"use client"

import React, {use, useEffect, useMemo, useState} from "react"
import {useRouter} from "next/navigation"
import dynamic from "next/dynamic"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {
    ArrowLeft,
    Clock,
    MemoryStick,
    Play,
    SendHorizonal,
} from "lucide-react"
import {apiGet, apiPost} from "@/lib/api"
import {CodeRunnerResponse, Problem, SubmissionResponse} from "@/lib/types/problem";
import {Header} from "@/components/header";
import MonacoEditorComponent from "@/components/hoccodeeditor";
import {notify} from "@/components/notify";
import {Spinner} from "@/components/ui/shadcn-io/spinner";

// const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {ssr: false})

export default function LearnProblemPage({params}: { params: Promise<{ problemId: string, contestId: string }> }) {
    const unwrappedParams = use(params);
    const contestId = unwrappedParams.contestId;
    const problemId = unwrappedParams.problemId
    const router = useRouter()
    const [authed, setAuthed] = useState<null | boolean>(null)
    const [tab, setTab] = useState<"problem" | "result">("problem")
    const [res, setRes] = useState<"run" | "submit">("run")
    const [submitOutput, setSubmitOutput] = useState<SubmissionResponse>()
    const [submissionId, setSubmissionId] = useState<string>("")
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        if (!token) {
            router.replace("/auth/signin")
            setAuthed(false)
        } else {
            setAuthed(true)
        }
    }, [router])

    const [problem, setProblem] = useState<Problem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!authed) return
        const fetchProblem = async () => {
            try {
                setLoading(true)
                const data = await apiGet<Problem>(`/contest/${contestId}/problem/${problemId}`)
                setProblem(data)
            } catch (e: any) {
                notify("error", {
                    title: "Có lỗi xảy ra",
                    description: e?.message ?? "Failed to load problem"
                })
                router.push(`/contest/${contestId}`)
            } finally {
                setLoading(false)
            }
        }
        fetchProblem()
    }, [authed, problemId])

    const starterCodes: Record<string, string> = {
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Your code here\n    return 0;\n}`,
        python: `# Your code here\nif __name__ == "__main__":\n    pass`,
    }

    const [language, setLanguage] = useState<"java" | "cpp" | "python">("java")
    const [code, setCode] = useState<string>(starterCodes["java"])
    const [runOutput, setRunOutput] = useState<CodeRunnerResponse>()
    const [running, setRunning] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [hasResult, setHasResult] = useState(false)

    const difficultyColor = useMemo(() => {
        switch (problem?.difficulty) {
            case "EASY":
                return "bg-green-100 text-green-800"
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800"
            case "HARD":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }, [problem?.difficulty])

    const handleRun = async () => {
        try {
            notify("success", {
                title: "Nộp bài thành công",
                description: "Bài làm đang được xử lý"
            })
            setRunning(true)
            setRes("run")
            const body = {
                "pid": problemId,
                "code": code,
                "language": language,
            }
            const response = await apiPost<CodeRunnerResponse>("/submission/run", body);
            setRunOutput(
                response
            )
            setHasResult(true)
            setTab("result")
        } finally {
            setRunning(false)
        }
    }

    const handleSubmit = async () => {
        try {
            notify("success", {
                title: "Nộp bài thành công",
                description: "Bài làm đang được xử lý"
            })
            setSubmitting(true)
            setRes("submit")
            const body = {
                "pid": problemId,
                "code": code,
                "language": language,
            }
            const submission = await apiPost<string>("/submission", body);
            setHasResult(true)
            setSubmissionId(submission)
            setTab("result")
            pollSubmission(submission)
        } catch (err : any){
            notify("error", {
                title: "Có lỗi xảy ra",
                description: err?.message ?? "Lỗi hệ thống. Vui lòng thử lại"
            })
        }
        finally {
            setSubmitting(false)
        }
    }

    const pollSubmission = async (submissionId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await apiGet<SubmissionResponse>(`/submission/${submissionId}/results`);
                setSubmitOutput(res)
                if (res.detail.status !== "IN_QUEUE") {
                    clearInterval(interval);
                    if(res.detail.status === "ACCEPTED"){
                        notify("success", {
                            title: "Thông báo",
                            description: "Bài làm đã vượt qua bộ kiểm thử"
                        })
                    }else{
                        notify("error", {
                            title: "Thông báo",
                            description: "Bài làm chưa vượt qua bộ kiểm thử"
                        })
                    }
                }
            } catch (err: any) {
                clearInterval(interval);
                notify("error", {
                    title: "Có lỗi xảy ra",
                    description: err?.message ?? "Lỗi hệ thống. Vui lòng thử lại"
                })
            }
        }, 300);
    };


    const handleLanguageChange = (lang: "java" | "cpp" | "python") => {
        setLanguage(lang)
        setCode(starterCodes[lang])
    }

    if (authed === null) {
        return <div className="container mx-auto max-w-7xl px-4 py-10">Checking session...</div>
    }
    if (!authed) return null

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="container mx-auto max-w-7xl px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/contest/${contestId}`)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent hover:bg-opacity-60 cursor-pointer transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
                    <Tabs value={tab} onValueChange={(value) => setTab(value as "problem" | "result")}
                          className="flex flex-col h-full max-h-[80vh] overflow-auto">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="problem">Thử Thách</TabsTrigger>
                            <TabsTrigger value="result" disabled={!hasResult}>
                                Kết Quả
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="problem" className="flex-1 overflow-hidden">
                            <Card className="overflow-hidden flex flex-col h-full">
                                <CardHeader className="space-y-3">
                                    <CardTitle className="flex flex-col gap-2">
                                        <span className="text-2xl font-semibold">
                                            {problem?.title ?? "Loading..."}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {problem && (
                                                <Badge
                                                    variant="secondary"
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColor}`}
                                                >
                                                    {problem.difficulty}
                                                </Badge>
                                            )}
                                            {problem && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                      <Clock size={14} className="text-muted-foreground"/>
                                                        {problem.timeLimit}s
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                      <MemoryStick size={14} className="text-muted-foreground"/>
                                                        {problem.memoryLimit}KB
                                                    </span>
                                                  </span>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {problem?.categories?.slice(0, 3).map((c) => (
                                                    <span
                                                        key={c}
                                                        className="text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
                                                    >
                                                        #{c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CardTitle>
                                </CardHeader>

                                {/* Scrollable content */}
                                <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2">
                                    {loading && <div className="flex justify-center items-center w-full h-full">
                                        <Spinner/>
                                    </div>}
                                    {error && <div className="text-red-600">{error}</div>}
                                    {problem && (
                                        <>
                                            {problem.description && (
                                                <div className="prose prose-sm dark:prose-invert max-w-none"
                                                     dangerouslySetInnerHTML={{__html: problem.description}}/>
                                            )}
                                            <Separator/>
                                            {problem.constrains && (
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-2">Ràng buộc</h3>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none"
                                                         dangerouslySetInnerHTML={{__html: problem.constrains}}/>
                                                </div>
                                            )}
                                            {problem.followUp && (
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-2">Mở rộng</h3>
                                                    <div
                                                        className="prose prose-sm text-muted-foreground dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={{__html: problem.followUp}}/>
                                                </div>
                                            )}


                                            <div>
                                                <h3 className="text-sm font-semibold mb-2">Ví dụ</h3>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-16">#</TableHead>
                                                            <TableHead>Đầu vào</TableHead>
                                                            <TableHead>Đầu ra</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {problem.allTestCases?.filter((t) => !t.isHidden).map((tc, idx) => (
                                                            <TableRow key={tc.id}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>
                                                                    <pre
                                                                        className="whitespace-pre-wrap text-xs">{tc.input}</pre>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <pre
                                                                        className="whitespace-pre-wrap text-xs">{tc.expectedOutput}</pre>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {!problem.allTestCases?.filter((t) => !t.isHidden).length && (
                                                            <TableRow>
                                                                <TableCell colSpan={3}
                                                                           className="text-muted-foreground text-sm">Không
                                                                    có ví dụ mẫu</TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="hints">
                                                    <AccordionTrigger className="text-sm">Gợi ý</AccordionTrigger>
                                                    <AccordionContent>
                                                        <ul className="list-disc pl-5 text-sm space-y-1">
                                                            {problem.hints?.length ? (problem.hints.map((h) => (
                                                                <li key={h.id}>{h.description}</li>
                                                            ))) : (<li>Không có gợi ý</li>)}
                                                        </ul>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="result" className="flex-1 overflow-y-auto">
                            <Card className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Kết quả</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm overflow-y-auto">
                                    {hasResult ? (
                                        <>
                                            {res === "run" ? (
                                                <div className="space-y-3">
                                                    {/* Tổng quan */}
                                                    {runOutput && (
                                                        <div className="p-3 rounded-md bg-slate-50 border text-sm">
                                                            <p>
                                                                <span className="font-medium">Trạng thái:</span>{" "}
                                                                <span
                                                                    className={
                                                                        runOutput.status === "ACCEPTED"
                                                                            ? "text-green-600 font-semibold"
                                                                            : "text-red-600 font-semibold"
                                                                    }
                                                                >
                {runOutput.status.replaceAll("_", " ")}
            </span>
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Kết quả:</span>{" "}
                                                                {runOutput.passed}/{runOutput.total}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="details">
                                                            <AccordionTrigger className="text-sm font-medium">
                                                                Chi tiết
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="space-y-2 ">
                                                                    {runOutput?.results?.map((r: any) => (
                                                                        <div
                                                                            key={r.case_id}
                                                                            className="p-3 rounded-md border bg-white shadow-sm hover:bg-slate-50 transition"
                                                                        >
                                                                            <div
                                                                                className="flex justify-between items-center text-sm">
                                                                      <span className="font-medium text-slate-700">
                                                                        Case #{r.case_id + 1}
                                                                      </span>
                                                                                <span
                                                                                    className={
                                                                                        r.status === "ACCEPTED"
                                                                                            ? "text-green-600 font-semibold"
                                                                                            : "text-red-600 font-semibold"
                                                                                    }
                                                                                >
                        {r.status.replaceAll("_", " ")}
                      </span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 mt-1">
                                                                                {r.message || "Không có thông tin chi tiết"}
                                                                            </p>
                                                                            <p className="text-xs text-slate-500">⏱ {r.time} ms</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="p-3 rounded-md bg-slate-50 border text-sm">
                                                        <p>
                                                            <span className="font-medium">Trạng thái:</span>{" "}
                                                            <span
                                                                className={
                                                                    submitOutput?.detail.status === "ACCEPTED"
                                                                        ? "text-green-600 font-semibold"
                                                                        : "text-red-600 font-semibold"
                                                                }
                                                            >
                                                              {submitOutput?.detail.status.replaceAll("_", " ")}
                                                            </span>
                                                        </p>
                                                        {submitOutput?.detail.status != "IN_QUEUE" ? (
                                                            <>
                                                                <p>
                                                                    <span className="font-medium">Kết quả:</span>{" "}
                                                                    {submitOutput?.detail?.passedTestCase}/{submitOutput?.detail?.totalTestCases}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Thời gian:</span>{" "}
                                                                    {submitOutput?.detail?.maxTime} ms
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p>
                                                                    <span className="font-medium">Đang chạy:</span>{" "}
                                                                    Thành
                                                                    công {submitOutput?.testcases?.filter(tc => tc.status === "ACCEPTED").length} / {submitOutput?.testcases?.length}
                                                                </p>

                                                            </>
                                                        )}

                                                    </div>
                                                    {(submitOutput?.testcases?.filter(tc => tc.status === "ACCEPTED").length ?? 0) > 0 && (
                                                        <Accordion type="single" collapsible defaultValue="details"
                                                                   className="w-full">
                                                            <AccordionItem value="details">
                                                                <AccordionTrigger className="text-sm font-medium">
                                                                    Chi tiết
                                                                </AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="space-y-2">
                                                                        {submitOutput?.testcases?.map((r: any, idx: number) => r.status === "ACCEPTED" && (
                                                                            <div
                                                                                key={`case-${idx}`}
                                                                                className="p-3 rounded-md border bg-white shadow-sm hover:bg-slate-50 transition"
                                                                            >
                                                                                <div
                                                                                    className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">
                Case #{r.case_id + 1}
              </span>
                                                                                    <span
                                                                                        className={
                                                                                            r.status === "ACCEPTED"
                                                                                                ? "text-green-600 font-semibold"
                                                                                                : "text-red-600 font-semibold"
                                                                                        }
                                                                                    >
                {r.status.replaceAll("_", " ")}
              </span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-600 mt-1">
                                                                                    {r.message || "Không có thông tin chi tiết"}
                                                                                </p>
                                                                                <p className="text-xs text-slate-500">⏱ {r.time} ms</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    )}
                                                </div>

                                            )}
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            Chưa có kết quả. Hãy chạy hoặc nộp bài để xem.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Right: Editor */}
                    <Card className="overflow-hidden flex flex-col max-h-[80vh]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">

                                HocCodeEditor
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value as any)}
                                    className="h-9 rounded-md border bg-background px-2 text-sm"
                                >
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="python">Python</option>
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRun}
                                    disabled={running || loading}
                                >
                                    <Play className="h-4 w-4 mr-1"/> Kiểm thử
                                </Button>
                                <Button className="cursor-pointer" size="sm" onClick={handleSubmit}
                                        disabled={submitting || loading}>
                                    <SendHorizonal className="h-4 w-4 mr-1"/> Nộp bài
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <div className="h-full">
                                <MonacoEditorComponent
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={(v) => setCode(v ?? "")}
                                    options={{
                                        fontSize: 14,
                                        minimap: {enabled: false},
                                        scrollBeyondLastLine: false,
                                    }}
                                >
                                </MonacoEditorComponent>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
