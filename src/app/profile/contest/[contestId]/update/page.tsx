"use client"

import React, {use, useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {ChevronDown, ChevronUp, Download, Plus, Save, Trash2, Upload} from "lucide-react"
import {format} from "date-fns"
import {formatInTimeZone, toDate, toZonedTime} from 'date-fns-tz';
import {Header} from "@/components/header";
import {Separator} from "@/components/ui/separator";
import {Editor} from "@tinymce/tinymce-react"
import {apiGet, apiPost, apiPut} from "@/lib/api";
import {notify} from "@/components/notify";
import {vi} from "date-fns/locale";
import {Sidebar} from "@/components/sidebar";
import {ContestEdit} from "@/lib/types/contest";
import {Spinner} from "@/components/ui/shadcn-io/spinner";

const CATEGORIES = [
    "ARRAY", "STRING", "HASH_TABLE", "DYNAMIC_PROGRAMMING", "MATH", "SORTING", "GREEDY",
    "DEPTH_FIRST_SEARCH", "BINARY_SEARCH", "DATABASE", "MATRIX", "TREE", "BREADTH_FIRST_SEARCH",
    "BIT_MANIPULATION", "TWO_POINTERS", "PREFIX_SUM", "HEAP", "SIMULATION", "BINARY_TREE",
    "GRAPH", "STACK", "COUNTING", "SLIDING_WINDOW", "DESIGN", "ENUMERATION", "BACKTRACKING",
    "UNION_FIND", "LINKED_LIST", "NUMBER_THEORY", "ORDERED_SET", "MONOTONIC_STACK",
    "SEGMENT_TREE", "TRIE", "COMBINATORICS", "BITMASK", "QUEUE", "RECURSION",
    "DIVIDE_AND_CONQUER", "BINARY_INDEXED_TREE", "MEMOIZATION", "GEOMETRY", "HASH_FUNCTION",
    "BINARY_SEARCH_TREE", "STRING_MATCHING", "SHORTEST_PATH", "TOPOLOGICAL_SORT", "ROLLING_HASH",
    "GAME_THEORY", "INTERACTIVE", "DATA_STREAM", "MONOTONIC_QUEUE", "BRAINTEASER",
    "DOUBLY_LINKED_LIST", "RANDOMIZED", "MERGE_SORT", "COUNTING_SORT", "ITERATOR",
    "CONCURRENCY", "PROBABILITY_AND_STATISTICS", "QUICKSELECT", "SUFFIX_ARRAY", "LINE_SWEEP",
    "MINIMUM_SPANNING_TREE", "BUCKET_SORT", "SHELL", "RESERVOIR_SAMPLING",
    "STRONGLY_CONNECTED_COMPONENT", "EULERIAN_CIRCUIT", "RADIX_SORT", "REJECTION_SAMPLING",
    "BICONNECTED_COMPONENT"
]

export default function UpdateContestPage({params}: { params: Promise<{ contestId: string }> }) {
    const unwrappedParams = use(params);
    const contestId = unwrappedParams.contestId;
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [password, setPassword] = useState("")
    const [startTime, setStartTime] = useState<Date | undefined>(undefined)
    const [endTime, setEndTime] = useState<Date | undefined>(undefined)
    const [numAttendees, setNumAttendees] = useState<number>(0)
    const [problems, setProblems] = useState<Problem[]>([
        {
            id: 1,
            title: "",
            description: "",
            constrains: "",
            followUp: "",
            timeLimit: 1,
            memoryLimit: 256,
            difficulty: "EASY",
            point: 100,
            hints: [""],
            testCases: [{input: "", expectedOutput: "", isHidden: false}],
            categories: [],
        },
    ])
    const [openCollapsibles, setOpenCollapsibles] = useState<{
        [key: number]: { hints: boolean; testCases: boolean }
    }>({})

    async function fetchData(){
        const data = await apiGet<ContestEdit>(`/contest/${contestId}/edit`)
        setTitle(data.title)
        setDescription(data.description)
        setPassword(data.password ? data.password : "")
        setEndTime(toDate(data.endTime))
        setStartTime(toDate(data.startTime))
        const simplifiedData: Problem[] = data.problems.map(problem => ({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            constrains: problem.constrains,
            followUp: problem.followUp,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            difficulty: problem.difficulty as "EASY" | "MEDIUM" | "HARD",
            point: problem.point,
            hints: problem.hints.map(h => h.description),
            testCases: problem.allTestCases.map(tc => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden
            })),
            categories: problem.categories
        }));

        setProblems(simplifiedData)
    }

    useEffect(() => {
        fetchData()

    }, []);


    const addProblem = () => {
        const newId = problems.length + 1
        setProblems([
            ...problems,
            {
                id: newId,
                title: "",
                description: "",
                constrains: "",
                followUp: "",
                timeLimit: 1,
                memoryLimit: 256,
                difficulty: "EASY",
                point: 100,
                hints: [""],
                testCases: [{input: "", expectedOutput: "", isHidden: false}],
                categories: [],
            },
        ])
        setOpenCollapsibles((prev) => ({
            ...prev,
            [newId]: {hints: true, testCases: true},
        }))
    }

    const removeProblem = (id: number) => {
        if (problems.length > 1) {
            setProblems(problems.filter((p) => p.id !== id))
            setOpenCollapsibles((prev) => {
                const newState = {...prev}
                delete newState[id]
                return newState
            })
        }
    }

    const updateProblem = (id: number, field: keyof Problem, value: any) => {
        setProblems(problems.map((p) => (p.id === id ? {...p, [field]: value} : p)))
    }

    const addTestCase = (problemId: number) => {
        setProblems(
            problems.map((p) =>
                p.id === problemId
                    ? {...p, testCases: [...p.testCases, {input: "", expectedOutput: "", isHidden: false}]}
                    : p,
            ),
        )
    }

    const removeTestCase = (problemId: number, index: number) => {
        setProblems(
            problems.map((p) => {
                if (p.id === problemId && p.testCases.length > 1) {
                    const newTestCases = [...p.testCases]
                    newTestCases.splice(index, 1)
                    return {...p, testCases: newTestCases}
                }
                return p
            }),
        )
    }

    const updateTestCase = (problemId: number, index: number, field: keyof TestCase, value: any) => {
        setProblems(
            problems.map((p) => {
                if (p.id === problemId) {
                    const newTestCases = [...p.testCases]
                    newTestCases[index] = {...newTestCases[index], [field]: value}
                    return {...p, testCases: newTestCases}
                }
                return p
            }),
        )
    }

    const addHint = (problemId: number) => {
        setProblems(
            problems.map((p) => (p.id === problemId ? {...p, hints: [...p.hints, ""]} : p)),
        )
    }

    const removeHint = (problemId: number, index: number) => {
        setProblems(
            problems.map((p) => {
                if (p.id === problemId && p.hints.length > 1) {
                    const newHints = [...p.hints]
                    newHints.splice(index, 1)
                    return {...p, hints: newHints}
                }
                return p
            }),
        )
    }

    const updateHint = (problemId: number, index: number, value: string) => {
        setProblems(
            problems.map((p) => {
                if (p.id === problemId) {
                    const newHints = [...p.hints]
                    newHints[index] = value
                    return {...p, hints: newHints}
                }
                return p
            }),
        )
    }

    const toggleCategory = (problemId: number, category: string) => {
        setProblems(
            problems.map((p) =>
                p.id === problemId
                    ? {
                        ...p,
                        categories: p.categories.includes(category)
                            ? p.categories.filter((c) => c !== category)
                            : [...p.categories, category],
                    }
                    : p,
            ),
        )
    }

    const handleDownloadTemplate = (problemId: number) => {
        const template = [
            {
                input: "example input",
                expectedOutput: "example output",
                isHidden: false,
            },
        ]
        const blob = new Blob([JSON.stringify(template, null, 2)], {type: "application/json"})
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `testcases_template_problem_${problemId}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleUploadTestCases = (problemId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const uploadedTestCases: TestCase[] = JSON.parse(e.target?.result as string)
                    if (Array.isArray(uploadedTestCases) && uploadedTestCases.every((tc) => "input" in tc && "expectedOutput" in tc && "isHidden" in tc)) {
                        setProblems(
                            problems.map((p) =>
                                p.id === problemId
                                    ? {...p, testCases: uploadedTestCases}
                                    : p,
                            ),
                        )
                        notify("success", {
                            title: "Thành công",
                            description: "Tải test cases lên thành công!"
                        })
                    } else {
                        notify("error", {
                            title: "Lỗi",
                            description: "Định dạng JSON không hợp lệ. Phải là một mảng test cases gồm input, expectedOutput và isHidden."
                        })
                    }
                } catch (error) {
                    notify("error", {
                        title: "Lỗi",
                        description: "Lỗi khi phân tích file JSON."
                    })
                }
            }
            reader.readAsText(file)
            event.target.value = ""
        }
    }



    // const formatTime = (time: Date) => {
    //     const timezone = 'Asia/Ho_Chi_Minh';
    //     const vietnameseTime = toZonedTime(time, timezone);
    //     return format(vietnameseTime, "yyyy-MM-dd'T'HH:mm:ssXXX", {timeZone: timezone}).replace("+07:00", ".000Z");
    // }

    const formatTime = (time: Date) => {
        return formatInTimeZone(
            time,
            "Asia/Ho_Chi_Minh",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        );
    };

    const handleSubmit = async () => {
        const currentDate = new Date()
        if (!title) {
            notify("error", {
                title: "Lỗi",
                description: "Tiêu đề cuộc thi là bắt buộc."
            })
            return
        }
        if (!startTime) {
            notify("error", {
                title: "Lỗi",
                description: "Thời gian bắt đầu là bắt buộc."
            })
            return
        }

        if (!endTime || endTime <= startTime) {
            notify("error", {
                title: "Lỗi",
                description: "Thời gian kết thúc phải sau thời gian bắt đầu."
            })
            return
        }
        if (problems.some((p) => !p.title || !p.description || p.testCases.some((tc) => !tc.input || !tc.expectedOutput))) {
            notify("error", {
                title: "Lỗi",
                description: "Tất cả các bài phải có tiêu đề, mô tả và test cases hợp lệ."
            })
            return
        }

        const contestData = {
            title,
            description,
            password: password || null,
            startTime: startTime ? formatTime(startTime) : null,
            endTime: endTime ? formatTime(endTime) : null,
            numAttendees: numAttendees,
            problems: problems.map((p) => ({
                pid: p.id,
                title: p.title,
                description: p.description,
                constrains: p.constrains,
                followUp: p.followUp,
                timeLimit: p.timeLimit,
                memoryLimit: p.memoryLimit,
                difficulty: p.difficulty,
                point: p.point,
                hints: p.hints.filter((h) => h !== ""),
                testCases: p.testCases,
                categories: p.categories,
            })),
        }

        console.log(contestData)

        try {
            const data = await apiPut<any>(`/contest/${contestId}`, contestData)
            notify("success", {
                title: "Thành công",
                description: "Cập nhật cuộc thi thành công"
            })
        } catch (err: any) {
            notify("error", {
                title: "Thất bại",
                description: "Cập nhật cuộc thi không thành công"
            })
        }
    }



    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Header></Header>
                <div className="flex flex-1">
                    <Sidebar/>
                    <main className="flex-1">
                        {!title ? (
                            <div className="flex justify-center items-center w-full h-full">
                                <Spinner/>
                            </div>
                        ) : (
                            <div className="container mx-auto px-4 py-8 max-w-7xl">
                                <h1 className="text-2xl font-bold mb-6 text-center">
                                    Chỉnh sửa thông tin cuộc thi
                                </h1>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Thông tin chi tiết</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="contest-title">Tiêu đề cuộc thi <span
                                                        className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="contest-title"
                                                        placeholder="Nhập tiêu đề cuộc thi"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="description">Mô tả</Label>
                                                    <Textarea
                                                        id="description"
                                                        placeholder="Mô tả cuộc thi của bạn"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        rows={4}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password">Mật khẩu (tùy chọn)</Label>
                                                    <Input
                                                        id="password"
                                                        type="text"
                                                        placeholder="Nhập mật khẩu cuộc thi"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="start-time">Thời gian bắt đầu <span
                                                            className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="start-time"
                                                            type="datetime-local"
                                                            value={startTime ? format(startTime, "yyyy-MM-dd'T'HH:mm") : ""}
                                                            onChange={(e) => setStartTime(e.target.value ? toDate(e.target.value, {timeZone: 'Asia/Ho_Chi_Minh'}) : undefined)}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="end-time">Thời gian kết thúc <span
                                                            className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="end-time"
                                                            type="datetime-local"
                                                            value={endTime ? format(endTime, "yyyy-MM-dd'T'HH:mm") : ""}
                                                            onChange={(e) => setEndTime(e.target.value ? toDate(e.target.value, {timeZone: 'Asia/Ho_Chi_Minh'}) : undefined)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="num-attendees">Số lượng người tham</Label>
                                                    <Input
                                                        id="num-attendees"
                                                        type="number"
                                                        min={0}
                                                        value={numAttendees}
                                                        onChange={(e) => setNumAttendees(Number(e.target.value))}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <CardTitle>Danh sách thử thách</CardTitle>
                                                <Button size="sm" onClick={addProblem}>
                                                    <Plus className="h-4 w-4 mr-2"/>
                                                    Thêm thử thách
                                                </Button>
                                            </CardHeader>
                                            <CardContent>
                                                <Tabs defaultValue={problems[0]?.id.toString() || "1"}
                                                      className="overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <TabsList className="mb-4 flex-nowrap">
                                                            {problems.map((problem, index) => (
                                                                <TabsTrigger key={problem.id} value={problem.id.toString()}>
                                                                    Thử thách {index + 1}
                                                                </TabsTrigger>
                                                            ))}
                                                        </TabsList>
                                                    </div>

                                                    {problems.map((problem) => (
                                                        <TabsContent key={problem.id} value={problem.id.toString()}
                                                                     className="space-y-6">
                                                            <div className="flex justify-between items-center">
                                                                <h3 className="text-lg font-medium"></h3>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeProblem(problem.id)}
                                                                    disabled={problems.length === 1}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2"/>
                                                                    Xóa thử thách
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`problem-${problem.id}-title`}>Tiêu đề
                                                                        Thử
                                                                        thách <span
                                                                            className="text-red-500">*</span></Label>
                                                                    <Input
                                                                        id={`problem-${problem.id}-title`}
                                                                        placeholder="Nhập tiêu đề thử thách"
                                                                        value={problem.title}
                                                                        onChange={(e) => updateProblem(problem.id, "title", e.target.value)}
                                                                    />
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`problem-${problem.id}-description`}>Mô
                                                                        tả Thử
                                                                        thách <span
                                                                            className="text-red-500">*</span></Label>
                                                                    <Editor
                                                                        id={`problem-${problem.id}-description`}
                                                                        apiKey="c7g3bowjbi9v4vokvur1e5uskxie7ky57ykmuzyouehu6hfh"
                                                                        value={problem.description}
                                                                        onEditorChange={(content) => updateProblem(problem.id, "description", content)}
                                                                        init={{
                                                                            placeholder: "Nhập mô tả thử thách",
                                                                            height: 300,
                                                                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                                                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                                                            entity_encoding: "raw"
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`problem-${problem.id}-constrains`}>Hạn
                                                                        chế</Label>
                                                                    <Textarea
                                                                        id={`problem-${problem.id}-constrains`}
                                                                        placeholder="Nhập các hạn chế (ví dụ: 1 ≤ n ≤ 10^5)"
                                                                        value={problem.constrains}
                                                                        onChange={(e) => updateProblem(problem.id, "constrains", e.target.value)}
                                                                        rows={3}
                                                                    />
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`problem-${problem.id}-follow-up`}>Yêu
                                                                        cầu nâng
                                                                        cao</Label>
                                                                    <Textarea
                                                                        id={`problem-${problem.id}-follow-up`}
                                                                        placeholder="Nhập yêu cầu nâng cao"
                                                                        value={problem.followUp}
                                                                        onChange={(e) => updateProblem(problem.id, "followUp", e.target.value)}
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                                <Separator/>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`problem-${problem.id}-difficulty`}>Độ
                                                                            khó</Label>
                                                                        <Select
                                                                            value={problem.difficulty}
                                                                            onValueChange={(value) => updateProblem(problem.id, "difficulty", value)}
                                                                        >
                                                                            <SelectTrigger
                                                                                id={`problem-${problem.id}-difficulty`}>
                                                                                <SelectValue placeholder="Lựa chọn độ khó"/>
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="EASY">Dễ</SelectItem>
                                                                                <SelectItem value="MEDIUM">Trung
                                                                                    Bình</SelectItem>
                                                                                <SelectItem value="HARD">Khó</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`problem-${problem.id}-categories`}>Chủ
                                                                            đề</Label>
                                                                        <Select>
                                                                            <SelectTrigger
                                                                                id={`problem-${problem.id}-categories`}>
                                                                                <SelectValue
                                                                                    placeholder={problem.categories.length > 0 ? problem.categories.join(", ") : "Lựa chọn chủ đề"}/>
                                                                            </SelectTrigger>
                                                                            <SelectContent
                                                                                className="max-h-60 overflow-y-auto">
                                                                                {CATEGORIES.map((category) => (
                                                                                    <div key={category}
                                                                                         className="flex items-center gap-2 px-3 py-1 hover:bg-muted">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={problem.categories.includes(category)}
                                                                                            onChange={() => toggleCategory(problem.id, category)}
                                                                                            className="h-4 w-4"
                                                                                        />
                                                                                        <Label
                                                                                            className="cursor-pointer">{category}</Label>
                                                                                    </div>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`problem-${problem.id}-time-limit`}>Giới
                                                                            hạn
                                                                            thời gian (s)</Label>
                                                                        <Input
                                                                            id={`problem-${problem.id}-time-limit`}
                                                                            type="number"
                                                                            min={0}
                                                                            value={problem.timeLimit}
                                                                            onChange={(e) => updateProblem(problem.id, "timeLimit", Number(e.target.value))}
                                                                        />
                                                                    </div>

                                                                    <div className="grid gap-2">
                                                                        <Label
                                                                            htmlFor={`problem-${problem.id}-memory-limit`}>Giới
                                                                            hạn bộ nhớ (KB)</Label>
                                                                        <Input
                                                                            id={`problem-${problem.id}-memory-limit`}
                                                                            type="number"
                                                                            min={0}
                                                                            value={problem.memoryLimit}
                                                                            onChange={(e) => updateProblem(problem.id, "memoryLimit", Number(e.target.value))}
                                                                        />
                                                                    </div>

                                                                    <div className="grid gap-2">
                                                                        <Label htmlFor={`problem-${problem.id}-point`}>Điểm
                                                                            thưởng</Label>
                                                                        <Input
                                                                            id={`problem-${problem.id}-point`}
                                                                            type="number"
                                                                            min={0}
                                                                            value={problem.point}
                                                                            onChange={(e) => updateProblem(problem.id, "point", Number(e.target.value))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Collapsible
                                                                open={openCollapsibles[problem.id]?.hints ?? true}
                                                                onOpenChange={(open) =>
                                                                    setOpenCollapsibles((prev) => ({
                                                                        ...prev,
                                                                        [problem.id]: {...prev[problem.id], hints: open},
                                                                    }))
                                                                }
                                                            >
                                                                <CollapsibleTrigger
                                                                    className="flex items-center justify-between w-full py-2">
                                                                    <h4 className="text-lg font-medium">Gợi ý</h4>
                                                                    <div
                                                                        className="p-2 rounded-md hover:bg-muted cursor-pointer"
                                                                        role="button"
                                                                        aria-label="Toggle hints"
                                                                    >
                                                                        {openCollapsibles[problem.id]?.hints ?? true ? (
                                                                            <ChevronUp className="h-4 w-4"/>
                                                                        ) : (
                                                                            <ChevronDown className="h-4 w-4"/>
                                                                        )}
                                                                    </div>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent className="space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <Label></Label>
                                                                        <Button variant="outline" size="sm"
                                                                                onClick={() => addHint(problem.id)}>
                                                                            <Plus className="h-4 w-4 mr-2"/>
                                                                            Thêm gợi ý
                                                                        </Button>
                                                                    </div>

                                                                    {problem.hints.map((hint, index) => (
                                                                        <div key={index}
                                                                             className="flex items-center gap-2">
                                                                            <Textarea
                                                                                id={`problem-${problem.id}-hint-${index}`}
                                                                                placeholder={`Gợi ý ${index + 1}`}
                                                                                value={hint}
                                                                                onChange={(e) => updateHint(problem.id, index, e.target.value)}
                                                                                rows={2}
                                                                            />
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => removeHint(problem.id, index)}
                                                                                disabled={problem.hints.length === 1}
                                                                            >
                                                                                <Trash2 className="h-4 w-4"/>
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </CollapsibleContent>
                                                            </Collapsible>

                                                            <Collapsible
                                                                open={openCollapsibles[problem.id]?.testCases ?? true}
                                                                onOpenChange={(open) =>
                                                                    setOpenCollapsibles((prev) => ({
                                                                        ...prev,
                                                                        [problem.id]: {
                                                                            ...prev[problem.id],
                                                                            testCases: open
                                                                        },
                                                                    }))
                                                                }
                                                            >
                                                                <CollapsibleTrigger
                                                                    className="flex items-center justify-between w-full py-2">
                                                                    <h4 className="text-lg font-medium">Bộ kiểm thử</h4>
                                                                    <div
                                                                        className="p-2 rounded-md hover:bg-muted cursor-pointer"
                                                                        role="button"
                                                                        aria-label="Toggle test cases"
                                                                    >
                                                                        {openCollapsibles[problem.id]?.testCases ?? true ? (
                                                                            <ChevronUp className="h-4 w-4"/>
                                                                        ) : (
                                                                            <ChevronDown className="h-4 w-4"/>
                                                                        )}
                                                                    </div>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent className="space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <Label></Label>
                                                                        <div className="flex gap-2">
                                                                            <Button variant="outline" size="sm"
                                                                                    onClick={() => handleDownloadTemplate(problem.id)}>
                                                                                <Download className="h-4 w-4 mr-2"/>
                                                                                Tải xuống mẫu
                                                                            </Button>
                                                                            <label htmlFor={`upload-${problem.id}`}>
                                                                                <Button variant="outline" size="sm" asChild>
                                                                                    <div>
                                                                                        <Upload className="h-4 w-4 mr-2"/>
                                                                                        Tải lên JSON
                                                                                    </div>
                                                                                </Button>
                                                                            </label>
                                                                            <Input
                                                                                id={`upload-${problem.id}`}
                                                                                type="file"
                                                                                accept=".json"
                                                                                className="hidden"
                                                                                onChange={(e) => handleUploadTestCases(problem.id, e)}
                                                                            />
                                                                            <Button variant="outline" size="sm"
                                                                                    onClick={() => addTestCase(problem.id)}>
                                                                                <Plus className="h-4 w-4 mr-2"/>
                                                                                Thêm bộ kiểm thử
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {problem.testCases.map((testCase, index) => (
                                                                        <div key={index}
                                                                             className="border rounded-lg p-4 space-y-4">
                                                                            <div
                                                                                className="flex justify-between items-center">
                                                                                <h4 className="font-medium">Bộ kiểm
                                                                                    thử {index + 1}</h4>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => removeTestCase(problem.id, index)}
                                                                                    disabled={problem.testCases.length === 1}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4"/>
                                                                                </Button>
                                                                            </div>

                                                                            <div className="grid gap-2">
                                                                                <Label
                                                                                    htmlFor={`problem-${problem.id}-test-${index}-input`}>Đầu
                                                                                    vào <span
                                                                                        className="text-red-500">*</span></Label>
                                                                                <Textarea
                                                                                    id={`problem-${problem.id}-test-${index}-input`}
                                                                                    placeholder="Đầu vào"
                                                                                    value={testCase.input}
                                                                                    onChange={(e) => updateTestCase(problem.id, index, "input", e.target.value)}
                                                                                    rows={2}
                                                                                />
                                                                            </div>

                                                                            <div className="grid gap-2">
                                                                                <Label
                                                                                    htmlFor={`problem-${problem.id}-test-${index}-output`}>Đầu
                                                                                    ra dự kiến <span
                                                                                        className="text-red-500">*</span></Label>
                                                                                <Textarea
                                                                                    id={`problem-${problem.id}-test-${index}-output`}
                                                                                    placeholder="Đầu ra dự kiến"
                                                                                    value={testCase.expectedOutput}
                                                                                    onChange={(e) => updateTestCase(problem.id, index, "expectedOutput", e.target.value)}
                                                                                    rows={2}
                                                                                />
                                                                            </div>

                                                                            <div className="flex items-center space-x-2">
                                                                                <Switch
                                                                                    id={`problem-${problem.id}-test-${index}-hidden`}
                                                                                    checked={testCase.isHidden}
                                                                                    onCheckedChange={(value) => updateTestCase(problem.id, index, "isHidden", value)}
                                                                                />
                                                                                <Label
                                                                                    htmlFor={`problem-${problem.id}-test-${index}-hidden`}>Bộ
                                                                                    kiểm thử ẩn</Label>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <Card className="sticky top-20">
                                            <CardHeader>
                                                <CardTitle>Tóm tắt Cuộc thi</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Tiêu đề cuộc thi</div>
                                                    <div className="font-medium">{title || "Cuộc thi chưa có tiêu đề"}</div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Thời gian bắt đầu</div>
                                                    <div
                                                        className="font-medium">{startTime ? format(startTime, "HH:mm - dd/MM/yyyy", {locale: vi}) : "Chưa thiết lập"}</div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Thời gian kết thúc</div>
                                                    <div
                                                        className="font-medium">{endTime ? format(endTime, "HH:mm - dd/MM/yyyy", {locale: vi}) : "Chưa thiết lập"}</div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Người tham dự dự kiến
                                                    </div>
                                                    <div className="font-medium">{numAttendees || "Chưa thiết lập"}</div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Mật khẩu</div>
                                                    <div
                                                        className="font-medium">{password ? "Đã thiết lập" : "Chưa thiết lập"}</div>
                                                </div>


                                                <div>
                                                    <div className="text-sm text-muted-foreground">Thử thách</div>
                                                    <div className="font-medium">{problems.length}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {problems.filter((p) => p.difficulty === "EASY").length} Dễ,{" "}
                                                        {problems.filter((p) => p.difficulty === "MEDIUM").length} Trung
                                                        bình,{" "}
                                                        {problems.filter((p) => p.difficulty === "HARD").length} Khó
                                                    </div>
                                                </div>

                                                <Button className="w-full" onClick={handleSubmit}>
                                                    <Save className="h-4 w-4 mr-2"/>
                                                    Chỉnh sửa thông tin cuộc thi
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    )
}

interface TestCase {
    input: string
    expectedOutput: string
    isHidden: boolean
}

interface Problem {
    id: number
    title: string
    description: string
    constrains: string
    followUp: string
    timeLimit: number
    memoryLimit: number
    difficulty: "EASY" | "MEDIUM" | "HARD"
    point: number
    hints: string[]
    testCases: TestCase[]
    categories: string[]
}