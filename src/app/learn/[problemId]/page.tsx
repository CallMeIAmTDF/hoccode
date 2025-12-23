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
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {
    ArrowLeft,
    BarChart,
    BarChart3,
    Bot,
    Bug,
    Calendar,
    Clock, CodeXml,
    Eye,
    FileText,
    MemoryStick,
    Play,
    PlusCircle,
    Search,
    SendHorizonal,
    User
} from "lucide-react"

// Giả định các imports khác
import {apiGet, apiPost} from "@/lib/api"
import {CodeAnalysis, CodeRunnerResponse, Problem, SubmissionResponse} from "@/lib/types/problem";
import {Header} from "@/components/header";
import {notify} from "@/components/notify";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {Editor} from "@tinymce/tinymce-react";
import ReportModal, {ReportTypeEnum} from "@/components/ReportModal";
import {AiReviewModal} from "@/components/AiReviewModal";
import {InDepthCodeAnalysisResponse} from "@/lib/types/analysis";
import CodeAnalysisModal from "@/components/CodeAnalysisModal";
import {Solution} from "@/lib/types/solution";
import SolutionModal from "@/components/SampleSolutionsModal";
import {StreakNotification} from "@/components/animation/StreakNotification";
import {useSocket} from "@/context/SocketProvider";
import {OnboardingTour} from "@/components/guidetour/OnboardingTour";
import {learnPageSteps, learnProblemPageSteps} from "@/lib/onboard/steps";


const MonacoEditorComponent = dynamic(() => import("@/components/hoccodeeditor"), {ssr: false});


type ActiveTab = "problem" | "result" | "discussion";
type SortOption = "date" | "views";


interface Discussion {
    id: number;
    title: string;
    description: string;
    view: number;
    createdAt: string;
    createdBy: string;
}


const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString("vi-VN");
};

// ====================================================================
//                          III. NEW TOPIC MODAL COMPONENT
// ====================================================================

interface NewTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    problemId: string;
    // Thêm hàm để cập nhật danh sách (giả định)
    onTopicAdded: (newTopic: Discussion) => void;
}

const NewTopicModal: React.FC<NewTopicModalProps> = ({isOpen, onClose, problemId, onTopicAdded}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            notify("error", {title: "Lỗi", description: "Vui lòng nhập đầy đủ Tiêu đề và Nội dung."});
            return;
        }

        setIsPosting(true);
        try {
            const data = {
                title: title,
                description: content,
                pid: problemId
            }
            const newTopic = await apiPost<Discussion>("/discussion", data);

            onTopicAdded(newTopic);
            notify("success", {title: "Thành công", description: "Đã đăng bài thảo luận mới."});
            onClose();
            setTitle('');
            setContent('');
        } catch (error) {
            notify("error", {title: "Lỗi", description: "Không thể đăng bài thảo luận."});
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Tạo thảo luận</DialogTitle>
                    <DialogDescription>
                        Đóng góp giải pháp, phân tích, hoặc tài liệu tham khảo cho thử thách này.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 overflow-y-auto">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Tiêu đề
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="Ví dụ: Phân tích Time Complexity O(n log n)"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4 flex-1">
                        <Label htmlFor="content" className="text-right pt-2">
                            Nội dung
                        </Label>
                        {/*<Textarea */}
                        {/*    id="content"*/}
                        {/*    value={content}*/}
                        {/*    onChange={(e) => setContent(e.target.value)}*/}
                        {/*    className="col-span-3 min-h-[250px]"*/}
                        {/*    placeholder="Nhập nội dung chi tiết (hỗ trợ Markdown/HTML đơn giản)"*/}
                        {/*/>*/}
                        {/* Nếu dùng editor chuyên dụng: */}
                        <div className="col-span-3">
                            {/*<SimpleMdeEditor value={content} onChange={setContent} />*/}
                            <Editor
                                id={`1`}
                                apiKey="c7g3bowjbi9v4vokvur1e5uskxie7ky57ykmuzyouehu6hfh"
                                value={content}
                                onEditorChange={setContent}
                                init={{
                                    placeholder: "Nhập mô tả",
                                    height: 300,
                                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                    entity_encoding: "raw"
                                }}
                            /></div>


                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPosting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPosting}>
                        {isPosting ? 'Đang đăng...' : 'Đăng Bài'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// ====================================================================
//                          II. MAIN COMPONENT (LearnProblemPage)
// ====================================================================

export default function LearnProblemPage({params}: { params: Promise<{ problemId: string }> }) {
    const router = useRouter()
    const unwrappedParams = use(params);
    const problemId = unwrappedParams.problemId;
    const [authed, setAuthed] = useState<null | boolean>(null)
    const [tab, setTab] = useState<ActiveTab>("problem")
    const [res, setRes] = useState<"run" | "submit">("run")
    const [submitOutput, setSubmitOutput] = useState<SubmissionResponse>()
    const [submissionId, setSubmissionId] = useState<string>("")

    const [topics, setTopics] = useState<Discussion[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Discussion | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý Modal

    const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<CodeAnalysis | null>(null);
    const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);


    const handleTopicAdded = (newTopic: Discussion) => {
        setTopics(prev => [newTopic, ...prev]);
    };

    // --- HANDLERS cho Tab Tài liệu Mở rộng ---
    const handleSelectTopic = async (topicId: number) => {
        const topic = await apiGet<Discussion>(`/discussion/${topicId}`);
        setSelectedTopic(topic)
    };
    const handleBackToList = () => setSelectedTopic(null);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

    // --- LOGIC SORT VÀ FILTER (useMemo) ---
    const filteredAndSortedTopics = useMemo(() => {
        let result = topics;
        if (searchTerm) {
            result = result.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === 'views') {
                return b.view - a.view;
            }
            return 0;
        });
    }, [searchTerm, sortBy, topics]);

    // Starter Code (Giả định)
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
    const [problem, setProblem] = useState<Problem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportContext, setReportContext] = useState("Problem Page");
    const [reportTargetId, setReportTargetId] = useState(problemId);

    const [showResultButton, setShowResultButton] = useState(false);

    const [isCodeAnalysisModalOpen, setIsCodeAnalysisModalOpen] = useState(false);
    const [inDepthData, setInDepthData] = useState<InDepthCodeAnalysisResponse | null>(null);
    const [loadingInDepth, setLoadingInDepth] = useState(false);

    const [isSolutionsModalOpen, setIsSolutionsModalOpen] = useState(false);
    const [sampleSolutions, setSampleSolutions] = useState<Solution[]>([]);

    const [streak, setStreak] = useState(1);
    const [showOverlay, setShowOverlay] = useState(false);
    const [prevStreak, setPrevStreak] = useState(1);
    const {isConnected, subscribe} = useSocket();

    const [runTour, setRunTour] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const hasSeenTour = localStorage.getItem('hasSeenLearnProblemOnboarding');
        if (!hasSeenTour || hasSeenTour === 'false') {
            const timer = setTimeout(() => {
                setRunTour(true);
                localStorage.setItem('hasSeenLearnProblemOnboarding', 'true');

            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isMounted]);

    const handleRun = async () => {
        try {
            notify("success", {
                title: "Chạy thử thành công",
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
    const handleAiReview = async () => {
        console.log("AI Review triggered")
        if (!code || !language || !submitOutput) {
            notify("error", {title: "Lỗi", description: "Vui lòng nộp bài thành công trước khi yêu cầu đánh giá."});
            return;
        }

        setIsAiReviewLoading(true);
        notify("info", {title: "Đang yêu cầu AI...", description: "Hệ thống đang phân tích mã nguồn của bạn."});

        try {


            const data = await apiGet<CodeAnalysis>(`/ai/codeAnalysis/${submissionId}`)

            setAiAnalysisResult(data);
            setIsAiReviewModalOpen(true);
            notify("success", {title: "Hoàn thành", description: "Đã có kết quả đánh giá từ AI."});

        } catch (error) {
            notify("error", {title: "Lỗi AI Review", description: "Không thể nhận đánh giá từ AI. Vui lòng thử lại."});
        } finally {
            setIsAiReviewLoading(false);
        }

    }
    const handleAiAnalysis = () => {
        console.log("AI Analysis triggered")
    }

    const handleOnInDepthReview = async () => {

        setLoadingInDepth(true);
        setIsAiReviewModalOpen(false);
        notify("info", {
            title: "Đang xử lý",
            description: "Đang xử lý phân tích chuyên sâu"
        })
        try {
            const data = await apiGet<InDepthCodeAnalysisResponse>(`/ai/codeAnalysis/inDepth/${problemId}`);
            setInDepthData(data);
            notify("success", {
                title: "Thành công",
                description: "Phân tích thành công"
            })
            setIsCodeAnalysisModalOpen(true);
        } catch (error: any) {
            notify("error", {
                title: "Thất bại",
                description: error.message ?? "Phân tích thành công"
            })
        }
    }

    const handleSubmit = async () => {
        setShowResultButton(false)
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
            await pollSubmission(submission)
        } catch (err: any) {
            notify("error", {
                title: "Có lỗi xảy ra",
                description: err?.message ?? "Lỗi hệ thống. Vui lòng thử lại"
            })
        } finally {
            setSubmitting(false)
        }
    }
    const pollSubmission = async (submissionId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await apiGet<SubmissionResponse>(`/submission/${submissionId}/results`);
                setSubmitOutput(res)
                if (res.detail.status !== "IN_QUEUE") {
                    if (res.detail.status === "ACCEPTED") {
                        setShowResultButton(true)
                    }
                    clearInterval(interval);
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

    const handleFetchSolution = async () => {
        try {
            const data = await apiGet<Solution[]>(`/solution/${problemId}`);
            setSampleSolutions(data);
            notify("success", {
                title: "Thành công",
                description: "Lấy lời giải thành công"
            })
            setIsSolutionsModalOpen(true)
        } catch (err: any) {
            notify("error", {
                title: "Thất bại",
                description: "Lấy lời giải không thành công"
            })
        }
    }

    // useEffect để fetch problem, check auth (Giữ nguyên)
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        if (!token) {
            router.replace("/auth/signin")
            setAuthed(false)
        } else {
            setAuthed(true)
        }
    }, [router])

    useEffect(() => {
        if (!authed) return
        const fetchProblem = async () => {
            try {
                setLoading(true)
                const data = await apiGet<Problem>(`/problem/${problemId}`)
                const discussion = await apiGet<Discussion[]>(`/discussion?pid=${problemId}`)
                setProblem(data)
                setTopics(discussion)
                // handleOnInDepthReview()
                // handleFetchSolution()
            } catch (e: any) {
                notify("error", {
                    title: "Có lỗi xảy ra",
                    description: e?.message ?? "Failed to load problem"
                })
                router.push("/learn")
            } finally {
                setLoading(false)
            }
        }

        if (problemId) {
            fetchProblem()
        }
    }, [authed, problemId])

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

    useEffect(() => {
        if (!isConnected) return;
        const sub = subscribe(`/user/topic/normal`, (msg) => {
            switch (msg.type){
                case "STREAK_UPDATE":
                    setStreak(msg.data + 1)
                    setPrevStreak(msg.data)
                    setTimeout(() => {
                        setShowOverlay(true);
                    }, 500)
                    break
            }
        });
        return () => sub?.unsubscribe();
    }, [subscribe, isConnected]);

    const handleTourFinish = () => {
        setRunTour(false);
        localStorage.setItem('hasSeenLearnProblemOnboarding', 'true');
    };

    if (authed === null) {
        return (
            <div></div>
        );
    }
    if (!authed) return null

    return (
        <div className="min-h-screen bg-background">
            {isMounted && <OnboardingTour run={runTour} onFinish={handleTourFinish} steps={learnProblemPageSteps}/>}
            <Header/>

            {/* Modal Đăng bài mới */}
            <NewTopicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                problemId={problemId}
                onTopicAdded={handleTopicAdded}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                target={problemId}
                type={ReportTypeEnum.PROBLEM}
            />

            <AiReviewModal
                isOpen={isAiReviewModalOpen}
                onClose={() => setIsAiReviewModalOpen(false)}
                analysis={aiAnalysisResult}
                onInDepthReview={handleOnInDepthReview}
                submissionId={submissionId}
                code={code}
                language={language}
            />

            <CodeAnalysisModal
                data={inDepthData}
                open={isCodeAnalysisModalOpen}
                onOpenChange={setIsCodeAnalysisModalOpen}
            />

            <SolutionModal
                isOpen={isSolutionsModalOpen}
                onClose={() => setIsSolutionsModalOpen(false)}
                solutions={sampleSolutions}
            />

            <StreakNotification
                isVisible={showOverlay}
                from={prevStreak}
                to={streak}
                onComplete={() => setShowOverlay(false)}
            />

            <div className="container mx-auto max-w-7xl px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-150px)]">

                    {/* Left: Problem details & Tabs */}
                    <Tabs value={tab} onValueChange={(value) => setTab(value as "problem" | "result")}
                          className="flex flex-col h-full max-h-[80vh] overflow-auto">

                        {/* Tab Headers */}
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="problem">Thử Thách</TabsTrigger>
                            <TabsTrigger value="result" disabled={!hasResult}  id="tour-result">Kết Quả</TabsTrigger>
                            <TabsTrigger value="discussion">Thảo Luận</TabsTrigger>
                        </TabsList>

                        {/* ====================================================
                           TAB 1: THỬ THÁCH (PROBLEM)
                           ==================================================== */}
                        <TabsContent value="problem" className="flex-1 overflow-hidden" id="tour-problem-information">
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
                                    {loading &&
                                        <div className="flex justify-center items-center w-full h-full"><Spinner/>
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

                        {/* ====================================================
                           TAB 2: KẾT QUẢ (RESULT)
                           ==================================================== */}
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
                                                    {/* Tổng quan RUN */}
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
                                                            <AccordionTrigger className="text-sm font-medium">Chi
                                                                tiết</AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="space-y-2 ">
                                                                    {runOutput?.results?.map((r: any) => (
                                                                        <div key={r.case_id}
                                                                             className="p-3 rounded-md border bg-white shadow-sm hover:bg-slate-50 transition">
                                                                            <div
                                                                                className="flex justify-between items-center text-sm">
                                                                                <span
                                                                                    className="font-medium text-slate-700">Case #{r.case_id + 1}</span>
                                                                                <span
                                                                                    className={r.status === "ACCEPTED" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                                                    {r.status.replaceAll("_", " ")}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 mt-1">{r.message || "Không có thông tin chi tiết"}</p>
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
                                                    {/* Tổng quan SUBMIT */}
                                                    <div className="p-3 rounded-md bg-slate-50 border text-sm">
                                                        <p>
                                                            <span className="font-medium">Trạng thái:</span>{" "}
                                                            <span
                                                                className={submitOutput?.detail.status === "ACCEPTED" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
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

                                                    {
                                                        showResultButton && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white shadow hover:bg-slate-100 transition"
                                                                    onClick={() => handleAiReview()}
                                                                    disabled={isAiReviewLoading}
                                                                >
                                                                    {isAiReviewLoading ? (
                                                                        <>
                                                                            <Spinner className="w-4 h-4 mr-1"/> Đang phân
                                                                            tích...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Bot className="w-4 h-4"/> Đánh giá bởi AI
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
                                                                    onClick={() => handleFetchSolution()}
                                                                >
                                                                    <CodeXml className="w-4 h-4"/> Xem lời giải
                                                                </button>
                                                            </div>
                                                        )
                                                    }


                                                    {(submitOutput?.testcases?.filter(tc => tc.status === "ACCEPTED").length ?? 0) > 0 && (
                                                        <Accordion type="single" collapsible defaultValue="details"
                                                                   className="w-full">
                                                            <AccordionItem value="details">
                                                                <AccordionTrigger className="text-sm font-medium">Chi
                                                                    tiết</AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="space-y-2">
                                                                        {submitOutput?.testcases?.map((r: any, idx: number) => r.status === "ACCEPTED" && (
                                                                            <div key={`case-${idx}`}
                                                                                 className="p-3 rounded-md border bg-white shadow-sm hover:bg-slate-50 transition">
                                                                                <div
                                                                                    className="flex justify-between items-center text-sm">
                                                                                    <span
                                                                                        className="font-medium text-slate-700">Case #{r.case_id + 1}</span>
                                                                                    <span
                                                                                        className={r.status === "ACCEPTED" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                                                        {r.status.replaceAll("_", " ")}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-600 mt-1">{r.message || "Không có thông tin chi tiết"}</p>
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
                                        <p className="text-muted-foreground">Chưa có kết quả. Hãy chạy hoặc nộp bài để
                                            xem.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ====================================================
                           TAB 3: TÀI LIỆU MỞ RỘNG (DISCUSSION) - CẬP NHẬT
                           ==================================================== */}
                        <TabsContent value="discussion" className="flex-1 overflow-hidden pt-0">
                            <Card className="flex flex-col h-full">
                                <CardHeader className="pt-0">
                                    {selectedTopic ? (
                                        <div className="w-auto inline-flex">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={handleBackToList}
                                                className="flex items-center gap-2"
                                            >
                                                <ArrowLeft className="w-4 h-4"/>
                                                Quay lại
                                            </Button>
                                        </div>
                                    ) : (
                                        // Thanh Sort, Search và nút Thêm Mới
                                        <div
                                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
                                            <CardTitle className="text-lg hidden md:block"></CardTitle>
                                            <div className="flex items-center gap-2 w-full">
                                                {/* NÚT THÊM MỚI */}

                                                {/* SORT */}
                                                <Select value={sortBy}
                                                        onValueChange={(v) => setSortBy(v as SortOption)}>
                                                    <SelectTrigger className="w-[140px] flex-shrink-0">
                                                        <SelectValue placeholder="Sắp xếp theo"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="date" className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2"/> Mới nhất
                                                        </SelectItem>
                                                        <SelectItem value="views" className="flex items-center">
                                                            <BarChart className="w-4 h-4 mr-2"/> Lượt xem
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {/* SEARCH */}
                                                <div className="relative flex-grow">
                                                    <Search
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                                    <Input
                                                        placeholder="Tìm kiếm tiêu đề..."
                                                        className="pl-9"
                                                        value={searchTerm}
                                                        onChange={handleSearchChange}
                                                    />
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="flex-shrink-0 flex items-center gap-1"
                                                >
                                                    <PlusCircle className="w-4 h-4"/> Thêm Mới
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>


                                {/* NỘI DUNG TÀI LIỆU (List hoặc Detail) */}
                                <CardContent className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                                    {selectedTopic ? (
                                        /* CHI TIẾT VIEW - Cải thiện giao diện */
                                        <div className="space-y-6 pb-4">
                                            {/* Header và Meta */}
                                            <div className="border-b pb-4">
                                                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                                                    <FileText className="w-6 h-6 text-primary"/>
                                                    {selectedTopic.title}
                                                </h2>
                                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                    {/*<Avatar*/}
                                                    {/*    className="w-6 h-6"><AvatarFallback>{selectedTopic.createdBy.split("@")[0].slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>*/}
                                                    <span>Đăng bởi: <strong>{selectedTopic.createdBy.split("@")[0]}</strong></span>
                                                    <span>• {formatTime(selectedTopic.createdAt)}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4"/> {selectedTopic.view} Lượt xem
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Nội dung chính */}
                                            <section>
                                                <h3 className="text-xl font-semibold mb-3 border-l-4 border-primary pl-2">Nội
                                                    Dung Chi Tiết</h3>
                                                <div
                                                    className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-gray-50 dark:bg-card/50 border min-h-[100px]"
                                                    dangerouslySetInnerHTML={{__html: selectedTopic.description}}
                                                />
                                            </section>

                                            {/*<Button variant="secondary" onClick={() => console.log("Mở form đóng góp")}>Đóng góp / Chỉnh sửa</Button>*/}
                                        </div>

                                    ) : (
                                        /* DANH SÁCH VIEW */
                                        filteredAndSortedTopics.length > 0 ? (
                                            filteredAndSortedTopics.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className="p-3 border rounded-lg hover:shadow-md transition cursor-pointer bg-white dark:bg-card"
                                                    onClick={() => handleSelectTopic(topic.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-semibold text-base mb-1 hover:text-primary transition">
                                                            {topic.title}
                                                        </h4>
                                                        {/*{topic.isSolved ? (*/}
                                                        {/*    <Badge className="bg-green-500 hover:bg-green-600">Hoàn thiện</Badge>*/}
                                                        {/*) : (*/}
                                                        {/*    <Badge variant="secondary">Draft</Badge>*/}
                                                        {/*)}*/}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {topic.description.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                                    </p>
                                                    <div className="flex items-center text-xs text-slate-500 gap-4">
                                                        <span className="flex items-center gap-1"><User
                                                            className="w-3 h-3"/>{topic.createdBy.split("@")[0]}</span>
                                                        <span className="flex items-center gap-1"><Eye
                                                            className="w-3 h-3"/>{topic.view}</span>
                                                        <span>{formatTime(topic.createdAt)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-10 text-muted-foreground">
                                                Không tìm thấy tài liệu nào. Hãy là người đầu tiên
                                            </div>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>

                    {/* Right: Editor */}
                    <Card className="overflow-hidden flex flex-col max-h-[80vh]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">HocCodeEditor</CardTitle>
                            <div className="flex items-center gap-2">
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value as any)}
                                    className="h-9 rounded-md border bg-background px-2 text-sm"
                                    id="tour-select-language"
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
                                    id="tour-run"
                                >
                                    <Play className="h-4 w-4 mr-1"/> Kiểm thử
                                </Button>
                                <Button className="cursor-pointer" size="sm" onClick={handleSubmit} id="tour-submit"
                                        disabled={submitting || loading}>
                                    <SendHorizonal className="h-4 w-4 mr-1"/> Nộp bài
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <div className="h-full" id="tour-hoccodeeditor">
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
            <Button
                className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-red-600 hover:bg-red-700 transition transform hover:scale-105"
                onClick={() => {
                    setReportContext("Problem Page (General)");
                    setReportTargetId(problemId);
                    setIsReportModalOpen(true);
                }}
                aria-label="Báo cáo lỗi, sự cố hoặc phản hồi"
                title="Báo cáo Lỗi / Sự cố (Bug Report)"
            >
                <Bug className="w-6 h-6 text-white"/>
            </Button>
        </div>
    )
}