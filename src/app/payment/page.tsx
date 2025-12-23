"use client"

import React, {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Header} from "@/components/header"
import {Button} from "@/components/ui/button"
import {
    CheckCircle2,
    ArrowLeft,
    Home,
    CreditCard,
    ShieldCheck,
    ReceiptText,
    ExternalLink
} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"

export default function PaymentPage() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        const timeout = setTimeout(() => {
            window.close()
        }, 3000)

        return () => {
            clearInterval(timer)
            clearTimeout(timeout)
        }
    }, [router])

    const handleManualClose = () => {
        window.close()
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
            <Header/>

            <main className="flex-1 flex items-center justify-center relative p-6">
                {/* Background Decor (Matching other pages) */}
                <div className="absolute inset-0 z-0 opacity-[0.4]"
                     style={{
                         backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}>
                </div>

                <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                    {/* Glowing effect behind card */}
                    <div
                        className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 rounded-[2.5rem] blur-2xl -z-10"></div>

                    <Card
                        className="bg-white/80 backdrop-blur-xl border-white shadow-2xl rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 pt-12 text-center">
                            {/* Success Icon */}
                            <div className="relative mb-6 inline-block">
                                <div
                                    className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
                                <div
                                    className="relative bg-emerald-50 p-4 rounded-full border border-emerald-100 shadow-inner">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500"/>
                                </div>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                Thanh toán hoàn tất!
                            </h1>
                            <p className="text-slate-500 text-sm mb-8">
                                Giao dịch của bạn đã được xác nhận và xử lý.
                            </p>

                            {/* Payment Summary */}
                            {/*<div*/}
                            {/*    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 mb-8">*/}
                            {/*    <div className="flex justify-between items-center text-xs">*/}
                            {/*        <span*/}
                            {/*            className="text-slate-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">*/}
                            {/*            <ReceiptText className="w-3.5 h-3.5"/>*/}
                            {/*            Mã đơn hàng*/}
                            {/*        </span>*/}
                            {/*        <span className="font-mono font-bold text-slate-700">{orderId}</span>*/}
                            {/*    </div>*/}
                            {/*    <div className="flex justify-between items-center text-xs">*/}
                            {/*        <span*/}
                            {/*            className="text-slate-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">*/}
                            {/*            <CreditCard className="w-3.5 h-3.5"/>*/}
                            {/*            Trạng thái*/}
                            {/*        </span>*/}
                            {/*        <span className="text-emerald-600 font-bold">Hoàn tất</span>*/}
                            {/*    </div>*/}
                            {/*    <div*/}
                            {/*        className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">*/}
                            {/*        <span*/}
                            {/*            className="text-slate-400 font-medium uppercase tracking-wider">Thời gian</span>*/}
                            {/*        <span*/}
                            {/*            className="text-slate-600 font-medium">{new Date().toLocaleTimeString('vi-VN')}</span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleManualClose}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 h-12 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    Đóng trình duyệt ngay
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/")}
                                    className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 h-10 rounded-xl transition-all"
                                >
                                    <Home className="w-4 h-4 mr-2"/>
                                    Về trang chủ
                                </Button>
                            </div>

                            {/* Auto-close indicator */}
                            <div className="mt-8 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5"/>
                                    Tự động đóng sau {countdown} giây...
                                </div>
                                {/* Progress Bar */}
                                <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                                        style={{width: `${(countdown / 3) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="mt-6 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5">
                        Bảo mật bởi HocCode Security
                    </p>
                </div>
            </main>
        </div>
    )
}
