import {Suspense} from "react";
import VerifyPageClient from "@/app/auth/verify/VerifyPageClient";

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center">Đang tải...</div>}>
            <VerifyPageClient />
        </Suspense>
    )
}