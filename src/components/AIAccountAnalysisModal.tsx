import {AnalysisReportData} from "@/lib/types/profile";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Brain, Target, Calendar, Award, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface AnalysisReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    data: AnalysisReportData | null;
}

const timeSlotTranslation: { [key: string]: string } = {
    'EARLY_MORNING': 'SÁNG SỚM',
    'MORNING': 'SÁNG',
    'AFTERNOON': 'CHIỀU',
    'EVENING': 'TỐI',
    'N/A': 'N/A',
    '':'-'
};

export const AnalysisReportModal: React.FC<AnalysisReportModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            isLoading,
                                                                            data
                                                                        }) => {
    // Helper for capitalization
    const capitalizeFirst = (str: string | null | undefined) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Helper to safely render text or a placeholder with capitalization
    const safeText = (text: string | null | undefined) => {
        if (!text) return "Không có dữ liệu";
        return capitalizeFirst(text);
    };

    // Helper to check if an object has any non-null values
    const hasData = (obj: any) => {
        if (!obj) return false;
        return Object.values(obj).some(val => val !== null && val !== undefined && val !== "");
    };

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-500 text-sm animate-pulse">Đang phân tích dữ liệu học tập...</p>
        </div>
    );

    const renderEmpty = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
            <AlertCircle className="h-12 w-12 text-gray-300" />
            <p>Không tìm thấy dữ liệu báo cáo.</p>
        </div>
    );

    const renderOverviewTab = () => {
        const overview = data?.overview;
        const highlights = data?.highlights || [];
        const funFacts = data?.funFacts || [];

        return (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-50 border-gray-200 shadow-sm gap-0 py-1">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Tổng số lần nộp</span>
                            <span className="text-2xl font-bold text-gray-800 mt-1">
                                {overview?.totalSubmissions ?? "-"}
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50 border-gray-200 shadow-sm gap-0 py-1">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Ngôn ngữ chính</span>
                            <span className="text-lg font-bold text-indigo-600 mt-1">
                                {capitalizeFirst(overview?.dominantLanguage) || "-"}
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50 border-gray-200 shadow-sm gap-0 py-1">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Thế mạnh</span>
                            <span className="text-lg font-bold text-emerald-600 mt-1">
                                {capitalizeFirst(overview?.strongestCategory) || "-"}
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50 border-gray-200 shadow-sm gap-0 py-1">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Thời gian</span>
                            <span className="text-lg font-bold text-gray-800 mt-1">
                                {timeSlotTranslation[overview?.activeTimeSlot ?? ""] || "-"}
                            </span>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Description */}
                {overview?.passRateDescription && (
                    <div className="bg-white p-4 border rounded-lg border-l-4 border-l-indigo-500 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            {/*<Target className="w-4 h-4 text-indigo-500"/> */}
                            Tổng kết hiệu suất
                        </h4>
                        <p className="text-gray-600 text-sm">{capitalizeFirst(overview.passRateDescription)}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Highlights */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Điểm nổi bật
                        </h3>
                        {highlights.length > 0 ? (
                            <ul className="space-y-2">
                                {highlights.map((item, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-700 bg-amber-50/50 p-3 rounded-md border border-amber-100">
                                        <span className="text-amber-500 font-bold">•</span>
                                        {capitalizeFirst(item)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Chưa có dữ liệu nổi bật.</p>
                        )}
                    </div>

                    {/* Fun Facts */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {/*<Sparkles className="w-5 h-5 text-purple-500" />*/}
                            Thông tin thú vị
                        </h3>
                        {funFacts.length > 0 ? (
                            <div className="grid gap-2">
                                {funFacts.map((fact, idx) => (
                                    <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                                        "{capitalizeFirst(fact)}"
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Chưa có thông tin thú vị.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderInsightsTab = () => {
        const insights = data?.insights;
        const scores = data?.achievementScore;

        // If both sections are essentially empty
        if (!hasData(insights) && !hasData(scores)) {
            return <div className="text-center py-10 text-gray-400 italic">Chưa có dữ liệu phân tích chi tiết.</div>;
        }

        return (
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Detailed Analysis */}
                <div className="space-y-5">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        {/*<Brain className="w-5 h-5 text-indigo-600" /> */}
                        Phân tích hành vi
                    </h3>

                    <div className="space-y-4">
                        <Card className="shadow-none border border-gray-200 py-2 gap-0">
                            <CardHeader className="py-3 px-4 border-b pb-0 gap-0 [.border-b]:pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700">Thói quen học tập</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm text-gray-600 leading-relaxed">
                                {safeText(insights?.studyHabits)}
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border border-gray-200 py-2 gap-0">
                            <CardHeader className="py-3 px-4 border-b pb-0 gap-0 [.border-b]:pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700">Phân tích ngôn ngữ</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm text-gray-600 leading-relaxed">
                                {safeText(insights?.languageAnalysis)}
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border border-gray-200 py-2 gap-0">
                            <CardHeader className="pt-0 py-2 px-4 border-b gap-0 [.border-b]:pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700">Chủ đề bài tập</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm text-gray-600 leading-relaxed">
                                {safeText(insights?.categoryAnalysis)}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Scores & Prediction */}
                <div className="space-y-5">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        {/*<Award className="w-5 h-5 text-indigo-600" /> */}
                        Đánh giá năng lực
                    </h3>

                    <div className="space-y-3">
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Độ nhất quán</div>
                            <div className="text-sm text-gray-700">{safeText(scores?.consistency)}</div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Giải quyết vấn đề</div>
                            <div className="text-sm text-gray-700">{safeText(scores?.problemSolving)}</div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Làm chủ ngôn ngữ</div>
                            <div className="text-sm text-gray-700">{safeText(scores?.languageMastery)}</div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 shadow-sm">
                            <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Đánh giá chung</div>
                            <div className="text-sm text-indigo-900 font-medium">{safeText(scores?.overall)}</div>
                        </div>
                    </div>

                    {insights?.behaviorPrediction && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Dự đoán hành vi</h4>
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                                {capitalizeFirst(insights.behaviorPrediction)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSuggestionsTab = () => {
        const suggestions = data?.improvementSuggestions;

        if (!hasData(suggestions)) {
            return <div className="text-center py-10 text-gray-400 italic">Chưa có đề xuất cải thiện.</div>;
        }

        const items = [
            { title: "Chủ đề còn yếu", content: suggestions?.weakCategories, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            { title: "Cải thiện ngôn ngữ", content: suggestions?.languageGrowth, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
            { title: "Tối ưu thời gian", content: suggestions?.timeOptimization, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            { title: "Mở rộng kỹ năng", content: suggestions?.skillExpansion, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
        ];

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, idx) => (
                        item.content ? (
                            <Card key={idx} className={`shadow-sm border ${item.border} ${item.bg} gap-0`}>
                                <CardHeader className="pb-0">
                                    <CardTitle className={`text-base ${item.color} flex items-center gap-2`}>
                                        {/*<TrendingUp className="w-4 h-4" />*/}
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {capitalizeFirst(item.content)}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : null
                    ))}
                </div>
                {/* Fallback if all mapped fields are null but object existed */}
                {!items.some(i => i.content) && (
                    <div className="text-center text-gray-400 italic mt-10">Không có đề xuất cụ thể nào.</div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        {/*<Brain className="w-6 h-6 text-indigo-600" />*/}
                        Phân tích học tập AI
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Báo cáo chi tiết về thói quen, hiệu suất và lộ trình phát triển của bạn.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    {isLoading ? (
                        renderLoading()
                    ) : !data ? (
                        renderEmpty()
                    ) : (
                        <Tabs defaultValue="overview" className="h-full flex flex-col">
                            <div className="px-6 pt-4 pb-0 shrink-0">
                                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                                        Tổng quan
                                    </TabsTrigger>
                                    <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                                        Chi tiết & Đánh giá
                                    </TabsTrigger>
                                    <TabsTrigger value="suggestions" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                                        Đề xuất cải thiện
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="overview" className="flex-1 min-h-0 mt-0 outline-none">
                                <ScrollArea className="h-full w-full">
                                    <div className="p-6">
                                        {renderOverviewTab()}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="insights" className="flex-1 min-h-0 mt-0 outline-none">
                                <ScrollArea className="h-full w-full">
                                    <div className="p-6">
                                        {renderInsightsTab()}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="suggestions" className="flex-1 min-h-0 mt-0 outline-none">
                                <ScrollArea className="h-full w-full">
                                    <div className="p-6">
                                        {renderSuggestionsTab()}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
