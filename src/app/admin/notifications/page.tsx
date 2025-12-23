
"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Bell,
    PlusCircle,
    Search,
    Send,
    Clock,
    User,
    ShieldAlert,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notify } from "@/components/notify"
import { apiGet, apiPost } from "@/lib/api"
import { cn } from "@/lib/utils"

// --- Types ---
interface Notification {
    id: number
    title: string
    message: string
    receiver: string
    redirectUrl: string | null
    status: "SEND" | "PENDING" | "DRAFT"
    type: "SYSTEM" | "USER" | "PROMOTION"
    createdAt: string
    createdBy: string
    updatedAt: string | null
    updatedBy: string | null
}

export default function AdminNotificationPage() {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Form state for new notification
    const [newNotify, setNewNotify] = useState({
        title: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const data = await apiGet<Notification[]>("/admin/notifications")
            setNotifications(data)
        } catch (error) {
            notify("error", { title: "Lỗi", description: "Không thể tải danh sách thông báo" })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNotification = async () => {
        if (!newNotify.title.trim() || !newNotify.message.trim()) {
            notify("error", { title: "Thiếu thông tin", description: "Vui lòng nhập đầy đủ tiêu đề và nội dung." })
            return
        }

        setIsSubmitting(true)
        try {
            // Simulated API call: await apiPost("/admin/notification", { ...newNotify, receiver: "ALL", type: "SYSTEM" })
            await apiPost<any>("/admin/notifications", {
                title: newNotify.title,
                content: newNotify.message,
            })
            notify("success", { title: "Thành công", description: "Thông báo đã được tạo và gửi đi." })
            setIsCreateModalOpen(false)
            setNewNotify({ title: "", message: "" })
            fetchNotifications()
        } catch (error) {
            notify("error", { title: "Lỗi", description: "Không thể gửi thông báo." })
        } finally {
            setIsSubmitting(false)
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "SYSTEM": return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1.5"><ShieldAlert className="w-3 h-3"/> Hệ thống</Badge>
            case "USER": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5"><User className="w-3 h-3"/> Người dùng</Badge>
            default: return <Badge variant="outline">{type}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SEND": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã gửi</Badge>
            case "PENDING": return <Badge className="bg-amber-500 hover:bg-amber-600">Đang chờ</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">

            {/* Action Bar (Search + Add Button) */}
            <Card className="shadow-sm border-slate-200 shrink-0 gap-0 py-0">
                <CardContent className="p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm tiêu đề hoặc nội dung thông báo..."
                            className="pl-9 bg-slate-50 border-slate-200 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-9 px-6 font-bold"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        {/*<PlusCircle className="w-4 h-4 mr-2" />*/}
                        Tạo thông báo
                    </Button>
                </CardContent>
            </Card>

            {/* Main Table Section */}
            <Card className="flex-1 bg-white shadow-sm border-slate-200 overflow-hidden flex flex-col min-h-0">
                <CardHeader className="pb-0 shrink-0 border-slate-50 gap-0 py-0 [&.border-b]:pb-0">
                    <CardTitle className="pb-0 text-sm font-bold text-slate-700 flex items-center gap-0 ">
                        Lịch sử gửi thông báo
                    </CardTitle>
                </CardHeader>

                <div className="flex-1 min-h-0 overflow-hidden pt-0 px-2">
                    <ScrollArea className="h-full w-full no-scrollbar scrollbar-hide [&_[data-radix-scroll-area-scrollbar]]:hidden">
                        <Table className="no-scrollbar">
                            <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-16">#ID</TableHead>
                                    <TableHead className="min-w-[200px]">Thông tin chi tiết</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Đối tượng</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thời gian tạo</TableHead>
                                    {/*<TableHead className="w-16 text-center">Xóa</TableHead>*/}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <TableRow key={idx} className="animate-pulse">
                                            <TableCell><div className="h-4 w-8 bg-slate-100 rounded"></div></TableCell>
                                            <TableCell>
                                                <div className="h-4 w-40 bg-slate-100 rounded mb-2"></div>
                                                <div className="h-3 w-60 bg-slate-50 rounded"></div>
                                            </TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 rounded-full"></div></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-slate-100 rounded"></div></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-100 rounded-full"></div></TableCell>
                                            <TableCell className="text-right"><div className="h-4 w-24 bg-slate-100 rounded ml-auto"></div></TableCell>
                                            {/*<TableCell><div className="h-8 w-8 bg-slate-100 rounded mx-auto"></div></TableCell>*/}
                                        </TableRow>
                                    ))
                                ) : paginatedNotifications.length > 0 ? (
                                    paginatedNotifications.map((n, idx) => (
                                        <TableRow key={n.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-mono text-xs text-slate-400">{idx + 1}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{n.title}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.message}</div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(n.type)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-600 border-none">{n.receiver}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(n.status)}</TableCell>
                                            <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-slate-700">{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    <span className="opacity-60">{new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </TableCell>
                                            {/*<TableCell className="text-center">*/}
                                            {/*    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">*/}
                                            {/*        <Trash2 className="w-4 h-4" />*/}
                                            {/*    </Button>*/}
                                            {/*</TableCell>*/}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center text-slate-400 italic">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Bell className="w-10 h-10 opacity-10" />
                                                <p>Không tìm thấy kết quả nào.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Footer with Pagination */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                        Hiển thị <span className="text-slate-900">{paginatedNotifications.length}</span> trên <span className="text-slate-900">{filteredNotifications.length}</span> thông báo
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-xs font-bold text-slate-600 px-2">
                            Trang {currentPage} / {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            {/*<Send className="w-5 h-5 text-indigo-600" />*/}
                            Gửi thông báo mới
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Thông báo sẽ được gửi đồng loạt đến tất cả người dùng trong hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Tiêu đề</label>
                            <Input
                                placeholder="VD: Bảo trì hệ thống định kỳ..."
                                className="bg-slate-50 focus:bg-white border-slate-200 h-11"
                                value={newNotify.title}
                                onChange={(e) => setNewNotify({ ...newNotify, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nội dung chi tiết</label>
                            <Textarea
                                placeholder="Nhập nội dung thông báo..."
                                rows={6}
                                className="bg-slate-50 focus:bg-white border-slate-200 resize-none"
                                value={newNotify.message}
                                onChange={(e) => setNewNotify({ ...newNotify, message: e.target.value })}
                            />
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3 text-xs text-indigo-700 leading-relaxed">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-indigo-500" />
                            <p>Thông báo này sẽ được gắn nhãn <strong>Hệ thống</strong> và gửi đến <strong>toàn bộ</strong> người dùng ngay sau khi nhấn gửi.</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="font-semibold text-slate-500">Hủy</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] font-bold shadow-lg shadow-indigo-100"
                            onClick={handleCreateNotification}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    {/*<Send className="w-4 h-4 mr-2" />*/}
                                    Gửi thông báo
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

