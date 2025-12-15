"use client"

import {useState, useMemo, useEffect} from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Calendar, Clock, Pencil, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import {calcHours} from "@/utils/time";
import {apiGet} from "@/lib/api";
import {notify} from "@/components/notify";

interface Contest {
    id: number
    title: string
    description: string
    numAttendees: number
    maxAttendees: number
    startTime: string
    endTime: string
    deleted: boolean
    isEditable: boolean
}

export default function ContestListPage() {
    const [search, setSearch] = useState("")
    const [contests, setContests] = useState<Contest[]>([
        {
            id: 4,
            title: "thaidangfa@gmail.com 123",
            description: "thaidangfa@gmail.com 123",
            numAttendees: 0,
            maxAttendees: 999999,
            startTime: "2025-09-11T21:59:00",
            endTime: "2025-09-13T00:53:00",
            deleted: false,
            isEditable: true,
        },
        {
            id: 3,
            title: "thaidangfa@gmail.com",
            description: "thaidangfa@gmail.com",
            numAttendees: 0,
            maxAttendees: 999999,
            startTime: "2025-09-11T14:46:00",
            endTime: "2025-09-12T14:44:00",
            deleted: false,
            isEditable: true,
        },
        {
            id: 2,
            title: "thaidangfa@gmail.com",
            description: "thaidangfa@gmail.com",
            numAttendees: 0,
            maxAttendees: 999999,
            startTime: "2025-09-11T14:14:00",
            endTime: "2025-09-13T14:11:00",
            deleted: false,
            isEditable: false,
        },
        {
            id: 1,
            title: "September Coding Contest 2025",
            description:
                "A monthly programming contest with algorithmic and data structure problems.",
            numAttendees: 1,
            maxAttendees: 256,
            startTime: "2025-09-08T12:00:00",
            endTime: "2025-09-15T12:00:00",
            deleted: false,
            isEditable: true,
        },
    ])

    const router = useRouter()

    useEffect(() => {
        const fetchMyContest = async () => {
            try{
                const data = await apiGet<Contest[]>(`/contest/me`)
                setContests(data)
            }catch (err: any){
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: err.message
                })
            }
        }
        fetchMyContest()
    }, []);

    const filtered = useMemo(() => {
        const s = search.toLowerCase()
        return contests.filter(
            (c) =>
                c.title.toLowerCase().includes(s) ||
                c.description.toLowerCase().includes(s)
        )
    }, [contests, search])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">
                    {/* Thanh tìm kiếm */}
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm cuộc thi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>

                    {/* Danh sách contest */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((contest) => (
                            <Card
                                key={contest.id}
                                className="hover:shadow-lg transition-shadow flex flex-col"
                            >
                                <CardHeader className="relative">
                                    <CardTitle className="text-lg font-semibold pr-6">
                                        {contest.title}
                                    </CardTitle>
                                    {contest.isEditable && (
                                        <Pencil
                                            className="absolute top-4 right-4 w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                                            onClick={() => router.push(`/profile/contest/${contest.id}/update`)}
                                        />
                                    )}
                                    <p className="text-sm text-gray-500">{contest.description}</p>
                                </CardHeader>

                                <CardContent className="flex flex-col justify-between flex-1">
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>
                        {contest.numAttendees} người tham gia
                      </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                        {new Date(contest.startTime).toLocaleString()}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>
                        {calcHours(contest.startTime, contest.endTime)}
                      </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="mt-4 cursor-pointer"
                                        onClick={() => router.push(`/profile/contest/${contest.id}`)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
