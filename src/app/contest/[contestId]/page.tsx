"use client"

import React, {use, useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Calendar, Clock, Users, Lock, Bell, ArrowRight} from "lucide-react"
import Link from "next/link"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Header} from "@/components/header";
import {ContestDetail, LeaderBoard} from "@/lib/types/contest";
import {apiGet, apiGetFile, apiPost} from "@/lib/api";
import {notify} from "@/components/notify";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {useRouter} from "next/navigation";
import {calcHours, toHHMMDDMMYYYY} from "@/utils/time";

export default function ContestDetailPage({params}: { params: Promise<{ contestId: string }> }) {
    const unwrappedParams = use(params);
    const contestId = unwrappedParams.contestId;
    const [isRegistered, setIsRegistered] = useState(false)
    const [passwordInput, setPasswordInput] = useState("")
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [contestDetail, setContestDetail] = useState<ContestDetail>()
    const [leaderboard, setLeaderboard] = useState<LeaderBoard>()
    const [isContestActive, setIsContestActive] = useState<boolean>(true)

    const router = useRouter()

    async function fetchContestDetail() {
        try {
            const data = await apiGet<ContestDetail>(`/contest/${contestId}`)
            setContestDetail(data)
            setIsContestActive(getContestStatus(data.startTime, data.endTime) !== "ended")
        } catch (err) {
            notify("error", {
                title: "Lỗi",
                description: "Tải dữ liệu cuộc thi không thành công"
            })
            router.push("/contest")
        }
    }

    const handleDownloadContestProblem = async () => {
        try {
            const blob = await apiGetFile(`/contest/${contestId}/generatePDF`);

            const url = window.URL.createObjectURL(new Blob([blob]));

            const a = document.createElement('a');
            a.href = url;
            a.download = `contest_${contestId}.pdf`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    async function fetchLeaderboard(){
        try {
            const data = await apiGet<LeaderBoard>(`/contest/${contestId}/leaderboard`)
            setLeaderboard(data)
        } catch (err) {
            notify("error", {
                title: "Lỗi",
                description: "Tải dữ liệu cuộc thi không thành công"
            })
            router.push("/contest")
        }
    }

    async function fetchIsJoin(){
        try {
            const data = await apiGet<boolean>(`/contest/${contestId}/isJoined`)
            setIsRegistered(data)
        } catch (err) {
            notify("error", {
                title: "Lỗi",
                description: "Tải dữ liệu cuộc thi không thành công"
            })
            router.push("/contest")
        }
    }

    useEffect(() => {
        fetchContestDetail()
        fetchLeaderboard()
        fetchIsJoin()
    }, []);

    async function handleJoinAPI() {
        try{
            const data = await apiPost<any>(`/contest/${contestId}/join?password=${passwordInput}`)
            notify("success", {
                title: "Thông báo",
                description: "Tham gia thành công"
            })
            setIsRegistered(true)
        }catch(err : any){
            notify("error", {
                title: "Lỗi",
                description: err.message ?? "Tham gia không thành công"
            })
        }

    }

    const handleRegister = () => {
        if (contestDetail?.hasPassword && !showPasswordInput) {
            setShowPasswordInput(true)
            return
        }
        handleJoinAPI()
        setShowPasswordInput(false)
    }

    const difficultyColor = {
        Beginner: "bg-green-500",
        Intermediate: "bg-yellow-500",
        Advanced: "bg-red-500",
    }

    function getContestStatus(startTime: string, endTime: string) {
        const now = new Date()
        const start = new Date(startTime)
        console.log({'now': now})
        console.log({"start": start})
        const end = new Date(endTime)
        console.log({"end": end})

        if (now < start) return "upcoming"
        if (now > end) return "ended"
        return "ongoing"
    }

    const statusColor = {
        upcoming: "bg-blue-500",
        ongoing: "bg-green-500",
        ended: "bg-gray-500",
    }

    const difficultyProblemColor = {
        EASY: "bg-green-500",
        MEDIUM: "bg-yellow-500",
        HARD: "bg-red-500",
    }

    const statusText: Record<typeof status, string> = {
        upcoming: "Sắp bắt đầu",
        ongoing: "Đang diễn ra",
        ended: "Đã kết thúc",
    }


    return (
        <>
            <Header></Header>
            <div className="max-w-7xl container mx-auto px-4 py-8">
                {contestDetail ? (
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        {/* Contest Details */}
                        <div className="w-full md:w-2/3">
                            <div
                                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                {/* Contest Info Left */}
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{contestDetail.title}</h1>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={statusColor[getContestStatus(contestDetail.startTime, contestDetail.endTime)]}>
                                            {statusText[getContestStatus(contestDetail.startTime, contestDetail.endTime)]}
                                        </Badge>
                                        {contestDetail.hasPassword && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Lock className="h-3 w-3"/>
                                                Không công khai
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    {!isContestActive ? (
                                        <></>
                                    ) : !isRegistered ? (
                                        showPasswordInput ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Nhập mật khẩu"
                                                    value={passwordInput}
                                                    onChange={(e) => setPasswordInput(e.target.value)}
                                                    className="w-40"
                                                />
                                                <Button onClick={handleRegister}>Xác nhận</Button>
                                            </div>
                                        ) : (
                                            <Button onClick={handleRegister}>Tham gia</Button>
                                        )
                                    ) : (
                                        <Button variant="outline" disabled>
                                            Đã tham gia
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Contest Details Card */}
                            <Card className="mb-6 shadow-sm rounded-xl">
                                <CardContent className="">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-blue-500"/>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Bắt đầu</div>
                                                <div
                                                    className="font-medium">{toHHMMDDMMYYYY(contestDetail.startTime)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-green-500"/>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Thời gian</div>
                                                <div
                                                    className="font-medium">{calcHours(contestDetail.startTime, contestDetail.endTime)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-purple-500"/>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Người tham gia</div>
                                                <div className="font-medium">{contestDetail.numAttendees}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                                        <p className="text-muted-foreground leading-relaxed">{contestDetail.description}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Tabs defaultValue="problems">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="problems">Thử thách</TabsTrigger>
                                    <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
                                </TabsList>

                                <TabsContent value="problems" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Danh sách thử thách</CardTitle>
                                            <Button variant="outline" size="sm" onClick={handleDownloadContestProblem} className="cursor-pointer">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="mr-2 h-4 w-4"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" x2="12" y1="15" y2="3" />
                                                </svg>
                                                Tải về tất cả
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {contestDetail.problems.map((problem, index) => (
                                                    <Link
                                                        key={problem.id}
                                                        href={`/contest/${contestId}/problem/${problem.id}`}
                                                        className="block"
                                                    >
                                                        <div
                                                            key={problem.id}
                                                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border hover:shadow-sm transition"
                                                        >
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                              <span className="font-semibold text-lg">
                                                                {String.fromCharCode(65 + index)}. {problem.title}
                                                              </span>
                                                                    {problem.accepted && (
                                                                        <Badge variant="secondary"
                                                                               className="bg-green-100 text-green-700 border-none">
                                                                            ✔ Đã hoàn thành
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div
                                                                    className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                                    <Badge
                                                                        className={
                                                                            difficultyProblemColor[
                                                                                problem.difficulty as keyof typeof difficultyProblemColor
                                                                                ]
                                                                        }
                                                                    >
                                                                        {problem.difficulty}
                                                                    </Badge>
                                                                    <span>{problem.passCount} hoàn thành</span>
                                                                    <span>•</span>
                                                                    <span>{problem.failCount} thất bại</span>
                                                                    <span>•</span>
                                                                    <span>{problem.timeLimit > 1000 ? problem.timeLimit / 1000 : problem.timeLimit}s / {problem.memoryLimit} KB</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 mt-3 md:mt-0">
                                                                <div
                                                                    className="text-primary font-semibold">{problem.point} pts
                                                                </div>
                                                                {isContestActive && isRegistered && (
                                                                    <Button size="sm" asChild>
                                                                        <Link
                                                                            href={`/contest/${contestId}/problem/${problem.id}`}>
                                                                            Solve
                                                                        </Link>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="leaderboard" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Bảng xếp hạng</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {leaderboard?.entries.map((user, index) => (
                                                    <div
                                                        key={user.username}
                                                        className="flex items-center justify-between p-4 border rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="font-bold text-xl w-8">{index + 1}</div>
                                                            <Avatar>
                                                                <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{user.username}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {user.problemStatuses.filter(ps => ps.status === "ACCEPTED").length} đã hoàn thành
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-primary">{user.totalPoints} pts</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Contest Rules and Info */}
                        <div className="w-full md:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thể lệ</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-1">Tính điểm</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Điểm được tính dựa trên độ khó của bài toán. Bài nộp vượt qua toàn bộ
                                            trường hợp kiểm thử sẽ được cộng điểm.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Gian lận</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Việc sao chép mã từ người tham gia khác hoặc các nguồn trực tuyến bị
                                            nghiêm cấm và sẽ bị loại.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Nộp bài</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Bạn có thể nộp nhiều lần. Điểm số sẽ được tính cho lần hoàn thành đầu
                                            tiên.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center w-full h-full">
                        <Spinner/>
                    </div>
                )}
            </div>

        </>
    )
}

