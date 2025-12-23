
"use client"

import React, { useState, useEffect } from 'react';
import {
    Crown, Check, Zap, Bot, Sparkles, ArrowRight, X,
    Loader2, ShieldCheck, Heart, Star, BrainCircuit,
    Users, Code, Rocket, CheckCircle2
} from 'lucide-react';
import { Header } from "@/components/header";
import { notify } from "@/components/notify";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {apiGet} from "@/lib/api";
import PaymentConfirmModal from "@/components/PaymentConfirmModal";
import {getVietQRUrl, PaymentLinkResponse} from "@/lib/types/premium";


export default function UpgradePage() {
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [payOs, setPayOs] = useState<PaymentLinkResponse>();

    useEffect(() => {
        const checkStatus = async () => {
            setLoading(true);
            try {
                const data = await apiGet<boolean>("/premium");
                setIsPremium(data);
                localStorage.setItem("premium", JSON.stringify(data));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handlePayment = async () => {
        setIsProcessing(true);
        setShowPaymentModal(true);
        try {
            const data = await apiGet<PaymentLinkResponse>("/payment");
            setPayOs(data);
            setIsProcessing(false);
        }catch (error : any){
            notify("error", {
                title: "Thất bại",
                description: "Lấy thông tin thanh toán không thành công"
            })
            setIsProcessing(false);
            setShowPaymentModal(false);
        }
    };

    const handleSuccess = () => {
        setIsPremium(true);
    }

    if (loading) {
        return (
            <div className="h-screen flex flex-col bg-white">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#FDFDFD] overflow-hidden font-sans text-slate-900">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes border-beam {
                    0% { offset-distance: 0%; }
                    100% { offset-distance: 100%; }
                }
                .border-beam {
                    position: absolute;
                    inset: 0;
                    border: 1px solid transparent;
                    border-radius: inherit;
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    pointer-events: none;
                }
                .border-beam::after {
                    content: "";
                    position: absolute;
                    aspect-ratio: 1;
                    width: 140px;
                    background: linear-gradient(to right, #6366f1, transparent);
                    offset-path: rect(0 auto auto 0 round 40px);
                    animation: border-beam 6s linear infinite;
                }
                .shimmer-btn {
                    background: linear-gradient(110deg, #4f46e5 45%, #6366f1 50%, #4f46e5 55%);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            ` }} />

            <Header />

            <main className="flex-1 container mx-auto max-w-5xl p-6 flex flex-col justify-center gap-8 relative">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="text-center space-y-3 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em]">
                            <Star className="w-3 h-3 fill-indigo-600"/>
                            Membership Plans
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full items-stretch pb-10">

                    {/* FREE PLAN CARD */}
                    <div
                        className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col shadow-sm transition-all hover:border-slate-300">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Standard</h3>
                            <p className="text-sm text-slate-400 font-medium">Dành cho người mới bắt đầu</p>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">Miễn phí</span>
                            </div>
                        </div>

                        <div className="space-y-5 flex-1">
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-slate-400" />
                                </div>
                                Giới hạn 5 lượt AI hỗ trợ/ngày
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600 opacity-50">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <X className="w-3 h-3 text-slate-300" />
                                </div>
                                <span className="line-through">Phân tích hồ sơ bằng AI</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-slate-400" />
                                </div>
                                Truy cập kho 1,000+ bài tập
                            </div>
                        </div>

                        <div className="mt-10">
                            <button
                                disabled
                                className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-100 cursor-not-allowed text-sm"
                            >
                                Gói hiện tại của bạn
                            </button>
                        </div>
                    </div>

                    {/* PREMIUM PLAN CARD */}
                    <div className={cn(
                        "relative rounded-[2.5rem] p-10 flex flex-col overflow-hidden transition-all duration-500",
                        isPremium
                            ? "bg-white border border-slate-200 shadow-sm"
                            : "bg-slate-950 text-white shadow-2xl shadow-indigo-200/50"
                    )}>
                        {!isPremium && <div className="border-beam"></div>}

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Premium</h3>
                                    <p className={cn("text-sm font-medium", isPremium ? "text-slate-400" : "text-slate-500")}>
                                        Đặc quyền lập trình tối thượng
                                    </p>
                                </div>
                                {!isPremium && (
                                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none font-bold text-[9px] uppercase tracking-widest px-2 py-1">
                                        Lifetime
                                    </Badge>
                                )}
                            </div>

                            {!isPremium && (
                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className="text-4xl font-black">10.000</span>
                                    <span className="text-indigo-400 font-bold text-sm">VNĐ</span>
                                </div>
                            )}

                            <div className="space-y-5 flex-1">
                                <div className="flex items-center gap-3 text-sm font-medium group transition-all">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                        isPremium ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        <Bot className="w-3 h-3" />
                                    </div>
                                    Hỏi đáp AI không giới hạn
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium group transition-all">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                        isPremium ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        <BrainCircuit className="w-3 h-3" />
                                    </div>
                                    Phân tích trang cá nhân bằng AI
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium group transition-all">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                        isPremium ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    Mở khóa mọi tính năng trong tương lai
                                </div>
                            </div>

                            <div className="mt-10">
                                {isPremium ? (
                                    <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 font-bold text-sm animate-in fade-in zoom-in-95">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Bạn đang là hội viên Premium
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePayment}
                                        className="w-full py-5 shimmer-btn text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-sm group/btn hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Nâng cấp trọn đời
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <PaymentConfirmModal
                onSuccess={handleSuccess}
                isShowPaymentModal={showPaymentModal}
                loadingData={isProcessing}
                onClose={() => setShowPaymentModal(false)}
                accountName={payOs?.accountName ?? ""}
                accountNumber={payOs?.accountNumber ?? ""}
                description={payOs?.description ?? ""}
                amount={payOs?.amount ?? 10000}
                qrImageUrl={payOs ? getVietQRUrl(payOs) : ""}
            />
        </div>
    );
}
