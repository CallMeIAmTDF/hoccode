import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {LogIn, LogOut, UserPlus, Settings, User, Crown, Star, Bell} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {useEffect, useState} from "react";
import NotificationDropdown from "@/components/NotificationDropdown";
import {apiGet} from "@/lib/api";

export default function NavbarActions({ isLoggedIn, handleLogout }: { isLoggedIn: boolean, handleLogout: () => void }) {
    const [user, setUser] = useState<{ name: string; email: string; avatar: string; isPremium: boolean } | null>(null)
    const [isMounted, setIsMounted] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const syncPremium = () => {
            setIsPremium(localStorage.getItem("premium") === "true");
        };
        syncPremium();

        window.addEventListener("storage", syncPremium);        // tab khác
        window.addEventListener("premium-change", syncPremium); // cùng tab

        return () => {
            window.removeEventListener("storage", syncPremium);
            window.removeEventListener("premium-change", syncPremium);
        };
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                if(!localStorage.getItem("accessToken")){
                    return null;
                }
                const data = await apiGet<boolean>("/premium");
                setIsPremium(data);
                localStorage.setItem("premium", JSON.stringify(data));
            } catch (error) {
                console.error(error);
            } finally {
            }
        };
        checkStatus();
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            const name = localStorage.getItem("name") || ""
            const email = localStorage.getItem("email") || ""
            const premium = localStorage.getItem("premium") === "true"
            const avatar = localStorage.getItem("avatar") || ""
            setUser({ name, email, avatar, isPremium })
        }
    }, [isLoggedIn, isPremium])

    // Hydration & Auth Latency Fix:
    // 1. If not mounted (SSR), show skeleton.
    // 2. If mounted but isLoggedIn is false, check localStorage. If data exists, it means AuthProvider
    //    is likely still initializing. Show skeleton instead of Login buttons to prevent flicker.
    if (!isMounted) {
        return <NavbarSkeleton />;
    }

    const hasSessionData = typeof window !== 'undefined' && (localStorage.getItem("email") || localStorage.getItem("name"));
    if (!isLoggedIn && hasSessionData) {
        return <NavbarSkeleton />;
    }

    return (
        <div className="flex items-center gap-3">

            {isLoggedIn && <NotificationDropdown />}
            {!isLoggedIn ? (
                <>
                    <Link href="/auth/signin">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <LogIn className="h-4 w-4 mr-2" />
                            Đăng Nhập
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button size="sm" className="bg-blue-700 hover:bg-blue-700/90">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Đăng Ký
                        </Button>
                    </Link>
                </>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative">
                            <Avatar
                                className={`cursor-pointer ring-2 transition ${
                                    user?.isPremium
                                        ? "ring-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:ring-yellow-400"
                                        : "ring-muted hover:ring-blue-700"
                                }`}
                            >
                                <AvatarImage src={user?.avatar} alt="User avatar" />
                                <AvatarFallback
                                    className={
                                        user?.isPremium
                                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                                            : ""
                                    }
                                >
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Premium effects */}
                            {user?.isPremium && (
                                <>
                                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-1 shadow-lg">
                                        <Crown className="h-3 w-3 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 animate-pulse" />
                                    <div className="absolute -top-2 -left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                                    <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-yellow-500 rounded-full animate-ping animation-delay-300" />
                                </>
                            )}
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg p-1">
                        <div className="px-3 py-2">
                            <div className="flex items-center gap-1">
                                <p className="text-xs font-medium">
                                    {user?.name || "Người dùng"}
                                </p>

                                {user?.isPremium && (
                                    <Crown className="h-3.5 w-3.5 text-yellow-500"/>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>

                        <DropdownMenuSeparator/>

                        {user?.isPremium && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href="/upgrade" className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500"/>
                                        <span>Tính năng Premium</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}

                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Trang cá nhân</span>
                            </Link>
                        </DropdownMenuItem>

                        {/*<DropdownMenuItem asChild>*/}
                        {/*    <Link href="/settings" className="flex items-center gap-2">*/}
                        {/*        <Settings className="h-4 w-4 text-muted-foreground" />*/}
                        {/*        <span>Cài đặt</span>*/}
                        {/*    </Link>*/}
                        {/*</DropdownMenuItem>*/}

                        {!user?.isPremium && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/upgrade"
                                        className="flex items-center gap-2 text-yellow-600 focus:text-yellow-700 focus:bg-yellow-50"
                                    >
                                        <Crown className="h-4 w-4" />
                                        <span>Nâng cấp Premium</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

function NavbarSkeleton() {
    return (
        <div className="flex items-center gap-3">
            {/* Notification placeholder */}
            <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />
            {/* Avatar placeholder */}
            <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />
        </div>
    )
}