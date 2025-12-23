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
    // const [countdown, setCountdown] = useState(3)
    // const [orderId] = useState(`HC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)
    //
    // useEffect(() => {
    //     // Countdown timer
    //     const timer = setInterval(() => {
    //         setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    //     }, 1000)
    //
    //     // Close window or redirect after 3s
    //     const timeout = setTimeout(() => {
    //         window.close()
    //     }, 3000)
    //
    //     return () => {
    //         clearInterval(timer)
    //         clearTimeout(timeout)
    //     }
    // }, [router])

    const handleManualClose = () => {
        const win = window.open("https://pay.payos.vn/web/46f9d9ac82d14cda9242656733c770cc", "_blank")
    }

    return (
        <>
            <Button
                onClick={handleManualClose}
            >
                Click
            </Button>
        </>
    )
}
