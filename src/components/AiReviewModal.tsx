// (Thêm vào sau ReportModal Component)

import {CodeAnalysis} from "@/lib/types/problem";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Bot, MemoryStick, Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {Badge} from "@/components/ui/badge";

interface AiReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: CodeAnalysis | null;
    onInDepthReview: () => void;
    submissionId: string;
    code: string;
    language: "java" | "cpp" | "python";
}

export const AiReviewModal: React.FC<AiReviewModalProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                analysis,
                                                                onInDepthReview,
                                                                submissionId,
                                                                code,
                                                                language,
                                                            }) => {
    const {CheckCircle2, AlertTriangle, MessageSquare, Timer, MemoryStick, Bot, InfoIcon} = require("lucide-react");

    const renderList = (title: string, items: string[], type: 'success' | 'warning' | 'info') => {
        if (!items || items.length === 0) return null;

        const processTextForHtml = (text: string) => {
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        };

        let icon: React.ReactNode;
        let borderColor: string;

        switch(type) {
            case 'success':
                icon = <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
                borderColor = "border-l-green-500";
                break;
            case 'warning':
                icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
                borderColor = "border-l-amber-500";
                break;
            case 'info':
            default:
                icon = <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />;
                borderColor = "border-l-blue-500";
        }

        return (
            <div className={`p-4 border-l-4 ${borderColor} bg-white rounded-lg shadow-sm space-y-3`}>
                <h4 className="font-semibold text-base flex items-center gap-2 text-gray-800">
                    {icon} {title}
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="flex gap-2 leading-relaxed"
                        >
                            <span className="text-gray-400 mt-1">•</span>
                            <span dangerouslySetInnerHTML={{__html: processTextForHtml(item)}} />
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    if (!analysis) return null;

    const hasComplexity = analysis.time_complexity || analysis.space_complexity;
    const hasContent = analysis.content && (
        (analysis.content.overview && analysis.content.overview.length > 0) ||
        (analysis.content.advantage && analysis.content.advantage.length > 0) ||
        (analysis.content.disadvantages && analysis.content.disadvantages.length > 0) ||
        (analysis.content.proposal && analysis.content.proposal.length > 0)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                    <DialogTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Bot className="w-6 h-6 text-indigo-600" />
                        Đánh giá Code bởi AI
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
                    <div className="space-y-6">
                        {/* Complexity Section */}
                        {hasComplexity ? (
                            <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200">
                                {analysis.time_complexity && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <Timer className="w-5 h-5 text-indigo-600" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Thời gian:
                                            </span>
                                            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                                {analysis.time_complexity}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {analysis.space_complexity && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <MemoryStick className="w-5 h-5 text-emerald-600" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Bộ nhớ:
                                            </span>
                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                                {analysis.space_complexity}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                                <InfoIcon className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">Không có thông tin về độ phức tạp thuật toán.</p>
                            </div>
                        )}

                        {/* Content Grid */}
                        {hasContent ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {renderList("Tóm tắt Thuật toán", analysis.content.overview, 'info')}
                                {renderList("Ưu điểm", analysis.content.advantage, 'success')}
                                {renderList("Nhược điểm / Vấn đề", analysis.content.disadvantages, 'warning')}
                                {renderList("Đề xuất Cải tiến", analysis.content.proposal, 'info')}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                                <InfoIcon className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">Không có phân tích chi tiết cho code này.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-white flex justify-between">
                    <Button
                        variant="default"
                        onClick={onInDepthReview}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                        {/*<Sparkles className="w-4 h-4 mr-2" />*/}
                        Phân tích chuyên sâu
                    </Button>
                    <Button variant="outline" onClick={onClose} className="px-6">
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};