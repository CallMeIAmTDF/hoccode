"use client"

import React, {useEffect, useState} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { apiPost } from "@/lib/api"
import {Mail, Lock, Code2} from "lucide-react"
import { motion } from "framer-motion";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {notify} from "@/components/notify";

export default function ForgotPasswordClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const code = searchParams.get("code")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repassword, setRepassword] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token ) {
            notify("info", {
                title: "Đã đăng nhập",
                description: "Chuyển về trang chủ...",
                duration: 1500,
            })
            setTimeout(() => {
                router.replace("/");
            }, 100);
        }
    }, [router]);

    async function handleSendEmail(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true)
            await apiPost("/users/forgotPassword", { email })
            notify("success", {
                title: "Đã gửi link đặt lại mật khẩu!",
                description: "Vui lòng kiểm tra hộp thư của bạn.",
            })
        } catch (err) {
            notify("error", {
                title: "Đổi mật khẩu thất bại",
                description: "Có lỗi xảy ra trong quá trình gửi.",
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (password !== repassword) {
            toast.error("Mật khẩu nhập lại không khớp")
            return
        }
        try {
            setLoading(true)
            await apiPost("/auth/verifyForgotPassword", { code, password })
            notify("success", {
                title: "Đổi mật khẩu thành công",
                description: "Đang chuyển về trang đăng nhập...",
            })
            router.push("/auth/signin")
        } catch (err) {
            notify("error", {
                title: "Đổi mật khẩu thất bại",
                description: "Có lỗi xảy ra trong quá trình gửi.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-4">
                        <Code2 className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-900">HocCode</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {code ? "Đặt lại mật khẩu" : "Quên mật khẩu"}
                    </h1>
                    <p className="text-slate-600">
                        {code
                            ? "Vui lòng nhập mật khẩu mới của bạn"
                            : "Nhập email để nhận liên kết đặt lại mật khẩu"}
                    </p>
                </div>

                <Card className="border-slate-200 shadow-lg py-10 px-5">
                    <CardContent>
                        {!code ? (
                            <form onSubmit={handleSendEmail} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4"/>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 border-slate-300 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? "Đang gửi..." : "Lấy lại mật khẩu"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu mới</Label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4"/>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Mật khẩu mới"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 border-slate-300 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="repassword">Nhập lại mật khẩu</Label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4"/>
                                        <Input
                                            id="repassword"
                                            type="password"
                                            placeholder="Nhập lại mật khẩu"
                                            value={repassword}
                                            onChange={(e) => setRepassword(e.target.value)}
                                            className="pl-10 border-slate-300 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </Button>
                            </form>
                        )}
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => router.push("/auth/signin")}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
