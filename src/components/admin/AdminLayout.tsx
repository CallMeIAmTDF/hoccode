// src/components/admin/AdminLayout.tsx
import React from 'react';
import { Menu, LayoutDashboard, Settings, Users, FileText, Trophy, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar cho màn hình desktop */}
            <div className="hidden lg:block w-64 bg-white border-r">
                <AdminSidebar />
            </div>

            <div className="flex flex-col flex-1">
                {/* Header (Top Bar) */}
                <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                    <div className="flex items-center justify-between h-16 px-6">
                        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

                        {/* Mobile Sidebar Toggle */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64">
                                    <AdminSidebar />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* User/Settings Icons (Có thể thêm Avatar/User Menu) */}
                        <Button variant="ghost" size="icon" className="hidden lg:block">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;