import ForgotPasswordClient from "@/app/auth/forgot/ForgotPasswordClient";
import {Suspense} from "react";

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center">Đang tải...</div>}>
            <ForgotPasswordClient />
        </Suspense>
    )
}