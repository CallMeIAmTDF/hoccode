
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { apiGet } from "@/lib/api";
import {
    Search,
    Filter,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Bug,
    MessageSquare,
    Flag,
    ChevronLeft,
    ChevronRight,
    Eye,
    Calendar,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Types ---

enum ReportTypeEnum {
    SYSTEM = 'SYSTEM',
    PROBLEM = 'PROBLEM',
    CONTEST = 'CONTEST',
    SUBMISSION = 'SUBMISSION',
    OTHER = 'OTHER'
}

interface Report {
    id: number;
    title: string;
    description: string;
    type: ReportTypeEnum | string;
    target: string;
    solved: boolean;
    solved_message: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

// --- Components ---

const ReportTypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, { icon: any, color: string, label: string }> = {
        SYSTEM: { icon: Bug, color: "text-red-600 bg-red-50 border-red-200", label: "Lỗi hệ thống" },
        PROBLEM: { icon: MessageSquare, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Lỗi thử thách" },
        CONTEST: { icon: Flag, color: "text-orange-600 bg-orange-50 border-orange-200", label: "Lỗi cuộc thi" },
        SUBMISSION: { icon: User, color: "text-purple-600 bg-purple-50 border-purple-200", label: "Lỗi bài nộp" },
        OTHER: { icon: FileText, color: "text-slate-600 bg-slate-50 border-slate-200", label: "Khác" },
    };

    const style = config[type] || config.OTHER;
    const Icon = style.icon;

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2.5 py-0.5", style.color)}>
            {/*<Icon className="w-3.5 h-3.5" />*/}
            {style.label}
        </Badge>
    );
};

const ReportStatusBadge = ({ solved }: { solved: boolean }) => {
    if (solved) {
        return (
            <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 text-emerald-600 bg-emerald-50 border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã giải quyết
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 text-amber-600 bg-amber-50 border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Đang xử lý
        </Badge>
    );
};

const ReportDetailModal = ({
                               report,
                               isOpen,
                               onClose
                           }: {
    report: Report | null,
    isOpen: boolean,
    onClose: () => void
}) => {
    if (!report) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <ReportTypeBadge type={report.type} />
                        {/*<span className="text-xs text-slate-400 font-mono">#{report.id}</span>*/}
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-800 leading-tight">
                        {report.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.createdAt).toLocaleString('vi-VN')}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Target Info */}
                        {/*{report.target && (*/}
                        {/*    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">*/}
                        {/*        <span className="font-semibold text-slate-700 mr-2">Đối tượng báo cáo:</span>*/}
                        {/*        <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">{report.target}</code>*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                {/*<FileText className="w-4 h-4 text-slate-500" />*/}
                                Nội dung chi tiết
                            </h4>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {report.description}
                            </div>
                        </div>

                        {/* Solution / Response */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                {/*<CheckCircle2 className="w-4 h-4 text-slate-500" />*/}
                                Trạng thái xử lý
                            </h4>
                            {report.solved ? (
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2 text-sm">
                                        {/*<CheckCircle2 className="w-4 h-4" />*/}
                                        Đã được giải quyết
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {report.solved_message || "Yêu cầu của bạn đã được xử lý thành công."}
                                    </p>
                                    <div className="mt-3 text-xs text-emerald-600/70 border-t border-emerald-100 pt-2 flex justify-between">
                                        <span>Cập nhật bởi: {report.updatedBy.split("@")[0] || "Admin"}</span>
                                        <span>{new Date(report.updatedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                                    {/*<Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />*/}
                                    <div>
                                        <div className="text-amber-700 font-semibold text-sm mb-1">Đang chờ xử lý</div>
                                        <p className="text-sm text-amber-800/80">
                                            Đội ngũ quản trị viên đang xem xét báo cáo của bạn. Bạn sẽ nhận được thông báo khi có phản hồi.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-slate-50 shrink-0">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ProfileReportPage() {
    // State
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");
    const [filterSolved, setFilterSolved] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const ITEMS_PER_PAGE = 10;

    // Fetch Data
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                // TODO: Replace with actual API endpoint
                const data = await apiGet<Report[]>('/report');
                setReports(data || []);
            } catch (error) {
                console.error("Fetch reports error:", error);
                // Fallback mock data for testing UI if API fails
                generateMockData();
                // notify("error", { title: "Lỗi tải dữ liệu", description: "Không thể tải danh sách báo cáo." });
            } finally {
                setLoading(false);
            }
        };

        const generateMockData = () => {
            const mock: Report[] = Array.from({ length: 25 }).map((_, i) => ({
                id: 100 + i,
                title: i % 3 === 0 ? `Lỗi hiển thị bài tập ${1000+i}` : i % 3 === 1 ? "Góp ý về giao diện tối" : "Báo cáo người dùng gian lận",
                description: "Mô tả chi tiết về vấn đề này. Tôi đã gặp phải tình trạng này khi đang cố gắng nộp bài. Mong admin xem xét.",
                type: i % 3 === 0 ? ReportTypeEnum.SYSTEM : i % 3 === 1 ? ReportTypeEnum.CONTEST : ReportTypeEnum.PROBLEM,
                target: i % 3 === 0 ? `Problem #${1000+i}` : "System UI",
                solved: i % 2 === 0,
                solved_message: i % 2 === 0 ? "Đã sửa lỗi trong bản cập nhật mới nhất." : "",
                createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                createdBy: "user123",
                updatedAt: new Date(Date.now()).toISOString(),
                updatedBy: "admin"
            }));
            setReports(mock);
        }

        fetchReports();
    }, []);

    // Filter Logic
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === "ALL" || report.type === filterType;

            const matchesSolved = filterSolved === "ALL" ||
                (filterSolved === "SOLVED" && report.solved) ||
                (filterSolved === "PENDING" && !report.solved);

            return matchesSearch && matchesType && matchesSolved;
        });
    }, [reports, searchQuery, filterType, filterSolved]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const currentReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType, filterSolved]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/*<div className="flex items-center justify-between mb-6 shrink-0">*/}
                    {/*    <div>*/}
                    {/*        <h1 className="text-2xl font-bold text-slate-900">Lịch sử báo cáo</h1>*/}
                    {/*        <p className="text-slate-500 text-sm mt-1">Theo dõi trạng thái các yêu cầu hỗ trợ của bạn</p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Filter Bar */}
                    <Card className="mb-6 shadow-sm border-slate-200 shrink-0 gap-0 py-4 ">
                        <CardContent className="px-4 py-0 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm báo cáo..."
                                        className="pl-9 bg-slate-50"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-full sm:w-[160px] bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                                            <SelectValue placeholder="Loại báo cáo" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả loại</SelectItem>
                                        <SelectItem value={ReportTypeEnum.SYSTEM}>Lỗi hệ thống</SelectItem>
                                        <SelectItem value={ReportTypeEnum.PROBLEM}>Lỗi thử thách</SelectItem>
                                        <SelectItem value={ReportTypeEnum.CONTEST}>Lỗi cuộc thi</SelectItem>
                                        <SelectItem value={ReportTypeEnum.SUBMISSION}>Lỗi bài nộp</SelectItem>
                                        <SelectItem value={ReportTypeEnum.OTHER}>Khác</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterSolved} onValueChange={setFilterSolved}>
                                    <SelectTrigger className="w-full sm:w-[190px] bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                            <SelectValue placeholder="Trạng thái" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="SOLVED">Đã giải quyết</SelectItem>
                                        <SelectItem value="PENDING">Đang xử lý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-sm text-slate-500 hidden md:block">
                                Hiển thị <span className="font-semibold text-slate-900">{filteredReports.length}</span> kết quả
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100">
                                <tr>
                                    {/*<th className="px-6 py-4 font-semibold w-20">#ID</th>*/}
                                    <th className="px-6 py-4 font-semibold">Tiêu đề</th>
                                    <th className="px-6 py-4 font-semibold">Loại</th>
                                    <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                    {/*<th className="px-6 py-4 font-semibold text-right w-20"></th>*/}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {/*<td className="px-6 py-4"><div className="h-4 w-8 bg-slate-100 rounded"></div></td>*/}
                                            <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                                            {/*<td className="px-6 py-4"></td>*/}
                                        </tr>
                                    ))
                                ) : currentReports.length > 0 ? (
                                    currentReports.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedReport(item)}
                                        >
                                            {/*<td className="px-6 py-4 font-medium text-slate-500">*/}
                                            {/*    {item.id}*/}
                                            {/*</td>*/}
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800 line-clamp-1 max-w-xs md:max-w-md">
                                                    {item.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ReportTypeBadge type={item.type} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ReportStatusBadge solved={item.solved} />
                                            </td>
                                            {/*<td className="px-6 py-4 text-right">*/}
                                            {/*    <Button*/}
                                            {/*        variant="ghost"*/}
                                            {/*        size="sm"*/}
                                            {/*        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"*/}
                                            {/*    >*/}
                                            {/*        <Eye className="w-4 h-4 text-indigo-600" />*/}
                                            {/*    </Button>*/}
                                            {/*</td>*/}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-3 bg-slate-50 rounded-full">
                                                    <AlertTriangle className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p>Không tìm thấy báo cáo nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredReports.length > 0 && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Trang <span className="font-medium">{currentPage}</span> / {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

            {/* Detail Modal */}
            <ReportDetailModal
                isOpen={!!selectedReport}
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}
