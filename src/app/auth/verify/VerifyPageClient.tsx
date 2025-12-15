"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Header} from "@/components/header";

export default function VerifyPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!code) {
            setStatus("error");
            setMessage("Mã xác thực không hợp lệ.");
            return;
        }

        apiGet<{ message: string }>(`/auth/verifyRegister?code=${code}`)
            .then((data) => {
                setStatus("success");
                setMessage(data.message || "Xác thực thành công!");
            })
            .catch((err) => {
                setStatus("error");
                setMessage("Xác thực thất bại. Vui lòng thử lại.");
            });
    }, [code]);

    useEffect(() => {
        if (status === "success" || status === "error") {
            if (countdown === 0) {
                if (status === "success") {
                    router.push("/auth/signin");
                } else {
                    router.push("/");
                }
            }

            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, status, router]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                {status === "loading" && (
                    <div className="text-gray-500">Đang xác thực...</div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-2 text-red-600">
                        <XCircle className="h-8 w-8" />
                        <span>{message}</span>
                        <span className="text-sm">
                            Quay về trang chủ sau {countdown}s...
                        </span>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-8 w-8"/>
                        <span>{message}</span>
                        <span className="text-sm">
                            Tự động chuyển đến trang đăng nhập sau {countdown}s...
                        </span>
                        <Button onClick={() => router.push("/auth/signin")}>
                            Đăng nhập ngay
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
