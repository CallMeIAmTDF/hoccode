"use client"

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    PlusCircle,
    Lock,
    Unlock,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    Trash2, // Icon thùng rác
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { notify } from "@/components/notify";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {apiGet} from "@/lib/api";

// ====================================================================
//                             I. TYPES & MOCK DATA (GIỮ NGUYÊN)
// ====================================================================

interface UserResponse {
    id: string;
    email: string;
    name: string;
    dob: string;
    avatar: string;
    no_password: boolean;
    is_locked: boolean;
}

const mockUsers: UserResponse[] = Array.from({ length: 25 }, (_, i) => ({
    id: `u-${(i + 1).toString().padStart(3, '0')}`,
    email: `user${i + 1}@example.com`,
    name: `User Name ${i + 1}`,
    dob: `199${i % 10}-0${(i % 12) + 1}-0${(i % 28) + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 5}`,
    no_password: i % 5 === 0,
    is_locked: i % 7 === 0,
}));


// ====================================================================
//                       II. MAIN ADMIN USERS COMPONENT (CẬP NHẬT)
// ====================================================================

const ITEMS_PER_PAGE = 5; // Đặt số lượng item trên mỗi trang

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // STATE PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiGet<UserResponse[]>("/admin/users");

            // await new Promise(resolve => setTimeout(resolve, 800));
            setUsers(data);

        } catch (error) {
            notify("error", { title: "Lỗi tải dữ liệu", description: "Không thể tải danh sách người dùng." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset về trang 1 khi thay đổi search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Lọc và Phân trang dữ liệu
    const { filteredAndPagedUsers, totalItems, totalPages, startIndex, endIndex } = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();

        // 1. Lọc
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(lowerCaseSearch) ||
            user.email.toLowerCase().includes(lowerCaseSearch) ||
            user.id.toLowerCase().includes(lowerCaseSearch)
        );

        const total = filtered.length;
        const pages = Math.ceil(total / ITEMS_PER_PAGE);

        // Đảm bảo currentPage không vượt quá totalPages
        const safeCurrentPage = Math.min(currentPage, pages) || 1;

        // 2. Phân trang
        const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paged = filtered.slice(start, end);

        return {
            filteredAndPagedUsers: paged,
            totalItems: total,
            totalPages: pages,
            startIndex: start + 1,
            endIndex: Math.min(end, total),
        };
    }, [users, searchTerm, currentPage]);


    // HÀM XỬ LÝ HÀNH ĐỘNG

    const handleToggleLock = async (userId: string, currentStatus: boolean, userName: string) => {
        try {
            const data = await apiGet<any>(`/admin/users/${userId}/lock`);
            const action = currentStatus ? "mở khóa" : "khóa";
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_locked: !currentStatus } : u));
            notify("success", { title: "Thành công", description: `Đã ${action} người dùng ${userName}.` });
        } catch (error) {
            notify("error", { title: "Thất bại", description: "Không thể thao tác." });
        }

    };


    const formatDOB = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    }


    return (
        <div className="bg-background p-4">
            <div className="container mx-auto max-w-7xl px-4">

                {/* TIÊU ĐỀ TRANG VÀ HÀNH ĐỘNG CHÍNH */}
                {/*<div className="flex justify-between items-center mb-6">*/}
                {/*    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">*/}
                {/*        <User className="w-6 h-6 text-primary" /> Quản Lý Người Dùng*/}
                {/*    </h1>*/}
                {/*    <Button onClick={handleCreateUser} className="flex items-center gap-2">*/}
                {/*        <PlusCircle className="w-4 h-4" /> Thêm Người Dùng Mới*/}
                {/*    </Button>*/}
                {/*</div>*/}

                {/* KHUNG CHỨA BẢNG VÀ CÔNG CỤ */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <CardTitle className="text-xl">Danh sách Người Dùng</CardTitle>

                        {/* INPUT TÌM KIẾM */}
                        <div className="relative w-full md:w-80 mt-4 md:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Tìm kiếm theo Tên, Email, ID..."
                                className="pl-9 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-primary">
                                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredAndPagedUsers.length === 0 && !searchTerm ? (
                            <div className="text-center p-10 text-muted-foreground">
                                <AlertCircle className="w-8 h-8 mx-auto mb-3"/>
                                <p>Hiện không có người dùng nào trong hệ thống.</p>
                            </div>
                        ) : filteredAndPagedUsers.length === 0 && searchTerm ? (
                            <div className="text-center p-10 text-muted-foreground">
                                <Search className="w-8 h-8 mx-auto mb-3"/>
                                <p>Không tìm thấy người dùng phù hợp với tìm kiếm.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-card/50">
                                            <TableHead className="w-[200px]">Thông tin</TableHead>
                                            <TableHead className="w-[150px]">Ngày sinh</TableHead>
                                            <TableHead className="text-center">Trạng thái</TableHead>
                                            <TableHead className="text-center w-[150px]">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndPagedUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{user.name}</span>
                                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4"/>
                                                        {formatDOB(user.dob)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {user.is_locked ? (
                                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                                <Lock className="w-3 h-3"/> Đã Khóa
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                                                <Unlock className="w-3 h-3"/> Hoạt động
                                                            </Badge>
                                                        )}
                                                        {user.no_password && (
                                                            <Badge className="flex items-center gap-1 mt-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                                                <AlertCircle className="w-3 h-3"/> Chưa có Mật khẩu
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* CỘT HÀNH ĐỘNG (NÚT HIỆN THỊ TRỰC TIẾP) */}
                                                <TableCell className="text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button
                                                            size="icon"
                                                            variant={user.is_locked ? "default" : "destructive"}
                                                            onClick={() => handleToggleLock(user.id, user.is_locked, user.name)}
                                                            title={user.is_locked ? "Mở Khóa Tài Khoản" : "Khóa Tài Khoản"}
                                                            className={user.is_locked ? "bg-green-600 hover:bg-green-700" : ""}
                                                        >
                                                            {user.is_locked ? (
                                                                <Unlock className="w-4 h-4" />
                                                            ) : (
                                                                <Lock className="w-4 h-4" />
                                                            )}
                                                        </Button>

                                                        {/*<Button*/}
                                                        {/*    size="icon"*/}
                                                        {/*    variant="outline"*/}
                                                        {/*    className="text-red-500 border-red-300 hover:bg-red-50"*/}
                                                        {/*    onClick={() => handleDeleteUser(user.id, user.name)}*/}
                                                        {/*    title="Xóa Tài Khoản"*/}
                                                        {/*>*/}
                                                        {/*    <Trash2 className="w-4 h-4" />*/}
                                                        {/*</Button>*/}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* PHÂN TRANG */}
                        <div className="flex justify-between items-center pt-4 border-t mt-4">
                            <span className="text-sm text-muted-foreground">
                                Hiển thị {startIndex} - {endIndex} trên tổng số {totalItems} người dùng
                                {searchTerm && ` (Tìm thấy)`}
                            </span>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    disabled={currentPage === 1 || loading}
                                >
                                    <ArrowLeft className="w-4 h-4"/>
                                </Button>
                                <span className="text-sm font-medium">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    <ArrowRight className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}