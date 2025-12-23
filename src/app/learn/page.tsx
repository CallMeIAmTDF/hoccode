"use client"

import React, {useState, useMemo, useEffect} from "react"
import {Header} from "@/components/header"
import {ProblemList} from "@/components/problem-list"
import {Leaderboard} from "@/components/leaderboard"
import {apiGet} from "@/lib/api";
import {LeaderboardItem, Problem, Recommendation} from "@/lib/types/problem";
import {toast} from "sonner";
import {Pageable} from "@/lib/types/types";
import {useRouter} from "next/navigation";
import {notify} from "@/components/notify";
import {useWebsocket} from "next/dist/client/dev/hot-reloader/app/use-websocket";
import {useSocket} from "@/context/SocketProvider";
import {StreakNotification} from "@/components/animation/StreakNotification";
import {OnboardingTour} from "@/components/guidetour/OnboardingTour";
import {learnPageSteps} from "@/lib/onboard/steps";


interface FilterState {
    keyword: string
    difficulty: string
    categories: string[]
}

interface ProblemsResponse {
    daily: Problem
    problems: Pageable<Problem>
}

export default function LearnPage() {
    const [filters, setFilters] = useState<FilterState>({
        keyword: "",
        difficulty: "ALL",
        categories: [],
    })

    const [problemsData, setProblemsData] = useState<ProblemsResponse | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    const [runTour, setRunTour] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenTour || hasSeenTour === 'false') {
            const timer = setTimeout(() => {
                setRunTour(true);
                localStorage.setItem('hasSeenOnboarding', 'true');

            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isMounted]);


    useEffect(() => {
        async function fetchProblem() {
            try {
                const problems = await apiGet<ProblemsResponse>("/problem")
                setProblemsData(problems)
            } catch (e) {
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: "Không thể lấy thử thách",
                    duration: 1500,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchProblem()
    }, [filters])


    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const lb = await apiGet<LeaderboardItem[]>("/problem/leaderboard")
                setLeaderboard(lb)
            } catch (e) {
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: "Không thể lấy bảng xếp hạng",
                    duration: 1500,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])


    const filteredProblems = useMemo(() => {
        if (!problemsData?.problems?.content) return []
        return problemsData.problems.content.filter((problem) => {
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase()
                const matchesTitle = problem.title.toLowerCase().includes(keyword)
                const matchesDescription = problem.description.toLowerCase().includes(keyword)
                if (!matchesTitle && !matchesDescription) return false
            }
            if (filters.difficulty && filters.difficulty !== "ALL" && problem.difficulty !== filters.difficulty) {
                return false
            }
            if (filters.categories.length > 0) {
                const hasMatchingCategory = filters.categories.some((category) => problem.categories.includes(category))
                if (!hasMatchingCategory) return false
            }
            return true
        })
    }, [filters, problemsData])

    const handleProblemClick = (problemId: number) => {
        router.push(`/learn/${problemId}`)
    }
    const handleTourFinish = () => {
        setRunTour(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
    };

    const handleRandomProblemClick = async () => {
        try {
            const problem = await apiGet<Recommendation>(`/problem/recommend`);
            router.push(`/learn/${problem.recommend}`)
        } catch (err: any) {
            notify("error", {
                title: "Lỗi",
                description: "Có lỗi xảy ra, vui lòng thử lại"
            })
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {isMounted && <OnboardingTour run={runTour} onFinish={handleTourFinish} steps={learnPageSteps}/>}
            <Header/>
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {problemsData && (
                            <ProblemList
                                onRandom={handleRandomProblemClick}
                                problems={filteredProblems}
                                dailyProblem={problemsData.daily}
                                dailyProblemId={problemsData.daily.id}
                                filters={filters}
                                onFiltersChange={setFilters}
                                onProblemClick={handleProblemClick}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <Leaderboard users={leaderboard}/>
                    </div>
                </div>

            </div>
        </div>
    )
}
