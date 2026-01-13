
import React, { useEffect, useState } from "react";
import {
    Crown,
    Loader2,
    Copy,
    CheckCircle2,
    X
} from "lucide-react";
import { notify } from "@/components/notify";
import { useSocket } from "@/context/SocketProvider";
import {
    Dialog,
    DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PaymentConfirmModalProps {
    isShowPaymentModal: boolean;
    loadingData?: boolean;
    onClose: () => void;
    onSuccess: () => void;

    accountName: string;
    accountNumber: string;
    description: string;
    amount: number;

    qrImageUrl?: string;
}

type PaymentStatus = "INIT" | "PROCESSING" | "SUCCESS";

export default function PaymentConfirmModal({
                                                isShowPaymentModal,
                                                loadingData = false,
                                                onClose,
                                                onSuccess,
                                                accountName,
                                                accountNumber,
                                                description,
                                                amount,
                                                qrImageUrl,
                                            }: PaymentConfirmModalProps) {
    const [status, setStatus] = useState<PaymentStatus>("INIT");
    const { isConnected, subscribe } = useSocket();

    useEffect(() => {
        if (!isConnected) return;
        const sub = subscribe(`/user/topic/payment`, (msg) => {
            switch (msg.type) {
                case "PREMIUM_USER":
                    setStatus("SUCCESS")
                    break
            }
        });
        return () => sub?.unsubscribe();
    }, [subscribe, isConnected]);

    useEffect(() => {
        if (status === "SUCCESS") {
            onSuccess();
            const timer = setTimeout(() => {
                localStorage.setItem("premium", "true")
                window.dispatchEvent(new Event("premium-change"));
                onClose();
                setStatus("INIT");
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    // Determine content and width based on state
    const isFinished = status === "SUCCESS";
    const modalWidth = (loadingData || isFinished) ? "sm:max-w-md" : "sm:max-w-3xl";

    return (
        <Dialog open={isShowPaymentModal} onOpenChange={(open) => !open && onClose()}>

            <DialogContent className={cn(
                "p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white",
                modalWidth
            )}>
                {/*<DialogHeader>*/}
                {/*    <DialogTitle>Chi tiết thanh toán</DialogTitle>*/}
                {/*</DialogHeader>*/}
                {/* Close button is provided by DialogContent usually, but if you want custom styling, keep it inside or use the default */}

                {loadingData ? (
                    <div className="p-10 flex flex-col items-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <p className="text-sm text-slate-400 font-medium">
                            Đang tải thông tin thanh toán...
                        </p>
                    </div>
                ) : isFinished ? (
                    <div className="p-10 text-center animate-in fade-in zoom-in-95 duration-300">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">
                            Thanh toán thành công
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">
                            Hệ thống sẽ tự động đóng sau 1 giây
                        </p>
                    </div>
                ) : (
                    <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center mb-6">
                            <h3 className="text-xl font-black text-slate-900">
                                Xác nhận thanh toán
                            </h3>
                            <p className="text-sm text-slate-400 font-medium">
                                Quét QR hoặc chuyển khoản theo thông tin
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                            {/* QR SECTION */}
                            <div className="flex items-center justify-center">
                                {qrImageUrl ? (
                                    <img
                                        src={qrImageUrl}
                                        alt="QR Thanh toán"
                                        className="w-56 h-56 rounded-2xl border border-slate-100 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-56 h-56 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                        QR Payment
                                    </div>
                                )}
                            </div>

                            {/* INFO SECTION */}
                            <div className="flex flex-col justify-between">
                                <div className="space-y-3 text-sm">
                                    <InfoRow label="Chủ tài khoản" value={accountName} />
                                    <InfoRow label="Số tài khoản" value={accountNumber} copy />
                                    <InfoRow label="Nội dung CK" value={description} copy />
                                    <InfoRow
                                        label="Số tiền"
                                        value={`${amount.toLocaleString("vi-VN")} VNĐ`}
                                        highlight
                                    />
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        onClick={onClose}
                                        disabled={status === "PROCESSING"}
                                        className="
                                            w-full
                                            py-3
                                            rounded-xl
                                            border
                                            border-slate-300
                                            text-slate-600
                                            font-semibold
                                            hover:bg-slate-50
                                            hover:text-slate-900
                                            transition
                                            disabled:opacity-50
                                        "
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ------------------ SUB COMPONENT ------------------ */
function InfoRow({
                     label,
                     value,
                     copy = false,
                     highlight = false,
                 }: {
    label: string;
    value: string;
    copy?: boolean;
    highlight?: boolean;
}) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-400 font-medium">{label}</span>

            <div
                className={cn(
                    "flex items-center gap-2 font-bold",
                    highlight ? "text-indigo-600 text-base" : "text-slate-900"
                )}
            >
                <span className="max-w-[220px] truncate">{value}</span>

                {copy && (
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(value);
                            notify("success", { title: "Đã sao chép", description: `Đã copy ${label}` });
                        }}
                        className="text-slate-400 hover:text-indigo-600"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
