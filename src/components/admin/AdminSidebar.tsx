"use client";

import Link from 'next/link';
import {LayoutDashboard, Users, FileText, Trophy, Bug, MessageSquare, Megaphone} from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Trang chủ', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Thử thách', href: '/admin/problems', icon: FileText },
    { name: 'Quản lý Cuộc thi', href: '/admin/contests', icon: Trophy },
    { name: 'Quản lý Người dùng', href: '/admin/users', icon: Users },
    { name: 'Quản lý Báo cáo', href: '/admin/reports', icon: Bug },
    { name: 'Quản lý Thông báo', href: '/admin/notifications', icon: Megaphone },

    // Quản lý Thảo luận sẽ nằm trong trang Quản lý Đề bài/Contest
];

const AdminSidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full p-4">
            <div className="mb-8 text-2xl font-bold text-red-600">
                HocCode.io
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
                    const Icon = item.icon;
                    return (
                        <Link key={item.name} href={item.href} passHref>
                            <div
                                className={`flex items-center p-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminSidebar;