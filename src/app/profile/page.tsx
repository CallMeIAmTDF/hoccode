"use client"

import React, {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Flame, Trophy, Medal, BarChart3, Edit2, Cpu, Cake, Bot, PenLine} from "lucide-react"
import {Header} from "@/components/header";
import CalendarHeatmap from "react-calendar-heatmap";
import {format, eachDayOfInterval, startOfYear, endOfYear} from "date-fns";
import {apiGet} from "@/lib/api";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import RadarProblemsChart from "@/components/problem-radar-chart";
import {ApiCategory} from "@/lib/types/problem";
import {AIAnalysis, DailySubmission, ProfileStats, Stats, StatsProps, UserStatsData} from "@/lib/types/profile";
import {notify} from "@/components/notify";
import {useRouter} from "next/navigation";
import LeetCodeStats from "@/app/test/ProgressChart";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {Sidebar} from "@/components/sidebar";
import UserStatsModal from "@/app/test2/UserStatsModal";
import {AnalysisReportModal} from "@/components/AIAccountAnalysisModal";


interface HeatmapData {
    date: string;
    count?: number;
}

const intensityColors: Record<number, string> = {
    0: "fill-gray-200",
    1: "fill-green-200",
    2: "fill-green-400",
    3: "fill-green-600",
    4: "fill-green-800",
};

export default function ProfilePage() {
    const startDate = startOfYear(new Date());
    const endDate = endOfYear(new Date());
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [radarData, setRadarData] = useState<ApiCategory[]>([])
    const [profileData, setProfileData] = useState<ProfileStats>();
    const [progress, setProgress] = useState<StatsProps>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [daily, setDaily] = useState<DailySubmission[]>([])

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        if (!token) {
            notify("error", {
                title: "Chưa đăng nhập",
                description: "Chuyển đến trang đăng nhập ...",
                duration: 1500,
            })
            router.replace("/auth/signin")
        }
    }, []);

    function formatDateToVietnamese(dateStr: string | undefined) {
        if (!dateStr) return ""
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `tháng ${month} năm ${year}`;
    }

    function formatDate(dob: string) {
        const date = new Date(dob);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function isBirthdayToday(dob: string) {
        const date = new Date(dob);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    }


    const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
    const [loadingAnalysisModal, setLoadingAnalysisModal] = useState<boolean>(true);
    const [analysisData, setAnalysisData] = useState<UserStatsData | null>(null)

    const [aiAnalysisModalOpen, setAIAnalysisModalOpen] = useState<boolean>(false);
    const [aiLoadingAnalysisModal, setAILoadingAnalysisModal] = useState<boolean>(true);
    const [aiAnalysisData, setAIAnalysisData] = useState<AIAnalysis | null>(null)

    const handleAnalysis = async () => {
        try {
            setAnalysisModalOpen(true);
            const analysis = await apiGet<UserStatsData>("/profile/analysis");
            setAnalysisData(analysis);
        } catch (err: any){
            setAnalysisModalOpen(false);
            notify('error', {
                title: "Lỗi tải dữ liệu",
                description: "Lấy dữ liệu không thành công"
            })
        } finally {
            setLoadingAnalysisModal(false);
        }
    }

    const handleAiAnalysis = async () => {
        try {
            setAIAnalysisModalOpen(true);
            setAnalysisModalOpen(false);
            const summary = await apiGet<AIAnalysis>("/ai/profile");
            setAIAnalysisData(summary);
        } catch (err: any){
            setAIAnalysisModalOpen(false);
            notify('error', {
                title: "Lỗi tải dữ liệu",
                description: "Lấy dữ liệu không thành công"
            })
        } finally {
            setAILoadingAnalysisModal(false);
        }
    }

    const handleUpdate = () => {

    }

    async function fetchHeatmap() {
        const heatmap = await apiGet<Record<string, number>>("/profile/heatmap")
        const newData: HeatmapData[] = eachDayOfInterval({start: startDate, end: endDate}).map((date) => {
            const key = format(date, "yyyy-MM-dd");
            return {
                date: key,
                count: heatmap[key] ?? 0,
            };
        });
        setHeatmapData(newData);
    }

    async function fetchRadarChart() {
        const radar = await apiGet<ApiCategory[]>("/profile/submissionByCategory")
        setRadarData(radar)
    }

    async function fetchStats() {
        const stats = await apiGet<ProfileStats>("/profile/stats")
        setProfileData(stats)
    }

    async function fetchProblemSolvedDiff() {
        const stats = await apiGet<Stats>("/profile/problemSolvedDiff")
        console.log(stats)
        setProgress({
            stats: stats
        })
    }

    async function fetchDailySubmission() {
        const dailySubmission = await apiGet<DailySubmission[]>("/profile/getDailySubmissions")
        console.log(dailySubmission)


        const formattedData = dailySubmission.map(item => ({
            ...item,
            day: new Date(item.day).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})
        }));
        setDaily(formattedData)

    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchHeatmap(),
                    fetchRadarChart(),
                    fetchStats(),
                    fetchProblemSolvedDiff(),
                    fetchDailySubmission(),
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Header/>
                <div className="flex flex-1">
                    <Sidebar/>
                    <main className="flex-1">
                        <div className="container mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left column */}
                            <Card className="lg:col-span-1 bg-background shadow-md">
                                {profileData ? (
                                    <>
                                        <CardHeader>
                                            <CardTitle className="flex flex-col items-center gap-2">
                                                <Avatar
                                                    className="w-24 h-24 cursor-pointer ring-2 ring-muted hover:ring-blue-700 transition">
                                                    {profileData?.info.avatar ? (
                                                        <AvatarImage src={profileData.info.avatar}
                                                                     alt={`${profileData.info.name} avatar`}/>
                                                    ) : (
                                                        <AvatarFallback>
                                                            {profileData?.info.name?.charAt(0).toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <span className="text-xl font-semibold">{profileData.info.name}</span>
                                                <span className="text-sm text-muted-foreground">
            {profileData.info.email.split("@")[0]}
          </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-around text-center">
                                                <div>
                                                    <p className="font-bold">{profileData.point}</p>
                                                    <p className="text-xs text-muted-foreground">Điểm</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">#{profileData.rank}</p>
                                                    <p className="text-xs text-muted-foreground">Xếp hạng</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">{profileData.solved}</p>
                                                    <p className="text-xs text-muted-foreground">Đã giải</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">{profileData.streak.maxStreak}</p>
                                                    <p className="text-xs text-muted-foreground">Chuỗi</p>
                                                </div>
                                            </div>
                                            <Separator/>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                Ngày sinh: {formatDate(profileData.info.dob)}
                                                {isBirthdayToday(profileData.info.dob) &&
                                                    <Cake className="w-4 h-4 text-pink-500"/>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Tham gia vào {formatDateToVietnamese(profileData.joined)}
                                            </p>
                                            {/*<Separator/>*/}

                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white shadow hover:bg-slate-100 transition"
                                                    onClick={() => handleUpdate()}
                                                >
                                                    <PenLine className="w-4 h-4"/>
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
                                                    onClick={() => handleAnalysis()}
                                                >
                                                    <BarChart3 className="w-4 h-4"/>
                                                    Phân tích chi tiết
                                                </button>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (

                                    <div className="flex justify-center items-center w-full h-full">
                                        <Spinner/>
                                    </div>
                                )}
                            </Card>

                            {/* Right column */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Cột 1 */}
                                    <Card className="gap-1">
                                        <CardHeader>
                                            <CardTitle>Thử thách đã hoàn thành</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex justify-center items-center min-h-[200px]">
                                            {progress?.stats ? (
                                                <div className="w-full">
                                                    <LeetCodeStats stats={progress.stats}/>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center w-full h-full">
                                                    <Spinner/>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Cột 2 */}
                                    {
                                        !loading ? (
                                            <RadarProblemsChart apiData={radarData}/>
                                        ) : (
                                            <div className="flex justify-center items-center w-full h-full">
                                                <Spinner/>
                                            </div>
                                        )
                                    }

                                </div>

                                {/* Activity */}
                                <Card className="gap-1">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-1">
                                            <BarChart3 className="h-5 w-5 text-blue-500"/>
                                            Hoạt động
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="recent" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="recent">10 ngày gần nhất</TabsTrigger>
                                                <TabsTrigger value="heatmap">Hoạt động trong
                                                    năm {new Date().getFullYear()}</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="recent">
                                                {/*  Chart here  */}
                                                <div className="h-[151px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={daily}>
                                                            <XAxis
                                                                dataKey="day"
                                                                stroke="#888888"
                                                                fontSize={10}
                                                                tickLine={false}
                                                                axisLine={false}
                                                            />
                                                            <YAxis
                                                                stroke="#888888"
                                                                fontSize={12}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickFormatter={(value) => `${value}`}
                                                            />
                                                            <Tooltip
                                                                cursor={{fill: 'hsl(210 40% 96.1%)'}}
                                                                content={({payload, label}) => {
                                                                    if (payload && payload.length) {
                                                                        return (
                                                                            <div
                                                                                className="bg-white p-2 border border-gray-200 rounded-md shadow-md">
                                                                                <p className="text-sm font-bold">{`Ngày: ${label}`}</p>
                                                                                <p className="text-sm">{`Số lượng: ${payload[0].value}`}</p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Bar
                                                                dataKey="count"
                                                                fill="hsl(214 91.6% 76.9%)"
                                                                radius={[4, 4, 0, 0]}
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="heatmap">
                                                <CalendarHeatmap
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    values={heatmapData}
                                                    classForValue={(value: HeatmapData | undefined) => {
                                                        if (!value || !value.count) return intensityColors[0];
                                                        const intensity = Math.max(Math.min(value.count / 7, 4), 1);
                                                        return intensityColors[intensity];
                                                    }}
                                                    showWeekdayLabels
                                                    titleForValue={(value: HeatmapData | undefined) =>
                                                        value ? `${value.date}: ${value.count ?? 0} submissions` : "No submissions"
                                                    }
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <UserStatsModal loading={loadingAnalysisModal} open={analysisModalOpen} onOpenChange={setAnalysisModalOpen} data={analysisData} onAnalyzeWithAI={handleAiAnalysis}></UserStatsModal>
                        <AnalysisReportModal data={aiAnalysisData} onClose={() => {setAIAnalysisModalOpen(false)}} isLoading={aiLoadingAnalysisModal} isOpen={aiAnalysisModalOpen}/>

                    </main>
                </div>
            </div>
        </>
    )
}