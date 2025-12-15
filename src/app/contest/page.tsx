"use client"

import React, {useEffect, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Users, Calendar, Lock, Clock, Search, Plus, ArrowRight} from "lucide-react"
import {calcHours} from "@/utils/time";
import {Header} from "@/components/header";
import {Contest} from "@/lib/types/contest";
import {apiGet} from "@/lib/api";
import {notify} from "@/components/notify";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {useRouter} from "next/navigation";

// Helper function để tính countdown
function useCountdown(targetDate: Date) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const difference = targetDate.getTime() - new Date().getTime();
        return difference > 0 ? difference : 0;
    });

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            const difference = targetDate.getTime() - new Date().getTime();
            setTimeLeft(difference > 0 ? difference : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, timeLeft]);

    if (timeLeft <= 0) return null;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (days > 0) {
        return `${days} ngày ${hours}h ${minutes}p`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}p ${seconds}s`;
    } else {
        return `${minutes}p ${seconds}s`;
    }
}

// Helper function để lấy status và style
function getContestStatus(startTime: string, endTime: string) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return {
            status: 'upcoming',
            label: 'Sắp diễn ra',
            className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    } else if (now >= start && now <= end) {
        return {
            status: 'ongoing',
            label: 'Đang diễn ra',
            className: 'bg-green-100 text-green-800 border-green-200'
        };
    } else {
        return {
            status: 'ended',
            label: 'Đã kết thúc',
            className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
}

// Component cho countdown
function CountdownDisplay({ contest }: { contest: Contest }) {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    let targetDate: Date;
    let prefix: string;
    let color: string;
    if (now < start) {
        targetDate = start;
        prefix = "Bắt đầu sau";
        color = "green";
    } else if (now >= start && now <= end) {
        targetDate = end;
        color = "orange";
        prefix = "Kết thúc sau";
    } else {
        return (
            <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-gray-600"/>
                <span className="text-gray-600">Đã kết thúc</span>
            </div>
        );
    }

    const countdown = useCountdown(targetDate);

    if (!countdown) return null;

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className={`w-4 h-4 text-${color}-600`}/>
            <span className={`text-${color}-600`}>{prefix}: {countdown}</span>
        </div>
    );
}

export default function ContestPage() {
    const [search, setSearch] = useState("")
    const [tab, setTab] = useState("all")
    const [contests, setContests] = useState<Contest[]>([])
    const now = new Date()
    const router = useRouter();

    async function fetchContests() {
        try {
            const data = await apiGet<Contest[]>("/contest")
            setContests(data)
        } catch (err) {
            notify("error", {
                title: "Lỗi",
                description: "Không tải được cuộc thi"
            })
        }
    }

    const filtered = contests.filter((c) => {
        const start = new Date(c.startTime)
        const end = new Date(c.endTime)

        let matchTab = false
        if (tab === "all") matchTab = true
        if (tab === "upcoming") matchTab = start > now
        if (tab === "ongoing") matchTab = start <= now && end >= now
        if (tab === "past") matchTab = end < now

        const searchLower = search.toLowerCase()
        const matchSearch =
            c.title.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower)

        return matchTab && matchSearch
    })

    useEffect(() => {
        fetchContests()
    }, []);

    return (
        <>
            <Header/>

            <div className="max-w-7xl flex flex-col h-screen p-6 space-y-6 mx-auto">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder="Tìm kiếm cuộc thi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>

                    <Tabs
                        defaultValue="all"
                        value={tab}
                        onValueChange={setTab}
                        className="md:ml-auto"
                    >
                        <TabsList>
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                            <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
                            <TabsTrigger value="ongoing">Đang diễn ra</TabsTrigger>
                            <TabsTrigger value="past">Đã kết thúc</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button className="md:ml-4 whitespace-nowrap" onClick={() => {
                        router.push("/contest/create")
                    }}>
                        <Plus></Plus> Tạo cuộc thi
                    </Button>
                </div>

                {/* Danh sách contest */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {contests.length === 0 ? (
                            <div className="flex justify-center items-center w-full h-full col-span-full">
                                <Spinner/>
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="text-center text-slate-500 col-span-full">
                                Không có cuộc thi nào
                            </p>
                        ) : (
                            filtered.map((contest) => {
                                const contestStatus = getContestStatus(contest.startTime, contest.endTime);

                                return (
                                    <Card
                                        key={contest.id}
                                        className="hover:shadow-lg transition rounded-2xl"
                                    >
                                        <CardHeader className="relative">
                                            <CardTitle className="flex items-center gap-2 text-base min-h-[3rem]">
                                                {contest.title}
                                                {contest.hasPassword && (
                                                    <Lock className="w-4 h-4 text-slate-500"/>
                                                )}
                                            </CardTitle>
                                            <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                                                {contest.description}
                                            </p>
                                        </CardHeader>

                                        <CardContent className="space-y-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4"/>
                                                {new Date(contest.startTime).toLocaleString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4"/>
                                                {calcHours(contest.startTime, contest.endTime)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4"/>
                                                {contest.numAttendees} người tham gia
                                            </div>

                                            {/* Countdown display */}
                                            <CountdownDisplay contest={contest} />

                                            <Button variant="outline" className="w-full cursor-pointer"
                                                    onClick={() => {
                                                        router.push(`/contest/${contest.id}`)
                                                    }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    )
}