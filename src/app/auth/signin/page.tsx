"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiPost } from "@/lib/api"; // API wrapper
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Code2, Chrome } from "lucide-react";
import {LoginResponse} from "@/lib/types/types";
import {notify} from "@/components/notify";
import {useAuth} from "@/lib/AuthProvider";
import {useSocket} from "@/context/SocketProvider";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();

    const shownToast = useRef(false);
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    const { reconnect } = useSocket();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token && !shownToast.current) {
            shownToast.current = true;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiPost<LoginResponse>("/auth/login", {
                email,
                password,
            });

            localStorage.setItem("accessToken", response.access_token);
            localStorage.setItem("refreshToken", response.refresh_token);
            localStorage.setItem("name", response.user.name);
            localStorage.setItem("email", response.user.email);
            localStorage.setItem("avatar", response.user.avatar);
            setIsLoggedIn(true);

            setTimeout(() => {
                reconnect();
            }, 100);

            notify("success", {
                title: "Đăng nhập thành công",
                description: "Chuyển về trang chủ...",
                duration: 1500,
            })
            if (response.user.role === "ROLE_ADMIN") {
                router.replace("/admin");
                return;
            }
            router.replace("/");
        } catch (err: unknown) {
            notify("error", {
                title: "Cảnh báo",
                description: "Đăng nhập không thành công",
                duration: 1500,
            })
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true);

            // Google popup
            if (!(window as any).google) {
                notify("error", {
                    title: "Google SDK lỗi",
                    description: "Không thể tải Google Identity Services",
                });
                setIsGoogleLoading(false);
                return;
            }

            (window as any).google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                flow: 'authCode',
                callback: async (response: any) => {
                    const idToken = response.credential;

                    try {
                        const res = await apiPost<LoginResponse>(
                            "/auth/login-google",
                            { idToken }
                        );

                        localStorage.setItem("accessToken", res.access_token);
                        localStorage.setItem("refreshToken", res.refresh_token);
                        localStorage.setItem("name", res.user.name);
                        localStorage.setItem("email", res.user.email);
                        localStorage.setItem("avatar", res.user.avatar);

                        setIsLoggedIn(true);
                        reconnect();

                        notify("success", {
                            title: "Đăng nhập Google thành công",
                            description: "Chuyển về trang chủ...",
                        });

                        router.replace("/");
                    } catch (err) {
                        notify("error", {
                            title: "Đăng nhập thất bại",
                            description: "Google token không hợp lệ",
                        });
                    }

                    setIsGoogleLoading(false);
                }
            });

            // Show popup Google login
            (window as any).google.accounts.id.prompt();

        } catch (err) {
            notify("error", {
                title: "Cảnh báo",
                description: "Google Login thất bại",
            });
            setIsGoogleLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Chào mừng trở lại</h1>
                    <p className="text-slate-600">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
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

                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Link href="/auth/forgot" className="text-sm text-blue-600 hover:text-blue-700">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang Đăng Nhập..." : "Đăng Nhập"}
                            </Button>
                        </form>

                        {/* --- Login Google --- */}
                        <div className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                            >
                                <svg
                                    className="h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 488 512"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M488 261.8c0-17.7-1.6-34.7-4.6-51H249v96.7h134.5c-5.8 31.3-23.5 57.7-50 75.4l81.1 63.2c47.5-43.8 73.4-108.2 73.4-184.3z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M249 492c67.6 0 124.2-22.4 165.6-60.8l-81.1-63.2c-22.5 15.1-51.3 24.1-84.5 24.1-64.9 0-119.8-43.7-139.4-102.4l-85.5 66.2C62.3 438.8 149.2 492 249 492z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M109.6 289.7c-4.6-13.8-7.2-28.6-7.2-43.7s2.6-29.9 7.2-43.7l-85.5-66.2C8.5 168.5 0 207.6 0 246s8.5 77.5 24.1 110.9l85.5-66.2z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M249 97.9c35.7 0 67.9 12.3 93.2 36.5l69.7-69.7C373.2 24.6 316.6 0 249 0 149.2 0 62.3 53.2 24.1 135.1l85.5 66.2C129.2 141.6 184.1 97.9 249 97.9z"
                                    />
                                </svg>
                                {isGoogleLoading ? "Đang kết nối Google..." : "Đăng nhập với Google"}
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Bạn chưa có tài khoản?{" "}
                                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Đăng ký
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
