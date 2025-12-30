
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Upload,
    Search,
    Trash2,
    Download,
    FilePlus,
    Loader2,
    FileArchive,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notify } from "@/components/notify";
import { cn } from "@/lib/utils";
import {apiGet, apiPost} from "@/lib/api";
import {useSocket} from "@/context/SocketProvider";

// --- Kiểu dữ liệu ---
type FileUploadStatus = 'FAILED' | 'UPLOADED' | 'RECEIVED';

interface DocumentFile {
    id: number;
    title: string;
    fileName: string;
    status: FileUploadStatus;
    size: number;
    createdAt: string;
}



export default function AdminFilesPage() {
    const [files, setFiles] = useState<DocumentFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { subscribe, isConnected } = useSocket();

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const data = await apiGet<DocumentFile[]>("/chat/file")
            setFiles(data)
        } catch (error) {
            notify("error", { title: "Lỗi", description: "Không thể tải danh sách tệp tin." });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = useMemo(() => {
        return files.filter(f =>
            f.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [files, searchTerm]);

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const paginatedFiles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredFiles.slice(start, start + itemsPerPage);
    }, [filteredFiles, currentPage]);

    const upsertFile = (incoming: DocumentFile) => {
        setFiles(prev => {
            const index = prev.findIndex(f => f.id === incoming.id);
            if (index !== -1) {
                const next = [...prev];
                next[index] = {
                    ...prev[index],
                    ...incoming,
                };
                return next;
            }
            return [...prev, incoming];
        });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusBadge = (status: FileUploadStatus) => {
        switch (status) {
            case 'UPLOADED':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] gap-1 px-2 py-0.5"><CheckCircle2 className="w-3 h-3"/> Đã tải lên</Badge>;
            case 'RECEIVED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] gap-1 px-2 py-0.5"><Clock className="w-3 h-3 animate-pulse"/> Đã nhận</Badge>;
            case 'FAILED':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-bold text-[10px] gap-1 px-2 py-0.5"><AlertCircle className="w-3 h-3"/> Thất bại</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    useEffect(() => {
        if(!isConnected) return;

        const sub = subscribe(`/user/topic/admin/files`, (msg) => {
            console.log(msg.data)
            if (msg.type === "NEW_NOTIFICATION") {
                const file = msg.data as DocumentFile;
                upsertFile(file);
                notify("info", {
                    title: "Thông báo",
                    description: msg.message
                })
            }
        });
        return () => sub?.unsubscribe();
    }, [subscribe, isConnected]);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden p-4">

            {/* Thanh hành động tinh gọn */}
            <Card className="shadow-sm border-slate-200 shrink-0 rounded-2xl overflow-hidden p-2">
                <CardContent className="p-3 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm tài liệu..."
                            className="pl-9 h-9 w-full text-xs bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={() => setIsUploadOpen(true)}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 font-bold rounded-xl shadow-sm transition-all active:scale-95"
                    >
                        <Upload className="w-3.5 h-3.5 mr-2" />
                        Tải lên mới
                    </Button>
                </CardContent>
            </Card>

            {/* Bảng dữ liệu */}
            <Card className="flex-1 bg-white shadow-sm border-slate-200 overflow-hidden flex flex-col min-h-0 rounded-2xl">
                <div className="flex-1 min-h-0 relative">
                    <div className="h-full w-full overflow-hidden">
                        <Table className="border-separate border-spacing-0">
                            <TableHeader className="relative z-20">
                                <TableRow className="hover:bg-transparent border-none">
                                    {/* 2. Đảm bảo bg-white để không bị nội dung body đè lên khi scroll */}
                                    {/* 3. Thêm shadow thay cho border-bottom vì border-separate làm mất border của tr */}
                                    <TableHead className="sticky top-0 bg-white z-30 w-16 h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 pl-6 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        ID
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-white z-30 min-w-[350px] h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        Tài liệu
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-white z-30 h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        Kích thước
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-white z-30 h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-white z-30 text-right h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(226,232,240,1)] pr-6">
                                        Ngày tải lên
                                    </TableHead>
                                    {/*<TableHead className="sticky top-0 bg-white z-30 w-20 text-center h-12 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_1px_0_0_rgba(226,232,240,1)]">*/}
                                    {/*    Hành động*/}
                                    {/*</TableHead>*/}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-b border-slate-50">
                                            <TableCell className="pl-6"><div className="h-3 w-6 bg-slate-100 rounded"></div></TableCell>
                                            <TableCell>
                                                <div className="h-3 w-40 bg-slate-100 rounded mb-1.5"></div>
                                                <div className="h-2 w-60 bg-slate-50 rounded"></div>
                                            </TableCell>
                                            <TableCell><div className="h-3 w-12 bg-slate-100 rounded"></div></TableCell>
                                            <TableCell><div className="h-5 w-20 bg-slate-100 rounded-lg"></div></TableCell>
                                            <TableCell className="text-right pr-6"><div className="h-3 w-20 bg-slate-100 rounded ml-auto"></div></TableCell>
                                            {/*<TableCell><div className="h-7 w-7 bg-slate-100 rounded-lg mx-auto"></div></TableCell>*/}
                                        </TableRow>
                                    ))
                                ) : paginatedFiles.length > 0 ? (
                                    paginatedFiles.map((file) => (
                                        <TableRow key={file.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                            <TableCell className="pl-6 font-mono text-[10px] text-slate-400">#{file.id}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-red-50 rounded-xl text-red-500 shrink-0 border border-red-100/50 shadow-sm">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors truncate tracking-tight">{file.title}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium truncate">{file.fileName}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold text-slate-600">{formatSize(file.size)}</TableCell>
                                            <TableCell>{getStatusBadge(file.status)}</TableCell>
                                            <TableCell className="text-right text-[11px] text-slate-500 font-bold pr-6">
                                                {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            {/*<TableCell className="text-center">*/}
                                            {/*    <div className="flex items-center justify-center gap-1">*/}
                                            {/*        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm transition-all active:scale-90">*/}
                                            {/*            <Download className="w-3.5 h-3.5" />*/}
                                            {/*        </Button>*/}
                                            {/*        /!*<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-white shadow-sm transition-all active:scale-90">*!/*/}
                                            {/*        /!*    <Trash2 className="w-3.5 h-3.5" />*!/*/}
                                            {/*        /!*</Button>*!/*/}
                                            {/*    </div>*/}
                                            {/*</TableCell>*/}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-60 text-center text-slate-400 italic">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                    <FileArchive className="w-8 h-8 opacity-20" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em]">Không tìm thấy tài liệu</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* Spacer cho padding bottom bên trong table scroll */}
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={6} className="p-4"></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Phân trang tinh gọn */}
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 shrink-0 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tổng cộng: <span className="text-slate-900 font-bold">{filteredFiles.length}</span> tệp
                    </span>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-white"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Trước
                        </Button>
                        <div className="text-[10px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-xl shadow-lg shadow-slate-200">
                            {currentPage} / {totalPages || 1}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-white"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                            Sau <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Modal Tải lên */}
            <UploadFileModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={(data: DocumentFile) => {
                    setIsUploadOpen(false)
                    upsertFile(data)
                    // fetchFiles()
                }}
            />
        </div>
    );
}

// --- Component Modal Tải lên ---
interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: DocumentFile) => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                notify("error", { title: "Sai định dạng", description: "Hệ thống chỉ chấp nhận tệp PDF." });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !file) {
            notify("error", { title: "Thiếu thông tin", description: "Vui lòng điền tiêu đề và chọn tệp." });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("file", file);

            const data = await apiPost<DocumentFile>(`/chat/upload`, formData);

            notify("success", { title: "Thành công", description: "Tệp đã được tải lên thành công." });
            onSuccess(data);
            setTitle("");
            setFile(null);
        } catch (error) {
            notify("error", { title: "Lỗi", description: "Không thể tải lên tệp tin. Vui lòng thử lại sau." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-[890px] bg-white rounded-[2.5rem] overflow-hidden p-0 border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-8 pb-4 bg-slate-50 border-b border-slate-100">
                        {/*<div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-indigo-100">*/}
                        {/*    <FilePlus className="w-5 h-5 text-indigo-600" />*/}
                        {/*</div>*/}
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Tải lên tài liệu</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-medium">
                            Chọn tệp PDF và đặt tiêu đề để lưu trữ vào kho hệ thống.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="doc-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề tài liệu</Label>
                            <Input
                                id="doc-title"
                                placeholder="VD: Đề thi cấu trúc dữ liệu 2024..."
                                className="h-11 text-xs bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all rounded-xl font-bold"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tệp tài liệu (PDF)</Label>
                            <div
                                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                                    file ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white",
                                    isSubmitting && "opacity-50"
                                )}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange}/>
                                {file ? (
                                    <>
                                        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg scale-110 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-black text-slate-900 line-clamp-1 max-w-[200px]">{file.name}</p>
                                            <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="absolute top-3 right-3 p-1.5 bg-white text-slate-400 rounded-full hover:text-red-500 shadow-md border border-slate-50 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 bg-slate-200 text-slate-400 rounded-xl group-hover:text-indigo-500 transition-colors">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-600">Bấm để chọn tệp</p>
                                            <p className="text-[9px] text-slate-400 font-medium">Chỉ chấp nhận định dạng .pdf (Max 20MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-11 font-black text-[11px] text-slate-400 uppercase tracking-widest hover:bg-slate-50" disabled={isSubmitting}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận tải lên"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
