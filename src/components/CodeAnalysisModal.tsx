// components/CodeAnalysisModal.tsx
'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from '@/components/ui/carousel';

import {
    BarChart3,
    Lightbulb,
    TrendingUp,
    CheckCircle,
    XCircle,
    Zap,
    Award,
    Key,
    Clock,
    Code,
    AlertTriangle
} from 'lucide-react';

import {InDepthCodeAnalysisResponse, Attempt} from '@/lib/types/analysis';

// --- Constants ---
const ACCENT_COLOR_CLASS = "text-blue-600";
const FIXED_CONTENT_HEIGHT = "min-h-[600px]";
const DATA_NOT_AVAILABLE = "N/A";

const AttemptCard: React.FC<{ attempt: Attempt; isBest: boolean }> = ({attempt, isBest}) => {

    // Hàm kiểm tra và render danh sách
    const renderList = (data: string[] | null | undefined, title: string, icon: React.ReactNode, colorClass: string) => {
        // Điều kiện hiển thị: dữ liệu phải tồn tại, phải là mảng, và không rỗng
        if (!data || !Array.isArray(data) || data.length === 0) {
            return null; // Không render gì nếu dữ liệu thiếu hoặc rỗng
        }

        return (
            <div>
                <h4 className={`font-semibold text-gray-800 mb-2 flex items-center ${colorClass}`}>
                    {icon} {title}:
                </h4>
                <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                    {data.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
        );
    };

    // Chuẩn bị dữ liệu độ phức tạp (xử lý null/undefined)
    const timeComplexity = attempt.complexity?.time || DATA_NOT_AVAILABLE;
    const spaceComplexity = attempt.complexity?.space || DATA_NOT_AVAILABLE;

    // Chuẩn bị các danh sách
    const improvements = attempt.improvements_from_previous;
    const strengths = attempt.strengths;
    const weaknesses = attempt.weaknesses;

    return (
        <Card className={`
            bg-white border-l-4 transition-all duration-300 shadow-md hover:shadow-lg
            ${isBest ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}
            h-full
        `}>
            <CardHeader className="p-5 border-b bg-gray-50">
                <CardTitle className="flex justify-between items-center text-lg font-bold">
                    <div className={`flex items-center space-x-2 ${ACCENT_COLOR_CLASS}`}>
                        {/*<Code className="w-5 h-5"/>*/}
                        <span>Lần thứ #{attempt.attempt_number || DATA_NOT_AVAILABLE}</span>
                    </div>
                    {isBest && <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"><Award
                        className="w-4 h-4 mr-1"/> Tốt nhất</Badge>}
                </CardTitle>
                <CardDescription className="text-gray-500 italic mt-1">
                    {attempt.approach || "Không có phương pháp tiếp cận nào được ghi nhận."}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                {(timeComplexity !== DATA_NOT_AVAILABLE || spaceComplexity !== DATA_NOT_AVAILABLE) && (
                    <div className="flex space-x-4">
                        <Badge variant="outline" className={`border text-gray-700 border-blue-600`}>
                            {/*<Clock className="w-4 h-4 mr-2 text-gray-500"/> */}
                            Time: {timeComplexity}
                        </Badge>
                        <Badge variant="outline" className={`border text-gray-700 border-blue-600`}>
                            {/*<Zap className="w-4 h-4 mr-2 text-gray-500"/> */}
                            Space: {spaceComplexity}
                        </Badge>
                    </div>
                )}

                {/* Cải tiến từ lần trước (Chỉ render nếu có dữ liệu) */}
                {renderList(improvements, "Cải tiến", <TrendingUp
                    className="w-5 h-5 mr-2 text-blue-500"/>, "text-gray-800")}

                {improvements && improvements.length > 0 && <Separator className="bg-gray-200"/>}

                {/* Điểm mạnh (Chỉ render nếu có dữ liệu) */}
                {renderList(strengths, "Điểm mạnh", <CheckCircle
                    className="w-5 h-5 mr-2 text-green-600"/>, "text-gray-800")}

                {/* Điểm yếu (Chỉ render nếu có dữ liệu) */}
                {renderList(weaknesses, "Điểm yếu", <XCircle className="w-5 h-5 mr-2 text-red-600"/>, "text-gray-800")}

                {/* Thông báo nếu không có Strength và Weakness */}
                {(!strengths || strengths.length === 0) && (!weaknesses || weaknesses.length === 0) && (
                    <p className="text-sm text-gray-500 italic flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500"/> Chưa có phân tích mạnh/yếu cụ thể.
                    </p>
                )}

            </CardContent>
        </Card>
    );
};

// --- Component Modal Chính ---
interface CodeAnalysisModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: InDepthCodeAnalysisResponse | null;  // Cho phép null
}

export const CodeAnalysisModal: React.FC<CodeAnalysisModalProps> = ({open, onOpenChange, data}) => {
    // Nếu không có data → hiển thị loading hoặc empty state
    if (!data) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl w-[95vw] !max-w-5xl sm:max-w-5xl max-h-[95vh] h-[600px] overflow-y-auto no-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                            {/*<BarChart3 className="w-8 h-8 text-blue-600"/>*/}
                            Phân Tích Code Chuyên Sâu
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <AlertTriangle className="w-16 h-16 mb-4 text-yellow-500"/>
                        <p className="text-lg">Không có dữ liệu phân tích chuyên sâu.</p>
                        <p className="text-sm mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const attempts = data.attempts || [];
    const totalAttempts = attempts.length;
    const bestAttempt = data.progression_summary?.best_attempt || 0;

    const renderList = (items: string[] | undefined | null, fallback: string) => {
        if (!items || items.length === 0) {
            return <p className="text-sm text-gray-500 italic">{fallback}</p>;
        }
        return (
            <ul className="text-sm list-disc ml-6 space-y-1 text-gray-700">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-[95vw] !max-w-5xl sm:max-w-5xl max-h-[95vh] max-h-[95vh] bg-white no-scrollbar h-[800px] gap-0">
                <DialogHeader className="pb-0">
                    <DialogTitle className="text-4xl font-extrabold flex items-center gap-3 text-blue-600">
                        {/*<BarChart3 className="w-9 h-9"/>*/}
                        Phân Tích Code Chuyên Sâu
                    </DialogTitle>
                    <DialogDescription className="text-lg text-gray-600">
                        Tổng hợp toàn bộ quá trình giải đề, điểm mạnh, điểm yếu và hướng cải thiện.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="attempts">Các lần thử ({totalAttempts})</TabsTrigger>
                        <TabsTrigger value="summary">Tóm tắt & Đề xuất</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-y-auto max-h-[60vh] no-scrollbar">
                        <TabsContent value="overview" className={`mt-6 space-y-6  ${FIXED_CONTENT_HEIGHT}`}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-3 text-blue-600">
                                        {/*<Key className="w-7 h-7"/> */}
                                        Vấn đề & Khái niệm chính
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div>
                                        <strong className="text-lg">Loại bài:</strong>{' '}
                                        <Badge className="ml-2 text-base" variant="outline">
                                            {data.problem_analysis?.inferred_problem_type || "Không xác định"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <strong className="text-lg block mb-2">Khái niệm cốt lõi:</strong>
                                        {data.problem_analysis?.key_concepts && data.problem_analysis.key_concepts.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {data.problem_analysis.key_concepts.map((c, i) => (
                                                    <Badge key={i} variant="outline"
                                                           className="border-blue-500 text-blue-700">
                                                        {c}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">Chưa xác định</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="attempts" className={`pt-6 ${FIXED_CONTENT_HEIGHT}`}>
                            {totalAttempts > 0 ? (
                                <div className="relative">
                                    <Carousel className="w-full">
                                        <CarouselContent className="-ml-4">
                                            {attempts.map((attempt, index) => (
                                                <CarouselItem key={index} className="pl-4 basis-full !max-w-full">
                                                    <div className="p-1">
                                                        <AttemptCard
                                                            attempt={attempt}
                                                            isBest={attempt.attempt_number === bestAttempt}
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious
                                            className="left-0 top-55 hover:bg-gray-100 border-gray-300 text-gray-700"/>
                                        <CarouselNext className="right-0 top-55 hover:bg-gray-100 border-gray-300 text-gray-700"/>
                                    </Carousel>
                                </div>
                            ) : (
                                <div
                                    className="text-center p-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <AlertTriangle className="w-10 h-10 mx-auto text-yellow-500 mb-3"/>
                                    <p className="text-lg font-semibold text-gray-700">Không có dữ liệu Attempts.</p>
                                    <p className="text-sm text-gray-500">Vui lòng kiểm tra lại nguồn dữ liệu hoặc API.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="summary" className={`mt-6 space-y-6  ${FIXED_CONTENT_HEIGHT}`}>
                            <Card className=" gap-1">
                                <CardHeader className={"pb-0"}>
                                    <CardTitle className="text-xl flex items-center gap-3 text-blue-600">
                                        {/*<Lightbulb className="w-6 h-6"/>*/}
                                        Tóm tắt tiến trình
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <div>
                                        <strong className="text-base block mb-1">Hiểu biết chính:</strong>
                                        {renderList(data.progression_summary?.key_insights, "Chưa có insight đáng kể.")}
                                    </div>
                                    <Separator/>
                                    <div>
                                        <strong className="text-base block mb-1">Lần thử tốt nhất (#{bestAttempt}):</strong>
                                        <p className="p-4 bg-blue-50 border-l-4 border-blue-500 italic text-gray-700 rounded-r-lg text-base">
                                            {data.progression_summary?.best_attempt_reason || "Không có lý do cụ thể."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-red-500 gap-1">
                                <CardHeader className={"pb-1"}>
                                    <CardTitle className="text-xl text-red-600 flex items-center gap-3">
                                        {/*<TrendingUp className="w-7 h-7"/>*/}
                                        Đề xuất cải thiện
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className={"pt-0"}>
                                    {renderList(data.recommendations, "Bạn đã làm rất tốt, không có đề xuất cải thiện nào!")}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CodeAnalysisModal;