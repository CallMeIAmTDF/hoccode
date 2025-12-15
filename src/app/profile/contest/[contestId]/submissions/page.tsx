"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Code, Clock, CheckCircle, XCircle, AlertCircle, Shield, Copy, Check } from 'lucide-react';
import {apiGet} from "@/lib/api";
import {notify} from "@/components/notify";
import {Header} from "@/components/header";
import {Sidebar} from "@/components/sidebar";
import PlagiarismModal from "@/components/PlagiarismModal";
import {useSocket} from "@/context/SocketProvider";

// Type definitions
interface Problem {
    id: number;
    title: string;
    difficulty: string;
}

interface Submission {
    id: string;
    pid: number;
    problem: Problem;
    code: string;
    language: string;
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR' | 'PENDING';
    totalTestCases: number;
    passedTestCase: number;
    message?: string;
    maxTime: number;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
}

interface APIResponse {
    submissions: Submission[];
    users: string[];
}
type PageProps = {
    params: Promise<{
        contestId: string;
    }>;
};
const ITEMS_PER_PAGE = 15;

export default async function SubmissionHistory({ params }: PageProps){
    const { contestId } = await params;
    const [data, setData] = useState<APIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [copied, setCopied] = useState(false);
    const [isPlagiarismChecked, setIsPlagiarismChecked] = useState(false);

    const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
    const [plagiarismData, setPlagiarismData] = useState<any>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);

    const { isConnected, subscribe } = useSocket();

    useEffect(() => {
        const fetchContestSubmission = async () => {
            try{
                const data = await apiGet<Submission[]>(`/contest/${contestId}/submissions`)
                const users = await apiGet<string[]>(`/contest/${contestId}/participants`)
                const mockData: APIResponse = {
                    submissions: data,
                    users: users
                };
                setData(mockData);
            }catch (err: any){
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: err.message
                })
            }
            setLoading(false);
        }

        const fetchIsPlagiarismChecked = async () => {
            try{
                const data = await apiGet<boolean>(`/contest/${contestId}/isPlagiarismChecked`)
                setIsPlagiarismChecked(data)
            }catch (err: any){
                notify("error", {
                    title: "Lỗi tải dữ liệu",
                    description: err.message
                })
            }
        }
        fetchIsPlagiarismChecked()
        fetchContestSubmission()
    }, []);

    useEffect(() => {
        if(!isConnected) return;

        const sub = subscribe(`/user/queue`, (msg) => {
            if (msg.type === "SIMPLE_NOTIFICATION") {
                notify("info", {
                    title: "Thông báo",
                    description: msg.message
                })
            }
        });
        return () => sub?.unsubscribe();
    }, [subscribe, isConnected]);


    // Filter and pagination
    const filteredSubmissions = useMemo(() => {
        if (!data) return [];

        return data.submissions.filter(sub => {
            const matchesSearch = sub.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.language.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUser = selectedUser === 'all' || sub.createdBy === selectedUser;
            return matchesSearch && matchesUser;
        });
    }, [data, searchQuery, selectedUser]);

    const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentSubmissions = filteredSubmissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700 border-green-300', label: 'Accepted' };
            case 'WRONG_ANSWER':
                return { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700 border-red-300', label: 'Wrong Answer' };
            case 'TIME_LIMIT_EXCEEDED':
                return { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Time Limit' };
            case 'RUNTIME_ERROR':
                return { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700 border-red-300', label: 'Runtime Error' };
            case 'COMPILE_ERROR':
                return { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Compile Error' };
            default:
                return { icon: <Clock className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Pending' };
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyCode = () => {
        if (selectedSubmission) {
            navigator.clipboard.writeText(selectedSubmission.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePlagiarism = async () => {
        try{
            const data = await apiGet<any>(`/contest/${contestId}/plagiarism`)
            if(data == null){
                notify("success", {
                    title: "Thành công",
                    description: "Đang kiểm tra, vui lòng đợi"
                })
            }
            else{
                setPlagiarismData({
                    matches: data
                })
                setShowPlagiarismModal(true);
            }
        }catch (err: any){
            notify("error", {
                title: "Lỗi tải dữ liệu",
                description: err.message
            })
        }
    }

    const handleBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Đang tải lịch sử nộp bài...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
    <div className="min-h-screen flex flex-col">
        <Header/>
        <div className="flex flex-1">
            <Sidebar/>
            <main className="flex-1 p-6 min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {/*<Button variant="outline" onClick={handleBack} className="flex items-center gap-2">*/}
                                {/*    <ArrowLeft className="w-4 h-4"/>*/}
                                {/*    Quay lại*/}
                                {/*</Button>*/}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Lịch sử nộp bài</h1>
                                    <p className="text-slate-600">{filteredSubmissions.length} lượt nộp</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 border-red-400 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                                onClick={handlePlagiarism}
                            >
                                <Shield className="w-4 h-4"/>
                                Kiểm tra gian lận
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                <Input
                                    placeholder="Tìm kiếm theo bài tập, ngôn ngữ..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                        setSelectedSubmission(null);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={selectedUser}
                                onChange={(e) => {
                                    setSelectedUser(e.target.value);
                                    setCurrentPage(1);
                                    setSelectedSubmission(null);
                                }}
                                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            >
                                <option value="all">Tất cả người dùng</option>
                                {data.users.map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto p-6">
                    <div
                        className={`grid gap-6 transition-all duration-300 ${selectedSubmission ? 'grid-cols-2' : 'grid-cols-1'}`}>

                        {/* Submissions List */}
                        <Card className={selectedSubmission ? '' : 'col-span-1'}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-slate-600"/>
                                    Danh sách nộp bài
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {currentSubmissions.map((submission) => {
                                        const statusConfig = getStatusConfig(submission.status);
                                        const isSelected = selectedSubmission?.id === submission.id;

                                        return (
                                            <div
                                                key={submission.id}
                                                onClick={() => setSelectedSubmission(submission)}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                                    isSelected
                                                        ? 'border-slate-400 bg-slate-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-slate-900">{submission.problem.title}</h3>
                                                            {/*<Badge variant="outline" className={`text-xs ${getDifficultyColor(submission.problem.difficulty)}`}>*/}
                                                            {/*    {submission.problem.difficulty}*/}
                                                            {/*</Badge>*/}
                                                        </div>
                                                        {/*<p className="text-sm text-slate-500">ID: {submission.id}</p>*/}
                                                    </div>
                                                    <Badge variant="outline"
                                                           className={`flex items-center gap-1 ${statusConfig.color}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-4">
                          <span className="text-slate-600">
                            <span className="font-medium">{submission.language}</span>
                          </span>
                                                        <span className="text-slate-600">
                            Test: <span className="font-medium">{submission.passedTestCase}/{submission.totalTestCases}</span>
                          </span>
                                                        <span className="text-slate-600">
                            <Clock className="w-3 h-3 inline mr-1"/>
                                                            {submission.maxTime}ms
                          </span>
                                                    </div>
                                                    <span
                                                        className="text-slate-500 text-xs">{formatDate(submission.createdAt)}</span>
                                                </div>

                                                <div className="mt-2 text-sm text-slate-600">
                                                    Người nộp: <span
                                                    className="font-medium">{submission.createdBy.split("@")[0]}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                                    <div className="text-sm text-slate-500">
                                        Hiển
                                        thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredSubmissions.length)} / {filteredSubmissions.length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4"/>
                                        </Button>

                                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                            if (pageNum > totalPages) return null;

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === currentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="min-w-[2rem]"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Code Detail Panel */}
                        {selectedSubmission && (
                            <Card className="animate-in slide-in-from-right duration-300">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="w-5 h-5 text-slate-600"/>
                                            Chi tiết bài nộp
                                        </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyCode}
                                            className="flex items-center gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                                            {copied ? 'Đã copy' : 'Copy code'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Submission Info */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Bài tập:</span>
                                            <span
                                                className="text-sm font-medium">{selectedSubmission.problem.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Thời gian:</span>
                                            <span className="text-sm font-medium">{selectedSubmission.maxTime}ms</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Ngôn ngữ:</span>
                                            <span
                                                className="text-sm font-medium uppercase">{selectedSubmission.language}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Thời gian nộp:</span>
                                            <span
                                                className="text-sm font-medium">{formatDate(selectedSubmission.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Code Display */}
                                    <div className="relative">
                                        <div
                                            className="absolute top-3 right-3 text-xs font-medium text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">
                                            {selectedSubmission.language}
                                        </div>
                                        <pre
                                            className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedSubmission.code}</code>
                  </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
        <PlagiarismModal
            isOpen={showPlagiarismModal}
            onClose={() => {
                setShowPlagiarismModal(false);
                setSelectedMatch(null);
                setPlagiarismData(null);
            }}
            data={plagiarismData}
            loading={loadingPlagiarism}
            selectedMatch={selectedMatch}
            onSelectMatch={setSelectedMatch}
        />
    </div>
    )
        ;
};
