"use client"

import React, {useState, useMemo, useEffect} from 'react';
// Import UI components
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
// Import Lucide Icons
import {
    Inbox, Search, AlertTriangle, Bug, Zap, Lightbulb, CheckCheck, X, Eye, Clock, User, ArrowRight, Save,
    Settings, FileText, Frown, Code
} from 'lucide-react';
import {Report, ReportTypeEnum} from "@/lib/types/admin";
import {apiGet, apiPost} from "@/lib/api";
import {notify} from "@/components/notify";

// ====================================================================
// TYPES & MOCK DATA (CẬP NHẬT)
// ====================================================================


const mockReports: Report[] = [
    {
        id: 1,
        title: "Lỗi hiển thị kết quả sai của Problem 1001",
        description: "Khi nộp bài <b>Two Sum</b> với input X, hệ thống trả về <code style='color:red; background-color:#fef2f2; padding:2px 4px; border-radius:4px;'>WA</code> nhưng test case chạy trên local lại <code style='color:green; background-color:#f0fdf4; padding:2px 4px; border-radius:4px;'>AC</code>. Có vẻ sai ở bộ test. <br/><br/><i>Đây là mô tả báo cáo có chứa nội dung HTML.</i>",
        type: ReportTypeEnum.PROBLEM,
        target: "Problem 1001: Two Sum",
        solved: false,
        solved_message: "",
        createdAt: "2025-10-25T10:00:00Z",
        createdBy: "user_a",
        updatedAt: "2025-10-25T10:00:00Z",
        updatedBy: "user_a",
    },
    {
        id: 2,
        title: "Không thể login bằng Google",
        description: "Chức năng đăng nhập bằng Google bị lỗi, bị redirect về trang login.",
        type: ReportTypeEnum.SYSTEM,
        target: "Auth System",
        solved: false,
        solved_message: "",
        createdAt: "2025-10-24T18:00:00Z",
        createdBy: "guest_user",
        updatedAt: "2025-10-24T18:00:00Z",
        updatedBy: "guest_user",
    },
    {
        id: 3,
        title: "Kết quả của submission ID 5000 bị sai",
        description: "Hệ thống báo Time Limit Exceeded, nhưng code của tôi chỉ tốn 0.5s trên local.",
        type: ReportTypeEnum.SUBMISSION,
        target: "Submission ID: 5000",
        solved: true,
        solved_message: "Đã kiểm tra lại. Lỗi do code của người dùng bị vòng lặp vô hạn với bộ test ẩn.",
        createdAt: "2025-10-23T14:00:00Z",
        createdBy: "coder_viet",
        updatedAt: "2025-10-23T15:30:00Z",
        updatedBy: "admin_dev",
    },
    {
        id: 4,
        title: "Không tìm thấy Contest đã tham gia",
        description: "Contest 'Thử thách Tháng 10' đã biến mất khỏi danh sách tham gia của tôi.",
        type: ReportTypeEnum.CONTEST,
        target: "Contest ID: 15",
        solved: true,
        solved_message: "Contest này đã kết thúc và được chuyển sang mục 'Lịch sử Contest'.",
        createdAt: "2025-10-22T08:00:00Z",
        createdBy: "user_c",
        updatedAt: "2025-10-22T10:00:00Z",
        updatedBy: "admin_dev",
    },
    {
        id: 5, title: "Góp ý giao diện", description: "Giao diện mobile cần tối ưu hơn một chút.",
        type: ReportTypeEnum.OTHER, target: "UI/UX", solved: false, solved_message: "",
        createdAt: "2025-10-26T11:00:00Z", createdBy: "user_d", updatedAt: "2025-10-26T11:00:00Z", updatedBy: "user_d",
    },
    {
        id: 6, title: "Lỗi Server 500 khi nộp bài", description: "Hệ thống bị lỗi 500 khi nộp bài Problem 1005.",
        type: ReportTypeEnum.SYSTEM, target: "Submission Server", solved: false, solved_message: "",
        createdAt: "2025-10-27T11:00:00Z", createdBy: "user_e", updatedAt: "2025-10-27T11:00:00Z", updatedBy: "user_e",
    },
];

// ====================================================================
// HELPERS (CẬP NHẬT)
// ====================================================================

const getTypeBadge = (type: ReportTypeEnum) => {
    switch (type) {
        case ReportTypeEnum.SYSTEM:
            return <Badge
                className="bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-1"><Settings
                className="w-3 h-3"/> Hệ thống</Badge>;
        case ReportTypeEnum.PROBLEM:
            return <Badge
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1"><FileText
                className="w-3 h-3"/> Thử thách</Badge>;
        case ReportTypeEnum.CONTEST:
            return <Badge
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1"><Zap
                className="w-3 h-3"/> Cuộc thi</Badge>;
        case ReportTypeEnum.SUBMISSION:
            return <Badge
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-1"><Code
                className="w-3 h-3"/> Bài nộp</Badge>;
        case ReportTypeEnum.OTHER:
            return <Badge variant="secondary" className="font-medium flex items-center gap-1"><Frown
                className="w-3 h-3"/> Khác</Badge>;
        default:
            return <Badge variant="secondary">Khác</Badge>;
    }
};

const getStatusBadge = (solved: boolean) => {
    if (solved) {
        return <Badge
            className="bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-1"><CheckCheck
            className="w-3 h-3"/> Đã giải quyết</Badge>;
    }
    return <Badge variant="outline"
                  className="text-yellow-700 border-yellow-300 bg-yellow-50 font-medium flex items-center gap-1"><Clock
        className="w-3 h-3"/> Đang chờ</Badge>;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}


// ====================================================================
// MAIN COMPONENT
// ====================================================================

const AdminReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal/Dialog States
    const [detailsReport, setDetailsReport] = useState<Report | null>(null); // For details view
    const [solvingReport, setSolvingReport] = useState<Report | null>(null); // For solve modal
    const [solveMessage, setSolveMessage] = useState('');
    const [isSolving, setIsSolving] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage, setReportsPerPage] = useState(5); // 5 reports per page

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await apiGet<Report[]>("/report")
                setReports(data)
            } catch (err: any) {
                notify("error", {
                    title: "Lỗi",
                    description: "Lấy báo cáo không thành công"
                })
            }
        }

        fetchReports()
    }, []);

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterStatus, reportsPerPage]);

    // Filter Logic
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.id.toString().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || report.type === filterType;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'solved' && report.solved) ||
                (filterStatus === 'unsolved' && !report.solved);

            return matchesSearch && matchesType && matchesStatus;
        }).sort((a, b) => {
            if (a.solved !== b.solved) {
                return a.solved ? 1 : -1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [reports, searchTerm, filterType, filterStatus]);

    // Pagination Logic
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

    const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Handle Open Details Dialog (Click vào hàng)
    const handleOpenDetails = (report: Report) => {
        setDetailsReport(report);
        setSolveMessage(report.solved_message || "");
        setSolvingReport(null); // Đảm bảo Solve Dialog đóng
    };

    // Handle Open Solve Modal
    const handleOpenSolveModal = () => {
        if (!detailsReport) return;
        setSolvingReport(detailsReport);
        setSolveMessage(detailsReport.solved_message || "");
        setDetailsReport(null);
    };

    // Handle Confirm Solve/Reopen (Trong Solve Modal)
    const handleConfirmSolve = async () => {
        if (!solvingReport) return;

        setIsSolving(true);

        // --- MOCK API CALL START ---
        const defaultMessage = `Đã giải quyết lúc ${formatDate(new Date().toISOString())}`
        const body = {
            id: solvingReport.id,
            message: solveMessage || defaultMessage
        }

        try {
            await apiPost<any>("/report/solved", body)
            notify("success", {
                title: "Thành công",
                description: "Đánh dấu báo cáo đã được giải quyết"
            })
        } catch (err: any) {
            notify("error", {
                title: "Lỗi",
                description: "Đánh dấu không thành công"
            })
        }

        const newSolvedStatus = !solvingReport.solved;

        // Cập nhật state cục bộ
        const updatedReport: Report = {
            ...solvingReport,
            solved: newSolvedStatus,
            solved_message: newSolvedStatus
                ? (solveMessage || defaultMessage)
                : solvingReport.solved_message,
            updatedAt: new Date().toISOString(),
            updatedBy: "admin",
        };

        setReports(prevReports =>
            prevReports.map(r => r.id === solvingReport.id ? updatedReport : r)
        );

        // Đóng modal
        setSolvingReport(null);
        setIsSolving(false);
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            {/*<h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 border-b pb-2">*/}
            {/*    <Inbox className="w-7 h-7 text-red-600" />*/}
            {/*    Hộp thư Báo cáo Người dùng*/}
            {/*</h1>*/}

            {/* Bộ lọc và Tìm kiếm */}
            <Card className="shadow-md">
                <CardContent className="px-4 flex flex-col md:flex-row gap-4 items-center">

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
                        <Input
                            placeholder="Tìm kiếm theo ID, Tiêu đề hoặc Mô tả..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* FILTER TYPE ĐÃ CẬP NHẬT */}
                    <Select onValueChange={setFilterType} defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Lọc theo Loại báo cáo"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Loại</SelectItem>
                            <SelectItem value={ReportTypeEnum.SYSTEM}>Hệ thống</SelectItem>
                            <SelectItem value={ReportTypeEnum.PROBLEM}>Thử thách</SelectItem>
                            <SelectItem value={ReportTypeEnum.CONTEST}>Cuộc thi</SelectItem>
                            <SelectItem value={ReportTypeEnum.SUBMISSION}>Bài nộp</SelectItem>
                            <SelectItem value={ReportTypeEnum.OTHER}>Khác</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setFilterStatus} defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Lọc theo Trạng thái"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Trạng thái</SelectItem>
                            <SelectItem value="unsolved">Đang chờ</SelectItem>
                            <SelectItem value="solved">Đã giải quyết</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Bảng Danh sách Báo cáo */}
            <Card className="shadow-lg gap-1">
                <CardHeader className="pb-1">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        {/*<AlertTriangle className="w-5 h-5 text-yellow-600" />*/}
                        Danh sách Báo cáo
                        {/*<Badge className="ml-2 bg-red-500 hover:bg-red-600">{filteredReports.filter(r => !r.solved).length}</Badge>*/}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className={""}>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead className="min-w-[250px]">Tiêu đề</TableHead>
                                <TableHead className="w-[120px]">Loại</TableHead>
                                <TableHead className="w-[150px]">Target</TableHead>
                                <TableHead className="w-[150px]">Người báo cáo</TableHead>
                                <TableHead className="w-[150px]">Thời gian tạo</TableHead>
                                <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                                <TableHead className="w-[80px] text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentReports.length > 0 ? (
                                currentReports.map((report) => (
                                    <TableRow key={report.id}
                                              className={`hover:bg-blue-50/50 cursor-pointer ${!report.solved ? 'bg-red-50/50' : 'opacity-80'}`}
                                              onClick={() => handleOpenDetails(report)}>
                                        <TableCell className="font-medium text-blue-600">{report.id}</TableCell>
                                        <TableCell
                                            className="font-semibold text-gray-700 max-w-[300px] truncate">{report.title}</TableCell>
                                        <TableCell>{getTypeBadge(report.type)}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{report.target}</TableCell>
                                        <TableCell className="text-sm text-gray-600 font-mono">
                                            <div className="flex items-center gap-1">
                                                {/*<User className="w-4 h-4" />*/}
                                                {report.createdBy.split("@")[0]}
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            className="text-sm text-gray-500">{formatDate(report.createdAt)}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(report.solved)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="outline" title="Chi tiết" onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDetails(report);
                                            }}>
                                                <Eye className="w-4 h-4 text-gray-500"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                        <AlertTriangle className="w-6 h-6 inline mr-2"/>
                                        Không tìm thấy Báo cáo nào phù hợp với điều kiện tìm kiếm/lọc.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Footer (Phân trang) */}
                <div className="p-4 border-t flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span className="mr-2">Hiển thị:</span>
                        <Select onValueChange={(val) => setReportsPerPage(Number(val))}
                                defaultValue={reportsPerPage.toString()}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue placeholder={reportsPerPage}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="hidden sm:inline">
                             Báo cáo/trang
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                         <span className="font-semibold text-gray-700">
                            Trang {currentPage} trên {totalPages || 1}
                        </span>
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <ArrowRight className="w-4 h-4 mr-1 rotate-180"/> Trước
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}>
                            Sau <ArrowRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* --- */}

            {/* Dialog Chi tiết Báo cáo (Click vào hàng) */}
            <Dialog open={!!detailsReport} onOpenChange={() => setDetailsReport(null)}>
                {detailsReport && (
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                Chi tiết Báo cáo #{detailsReport.id}
                                {/*{getStatusBadge(detailsReport.solved)}*/}
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết về báo cáo người dùng.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <h3 className="text-lg font-bold text-gray-800">{detailsReport.title}</h3>
                            <Separator/>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><span className="font-semibold">Loại:</span> {getTypeBadge(detailsReport.type)}</p>
                                <p><span className="font-semibold">Target:</span> <Badge
                                    variant="secondary">{detailsReport.target}</Badge></p>
                                <p><span className="font-semibold">Người gửi:</span> <span
                                    className="font-mono text-blue-600">{detailsReport.createdBy}</span></p>
                                <p><span
                                    className="font-semibold">Thời gian:</span> {formatDate(detailsReport.createdAt)}
                                </p>
                            </div>

                            <Label className="font-semibold mt-2">Nội dung Báo cáo:</Label>
                            <Card className="p-3 bg-gray-50 text-sm overflow-auto max-h-40">
                                {/* Hiển thị nội dung HTML */}
                                <div className="prose max-w-none text-sm"
                                     dangerouslySetInnerHTML={{__html: detailsReport.description}}/>
                            </Card>

                            {detailsReport.solved && (
                                <>
                                    <Label className="font-semibold mt-2 text-green-700">Phản hồi/Ghi chú Giải
                                        quyết:</Label>
                                    <Card className="p-3 bg-green-50 border-green-200 text-sm whitespace-pre-wrap">
                                        {detailsReport.solved_message}
                                    </Card>
                                </>
                            )}
                        </div>

                        <DialogFooter className="">
                            <Button variant="outline" onClick={() => setDetailsReport(null)}>
                                Đóng
                            </Button>

                            {!detailsReport.solved && <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleOpenSolveModal}
                            >
                                {/*<CheckCheck className="w-4 h-4 mr-2"/>*/}
                                Giải quyết Báo cáo
                            </Button>}
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            {/* Dialog Solve/Reopen Báo cáo (Mở từ nút Solve) */}
            <Dialog open={!!solvingReport} onOpenChange={() => setSolvingReport(null)}>
                {solvingReport && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className={`${solvingReport.solved ? 'text-red-600' : 'text-green-600'}`}>
                                {solvingReport.solved ? 'Mở lại Báo cáo' : 'Xác nhận Giải quyết'} #{solvingReport.id}
                            </DialogTitle>
                            <DialogDescription>
                                {solvingReport.solved
                                    ? 'Bạn có chắc chắn muốn mở lại báo cáo này?'
                                    : 'Vui lòng nhập phản hồi hoặc ghi chú nội bộ trước khi xác nhận giải quyết.'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {!solvingReport.solved && (
                                <>
                                    <Label htmlFor="solved-message-input" className="font-semibold">Phản hồi Giải quyết
                                        (Admin):</Label>
                                    <Textarea
                                        id="solved-message-input"
                                        placeholder="Nhập tin nhắn giải quyết, ghi chú nội bộ, hoặc phản hồi cho người dùng..."
                                        value={solveMessage}
                                        onChange={(e) => setSolveMessage(e.target.value)}
                                        rows={4}
                                    />
                                </>
                            )}
                            {solvingReport.solved && (
                                <p className="text-sm text-gray-500 italic">Tin nhắn hiện tại sẽ được giữ nguyên nếu bạn
                                    mở lại báo cáo.</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSolvingReport(null)} disabled={isSolving}>
                                Hủy
                            </Button>
                            <Button
                                className={`${solvingReport.solved ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                                onClick={handleConfirmSolve}
                                disabled={isSolving || (!solvingReport.solved && solveMessage.trim().length < 5)}
                            >
                                {isSolving ? (
                                    <>
                                        <Clock className="w-4 h-4 mr-2 animate-spin"/>
                                        Đang xử lý...
                                    </>
                                ) : solvingReport.solved ? (
                                    <>
                                        <X className="w-4 h-4 mr-2"/>
                                        Xác nhận Mở lại
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2"/>
                                        Xác nhận Giải quyết
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

        </div>
    );
};

export default AdminReportsPage;