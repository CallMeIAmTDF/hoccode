import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
    CheckCircle,
    XCircle,
    TrendingUp,
    Calendar,
    Code2,
    Award,
    BarChart3,
    Activity,
    Trophy,
    Zap,
    Clock, Code, Sunrise, Sunset, Bot, Loader2, AlertTriangle, Moon
} from 'lucide-react';
import {DailyTimeSlotAnalysis, UserStatsData} from "@/lib/types/profile";
import {Button} from "@/components/ui/button";


interface UserStatsModalProps {
    open: boolean;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    data: UserStatsData | null;
    onAnalyzeWithAI?: () => void;
}

const timeSlotTranslation: { [key: string]: string } = {
    'EARLY_MORNING': 'SÁNG SỚM',
    'MORNING': 'SÁNG',
    'AFTERNOON': 'CHIỀU',
    'EVENING': 'TỐI',
    'N/A': 'N/A',
};

const dayOfWeekTranslation: { [key: string]: string } = {
    'MONDAY': 'Thứ Hai',
    'TUESDAY': 'Thứ Ba',
    'WEDNESDAY': 'Thứ Tư',
    'THURSDAY': 'Thứ Năm',
    'FRIDAY': 'Thứ Sáu',
    'SATURDAY': 'Thứ Bảy',
    'SUNDAY': 'Chủ Nhật',
    'N/A': 'N/A',
};


const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200">
            {[1, 2, 3].map(i => (
                <Card key={i} className="flex-1 min-w-[200px] h-[100px] border-l-4 border-gray-300">
                    <CardHeader className="pb-2"><div className="h-3 w-1/2 bg-gray-200 rounded"></div></CardHeader>
                    <CardContent><div className="h-8 w-3/4 bg-gray-300 rounded"></div></CardContent>
                </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-1 shadow-md h-[300px]"><div className="h-full w-full bg-gray-100 rounded-lg"></div></Card>
            <Card className="col-span-1 lg:col-span-2 shadow-md h-[300px]"><div className="h-full w-full bg-gray-100 rounded-lg"></div></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md h-[250px]"><div className="h-full w-full bg-gray-100 rounded-lg"></div></Card>
            <Card className="shadow-md h-[250px]"><div className="h-full w-full bg-gray-100 rounded-lg"></div></Card>
        </div>
    </div>
);

export const UserStatsModal: React.FC<UserStatsModalProps> = ({open, loading, onOpenChange, data, onAnalyzeWithAI}) => {

    // Xử lý trạng thái Loading
    if (loading) {
        return (
            <>
                <style dangerouslySetInnerHTML={{
                    __html: `
                [data-radix-dialog-overlay] {
                    pointer-events: none !important;
                }
                [data-radix-dialog-content] {
                    pointer-events: auto !important;
                }
            `
                }}/>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[1200px] max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                <Loader2 className="w-8 h-8 mr-2 animate-spin"/> Đang Tải Thống Kê...
                            </DialogTitle>
                            <DialogDescription className="text-base text-gray-600">
                                Vui lòng chờ trong giây lát.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
                            <LoadingSkeleton/>
                        </div>
                        <DialogFooter className="p-4 border-t bg-white flex justify-end">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6" disabled>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // Xử lý trạng thái Không có dữ liệu (data === null)
    if (!data) {
        return (
            <>
                <style dangerouslySetInnerHTML={{
                    __html: `
                [data-radix-dialog-overlay] {
                    pointer-events: none !important;
                }
                [data-radix-dialog-content] {
                    pointer-events: auto !important;
                }
            `
                }}/>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-w-xl w-[95vw]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Activity className="w-6 h-6"/> Thống Kê Hoạt Động
                            </DialogTitle>
                        </DialogHeader>
                        <div className="text-center py-10 text-gray-500">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500"/>
                            <p className="text-lg">Không thể tải dữ liệu thống kê.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    const {passedSubmissions, failedSubmissions} = data.submissionSummary;
    const totalSubmissions = passedSubmissions + failedSubmissions;

    // Logic chính: Kiểm tra xem người dùng đã submit lần nào chưa
    const hasSubmissionData = totalSubmissions > 0;

    const successRate = hasSubmissionData ? (passedSubmissions / totalSubmissions) * 100 : 0;
    const failureRate = 100 - successRate;

    // 1. Xử lý dữ liệu Time Slot (sử dụng toán tử nullish coalescing `??` và optional chaining `?.`)
    const timeSlots: DailyTimeSlotAnalysis = {
        EARLY_MORNING: data.dailyTimeSlotAnalysis?.EARLY_MORNING ?? 0,
        MORNING: data.dailyTimeSlotAnalysis?.MORNING ?? 0,
        AFTERNOON: data.dailyTimeSlotAnalysis?.AFTERNOON ?? 0,
        EVENING: data.dailyTimeSlotAnalysis?.EVENING ?? 0,
    };

    const totalTimeSlots = (Object.values(timeSlots) as number[])
        .reduce((sum, count) => sum + count, 0);

    const getTimeSlotPercent = (count: number) => {
        return totalTimeSlots > 0 ? Math.round((count / totalTimeSlots) * 100) : 0;
    };

    const timeSlotData = [
        { key: "EARLY_MORNING", name: "SÁNG SỚM", icon: <Moon className="w-4 h-4 text-gray-500"/>, count: timeSlots.EARLY_MORNING, color: "from-gray-400 to-slate-500" },
        { key: "MORNING", name: "SÁNG", icon: <Sunrise className="w-4 h-4 text-orange-500"/>, count: timeSlots.MORNING, color: "from-orange-400 to-amber-500" },
        { key: "AFTERNOON", name: "CHIỀU", icon: <Clock className="w-4 h-4 text-teal-500"/>, count: timeSlots.AFTERNOON, color: "from-teal-400 to-green-500" },
        { key: "EVENING", name: "TỐI", icon: <Sunset className="w-4 h-4 text-purple-500"/>, count: timeSlots.EVENING, color: "from-purple-500 to-indigo-600" },
    ].filter(slot => (slot.count ?? 0) > 0);

    const busiestTimeSlotKey = data.dayOfWeekAnalysis?.busiestTimeSlot ?? 'N/A';
    const busiestDayKey = data.dayOfWeekAnalysis?.busiestDay ?? 'N/A';

    const busiestTimeSlotVi = timeSlotTranslation[busiestTimeSlotKey] || busiestTimeSlotKey;
    const busiestDayVi = dayOfWeekTranslation[busiestDayKey] || busiestDayKey;

    const categoryEntries = Object.entries(data.categorySubmissionCount || {})
        .sort(([, a], [, b]) => b - a);

    const languageEntries = Object.entries(data.languageSubmissionSummary || {});

    const formatJoinedDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                [data-radix-dialog-overlay] {
                    pointer-events: none !important;
                }
                [data-radix-dialog-content] {
                    pointer-events: auto !important;
                }
            `
            }}/>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[1200px] max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            {/*<Activity className="w-8 h-8"/> */}
                            Thống Kê Hoạt Động Người Dùng
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-600">
                            Tổng quan về hiệu suất, thói quen và kỹ năng lập trình của bạn.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 flex-1 overflow-y-auto bg-gray-50 space-y-4 no-scrollbar">
                        {/* Hàng 1: Tổng quan (Rank, Point, Joined) - Luôn hiển thị */}
                        <div className="flex flex-wrap gap-8 pb-4 border-b border-gray-200">
                            <Card className="flex-1 min-w-[200px] border-l-4 border-yellow-500 gap-1 py-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                    <CardTitle className="text-sm font-medium text-gray-600">Thứ Hạng</CardTitle>
                                    <Trophy className="w-4 h-4 text-yellow-500"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-800">#{data.stats.rank}</div>
                                </CardContent>
                            </Card>

                            <Card className="flex-1 min-w-[200px] border-l-4 border-blue-500 gap-1 py-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                    <CardTitle className="text-sm font-medium text-gray-600">Điểm Tích Lũy</CardTitle>
                                    <Zap className="w-4 h-4 text-blue-500"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-800">{data.stats.point}</div>
                                </CardContent>
                            </Card>

                            <Card className="flex-1 min-w-[200px] border-l-4 border-green-500 gap-1 py-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Tham Gia Từ</CardTitle>
                                    <Calendar className="w-4 h-4 text-green-500"/>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="text-base font-bold text-gray-800">{formatJoinedDate(data.stats.joined)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* KHỐI NỘI DUNG CHÍNH: Hiển thị cảnh báo nếu không có submission */}
                        {!hasSubmissionData ? (
                            <div
                                className="text-center py-10 px-6 bg-white rounded-xl border-2 border-dashed border-indigo-200 shadow-sm">
                                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-indigo-500"/>
                                <h3 className="text-xl font-semibold text-gray-700">Chưa có dữ liệu hoạt động</h3>
                                <p className="text-gray-500">Hãy bắt đầu giải một bài tập để xem thống kê chi tiết về
                                    hiệu suất và thói quen của bạn!</p>
                            </div>
                        ) : (
                            <>
                                {/* Hàng 2: Trực quan hóa & Phân tích chính */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Card 1: Tỷ lệ Success/Failed */}
                                    <Card className="col-span-1 lg:col-span-1 shadow-md gap-1 py-4">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                {/*<TrendingUp className="w-6 h-6"/> */}
                                                Hiệu Suất Tổng Thể
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                                                    {/*<BarChart3 className="w-4 h-4 text-indigo-500"/> */}
                                                    Tỷ lệ Đạt / Thất bại ({totalSubmissions} lần)
                                                </h5>

                                                {/* Biểu đồ thanh ngang mô phỏng tỷ lệ */}
                                                <div className="h-6 flex rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        style={{width: `${successRate}%`}}
                                                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-500"
                                                    >
                                                        {passedSubmissions > 0 && `${successRate.toFixed(1)}%`}
                                                    </div>
                                                    <div
                                                        style={{width: `${failureRate}%`}}
                                                        className="bg-gradient-to-r from-red-400 to-rose-500 h-full flex items-center justify-start pl-2 text-xs font-bold text-white transition-all duration-500"
                                                    >
                                                        {failedSubmissions > 0 && `${failureRate.toFixed(1)}%`}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-sm font-medium">
                                                <p className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4"/> Đạt: {passedSubmissions}
                                                </p>
                                                <p className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4"/> Thất bại: {failedSubmissions}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Card 2: Phân tích Thói quen */}
                                    <Card className="col-span-1 lg:col-span-2 shadow-md gap-1 py-4">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                {/*<Clock className="w-6 h-6"/> */}
                                                Thói Quen Giải Đề
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                                    {/*<BarChart3 className="w-4 h-4 text-indigo-500"/>*/}
                                                    Thống kê theo Khung Giờ
                                                </h5>
                                                {/* Biểu đồ thanh đơn giản cho Time Slots */}
                                                {timeSlotData.map(slot => {
                                                    const percent = getTimeSlotPercent(slot.count ?? 0);
                                                    return (
                                                        <div key={slot.key} className="space-y-1">
                                                            <div
                                                                className="flex justify-between items-center text-xs font-medium text-gray-700">
                                                            <span
                                                                className="flex items-center gap-1">{slot.name} ({slot.count})</span>
                                                                <span>{percent}%</span>
                                                            </div>
                                                            <div
                                                                className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    style={{width: `${percent}%`}}
                                                                    className={`h-full bg-gradient-to-r ${slot.color} transition-all duration-500`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="space-y-3">
                                                <div
                                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <span
                                                    className="text-sm font-medium text-gray-600">Khung giờ vàng</span>
                                                    <Badge variant="secondary"
                                                           className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                                                        {busiestTimeSlotVi}
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                <span
                                                    className="text-sm font-medium text-gray-600">Ngày năng suất</span>
                                                    <Badge variant="secondary"
                                                           className="bg-indigo-200 text-indigo-800 hover:bg-indigo-300">
                                                        {busiestDayVi}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {/*<div className="space-y-3">*/}
                                            {/*    <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">*/}
                                            {/*        <p className="font-semibold text-gray-700 mb-1">Thời điểm hoạt động*/}
                                            {/*            nhiều nhất:</p>*/}
                                            {/*        <Badge variant="secondary"*/}
                                            {/*               className="bg-blue-200 text-blue-800 text-sm">*/}
                                            {/*            {busiestTimeSlotVi}*/}
                                            {/*        </Badge>*/}
                                            {/*    </div>*/}
                                            {/*    <div className="p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">*/}
                                            {/*        <p className="font-semibold text-gray-700 mb-1">Ngày trong tuần hoạt*/}
                                            {/*            động nhiều nhất:</p>*/}
                                            {/*        <Badge variant="secondary"*/}
                                            {/*               className="bg-indigo-200 text-indigo-800 text-sm">*/}
                                            {/*            {busiestDayVi}*/}
                                            {/*        </Badge>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Hàng 3: Phân tích Kỹ năng/Ngôn ngữ */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
                                    {/* Card 3: Phân tích Thể loại (Category) */}
                                    <Card className="shadow-md gap-2 py-4">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                {/*<Code className="w-6 h-6"/> */}
                                                Kỹ Năng / Thuật Toán Đã Sử Dụng
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3 italic">Các thể loại bài tập bạn đã
                                                thử
                                                (Top 5):</p>
                                            <div className="space-y-3">
                                                {categoryEntries.slice(0, 5).map(([category, count]) => (
                                                    <div key={category} className="flex justify-between items-center">
                                                        <Badge variant="outline"
                                                               className="text-base border-blue-500 text-blue-700">
                                                            {category}
                                                        </Badge>
                                                        <span className="font-semibold text-gray-800">{count} lần</span>
                                                    </div>
                                                ))}
                                                {categoryEntries.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">Chưa có dữ liệu thể
                                                        loại.</p>
                                                )}
                                                {categoryEntries.length > 5 && (
                                                    <p className="text-xs text-gray-500 italic">...
                                                        và {categoryEntries.length - 5} thể loại khác.</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Card 4: Phân tích Ngôn ngữ */}
                                    <Card className="shadow-md gap-2 py-4">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                {/*<Code className="w-6 h-6"/> */}
                                                Ngôn Ngữ Lập Trình
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {languageEntries.map(([lang, summary]) => {
                                                const successRate = (summary.total > 0 ? (summary.passed / summary.total) * 100 : 0).toFixed(1);
                                                return (
                                                    <div key={lang}
                                                         className="p-3 border rounded-lg bg-white space-y-2">
                                                        <h4 className="text-lg font-bold text-gray-800 capitalize flex items-center justify-between">
                                                            {lang}
                                                            <Badge
                                                                className="bg-purple-600 text-white hover:bg-purple-700">
                                                                Tổng: {summary.total}
                                                            </Badge>
                                                        </h4>
                                                        <div className="flex justify-between text-sm">
                                                            <p className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="w-4 h-4"/> Đạt: {summary.passed}
                                                            </p>
                                                            <p className="flex items-center gap-1 text-red-600">
                                                                <XCircle className="w-4 h-4"/> Thất
                                                                bại: {summary.failed}
                                                            </p>
                                                            <p className="font-semibold text-indigo-600">
                                                                Tỷ lệ Đạt: {successRate}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {languageEntries.length === 0 && (
                                                <p className="text-sm text-gray-500 italic">Chưa có dữ liệu ngôn
                                                    ngữ.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer (Chỉ hiển thị nút AI khi có Submission Data) */}
                    <DialogFooter className="p-4 border-t bg-white flex justify-between">
                        {onAnalyzeWithAI && hasSubmissionData && (
                            <Button
                                variant="default"
                                onClick={onAnalyzeWithAI}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            >
                                {/*<Bot className="w-4 h-4 mr-2" />*/}
                                Phân tích với AI
                            </Button>
                        )}

                        {/* Nút Đóng */}
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className={`px-6 ${!(onAnalyzeWithAI && hasSubmissionData) ? 'ml-auto' : ''}`}
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserStatsModal;