"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Clock, Calendar, Code, TrendingUp, Medal, Award, Search, History, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Pie
} from 'recharts';
import {Sidebar} from "@/components/sidebar";
import {Header} from "@/components/header";
import {useRouter} from "next/navigation";
import {apiGet} from "@/lib/api";
import {toast} from "sonner";
import {notify} from "@/components/notify";

interface Contest {
    id: number;
    title: string;
    description: string;
    numAttendees: number;
    password?: string;
    startTime: string;
    endTime: string;
    deleted: boolean;
}

interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

interface ContestProblemStatusResponse {
    problemName: string;
    status: 'ACCEPTED' | 'UNACCEPTED' | 'NOT_SUBMITTED';
    acceptedCount: number;
    wrongCount: number;
}

interface ContestLeaderboardEntryDTO {
    username: string;
    totalPoints: number;
    problemStatuses: ContestProblemStatusResponse[];
}

interface ProblemSubmissionCount {
    problem: Problem;
    submissionCount: number;
    solvedCount: number;
    averageScore: number;
    acceptanceRate: number;
}

interface ContestLeaderboardResponse {
    contestName: string;
    entries: ContestLeaderboardEntryDTO[];
}

interface ContestActivity {
    recentSubmissions: Array<{
        username: string;
        problemName: string;
        status: 'ACCEPTED' | 'UNACCEPTED';
        submitTime: string;
    }>;
}

interface APIResponse {
    contest: Contest;
    countSubmissionByProblem: ProblemSubmissionCount[];
    leaderboard: ContestLeaderboardResponse;
    contestActivity: ContestActivity;
}

type SortField = 'rank' | 'username' | 'totalPoints' | 'solved';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;
type PageProps = {
    params: Promise<{
        contestId: string;
    }>;
};

export default async function ContestLeaderboard({ params }: PageProps){
    const { contestId } = await params;
    const [data, setData] = useState<APIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('rank');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter()

    useEffect(() => {
        const fetchContestStats = async () => {
            try{
                const data = await apiGet<APIResponse>(`/contest/${contestId}/stats`)
                setData(data)
                setLoading(false)
            }catch (err: any){
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: err.message,
                })
                router.push("/profile/contest")
            }
        }
        fetchContestStats()
    }, []);

    const computedStats = useMemo(() => {
        if (!data) return null;

        const entries = data.leaderboard.entries;
        const maxPoints = Math.max(...entries.map(e => e.totalPoints));
        const totalSubmissions = data.countSubmissionByProblem.reduce((sum, p) => sum + p.submissionCount, 0);
        const averageScore = entries.reduce((sum, e) => sum + e.totalPoints, 0) / entries.length;
        const totalSolved = entries.reduce((sum, e) => sum + e.problemStatuses.filter(p => p.status === 'ACCEPTED').length, 0);
        const completionRate = (totalSolved / (entries.length * data.countSubmissionByProblem.length)) * 100;

        // Score distribution for charts
        const scoreRanges = [
            { range: '0-200', count: 0, color: '#ef4444' },
            { range: '200-500', count: 0, color: '#f59e0b' },
            { range: '500-1000', count: 0, color: '#eab308' },
            { range: '1000+', count: 0, color: '#0ea5e9' }
        ];

        entries.forEach(entry => {
            const score = entry.totalPoints;
            if (score < 200) scoreRanges[0].count++;
            else if (score < 500) scoreRanges[1].count++;
            else if (score < 1000) scoreRanges[2].count++;
            else scoreRanges[3].count++;
        });

        // Problem difficulty distribution
        const difficultyStats = data.countSubmissionByProblem.reduce((acc, p) => {
            const diff = p.problem.difficulty;
            if (!acc[diff]) acc[diff] = { count: 0, solved: 0, submissions: 0 };
            acc[diff].count++;
            acc[diff].solved += p.solvedCount;
            acc[diff].submissions += p.submissionCount;
            return acc;
        }, {} as any);

        const difficultyChartData = Object.entries(difficultyStats).map(([difficulty, stats]: [string, any]) => ({
            difficulty,
            solved: stats.solved,
            submissions: stats.submissions,
            acceptance: (stats.solved / stats.submissions * 100).toFixed(1)
        }));

        return {
            maxPoints: Math.floor(maxPoints),
            totalSubmissions,
            averageScore: Math.floor(averageScore),
            completionRate: Math.floor(completionRate),
            scoreDistribution: scoreRanges,
            difficultyStats: difficultyChartData,
            participantsWithSubmissions: entries.filter(e => e.problemStatuses.some(p => p.status !== 'NOT_SUBMITTED')).length
        };
    }, [data]);

    // Add rank to entries and handle filtering/sorting
    const rankedEntries = useMemo(() => {
        if (!data) return [];

        return data.leaderboard.entries
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
                solvedCount: entry.problemStatuses.filter(p => p.status === 'ACCEPTED').length
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints);
    }, [data]);

    const filteredAndSortedEntries = useMemo(() => {
        if (!rankedEntries.length) return [];

        let filtered = rankedEntries.filter(entry =>
            entry.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case 'rank':
                    aValue = a.rank;
                    bValue = b.rank;
                    break;
                case 'username':
                    aValue = a.username.toLowerCase();
                    bValue = b.username.toLowerCase();
                    break;
                case 'totalPoints':
                    aValue = a.totalPoints;
                    bValue = b.totalPoints;
                    break;
                case 'solved':
                    aValue = a.solvedCount;
                    bValue = b.solvedCount;
                    break;
                default:
                    aValue = a.rank;
                    bValue = b.rank;
            }

            if (sortDirection === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [rankedEntries, searchQuery, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentEntries = filteredAndSortedEntries.slice(startIndex, endIndex);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-300';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'hard': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-slate-100 text-slate-600 border-slate-300';
        }
    };

    const getRankDisplay = (rank: number) => {
        if (rank === 1) return { icon: <Trophy className="w-4 h-4 text-yellow-600" />, bg: 'bg-yellow-50 border-yellow-200' };
        if (rank === 2) return { icon: <Medal className="w-4 h-4 text-slate-500" />, bg: 'bg-slate-50 border-slate-200' };
        if (rank === 3) return { icon: <Award className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' };
        return { icon: <span className="text-sm font-semibold text-slate-600">#{rank}</span>, bg: 'bg-white border-slate-200' };
    };

    const getStatusIcon = (status: ContestProblemStatusResponse) => {
        if (status.status === 'ACCEPTED') {
            return { icon: '✓', className: 'bg-green-500 text-white', tooltip: `AC (${status.wrongCount} wrong attempts)` };
        } else if (status.status === 'UNACCEPTED') {
            return { icon: status.wrongCount.toString(), className: 'bg-red-500 text-white', tooltip: `${status.wrongCount} wrong attempts` };
        } else {
            return { icon: '-', className: 'bg-slate-200 text-slate-500', tooltip: 'Not submitted' };
        }
    };

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 text-left font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
            {children}
            {sortField === field && (
                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
            )}
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Đang tải dữ liệu contest...</p>
                </div>
            </div>
        );
    }

    if (!data || !computedStats) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <div className="flex flex-1">
                <Sidebar/>
                <main className="min-h-screen bg-slate-50 flex-1 p-6 space-y-6">
                    {/* Contest Header */}
                    <div className="bg-white border-b border-slate-200 rounded-lg">
                        <div className="max-w-7xl mx-auto p-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{data.contest.title}</h1>
                                    <p className="text-slate-600 max-w-2xl">{data.contest.description}</p>
                                </div>
                                <div className="flex items-center gap-3 ml-6">

                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                                            <Users className="w-4 h-4"/>
                                            <span>{filteredAndSortedEntries.length} thí sinh</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            Contest #{data.contest.id}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Bắt đầu</p>
                                        <p className="font-medium text-slate-900">{formatDate(data.contest.startTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Kết thúc</p>
                                        <p className="font-medium text-slate-900">{formatDate(data.contest.endTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-slate-500"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Điểm cao nhất</p>
                                        <p className="font-medium text-slate-900">{computedStats.maxPoints}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-slate-500"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Điểm TB</p>
                                        <p className="font-medium text-slate-900">{computedStats.averageScore}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Code className="w-4 h-4 text-slate-500"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Lượt nộp</p>
                                        <p className="font-medium text-slate-900">{computedStats.totalSubmissions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="max-w-7xl mx-auto p-2">
                        {/* Top Row - Score Distribution, Problem Stats, Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Problem Stats */}
                            <Card className="h-[400px] flex flex-col gap-1">
                                <CardHeader className="pb-1">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Code className="w-5 h-5 text-slate-600"/>
                                        Thống kê bài tập
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto scrollbar-hide pt-1">
                                    <style>
                                        {`
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                        }
                        .scrollbar-hide {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}
                                    </style>
                                    <div className="space-y-4">
                                        {data.countSubmissionByProblem.map((item, index) => (
                                            <div key={index}
                                                 className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline"
                                                           className={`text-xs ${getDifficultyColor(item.problem.difficulty)}`}>
                                                        {item.problem.difficulty}
                                                    </Badge>
                                                    <span
                                                        className="text-xs text-slate-500">{item.acceptanceRate.toFixed(1)}%</span>
                                                </div>
                                                <p className="font-medium text-slate-900 text-sm mb-2">{item.problem.title}</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-slate-500">Lượt nộp</p>
                                                        <p className="font-semibold">{item.submissionCount}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Thành công</p>
                                                        <p className="font-semibold text-green-600">{item.solvedCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Score Distribution */}
                            <Card className="h-[400px] flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <PieChart className="w-5 h-5 text-slate-600"/>
                                        Phân bổ điểm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={computedStats.scoreDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="count"
                                            >
                                                {computedStats.scoreDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: any, name: any, props: any) => [value, props.payload.range]}/>
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-2 space-y-1">
                                        {computedStats.scoreDistribution.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <div className={`w-3 h-3 rounded`}
                                                     style={{backgroundColor: item.color}}></div>
                                                <span className="text-slate-600">{item.range}: {item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>


                            {/* Contest Activity */}
                            <Card className="h-[400px] flex flex-col">
                                <CardHeader className=" gap-1">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TrendingUp className="w-5 h-5 text-slate-600"/>
                                        Hoạt động
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm text-slate-700">Nộp gần đây</h4>
                                            {data.contestActivity.recentSubmissions.slice(0, 4).map((sub, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs">
                                            <span
                                                className="text-slate-600 truncate max-w-[100px]">{sub.username.split("@")[0]}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        sub.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                    {sub.status === 'ACCEPTED' ? 'AC' : 'WA'}
                                </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-3 border-t border-slate-200 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Đã nộp:</span>
                                                <span
                                                    className="font-semibold">{computedStats.participantsWithSubmissions}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Tỉ lệ hoàn thành:</span>
                                                <span className="font-semibold">{computedStats.completionRate}%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Điểm trung bình:</span>
                                                <span className="font-semibold">{computedStats.averageScore}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex justify-center pt-4">
                                        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push(`/profile/contest/${data.contest.id}/submissions`)}>
                                            <History className="w-4 h-4"/>
                                            Lịch sử nộp bài
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Leaderboard */}
                        <div className="grid grid-cols-1">
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Trophy className="w-5 h-5 text-slate-600"/>
                                            Bảng xếp hạng ({filteredAndSortedEntries.length} thí sinh)
                                        </CardTitle>
                                    </div>
                                    <div className="relative">
                                        <Search
                                            className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <Input
                                            placeholder="Tìm kiếm theo tên..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="grid grid-cols-12 gap-4 p-3 border-b border-slate-200 text-sm font-semibold text-slate-700">
                                        <div className="col-span-1">
                                            <SortHeader field="rank">Hạng</SortHeader>
                                        </div>
                                        <div className="col-span-3">
                                            <SortHeader field="username">Thí sinh</SortHeader>
                                        </div>
                                        <div className="col-span-2">
                                            <SortHeader field="totalPoints">Điểm số</SortHeader>
                                        </div>
                                        <div className="col-span-1">
                                            <SortHeader field="solved">Giải</SortHeader>
                                        </div>
                                        <div className="col-span-5 text-center">Bài tập</div>
                                    </div>
                                    <div className="space-y-1">
                                        {currentEntries.map((entry) => {
                                            const rankDisplay = getRankDisplay(entry.rank);
                                            return (
                                                <div key={entry.username}
                                                     className={`grid grid-cols-12 gap-4 p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm`}>
                                                    <div className="col-span-1 flex items-center">
                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                            {rankDisplay.icon}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex items-center">
                                                        <span
                                                            className="font-semibold text-slate-900">{entry.username}</span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                <span
                                                    className="font-bold text-slate-900">{Math.floor(entry.totalPoints)}</span>
                                                    </div>
                                                    <div className="col-span-1 flex items-center">
                                                <span
                                                    className="font-semibold text-green-600">{entry.solvedCount}</span>
                                                    </div>
                                                    <div className="col-span-5 flex items-center justify-center gap-1">
                                                        {entry.problemStatuses.map((problem, pIndex) => {
                                                            const statusDisplay = getStatusIcon(problem);
                                                            return (
                                                                <div
                                                                    key={pIndex}
                                                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${statusDisplay.className}`}
                                                                    title={`${problem.problemName}: ${statusDisplay.tooltip}`}
                                                                >
                                                                    {statusDisplay.icon}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div
                                        className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                                        <div className="text-sm text-slate-500">
                                            Hiển
                                            thị {startIndex + 1}-{Math.min(endIndex, filteredAndSortedEntries.length)} / {filteredAndSortedEntries.length} thí
                                            sinh
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4"/>
                                            </Button>
                                            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                                if (pageNum > totalPages) return null;
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === currentPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className="min-w-[2rem]"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

