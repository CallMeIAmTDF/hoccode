import { toast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import {JSX} from "react";

type NotifyType = "success" | "error" | "info" | "warning";

interface NotifyOptions {
    title: string;
    description?: string;
    duration?: number;
}

export function notify(
    type: NotifyType,
    { title, description, duration }: NotifyOptions
) {
    const variants: Record<
        NotifyType,
        { bg: string; border: string; text: string; icon: JSX.Element }
    > = {
        // SUCCESS: Nền xanh nhạt, viền xanh đậm
        success: {
            bg: "bg-white",
            border: "border-green-500",
            text: "text-green-800",
            icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
        },
        // ERROR: Nền trắng, viền đỏ đậm
        error: {
            bg: "bg-white",
            border: "border-red-500",
            text: "text-red-800",
            icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
        },
        // INFO: Nền trắng, viền xanh dương
        info: {
            bg: "bg-white",
            border: "border-blue-500",
            text: "text-blue-800",
            icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
        },
        // WARNING: Nền trắng, viền vàng cam
        warning: {
            bg: "bg-white",
            border: "border-yellow-500",
            text: "text-yellow-800",
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
        },
    };
    toast.dismiss();
    toast.custom(
        () => (
            <div
                // Tinh chỉnh: Bo góc lớn hơn (xl), đổ bóng lớn (2xl), border trái dày hơn (4)
                className={`w-full max-w-md rounded-xl shadow-2xl border-l-4 p-3 flex items-start gap-4 transition-all duration-300 ${variants[type].bg} ${variants[type].border}`}
            >
                {/* Icon bên trái */}
                {variants[type].icon}

                {/* Nội dung bên phải */}
                <div className="flex flex-col leading-snug flex-1">
                    <div className={`font-bold text-sm ${variants[type].text}`}>{title}</div>
                    {description && (
                        // Màu chữ xám nhẹ, dễ đọc hơn
                        <div className="text-xs text-gray-500 mt-1">{description}</div>
                    )}
                </div>
            </div>
        ),
        {
            duration: duration ?? 2500,
            style: {
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: "0",
            },
        }
    );
}

export function dismiss(){
    toast.dismiss();
}