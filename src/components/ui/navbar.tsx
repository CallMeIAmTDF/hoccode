'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Scale, MessageCircle, LogIn, UserPlus, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        router.push('/');
    };

    const NavLinks = () => (
        <>
            <div className="flex items-center gap-2">
                {!isLoggedIn ? (
                    <>
                        <Link href="/signin" className="inline-flex">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <LogIn className="h-4 w-4"/>
                                <span>Đăng Nhập</span>
                            </Button>
                        </Link>

                        <Link href="/signup" className="inline-flex">
                            <Button
                                size="sm"
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <UserPlus className="h-4 w-4"/>
                                <span>Đăng Ký</span>
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/chat"
                            className="flex items-center gap-1 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            <MessageCircle className="h-4 w-4"/>
                            <span>Trò Chuyện</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4"/>
                            <span>Đăng Xuất</span>
                        </Button>
                    </>
                )}
            </div>
        </>
    );

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Scale className="h-8 w-8 text-blue-600"/>
                        <span className="text-xl font-bold text-slate-900">LegalBot</span>
                    </Link>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <NavLinks/>
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden border-t border-slate-200">
                        <div className="flex flex-col p-3 space-y-2 bg-white">
                            <NavLinks />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}