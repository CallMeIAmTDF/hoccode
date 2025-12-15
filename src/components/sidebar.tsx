"use client"
import {useState} from "react"
import {usePathname} from "next/navigation"
import {Trophy, TextSelect, ChevronLeft, ChevronRight, BarChart3, Code} from "lucide-react"
import Link from "next/link"
import clsx from "clsx"

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    const links = [
        { href: "/profile", label: "Trang cá nhân", icon: TextSelect },
        { href: "/profile/contest", label: "Cuộc thi của bạn", icon: Trophy },
        { href: "/profile/report", label: "Báo cáo của bạn", icon: BarChart3 },
        { href: "/profile/submission", label: "Bài nộp của bạn", icon: Code },
    ];

    return (
        <aside
            className={clsx(
                "h-[calc(100vh-4rem)] sticky top-16 border-r bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                {!collapsed && (
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Menu
                    </h2>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    )}
                </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
                {links.map((item) => {
                    const isActive = item.href === "/profile"
                        ? pathname === "/profile"
                        : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-200 transition-all duration-200 group relative",
                                "hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400",
                                collapsed && "justify-center",
                                isActive && "bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0"/>
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                            {collapsed && (
                                <span
                                    className="absolute left-full ml-2 px-2 py-1 text-sm bg-gray-800 text-white rounded
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
                                >
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
