
"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DollarSign,
    Download,
    FileText,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Loader2
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { notify } from "@/components/notify"
import {apiGet, apiGetFile} from "@/lib/api";

// --- Types ---
interface RevenueMonth {
    month: string
    revenue: number
}

interface ReportFile {
    fileName: string
    fileSize: number
    lastModified: string
}

interface PaymentAdminData {
    revenueThisMonth: number
    last12MonthsRevenue: RevenueMonth[]
    report: ReportFile[]
    totalRevenue: number
}

// --- Mock Data ---
const MOCK_DATA: PaymentAdminData = {
    revenueThisMonth: 20000,
    last12MonthsRevenue: [
        { month: "2024-01", revenue: 5000 },
        { month: "2024-02", revenue: 12000 },
        { month: "2024-03", revenue: 8000 },
        { month: "2024-04", revenue: 15000 },
        { month: "2024-05", revenue: 9000 },
        { month: "2024-06", revenue: 21000 },
        { month: "2024-07", revenue: 18000 },
        { month: "2024-08", revenue: 25000 },
        { month: "2024-09", revenue: 22000 },
        { month: "2024-10", revenue: 19000 },
        { month: "2024-11", revenue: 14000 },
        { month: "2024-12", revenue: 20000 }
    ],
    report: [
        { fileName: "revenue-2024-12.pdf", fileSize: 22899, lastModified: "2024-12-31" },
        { fileName: "revenue-2024-11.pdf", fileSize: 21500, lastModified: "2024-11-30" },
        { fileName: "revenue-2024-10.pdf", fileSize: 20100, lastModified: "2024-10-31" },
        { fileName: "revenue-2024-09.pdf", fileSize: 24200, lastModified: "2024-09-30" },
        { fileName: "revenue-2024-08.pdf", fileSize: 19800, lastModified: "2024-08-31" },
        { fileName: "revenue-2024-07.pdf", fileSize: 22000, lastModified: "2024-07-31" },
        { fileName: "revenue-2024-06.pdf", fileSize: 18500, lastModified: "2024-06-30" },
        { fileName: "revenue-2024-05.pdf", fileSize: 17200, lastModified: "2024-05-31" },
        { fileName: "revenue-2024-04.pdf", fileSize: 25000, lastModified: "2024-04-30" },
        { fileName: "revenue-2024-03.pdf", fileSize: 21000, lastModified: "2024-03-31" },
        { fileName: "revenue-2024-02.pdf", fileSize: 19500, lastModified: "2024-02-29" },
        { fileName: "revenue-2024-01.pdf", fileSize: 16800, lastModified: "2024-01-31" },
    ],
    totalRevenue: 188000
}

export default function AdminPaymentPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<PaymentAdminData | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            // await new Promise(resolve => setTimeout(resolve, 600))
            // setData(MOCK_DATA)
            // setLoading(false)

            try {
                const data = await apiGet<PaymentAdminData>('/admin/payment/stats')
                setData(data)

            }catch (err: any){
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: "Tải dữ liêệu thanh toán không thành công"
                })
            }finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleDownload = async (fileName: string) => {
        notify("info", {
            title: "Đang tải xuống",
            description: `Tệp ${fileName} đang được chuẩn bị...`
        })

        try {
            const blob = await apiGetFile(`/admin/payment/stats/download/${fileName}`);

            const url = window.URL.createObjectURL(new Blob([blob]));

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            notify("success", {
                title: "Tải thành công",
                description: `Tệp ${fileName} đã được tải xuống`
            })
        }catch (err: any){
            notify("error", {
                title: "Lỗi",
                description: `Tệp ${fileName} không thể tải...`
            })
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    const formatMonthYear = (dateStr: string) => {
        if (!dateStr) return ""
        const [year, month] = dateStr.split('-')
        return `${month}/${year}`
    }

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Header Info */}
            {/*<div className="flex items-center justify-between shrink-0">*/}
            {/*    <div>*/}
            {/*        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thống kê Tài chính</h2>*/}
            {/*        <p className="text-slate-500 text-sm">Tổng quan doanh thu và các tệp báo cáo định kỳ</p>*/}
            {/*    </div>*/}
            {/*    /!*<div className="flex gap-2 text-sm">*!/*/}
            {/*    /!*    <Button variant="outline" size="sm" className="bg-white border-slate-200">*!/*/}
            {/*    /!*        <Calendar className="w-4 h-4 mr-2" />*!/*/}
            {/*    /!*        Năm 2024*!/*/}
            {/*    /!*    </Button>*!/*/}
            {/*    /!*</div>*!/*/}
            {/*</div>*/}

            {/* Layout 2 Cột */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* BÊN TRÁI: Chỉ số & Biểu đồ (Chiếm 8/12 cột) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0">

                    {/* Thẻ chỉ số */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                        <Card className="bg-white shadow-sm border-slate-200 relative overflow-hidden group py-3">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doanh thu tháng này</p>
                                        <h3 className="text-3xl font-black text-slate-900">{formatCurrency(data?.revenueThisMonth || 0)}</h3>
                                    </div>
                                    {/*<div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">*/}
                                    {/*    /!*<TrendingUp className="w-6 h-6" />*!/*/}
                                    {/*</div>*/}
                                </div>
                                {/*<div className="mt-4 flex items-center gap-2">*/}
                                {/*    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px]">*/}
                                {/*        <ArrowUpRight className="w-3 h-3 mr-0.5" />*/}
                                {/*        +8.4%*/}
                                {/*    </Badge>*/}
                                {/*    <span className="text-[10px] text-slate-400 font-medium">so với tháng trước</span>*/}
                                {/*</div>*/}
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm border-slate-200 relative overflow-hidden group  py-3">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng doanh thu</p>
                                        <h3 className="text-3xl font-black text-slate-900">{formatCurrency(data?.totalRevenue || 0)}</h3>
                                    </div>
                                    {/*<div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">*/}
                                    {/*    /!*<DollarSign className="w-6 h-6" />*!/*/}
                                    {/*</div>*/}
                                </div>
                                {/*<div className="mt-4 text-[10px] text-slate-400 font-medium">*/}
                                {/*    Dữ liệu tích lũy hệ thống*/}
                                {/*</div>*/}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Biểu đồ */}
                    <Card className="flex-1 bg-white shadow-sm border-slate-200 flex flex-col min-h-0 overflow-hidden">
                        <CardHeader className="pb-2 shrink-0">
                            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
                                {/*<TrendingUp className="w-4 h-4 text-indigo-600" />*/}
                                Biến động doanh thu (12 tháng qua)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.last12MonthsRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={10}
                                        tick={{ fill: '#94a3b8' }}
                                        tickFormatter={formatMonthYear}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-xs border border-slate-800">
                                                        <p className="font-bold mb-1">{formatMonthYear(payload[0].payload.month)}</p>
                                                        <p className="text-indigo-300 font-mono">{formatCurrency(payload[0].value as number)}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={36}>
                                        {(data?.last12MonthsRevenue || []).map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.revenue > 15000 ? "#4f46e5" : entry.revenue > 0 ? "#818cf8" : "#e2e8f0"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* BÊN PHẢI: Báo cáo PDF (Chiếm 4/12 cột) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 overflow-hidden">
                    <Card className="h-full bg-white shadow-sm border-slate-200 flex flex-col overflow-hidden gap-0">
                        <CardHeader className=" border-b border-slate-50 shrink-0 gap-0">
                            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
                                {/*<FileText className="w-4 h-4 text-emerald-600" />*/}
                                Báo cáo doanh thu
                            </CardTitle>
                        </CardHeader>

                        {/* Quan trọng: flex-1 và min-h-0 cho phép ScrollArea hoạt động trong flexbox */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <ScrollArea className="h-full w-full">
                                <CardContent className="p-4 space-y-3">
                                    {data?.report.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors shrink-0">
                                                    <FileText className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{file.fileName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        {(file.fileSize / 1024).toFixed(1)} KB • {file.lastModified}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm shrink-0"
                                                onClick={() => handleDownload(file.fileName)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!data?.report || data.report.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <FileText className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="text-xs">Không có báo cáo nào</p>
                                        </div>
                                    )}
                                </CardContent>
                            </ScrollArea>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 leading-tight italic">
                                <span>*</span>
                                <span>Báo cáo được tự động khởi tạo vào ngày đầu tiên của mỗi tháng.</span>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}
