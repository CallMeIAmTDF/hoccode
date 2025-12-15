
"use client"

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { apiGet } from "@/lib/api";
import { notify } from "@/components/notify";
import {
    Search,
    Filter,
    Clock,
    Code2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Timer,
    Cpu,
    ArrowLeft,
    Copy,
    Check,
    FileCode,
    ChevronLeft,
    ChevronRight,
    Layout,
    Trophy,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {Pageable} from "@/lib/types/types";

// --- Types ---

type StatusEnum = 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'CANT_BE_JUDGED' | 'IN_QUEUE';

interface MySubmissionResponse {
    id: string;
    pid: number;
    code: string;
    language: string;
    status: StatusEnum;
    totalTestCases: number;
    passedTestCase: number;
    maxTime: number;
    createdAt: string;
    isContest: boolean;
}

// interface Pageable<T> {
//     content: T[];
//     totalPages: number;
//     totalElements: number;
//     size: number;
//     number: number;
//     first: boolean;
//     last: boolean;
//     empty: boolean;
// }

// --- Hooks ---

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const LANGUAGE_EXTENSION_MAP: Record<string, string> = {
    'cpp': 'cpp',
    'c++': 'cpp',
    'java': 'java',
    'python': 'py',
};
// --- Components ---

const StatusBadge = ({ status }: { status: StatusEnum }) => {
    const config = {
        ACCEPTED: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Accepted" },
        WRONG_ANSWER: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Wrong Answer" },
        TIME_LIMIT_EXCEEDED: { icon: Timer, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Time Limit" },
        COMPILATION_ERROR: { icon: AlertCircle, color: "text-orange-600 bg-orange-50 border-orange-200", label: "Compilation Error" },
        CANT_BE_JUDGED: { icon: Code2, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Cant Be Judged" },
        IN_QUEUE: { icon: Clock, color: "text-slate-600 bg-slate-50 border-slate-200", label: "In Queue" },
    }[status] || { icon: AlertCircle, color: "text-slate-600", label: status };

    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2.5 py-0.5", config.color)}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </Badge>
    );
};

export default function ProfileSubmissionPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Pageable<MySubmissionResponse> | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<MySubmissionResponse | null>(null);
    const [page, setPage] = useState(0);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterType, setFilterType] = useState<string>("ALL"); // 'ALL' | 'CONTEST' | 'PRACTICE'
    const [searchPid, setSearchPid] = useState("");
    const [copied, setCopied] = useState(false);

    const debouncedSearchPid = useDebounce(searchPid, 200);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("size", "15");
            // params.append("sort", "createdAt,desc"); // Assuming backend default or needed

            if (filterStatus !== "ALL") params.append("status", filterStatus);
            if (debouncedSearchPid.trim()) params.append("pid", debouncedSearchPid.trim());

            if (filterType === "CONTEST") params.append("isContest", "true");
            else if (filterType === "PRACTICE") params.append("isContest", "false");

            const res = await apiGet<Pageable<MySubmissionResponse>>(`/submission/me?${params.toString()}`);
            setData(res);

        } catch (error: any) {
            console.error(error);
            notify("error", { title: "Lỗi", description: "Không thể tải danh sách bài nộp" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [page, filterStatus, filterType, debouncedSearchPid]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [filterStatus, filterType, debouncedSearchPid]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        notify("success", { title: "Đã sao chép code" });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // --- Detail View (Split Screen) ---
    if (selectedSubmission) {
        return (
            <div className="flex h-screen flex-col bg-slate-50 overflow-hidden">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
                        {/* Detail Header */}
                        <div className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0 h-16">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(null)}
                                    className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại danh sách
                                </Button>
                                <div className="h-6 w-px bg-slate-200" />
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        Bài nộp #{selectedSubmission.id.substring(0, 8)}...
                                        {selectedSubmission.isContest && <Badge variant="secondary" className="text-[10px] h-5 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">Contest</Badge>}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Problem ID: <span className="font-mono font-medium text-indigo-600">{selectedSubmission.pid}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selectedSubmission.status} />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyCode(selectedSubmission.code)}
                                    className="gap-2"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? "Đã copy" : "Copy Code"}
                                </Button>
                            </div>
                        </div>

                        {/* Split Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left: Code Viewer */}
                            <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
                                <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] text-xs select-none">
                                    <span className="text-slate-300 flex items-center gap-2">
                                        <Code2 className="w-3.5 h-3.5 text-blue-400" />
                                        solution.{LANGUAGE_EXTENSION_MAP[selectedSubmission.language.toLowerCase()] ?? selectedSubmission.language.toLowerCase()}
                                    </span>
                                    <span className="text-slate-500 uppercase">{selectedSubmission.language}</span>
                                </div>
                                <ScrollArea className="flex-1 w-full">
                                    <div className="p-4">
                                        <pre className="font-mono text-sm text-slate-200 leading-relaxed tab-4">
                                            <code>{selectedSubmission.code}</code>
                                        </pre>
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Right: Info Panel */}
                            <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0">
                                <div className="p-6 space-y-6">
                                    {/* Summary Card */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <Layout className="w-4 h-4 text-slate-500" />
                                            Thông tin thực thi
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="text-xs text-slate-500 mb-1">Thời gian chạy</div>
                                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                    {selectedSubmission.maxTime}ms
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="text-xs text-slate-500 mb-1">Test cases</div>
                                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                                                    {selectedSubmission.passedTestCase}/{selectedSubmission.totalTestCases}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Detail List */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <FileCode className="w-4 h-4 text-slate-500" />
                                            Chi tiết
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Trạng thái</span>
                                                <span className="font-medium text-slate-700">{selectedSubmission.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Ngôn ngữ</span>
                                                <span className="font-medium text-slate-700 uppercase">{selectedSubmission.language}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Thời gian nộp</span>
                                                <span className="font-medium text-slate-700 text-right text-xs">
                                                    {formatDate(selectedSubmission.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Loại bài</span>
                                                <Badge variant={selectedSubmission.isContest ? "secondary" : "outline"} className="font-normal">
                                                    {selectedSubmission.isContest ? "Contest" : "Practice"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fun Fact / Encouragement */}
                                    {selectedSubmission.status !== 'ACCEPTED' && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                                            <p className="font-medium mb-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                Đừng nản chí!
                                            </p>
                                            <p className="text-xs opacity-90">
                                                Hãy kiểm tra lại các trường hợp biên và logic thuật toán của bạn.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // --- Main List View ---
    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/*<div className="flex items-center justify-between mb-6 shrink-0">*/}
                    {/*    <div>*/}
                    {/*        <h1 className="text-2xl font-bold text-slate-900">Lịch sử nộp bài</h1>*/}
                    {/*        <p className="text-slate-500 text-sm mt-1">Quản lý và xem lại các bài giải của bạn</p>*/}
                    {/*    </div>*/}
                    {/*    <div className="flex items-center gap-3">*/}
                    {/*        /!* Stats Mini Cards could go here *!/*/}
                    {/*        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">*/}
                    {/*            <CheckCircle2 className="w-4 h-4 text-emerald-500" />*/}
                    {/*            <span>Đã hoàn thành: <span className="font-semibold text-slate-700">{data?.totalElements || 0}</span></span>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Filter Bar */}
                    <Card className="mb-6 py-4 shadow-sm border-slate-200 shrink-0 gap-0">
                        <CardContent className="px-4 py-0 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm theo ID bài tập..."
                                        className="pl-9 bg-slate-50"
                                        value={searchPid}
                                        onChange={(e) => setSearchPid(e.target.value)}
                                        // Removed onKeyDown, using debounce in useEffect
                                    />
                                </div>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full sm:w-[230px] bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                                            <SelectValue placeholder="Trạng thái" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                        <SelectItem value="WRONG_ANSWER">Wrong Answer</SelectItem>
                                        <SelectItem value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</SelectItem>
                                        <SelectItem value="COMPILATION_ERROR">Compilation Error</SelectItem>
                                        <SelectItem value="CANT_BE_JUDGED">Cant Be Judged</SelectItem>
                                        <SelectItem value="IN_QUEUE">In Queue</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-full sm:w-[150px] bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Layout className="w-3.5 h-3.5 text-slate-500" />
                                            <SelectValue placeholder="Loại bài" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả loại</SelectItem>
                                        <SelectItem value="PRACTICE">Luyện tập</SelectItem>
                                        <SelectItem value="CONTEST">Cuộc thi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Optional: Add clear filters button if needed */}
                        </CardContent>
                    </Card>

                    {/* Table List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1 no-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-20">#PID</th>
                                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                    <th className="px-6 py-4 font-semibold">Loại</th>
                                    <th className="px-6 py-4 font-semibold">Ngôn ngữ</th>
                                    <th className="px-6 py-4 font-semibold text-center">Test Cases</th>
                                    <th className="px-6 py-4 font-semibold text-right">Thời gian chạy</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ngày nộp</th>
                                    {/*<th className="px-6 py-4 font-semibold text-center w-20">Hành động</th>*/}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded mx-auto"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded ml-auto"></div></td>
                                            {/*<td className="px-6 py-4"></td>*/}
                                        </tr>
                                    ))
                                ) : data?.content && data.content.length > 0 ? (
                                    data.content.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedSubmission(item)}
                                        >
                                            <td className="px-6 py-4 font-medium text-indigo-600">
                                                {item.pid}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.isContest ? (
                                                    <div className="flex items-center gap-1.5 text-purple-600">
                                                        <Trophy className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-semibold">Contest</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        <span className="text-xs">Practice</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className="uppercase text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                        {item.language}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1 text-slate-600">
                                                        <span className={item.passedTestCase === item.totalTestCases ? "text-emerald-600 font-bold" : ""}>
                                                            {item.passedTestCase}
                                                        </span>
                                                    <span className="text-slate-400">/</span>
                                                    <span>{item.totalTestCases}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums text-slate-600">
                                                {item.maxTime}ms
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            {/*<td className="px-6 py-4 text-center">*/}
                                            {/*    <Button*/}
                                            {/*        variant="ghost"*/}
                                            {/*        size="sm"*/}
                                            {/*        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"*/}
                                            {/*    >*/}
                                            {/*        <ChevronRight className="w-4 h-4 text-slate-400" />*/}
                                            {/*    </Button>*/}
                                            {/*</td>*/}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-3 bg-slate-50 rounded-full">
                                                    <Search className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p>Không tìm thấy bài nộp nào phù hợp.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {data && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Trang <span className="font-medium">{data.number + 1}</span> / {data.totalPages || 1}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.first}
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.last}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-8"
                                    >
                                        Sau <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
