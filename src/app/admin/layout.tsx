// app/admin/layout.tsx
'use client'
import React from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {notify} from "@/components/notify";
// Giả định Header là component toàn cục đã có sẵn
// import Header from '@/components/Header';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminRootLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const handleLogout = () => {
        window.localStorage.clear();
        window.location.href = "/auth/signin";

        notify("success", {
            title: "Đăng xuất thành công",
            description: "Trở về trang đăng nhập"
        })
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">

            {/* 1. Sidebar (Cố định, Cuộn độc lập) */}
            <div className="hidden lg:flex flex-col w-64 bg-white border-r">
                {/*<div className="p-4 border-b h-16 flex items-center">*/}
                {/*    <h1 className="text-2xl font-bold text-red-600">ADMIN PANEL</h1>*/}
                {/*</div>*/}
                {/* Scrollbar cho Sidebar (nếu nội dung dài) */}
                <div className="flex-1 overflow-y-auto">
                    <AdminSidebar />
                </div>
            </div>

            {/* 2. Main Area (Header + Content) */}
            <div className="flex flex-col flex-1">

                {/* Top Bar (Cố định) */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm sticky top-0 z-40">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {/* Tiêu đề trang con sẽ được lấy từ metadata hoặc context */}
                        Quản trị Hệ thống
                    </h1>

                    {/* Mobile Sidebar Toggle */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                {/*<div className="p-4 border-b h-16 flex items-center">*/}
                                {/*    <h1 className="text-xl font-bold text-red-600">HocCode.Io</h1>*/}
                                {/*</div>*/}
                                <AdminSidebar />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-2">
                        {/*<Button variant="ghost" size="icon">*/}
                        {/*    <Settings className="h-5 w-5 text-gray-600" />*/}
                        {/*</Button>*/}
                        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 text-red-600"/>
                        </Button>
                    </div>
                </header>

                {/* Main Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminRootLayout;