"use client"

import Link from "next/link"
import {Code2, Trophy, Swords, Users} from "lucide-react"
import {usePathname, useRouter} from "next/navigation";
import { cn } from "@/lib/utils";
import NavbarActions from "@/components/navbar-profile";
import {useAuth} from "@/lib/AuthProvider";
import { motion } from "framer-motion";

export function Header() {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        router.push('/');
    };

    const navItems = [
        { href: "/learn", label: "Luyện tập", icon: <Code2 className="h-4 w-4" /> },
        { href: "/contest", label: "Cuộc thi", icon: <Trophy className="h-4 w-4" /> },
        { href: "/combat", label: "Thực chiến", icon: <Swords className="h-4 w-4" /> },
        { href: "/interview", label: "Phỏng vấn", icon: <Users className="h-4 w-4" /> },
    ];

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
                {/* Left: Logo + Navigation */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Code2 className="h-6 w-6 text-blue-700 group-hover:scale-110 transition-transform"/>
                        <span className="text-xl font-bold text-foreground">HocCode</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 relative">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-blue-700/5"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}

                                    {active && (
                                        <motion.div
                                            layoutId="navUnderline"
                                            className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-700 rounded-full"
                                            transition={{type: "spring", stiffness: 500, damping: 30}}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: User actions */}
                <NavbarActions isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>
            </div>
        </header>
    );
}
