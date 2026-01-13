import React, {useEffect, useState, useMemo} from "react";
import {Bell, Sword, FileCode, Trophy, CheckCircle, ListFilter} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {motion, AnimatePresence} from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {apiGet} from "@/lib/api";
import {notify} from "@/components/notify";
import {useSocket} from "@/context/SocketProvider";
import {StreakNotification} from "@/components/animation/StreakNotification";

dayjs.locale("vi");
dayjs.extend(relativeTime);

interface Notification {
    id: number;
    receiver: string;
    redirectUrl: string | null;
    message: string;
    title: string;
    status: "READ" | "SEND";
    type: "PROBLEM" | "CONTEST" | "SUBMISSION" | "COMBAT";
    createdAt: string;
}

// Định nghĩa kiểu cho các bộ lọc
type StatusFilter = "ALL" | "SEND" | "READ";
type TypeFilter = "ALL" | "PROBLEM" | "CONTEST" | "SUBMISSION" | "COMBAT";

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const {isConnected, subscribe} = useSocket();


    const fetchNotifications = async () => {
        try {
            const res = await apiGet<Notification[]>("/notifications");
            setNotifications(res);
        } catch (err: any) {
            notify("error", {
                title: "Lỗi",
                description: err.message
            })
        }
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    useEffect(() => {
        fetchNotifications();

    }, []);


    useEffect(() => {
        setUnreadCount(notifications.filter((n) => n.status === "SEND").length);
    }, [notifications]);

    // const unreadCount = notifications.filter((n) => n.status === "SEND").length;

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const statusMatch = statusFilter === "ALL" || n.status === statusFilter;
            const typeMatch = typeFilter === "ALL" || n.type === typeFilter;
            return statusMatch && typeMatch;
        });
    }, [notifications, statusFilter, typeFilter]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "PROBLEM":
                return <FileCode className="w-4 h-4 text-blue-500 flex-shrink-0"/>;
            case "CONTEST":
                return <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0"/>;
            case "SUBMISSION":
                return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/>;
            case "COMBAT":
                return <Sword className="w-4 h-4 text-red-500 flex-shrink-0"/>;
            default:
                return <Bell className="w-4 h-4 text-gray-500 flex-shrink-0"/>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "PROBLEM":
                return "Bài tập";
            case "CONTEST":
                return "Cuộc thi";
            case "SUBMISSION":
                return "Bài nộp";
            case "COMBAT":
                return "Thực chiến";
            default:
                return "Thông báo";
        }
    };

    const handleClickNotification = async (n: Notification) => {
        if (n.status === "SEND") {
            try {
                await apiGet<any>(`/notifications/${n.id}`);
                setNotifications(prev => prev.map(notif =>
                    notif.id === n.id ? {...notif, status: "READ"} : notif
                ));
            } catch (err) {
                console.warn("Không thể đánh dấu đã đọc:", err);
            }
        }

        const targetUrl = n.redirectUrl && n.redirectUrl.trim() !== '' ? n.redirectUrl : "#";
        if (targetUrl !== "#") {
            window.location.href = targetUrl;
        }
    };

    useEffect(() => {
        if (!isConnected) return;

        const handleMessage = (msg: any) => {
            // console.log("RAW STOMP MESSAGE:", msg);
            switch (msg.type) {
                case "NEW_NOTIFICATION":
                    setUnreadCount(prev => prev + 1);
                    break;
            }
        };

        const subPrivate = subscribe('/user/topic/notification', handleMessage);
        const subBroadcast = subscribe('/topic/notification', handleMessage);

        return () => {
            subPrivate?.unsubscribe();
            subBroadcast?.unsubscribe();
        };
    }, [subscribe, isConnected]);

    const availableTypes: TypeFilter[] = ["ALL", "CONTEST", "COMBAT", "PROBLEM", "SUBMISSION"];


    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        onClick={() => setOpen(!open)}
                    >
                        <Bell className="h-5 w-5"/>
                        {unreadCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[400px] p-0 flex flex-col">
                    {/* TIÊU ĐỀ CỐ ĐỊNH VÀ BỘ LỌC */}
                    <div className="sticky top-0 bg-white z-10 p-3 border-b flex flex-col gap-2">
                        <span className="font-bold text-center block text-gray-800">Thông báo</span>

                        {/* Thanh Lọc Trạng Thái */}
                        <div className="flex justify-around text-xs p-1 rounded-lg bg-gray-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex-1 h-auto py-1 transition-colors ${
                                    statusFilter === "ALL"
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={() => setStatusFilter("ALL")}
                            >
                                Tất cả
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex-1 h-auto py-1 transition-colors ${
                                    statusFilter === "SEND"
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={() => setStatusFilter("SEND")}
                            >
                                Chưa đọc ({unreadCount})
                            </Button>
                        </div>

                        {/* Bộ lọc theo Type */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs h-8 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <ListFilter className="w-3 h-3 mr-1"/>
                                    Lọc theo Loại:
                                    <span className="font-semibold ml-1">
              {typeFilter === "ALL" ? "Tất cả" : getTypeLabel(typeFilter)}
            </span>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-48">
                                {availableTypes.map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`transition-colors ${
                                            typeFilter === type
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        {type === "ALL" ? "Tất cả các loại" : getTypeLabel(type)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* DANH SÁCH CUỘN */}
                    <div className="max-h-[280px] overflow-y-auto no-scrollbar">
                        <AnimatePresence>
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n, index) => (
                                    <motion.div
                                        key={n.id || index}
                                        layout
                                        initial={{opacity: 0, y: -5}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: 5}}
                                        transition={{duration: 0.2}}
                                    >
                                        <DropdownMenuItem
                                            className="flex items-center gap-3 cursor-pointer px-4 py-3 border-b transition-colors
                  focus:outline-none focus:ring-0 hover:bg-gray-500 text-gray-800"
                                            onClick={() => handleClickNotification(n)}
                                        >
                                            {getTypeIcon(n.type)}

                                            <div className="flex flex-col text-sm w-full min-w-0">
                                                <div className="font-semibold flex items-center gap-1 min-w-0">
                                                    <span className="truncate">{n.title}</span>
                                                    {/*                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">*/}
                                                    {/*  ({getTypeLabel(n.type)})*/}
                                                    {/*</span>*/}
                                                </div>
                                                <div className="text-gray-600 text-xs line-clamp-2">{n.message}</div>
                                                <div className="text-[11px] text-gray-400 mt-1">
                                                    {dayjs(n.createdAt).fromNow()}
                                                </div>
                                            </div>

                                            {n.status === "SEND" && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"/>
                                            )}
                                        </DropdownMenuItem>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="p-4 text-center text-sm text-gray-500"
                                >
                                    Không có thông báo nào phù hợp với bộ lọc.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}