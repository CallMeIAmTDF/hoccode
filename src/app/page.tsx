
"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/AuthProvider"
import { Button } from "@/components/ui/button"
import {
    Code2,
    Trophy,
    Zap,
    Terminal,
    UserPlus,
    ArrowRight
} from "lucide-react"

export default function LandingPage() {
    const { isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden selection:bg-indigo-100 flex flex-col">
            <Header />

            {/* --- HERO SECTION ONLY --- */}
            {/* Adjusted spacing: Reduced pt-20 to pt-8, added lg:pb-32 to push content upwards visually when centered */}
            <main className="flex-1 flex items-center justify-center relative pt-8 lg:pt-0 lg:pb-32">

                {/* Background Effects */}
                <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
                     style={{
                         backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}>
                </div>
                {/* Soft Gradients */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

                {/* Floating Decor Icons (Subtle) */}
                <div className="absolute top-1/4 left-[5%] text-slate-300/50 animate-bounce duration-[4000ms] -z-10 hidden xl:block">
                    <Code2 className="w-12 h-12" />
                </div>
                <div className="absolute bottom-1/4 right-[5%] text-slate-300/50 animate-pulse duration-[5000ms] -z-10 hidden xl:block">
                    <Terminal className="w-16 h-16" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pl-10">

                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0 pb-8 pl-13">

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-500">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Nền tảng luyện thuật toán
                            </div>

                            {/* Headings */}
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                    Chinh phục <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
                                        Thế giới Code
                                    </span>
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-500 leading-relaxed">
                                    Nâng cao tư duy thuật toán, tham gia các cuộc thi kịch tính và chuẩn bị hành trang vững chắc cho sự nghiệp IT của bạn.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                                {!isLoggedIn ? (
                                    <>
                                        <Link href="/auth/signin">
                                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 rounded-full text-base font-semibold transition-all hover:-translate-y-1">
                                                <UserPlus className="h-5 w-5 mr-2"/>
                                                Bắt Đầu Ngay
                                            </Button>
                                        </Link>
                                        <Link href="/learn">
                                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-slate-200 text-slate-700 hover:bg-white hover:text-indigo-600 rounded-full text-base font-medium bg-white/60 backdrop-blur-sm transition-all hover:-translate-y-1">
                                                Khám Phá Bài Tập
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/learn">
                                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 rounded-full text-base font-semibold transition-all hover:-translate-y-1">
                                            <Code2 className="h-5 w-5 mr-2"/>
                                            Vào Luyện Tập
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative hidden lg:block h-[530px] w-full perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-300">

                            {/* Code Card (Center) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl p-8 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out z-20 group">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono font-medium">Solution.java</div>
                                </div>
                                {/* Code lines */}
                                <div className="space-y-3 font-mono text-sm leading-relaxed">
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">1</span>
                                        <span className="text-purple-600">class</span> <span className="text-yellow-600 pl-2">HocCode</span> <span className="text-slate-600">{`{`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">2</span>
                                        <span className="pl-4 text-blue-600">public void</span> <span className="text-yellow-600 pl-2">levelUp</span>() <span className="text-slate-600">{`{`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">3</span>
                                        <span className="pl-8 text-slate-500 italic">// Keep practicing everyday</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">4</span>
                                        <span className="pl-8 text-purple-600">while</span> <span className="text-slate-600">(</span><span className="text-slate-800">isLearning</span><span className="text-slate-600">) {`{`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">5</span>
                                        <span className="pl-12 text-slate-800">skills++;</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">6</span>
                                        <span className="pl-12 text-emerald-600">rank = "Grandmaster";</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">7</span>
                                        <span className="pl-8 text-slate-600">{`}`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">8</span>
                                        <span className="pl-4 text-slate-600">{`}`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-slate-300 w-6 select-none">9</span>
                                        <span className="text-slate-600">{`}`}</span>
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>

                            {/* Decorative Elements behind/around */}
                            <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

                            {/* Floating Badge: Trophy */}
                            <div className="absolute top-[10%] right-[15%] bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-bounce duration-[3000ms] z-30">
                                <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                            </div>

                            {/* Floating Badge: Fast */}
                            <div className="absolute bottom-[20%] left-[10%] bg-slate-900 text-white p-4 rounded-2xl shadow-xl animate-bounce duration-[4000ms] delay-700 z-30 flex flex-col items-center">
                                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-bold mt-1">FAST</span>
                            </div>

                            {/* Floating Badge: Accepted */}
                            <div className="absolute top-[40%] left-[5%] bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-200 animate-pulse delay-1000 z-20 transform -rotate-12 flex items-center gap-2">
                                <span className="font-mono text-sm font-bold">Accepted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simple Footer/Copyright at bottom */}
                <div className="absolute bottom-13 w-full text-center">
                    <p className="text-slate-400 text-sm">© 2025 HocCode. Built for developers.</p>
                </div>
            </main>
        </div>
    )
}
