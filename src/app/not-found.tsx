
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search, Code2, FileQuestion, Layers, Command } from "lucide-react"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans overflow-hidden selection:bg-indigo-100">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center relative p-6">

                {/* --- Background Effects --- */}
                {/* Grid Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.4]"
                     style={{
                         backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}>
                </div>

                {/* Animated Radar/Glow Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -z-10"></div>

                {/* Floating Icons Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-[15%] text-slate-200 animate-bounce duration-[3000ms]">
                        <Code2 className="w-12 h-12" />
                    </div>
                    <div className="absolute bottom-1/3 right-[15%] text-slate-200 animate-bounce duration-[4000ms] delay-700">
                        <FileQuestion className="w-16 h-16" />
                    </div>
                    <div className="absolute top-1/3 right-[25%] text-slate-200 animate-pulse duration-[5000ms]">
                        <Command className="w-8 h-8 opacity-50" />
                    </div>
                    <div className="absolute bottom-1/4 left-[20%] text-slate-200 animate-bounce duration-[3500ms] delay-300">
                        <div className="text-6xl font-black opacity-20">{`{ }`}</div>
                    </div>
                </div>

                {/* --- Main Content Stack (The "Wow" Part) --- */}
                <div className="relative z-10 w-full max-w-md group">

                    {/* Card Layer 1 (Back - Decorative) */}
                    <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] transform rotate-[-6deg] scale-95 opacity-60 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-100"></div>

                    {/* Card Layer 2 (Middle - Decorative) */}
                    <div className="absolute inset-0 bg-white rounded-[2rem] transform rotate-[6deg] scale-95 opacity-80 shadow-lg transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-100 border border-indigo-50/50"></div>

                    {/* Card Layer 3 (Front - Main Content) */}
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 md:p-10 text-center transform transition-transform duration-500 hover:-translate-y-2">

                        {/* 404 Visual */}
                        <div className="relative mb-6 inline-block">
                            <div className="text-[8rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-500 select-none drop-shadow-sm">
                                404
                            </div>
                            {/* Search Icon Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-slate-100 animate-bounce">
                                <div className="bg-red-50 p-2 rounded-full">
                                    <Search className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Không tìm thấy trang
                        </h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Trang bạn đang tìm kiếm đã bị di chuyển, xóa hoặc chưa từng tồn tại trong hệ thống.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.back()}
                                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-all hover:scale-105 active:scale-95"
                            >
                                {/*<ArrowLeft className="w-4 h-4 mr-2" />*/}
                                Quay lại
                            </Button>

                            <Link href="/">
                                <Button
                                    size="lg"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-medium transition-all hover:scale-105 active:scale-95"
                                >
                                    {/*<Home className="w-4 h-4 mr-2" />*/}
                                    Về trang chủ
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                {/*<div className="absolute bottom-8 text-slate-400 text-xs font-mono flex items-center gap-2 opacity-60">*/}
                {/*    <Layers className="w-3 h-3" />*/}
                {/*    <span>ERROR_CODE: PAGE_NOT_FOUND</span>*/}
                {/*</div>*/}

            </main>
        </div>
    )
}
