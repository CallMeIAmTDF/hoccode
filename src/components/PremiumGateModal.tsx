import React from 'react';
import { Crown, ArrowRight, Bot, BarChart3 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface PremiumGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    featureName?: string;
    price?: string; // Cho phép truyền giá từ ngoài vào nếu cần
}

export const PremiumGateModal: React.FC<PremiumGateModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onConfirm,
                                                                      featureName = "Tính năng này",
                                                                      price = "10.000 VNĐ"
                                                                  }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Sử dụng DialogContent để Radix UI quản lý Portal và Focus.
                p-0 và border-none để giữ nguyên design custom của bạn.
            */}
            <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white rounded-2xl shadow-2xl z-[110]">
                {/* Header Section */}
                <div className="relative bg-slate-900 p-8 text-center">
                    <div className="sr-only">
                        <DialogTitle>Nâng cấp Premium</DialogTitle>
                        <DialogDescription>
                            {featureName} dành riêng cho thành viên Premium
                        </DialogDescription>
                    </div>

                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                        <Crown className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        Nâng cấp Premium
                    </h3>
                    <p className="text-sm text-slate-300">
                        {featureName} dành riêng cho thành viên Premium
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-8">
                    <div className="space-y-3 mb-8">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-0.5">
                                    AI trợ lý không giới hạn
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Hỏi đáp không giới hạn với AI mọi lúc
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <BarChart3 className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-0.5">
                                    AI phân tích trang cá nhân
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Báo cáo chi tiết về tiến độ học tập
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-slate-900">{price}</span>
                            <span className="text-slate-500 text-sm ml-1">/ trọn đời</span>
                        </div>

                        <button
                            onClick={onConfirm}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                        >
                            Đăng ký Premium ngay
                            {/*<ArrowRight className="w-4 h-4" />*/}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};