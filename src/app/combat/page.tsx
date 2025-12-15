"use client"

import React, {useEffect, useMemo, useState, useCallback, useRef} from "react"
import dynamic from "next/dynamic"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Zap, Users, Clock, Trophy, Play, SendHorizonal, Code, BarChart, User, Loader2, X, PlusCircle,
    MemoryStick, FileText, ArrowLeft
} from "lucide-react"
import {Progress} from "@/components/ui/progress"

import {Header} from "@/components/header";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {apiGet, apiPost} from "@/lib/api";
import {notify} from "@/components/notify";
import {useSocket} from "@/context/SocketProvider";
import {CodeRunnerResponse, Result} from "@/lib/types/problem";
import {toast} from "sonner";
import {AnimatePresence, motion} from "framer-motion";

const MonacoEditorComponent = dynamic(() => import("@/components/hoccodeeditor"), {ssr: false});

// ====================================================================
//                             I. INTERFACES & ENUM
// ====================================================================

// Trạng thái hiển thị của trang
enum View {
    HOME = 'home',
    LOBBY = 'lobby',
    BATTLE = 'battle',
}

interface Hint {
    id: number
    description: string
}

interface TestCase {
    id: number
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
    difficulty: string
    point: number
    categories: string[]
    accepted: boolean
    passCount: number
    failCount: number
    hints?: Hint[]
    allTestCases?: TestCase[]
}

interface Competitor {
    username: string;
    score: number;
    rank: number;
}

const MAX_PLAYERS = 8;
const MAX_WAIT_SECONDS = 120;

const MOCK_PROBLEM: Problem = {
    id: 101,
    title: "Tìm tổng lớn nhất của dãy con liên tiếp (Kadane's)",
    description: "Cho một mảng số nguyên, tìm tổng lớn nhất của bất kỳ dãy con liên tiếp nào. Ví dụ: Với mảng `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`, tổng lớn nhất là `6` (từ dãy con `[4, -1, 2, 1]`). Đây là một bài toán cổ điển thường được giải bằng thuật toán Kadane.",
    constrains: "Độ dài mảng N nằm trong khoảng 1 ≤ N ≤ 10⁵. Giá trị phần tử nằm trong khoảng −10⁴ ≤ A[i] ≤ 10⁴. Cần có lời giải O(N).",
    followUp: "Bạn có thể mở rộng bài toán này để tìm tổng lớn nhất của dãy con trong mảng 2 chiều không?",
    timeLimit: 1,
    memoryLimit: 256,
    difficulty: "MEDIUM",
    point: 100,
    categories: ["Array", "DP"],
    accepted: false,
    passCount: 520,
    failCount: 150,
    hints: [
        {id: 1, description: "Bắt đầu với một biến để lưu trữ tổng cục bộ lớn nhất và một biến cho tổng hiện tại."},
    ],
    allTestCases: [
        {id: 1, input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", expectedOutput: "6", isHidden: false},
        {id: 2, input: "[1]", expectedOutput: "1", isHidden: false},
        {id: 3, input: "[-1, -2, -3]", expectedOutput: "-1", isHidden: false},
        {id: 4, input: "...", expectedOutput: "...", isHidden: true},
    ]
};

// ====================================================================
//                             II. SUB-COMPONENTS
// ====================================================================

// --- 1. Trang Chủ ---
const HomePage: React.FC<{ onStartMatchmaking: () => void }> = ({onStartMatchmaking}) => (
    <div
        className="container mx-auto max-w-5xl px-4 flex flex-col justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="text-center mb-10 space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">
                HocCode Arena: Lập Trình Đối Kháng
            </h1>
            <p className="text-xl text-muted-foreground">
                Đánh bại 7 đối thủ khác bằng thuật toán tối ưu nhất trong thời gian giới hạn!
            </p>
        </div>

        <Card className="shadow-2xl border-2 border-primary/20 w-full max-w-3xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                    Luật chơi & Tính năng
                </CardTitle>
            </CardHeader>
            <Separator/>
            <CardContent className="grid md:grid-cols-2 gap-8 py-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                        <Users className="w-5 h-5"/> Thông tin
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                        <li>Mỗi phòng có tối đa <b>8 người chơi</b></li>
                        <li>Hệ thống xếp hạng thời gian thực.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                        <Clock className="w-5 h-5"/> Giới hạn thời gian nghiêm ngặt
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                        <li>Tổng thời gian thi đấu: <b>15 phút</b></li>
                    </ul>
                </div>
            </CardContent>
        </Card>

        <div className="text-center mt-12">
            <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
                onClick={onStartMatchmaking}
            >
                Bắt đầu
            </Button>
        </div>
    </div>
);


// --- 2. Trang Lobby ---
interface LobbyProps {
    onEnterBattle: (roomId: string) => void;
    onCancel: () => void;
    players: Competitor[];
    initialWaitCountdown: number;
    roomId: string;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const LobbyPage: React.FC<LobbyProps> = ({onEnterBattle, onCancel, players, initialWaitCountdown, roomId}) => {
    const [maxWaitCountdown, setMaxWaitCountdown] = useState(initialWaitCountdown !== undefined ? initialWaitCountdown : MAX_WAIT_SECONDS);
    const [isCountingDown, setIsCountingDown] = useState(true);
    const [matchFound, setMatchFound] = useState(false);
    const progressValue = useMemo(() => (players.length / MAX_PLAYERS) * 100, [players.length]);

    useEffect(() => {
        if (!isCountingDown || matchFound) return;

        const countdownInterval = setInterval(() => {
            setMaxWaitCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setIsCountingDown(false);
                    setMatchFound(true);
                    setTimeout(() => onEnterBattle("A1B2C3D4"), 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [isCountingDown, matchFound, onEnterBattle]);

    useEffect(() => {
        setMaxWaitCountdown(initialWaitCountdown);
    }, [initialWaitCountdown]);

    const renderPlayerSlots = useMemo(() => {
        const slots = [];
        for (let i = 0; i < MAX_PLAYERS; i++) {
            const player = players[i];
            slots.push(
                <div
                    key={i}
                    className={`flex h-28 flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 border ${
                        player
                            ? 'bg-card shadow-lg border-primary/50'
                            : 'bg-muted/30 border-dashed border-gray-400 opacity-70'
                    }`}
                >
                    {player ? (
                        <>
                            <Avatar className="w-12 h-12 mb-2">
                                <AvatarFallback className="bg-primary text-white">
                                    {player.username.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className="font-semibold text-sm truncate w-full text-center">{player.username.split("@")[0]}</span>
                        </>
                    ) : (
                        <div className="text-muted-foreground">
                            <X className="w-6 h-6 mb-1"></X>
                        </div>
                    )}
                </div>
            );
        }
        return slots;
    }, [players]);

    return (
        <div
            className="container mx-auto max-w-7xl px-4 flex flex-col justify-center items-center min-h-[calc(100vh-80px)]">
            <Card className="shadow-2xl w-full max-w-5xl">
                <CardHeader className="text-center space-y-3">
                    <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                        {matchFound ? (
                            <span className="text-green-600">TRẬN ĐẤU ĐÃ SẴN SÀNG!</span>
                        ) : (
                            <>
                                <Loader2 className="w-6 h-6 text-primary animate-spin"/> Đang tìm kiếm đối thủ...
                            </>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-8 py-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                        {renderPlayerSlots}
                    </div>
                    <Separator/>

                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col items-start gap-2 flex-1">
                            <div className="text-4xl font-extrabold text-primary">
                                {players.length} / {MAX_PLAYERS}
                            </div>
                            <Progress value={progressValue} className="w-full h-2"/>
                            <p className="text-lg text-muted-foreground">
                                Đang tìm kiếm thêm <b>{MAX_PLAYERS - players.length}</b> người.
                            </p>
                        </div>

                        <div
                            className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-800 rounded-lg shadow-inner min-w-[150px]">
                            {matchFound ? (
                                <span className="text-2xl font-bold text-green-600">Chuẩn bị!!!</span>
                            ) : (
                                <span
                                    className={`text-4xl font-extrabold ${maxWaitCountdown <= 10 ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
                                    {formatTime(maxWaitCountdown)}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


// --- 3. Trang Làm Bài (Battle Room) ---
interface BattleProps {
    onExit: () => void;
    problem: Problem
    comp: Competitor[]
    roomId: string
    submitResponse: any
}


const BattlePage: React.FC<BattleProps> = ({onExit, problem, comp, roomId, submitResponse}) => {
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [competitors, setCompetitors] = useState<Competitor[]>(comp);

    const availableLanguages = ["cpp", "java", "python"] as const;
    type Language = typeof availableLanguages[number];

    const starterCodes: Record<string, string> = {
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Your code here\n    return 0;\n}`,
        python: `# Your code here\nif __name__ == "__main__":\n    pass`,
    }

    const [language, setLanguage] = useState<Language>("cpp")
    const [code, setCode] = useState<string>(starterCodes["cpp"]);
    const [runResult, setRunResult] = useState<string>("Chưa có kết quả chạy thử.");
    const [detailedResults, setDetailedResults] = useState<Result[]>([]);
    const [activeTab, setActiveTab] = useState<'problem' | 'result'>('problem');
    const [isBattleFinished, setIsBattleFinished] = useState<boolean>(false)


    useEffect(() => {
        setCode(starterCodes[language])
    }, [language]);

    // Timer Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    console.log("Trận đấu kết thúc!");
                    setTimeout(onExit, 5000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onExit]);


    useEffect(() => {
        setCompetitors(comp)
    }, [comp]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };


    // Handlers
    const handleRunCode = async () => {
        setRunResult(`Đang kiểm tra trên ${problem.allTestCases?.filter(tc => !tc.isHidden).length} test case mẫu...`);
        setDetailedResults([]);
        setActiveTab("result");
        try {
            notify("success", {
                title: "Chạy thử thành công",
                description: "Bài làm đang được xử lý",
            });
            const body = {
                pid: problem.id,
                code: code,
                language: language,
            };
            const response = await apiPost<CodeRunnerResponse>("/submission/run", body);

            setRunResult(`Thành công trên ${response.passed}/${response.total} mẫu.`);
            if (response.results && response.results.length > 0) {
                setDetailedResults(response.results);
            }
        } catch (error) {
            setRunResult("Chạy thử thất bại. Vui lòng thử lại sau.");
        }
    };

    const handleSubmitCode = async () => {
        setActiveTab("result");
        setDetailedResults([]);
        try {
            notify("success", {
                title: "Nộp thành công",
                description: "Bài làm đang được xử lý",
            });
            const body = {
                pid: problem.id,
                code: code,
                language: language,
            };
            const response = await apiPost<string>(`/combat/submit?roomId=${roomId}`, body);
        } catch (error) {
            setRunResult("Chạy thử thất bại. Vui lòng thử lại sau.");
        }
        setIsBattleFinished(true)
    };

    useEffect(() => {
        if(timeLeft === 0){
            setIsBattleFinished(true)
        }
    }, [timeLeft]);


    useEffect(() => {
        if(submitResponse){
            if(submitResponse.data == null){
                notify("info",{
                    title: "Thông báo",
                    description: submitResponse.message
                })
            }else{
                setRunResult(`Kết quả bài nộp: ${submitResponse.data.status.replaceAll("_", " ")}\nSố điểm nhận được: ${submitResponse.data.passedTestCase}`);
            }
        }
    }, [submitResponse]);

    const email = localStorage.getItem("email");
    const currentUser = email ? email.split("@")[0] : "";


    const exampleTestCases = problem.allTestCases?.filter(tc => !tc.isHidden) || [];

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b bg-background">
                <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Code className="w-6 h-6"/>
                    HocCodeArena
                </h1>
                <div className="flex items-center gap-4">
                    <div className={`text-sm font-extrabold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 ${
                        timeLeft <= 60 && timeLeft > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-primary-foreground'
                    }`}>
                        <Clock className="w-5 h-5"/> {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 h-full grid-rows-1">
                        {/* Cột 1: Đề bài & Kết quả */}
                        <div className="col-span-12 lg:col-span-4 h-full">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'problem' | 'result')}
                                  className="h-full flex flex-col">
                                <TabsList className="w-full grid grid-cols-2 flex-shrink-0">
                                    <TabsTrigger value="problem">Đề Bài</TabsTrigger>
                                    <TabsTrigger value="result">Kết Quả Chạy</TabsTrigger>
                                </TabsList>

                                <TabsContent value="problem"
                                             className="flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                                    <Card className="flex-1 flex flex-col overflow-hidden">
                                        <CardHeader className="flex-shrink-0 space-y-3">
                                            <CardTitle className="text-xl">{problem.title}</CardTitle>
                                            <div
                                                className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> {problem.timeLimit}s
                                    </span>
                                                <span className="flex items-center gap-1">
                                        <MemoryStick className="w-3 h-3"/> {problem.memoryLimit}MB
                                    </span>
                                                {problem.categories.map(c =>
                                                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent
                                            className="flex-1 overflow-y-auto space-y-4 min-h-0  no-scrollbar  ">
                                            <section>
                                                <h3 className="text-base font-semibold mb-2">Mô tả</h3>
                                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm"
                                                     dangerouslySetInnerHTML={{__html: problem.description}}/>
                                            </section>
                                            <Separator/>

                                            <section>
                                                <h3 className="text-base font-semibold mb-2">Ràng buộc</h3>
                                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm"
                                                     dangerouslySetInnerHTML={{__html: problem.constrains}}/>
                                            </section>
                                            <Separator/>

                                            <section>
                                                <h3 className="text-base font-semibold mb-2">
                                                    Ví dụ
                                                </h3>
                                                {exampleTestCases.length > 0 ? (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-12">#</TableHead>
                                                                    <TableHead>Đầu vào</TableHead>
                                                                    <TableHead>Đầu ra</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {exampleTestCases.map((tc, idx) => (
                                                                    <TableRow key={tc.id}>
                                                                        <TableCell
                                                                            className="font-medium">{idx + 1}</TableCell>
                                                                        <TableCell>
                                                                <pre
                                                                    className="text-xs whitespace-pre-wrap">{tc.input}</pre>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                <pre
                                                                    className="text-xs whitespace-pre-wrap">{tc.expectedOutput}</pre>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground text-sm">Không có ví dụ mẫu
                                                        nào.</p>
                                                )}
                                            </section>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="result" className="flex-1 mt-4 overflow-hidden">
                                    <Card className="h-full flex flex-col">
                                        <CardHeader className="flex-shrink-0">
                                            <CardTitle className="text-xl">Kết quả</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto">
  <pre
      className={`p-4 rounded-md text-sm whitespace-pre-wrap ${
          detailedResults.length > 0 && detailedResults.every(t => t.status === "ACCEPTED") || runResult.includes("ACCEPTED")
              ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800"
              : runResult.includes("Chưa có")
                  ? "bg-muted/50 border-dashed border"
                  : runResult.includes("thất bại") || runResult.includes("WRONG_ANSWER")
                      ? "bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                      : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
      }`}
  >
    {runResult}

      {detailedResults.length > 0 && (
          <>
              {"\n\n"}Chi tiết:
              {"\n"}
              {detailedResults.map((r, i) => (
                  <div key={r.case_id} className="mt-2 border-t border-dashed pt-2">
                      <div className="flex justify-between">
                          <span className="font-medium">Case #{i + 1}</span>
                          <span
                              className={`${
                                  r.status === "ACCEPTED"
                                      ? "text-green-600 dark:text-green-400"
                                      : r.status === "WRONG_ANSWER"
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-yellow-600 dark:text-yellow-400"
                              }`}
                          >
                {r.status.replaceAll("_", " ")}
              </span>
                      </div>
                      <div className="text-xs opacity-80">
                          Thời gian: {r.time}ms
                      </div>
                      {r.message && (
                          <div className="text-xs italic mt-1 text-muted-foreground">
                              {r.message}
                          </div>
                      )}
                  </div>
              ))}
          </>
      )}
  </pre>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Cột 2: Code Editor */}
                        <div className="col-span-12 lg:col-span-5 h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Code Editor</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as Language)}
                                            className="h-9 rounded-md border bg-background px-2 text-sm"
                                        >
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                            <option value="python">Python</option>
                                        </select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRunCode}
                                            disabled={isBattleFinished}
                                        >
                                            <Play className="h-4 w-4 mr-1"/> Kiểm thử
                                        </Button>
                                        <Button
                                            className="cursor-pointer"
                                            size="sm"
                                            onClick={handleSubmitCode}
                                            disabled={isBattleFinished}
                                        >
                                            <SendHorizonal className="h-4 w-4 mr-1"/> Nộp bài
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-hidden">
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
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cột 3: Bảng xếp hạng */}
                        <div className="col-span-12 lg:col-span-3 h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="flex-shrink-0">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BarChart className="w-5 h-5"/> Bảng Xếp Hạng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                                    <div className="flex-shrink-0 border-b">
                                        <Table>
                                            <TableHeader className="bg-muted">
                                                <TableRow>
                                                    <TableHead className="w-12">#</TableHead>
                                                    <TableHead>Người Chơi</TableHead>
                                                    <TableHead className="text-right w-20">Điểm</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                        </Table>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar">
                                        <Table className="no-scrollbar">
                                            <TableBody className="no-scrollbar">
                                                <AnimatePresence >
                                                    {competitors.map((c) => (
                                                        <motion.tr
                                                            key={c.username}
                                                            layout
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                                                            className="border-b"
                                                        >
                                                            <TableCell className="font-bold w-12">{c.rank}</TableCell>
                                                            <TableCell
                                                                className={
                                                                    c.username.split("@")[0] === currentUser ? "font-bold" : ""
                                                                }
                                                            >
                                                                {c.username.split("@")[0]}
                                                                {c.username.split("@")[0] === currentUser && " (Bạn)"}
                                                            </TableCell>
                                                            <TableCell className="text-right text-lg font-bold text-green-600 w-20">
                                                                {c.score}
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface LeaderboardEntry {
    username: string;
    rank: number;
    score: number;
}

interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
}

interface LeaderboardItem extends LeaderboardEntry {
    id: number;
}

// ====================================================================
//                             III. MAIN CONTROLLER
// ====================================================================

export default function CodeCombatControllerPage() {
    // Quản lý trạng thái giao diện hiện tại
    const [currentView, setCurrentView] = useState<View>(View.HOME);
    const [roomId, setRoomId] = useState<string>("");
    const [players, setPlayers] = useState<Competitor[]>([]);
    const [timeRemain, setTimeRemain] = useState(120);
    const [problem, setProblem] = useState<Problem>(MOCK_PROBLEM)
    const [submitResponse, setSubmitResponse] = useState<any>();

    const { subscribe, isConnected } = useSocket();
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        if (!isConnected) {
            console.log("⏳ Waiting for connection...");
            return;
        }
        subscriptionRef.current = subscribe(`/user/queue`, (msg) => {
            switch (msg.type) {
                case "USER_LIST":
                    const competitors: Competitor[] = msg.data.usernames.map((name: string, index: number) => ({
                        username: name,
                        rank: index + 1,
                        score: 0
                    }));
                    setPlayers(competitors)
                    if (currentView == View.HOME) {
                        setCurrentView(View.LOBBY)
                    }
                    break

                case "ROOM_CANCEL":
                    notify("info", {
                        title: "Thông báo",
                        description: msg.message,
                    })
                    setCurrentView(View.HOME)
                    break

                case "NEW_USER":
                    setPlayers((prevPlayers) => [
                        ...prevPlayers,
                        {
                            username: msg.data.username,
                            rank: prevPlayers.length + 1,
                            score: 0,
                        },
                    ]);
                    break

                case "TIME_REMAIN":
                    const createdAt = new Date(msg.data);
                    const now = new Date();
                    let diffMs = now.getTime() - createdAt.getTime();

                    const twoMinutes = 2 * 60 * 1000;
                    diffMs -= twoMinutes;

                    diffMs = -diffMs
                    console.log("Khoảng cách sau khi trừ 2 phút (ms): ", Math.floor(diffMs / 1000));

                    setTimeRemain(Math.floor(diffMs / 1000));
                    break

                case "STATUS":
                    notify("info", {
                        title: "Thông báo",
                        description: msg.message
                    })
                    break

                case "ROOM_REJOIN":
                    setRoomId(msg.data.roomId)
                    if (msg.data.problem != null) {
                        console.log(msg.data.problem)
                        setProblem(msg.data.problem)
                        setCurrentView(View.BATTLE)
                    }
                    break


                case "ROOM_START":
                    setRoomId(msg.data.roomId)
                    setProblem(msg.data.problem)
                    setCurrentView(View.BATTLE)
                    break

                case "ROOM_END":
                    notify("info", {
                        title: "Thông báo",
                        description: `Trận đấu đã kết thúc: Rank #${msg.data.rank}`
                    })
                    setCurrentView(View.HOME)
                    break

                case "LEADERBOARD":
                    const leaderboard : LeaderboardEntry[] = msg.data.leaderboard
                    const list : Competitor[] = leaderboard.map((item, index) => ({
                        id: index + 1,
                        username: item.username,
                        rank: item.rank,
                        score: item.score
                    }));
                    setPlayers(list);
                    break

                case "SUBMIT_RESPONSE":
                    // notify("info", {
                    //     title: "Thông báo",
                    //     description: msg.message
                    // })
                    setSubmitResponse(msg)
                    break

                default:
                    console.log(msg.type)
                    break;
            }
        });
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                console.log("🔕 Unsubscribed");
            }
        };
    }, [subscribe, isConnected]);

    // Handlers để chuyển đổi View
    const handleStartMatchmaking = useCallback(() => {
        apiGet<string>("/combat/join")
    }, []);
    const handleEnterBattle = useCallback((id: string) => {
        // setRoomId(id);
        // setCurrentView(View.BATTLE);
    }, []);
    const handleExit = useCallback(() => {
        // setRoomId(null);
        // setCurrentView(View.HOME);
    }, []);

    // Logic Render nội dung chính
    const renderContent = () => {
        switch (currentView) {
            case View.HOME:
                return <HomePage onStartMatchmaking={handleStartMatchmaking}/>;
            case View.LOBBY:
                // Truyền hàm để chuyển sang Battle khi đủ người
                return <LobbyPage onEnterBattle={handleEnterBattle} onCancel={handleExit} players={players}
                                  initialWaitCountdown={timeRemain} roomId={roomId}/>;
            case View.BATTLE:
                // Đảm bảo roomId tồn tại khi render Battle
                // if (!roomId) return <div className="p-10 text-center">Đang tải phòng đấu...</div>;
                return <BattlePage onExit={handleExit} comp={players} problem={problem} roomId={roomId} submitResponse={submitResponse}/>;
            default:
                return <HomePage onStartMatchmaking={handleStartMatchmaking}/>;
        }
    };

    return (
        <div className="">
            <Header/>
            <div className="max-w-7xl container mx-auto py-3 ">
                {renderContent()}
            </div>
        </div>
    );
}