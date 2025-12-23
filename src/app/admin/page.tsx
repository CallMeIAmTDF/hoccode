// app/admin/page.tsx
"use client"

import React, {useEffect, useState} from 'react';
// Import các component UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Import Lucide Icons
import { User, FileText, Trophy, Bug, ArrowRight, LucideIcon, CheckCircle, Settings, MessageSquare, PieChart } from 'lucide-react';
import {useRouter} from "next/navigation";
import {router} from "next/client";
import {apiGet} from "@/lib/api";
import {DashboardStats, Report, ReportTypeEnum, Stats, TypeCount} from "@/lib/types/admin";


interface StatItem {
    title: string;
    value: string;
    icon: LucideIcon;
    change: string;
    color: string;
    border: string;
    href: string;
}

interface Distribution{
    type: ReportTypeEnum
    count: number;
    color: string;
    text: string;
}

const typeMeta = {
    SYSTEM:    { color: "bg-orange-500", text: "Hệ thống" },
    PROBLEM:   { color: "bg-blue-600",   text: "Thử thách" },
    CONTEST:   { color: "bg-purple-500", text: "Cuộc thi" },
    SUBMISSION:{ color: "bg-cyan-500",   text: "Nộp bài" },
    OTHER:     { color: "bg-gray-400",   text: "Khác" },
};

function transformReportData(apiData: TypeCount[]) {
    return apiData.map(item => ({
        type: ReportTypeEnum[item.type],
        count: item.count,
        color: typeMeta[item.type].color,
        text: typeMeta[item.type].text,
    }));
}

const iconMap: Record<string, any> = {
    users: User,
    problems: FileText,
    contests: Trophy,
    reports: Bug,
};

const colorMap: Record<string, { color: string; border: string }> = {
    users: { color: "text-blue-600", border: "border-blue-600" },
    problems: { color: "text-green-600", border: "border-green-600" },
    contests: { color: "text-yellow-600", border: "border-yellow-600" },
    reports: { color: "text-red-600", border: "border-red-600" },
};

interface ApiStat {
    title: string;
    value: string;
    change: string;
}

interface UiStat {
    title: string;
    value: string;
    icon: any;
    change: string;
    color: string;
    border: string;
    href: string;
}

function transformApiStats(apiData: ApiStat[]): UiStat[] {
    return apiData.map((item) => {
        const map = colorMap[item.title] || { color: "", border: "" };
        let uiHref = "/admin/" + item.title;
        let uiTitle = "";
        switch (item.title) {
            case "users":
                uiTitle = "Tổng số Người dùng";
                break;
            case "problems":
                uiTitle = "Tổng số Thử thách";
                break;
            case "contests":
                uiTitle = "Cuộc thi đã tổ chức";
                break;
            case "reports":
                uiTitle = "Báo cáo";
                break;
            default:
                uiTitle = item.title;
        }

        return {
            title: uiTitle,
            value: item.value,
            icon: iconMap[item.title],
            change: item.change,
            color: map.color,
            border: map.border,
            href: uiHref
        };
    });
}
const StatCard: React.FC<StatItem> = ({ title, value, icon: Icon, change, color, border, href }) => (
    <Card className={`shadow-lg hover:shadow-xl gap-1 transition-shadow border-t-4 ${border}`} onClick={() => {window.location.href = href}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{change}</p>
        </CardContent>
    </Card>
);

// ====================================================================
// MOCK CHART COMPONENTS (Giữ lại Pie Chart)
// ====================================================================
const hexColorMap: Record<string, string> = {
    "bg-orange-500": "#f97316",
    "bg-blue-600": "#2563eb",
    "bg-purple-500": "#a855f7",
    "bg-cyan-500": "#06b6d4",
    "bg-gray-400": "#9ca3af",
};
interface PieChartMockProps {
    data: Distribution[];
}
const PieChartMock: React.FC<PieChartMockProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    let cumulative = 0;
    const gradient = data
        .map((item) => {
            const start = (cumulative / total) * 100;
            cumulative += item.count;
            const end = (cumulative / total) * 100;
            const hex = hexColorMap[item.color] || "#ccc";
            return `${hex} ${start}% ${end}%`;
        })
        .join(", ");

    return (
        <div className="flex flex-col items-center justify-center p-10">
            {/* Chart + Legend */}
            <div className="flex items-center justify-center gap-8">
                {/* Biểu đồ hình tròn */}
                <div
                    className="w-40 h-40 rounded-full relative shadow-inner"
                    style={{ background: `conic-gradient(${gradient})` }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-gray-700 shadow">
                            {total}
                        </div>
                    </div>
                </div>

                {/* Legend nằm ngang */}
                <div className="space-y-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm min-w-[150px]">
                            <div className="flex items-center">
                                <span
                                    className={`w-3 h-3 rounded-full mr-2 ${item.color}`}
                                ></span>
                                {item.text}
                            </div>
                            <span className="font-semibold text-gray-700">
                                {Math.round((item.count / total) * 100)}% ({item.count})
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};



// ====================================================================
// MAIN COMPONENT: DASHBOARD PAGE
// ====================================================================

const DashboardPage: React.FC = () => {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([])
    const [stats, setStats] = useState<Stats[]>([])
    const [chart, setChart] = useState<TypeCount[]>([])
    const renderReportTypeBadge = (type: ReportTypeEnum) => {
        let text = "";
        let colorClass = "";
        let Icon: LucideIcon = MessageSquare;

        switch (type) {
            case ReportTypeEnum.SYSTEM:
                text = "Hệ thống";
                colorClass = "bg-orange-500 hover:bg-orange-600";
                Icon = Settings;
                break;
            case ReportTypeEnum.PROBLEM:
                text = "Thử thách";
                colorClass = "bg-blue-600 hover:bg-blue-700";
                Icon = FileText;
                break;
            case ReportTypeEnum.CONTEST:
                text = "Cuộc thi";
                colorClass = "bg-purple-500 hover:bg-purple-600";
                Icon = Trophy;
                break;
            case ReportTypeEnum.SUBMISSION:
                text = "Nộp bài";
                colorClass = "bg-cyan-500 hover:bg-cyan-600";
                Icon = CheckCircle;
                break;
            default:
                text = "Khác";
                colorClass = "bg-gray-500 hover:bg-gray-600";
                Icon = MessageSquare;
        }
        return (
            <Badge className={`text-xs flex items-center ${colorClass}`}>
                <Icon className="w-3 h-3 mr-1" />{text}
            </Badge>
        );
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            const data = await apiGet<DashboardStats>("/admin/dashboard/stats");
            setReports(data.reports)
            setStats(data.stats)
            setChart(data.chart)
            // console.log(data);
        }
        fetchDashboard()
    }, []);


    // Lấy 5 Reports chưa xử lý gần nhất
    const recentUnsolvedReports = reports
        .filter(r => !r.solved)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="m-4 pt-3">
            {/*<h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Tổng quan & Reports</h2>*/}

            {/* 1. THỐNG KÊ (STAT CARDS) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-14">
                {transformApiStats(stats).map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        change={stat.change}
                        color={stat.color}
                        border={stat.border}
                        href={stat.href}
                    />
                ))}
            </div>

            {/* 2. REPORTS VÀ PHÂN LOẠI (Bố cục 2/3 + 1/3) */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* BẢNG: 5 REPORTS CHƯA XỬ LÝ GẦN NHẤT (Lớn nhất, chiếm 2/3) */}
                <Card className="lg:col-span-3 shadow-lg h-full flex flex-col gap-1">
                    <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-600">
                            <Bug className="w-5 h-5" /> Báo cáo chưa xử lý
                        </CardTitle>
                        <Button variant="link" size="sm" className="flex items-center cursor-pointer text-red-600 hover:text-red-700 p-0 h-auto"
                            onClick={() => {router.push('/admin/reports')}}
                        >
                            Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 px-3">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    {/*<TableHead className="w-[80px]">ID</TableHead>*/}
                                    <TableHead className="w-[120px]">Loại</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    {/*<TableHead className="w-[100px]">Target</TableHead>*/}
                                    <TableHead className="w-[120px]">Ngày tạo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUnsolvedReports.map((report) => (
                                    <TableRow key={report.id} className="cursor-pointer hover:bg-red-50/50">
                                        {/*<TableCell className="font-medium text-red-600">#{report.id}</TableCell>*/}
                                        <TableCell>{renderReportTypeBadge(report.type)}</TableCell>
                                        <TableCell className="max-w-xs truncate">{report.title}</TableCell>
                                        {/*<TableCell className="text-xs font-mono">{report.target}</TableCell>*/}
                                        <TableCell className="text-sm">{new Date(report.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Biểu đồ phân loại Reports (Pie Chart Mock, chiếm 1/3) */}
                <Card className="shadow-lg lg:col-span-2 gap-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 p-1">
                            <PieChart className="w-5 h-5 text-gray-600"/> Phân loại báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChartMock data={transformReportData(chart)}/>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default DashboardPage;