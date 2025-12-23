"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi } from '@/lib/test/roomApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Video,
    Plus,
    ArrowRight,
    Loader2,
    Info,
    Users,
    MonitorPlay, Code2, Zap, ShieldCheck, Keyboard, Sparkles, StickyNote
} from 'lucide-react';
import {cn} from "@/lib/utils";
import {Header} from "@/components/header";

const CallHomePage: React.FC = () => {
    const router = useRouter();
    const [roomIdInput, setRoomIdInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleCreateRoom = async () => {
        try {
            setIsCreating(true);
            setError('');

            const room = await roomApi.createRoom();

            // Redirect đến room vừa tạo
            router.push(`/interview/call/${room.roomId}`);
        } catch (err) {
            setError('Không thể tạo phòng. Vui lòng thử lại.');
            console.error('Create room error:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!roomIdInput.trim()) {
            setError('Vui lòng nhập mã phòng');
            return;
        }

        try {
            setIsJoining(true);
            setError('');
            const validation = await roomApi.validateRoom(roomIdInput);
            if (!validation.valid) {
                setError('Phòng không tồn tại hoặc đã hết hạn.');
                return;
            }
            // Redirect đến room
            router.push(`/interview/call/${roomIdInput}`);
        } catch (err) {
            setError('Không thể tham gia phòng. Vui lòng thử lại.');
            console.error('Join room error:', err);
        } finally {
            setIsJoining(false);
        }
    };
    const hasInput = roomIdInput.trim().length > 0;
    const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
    return (
        <div className="h-screen flex flex-col bg-[#FDFDFD] overflow-hidden">
            <Header/>

            <div className="flex-1 flex items-center justify-center p-4 relative">
                {/* Trang trí nền */}
                <div className="absolute inset-0 z-0 opacity-[0.3]" style={{
                    backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>

                <div
                    className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-8 md:p-10 space-y-6">
                        {/* Tiêu đề */}
                        <div className="space-y-2 text-center">
                            {/*<div className="inline-flex p-2.5 bg-indigo-50 rounded-2xl text-indigo-600 mb-1">*/}
                            {/*    /!*<Video className="w-6 h-6"/>*!/*/}
                            {/*</div>*/}
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Phỏng Vấn
                            </h1>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mx-auto">
                                Môi trường cộng tác thời gian thực
                            </p>
                        </div>

                        {/* Thông báo lỗi */}
                        {error && (
                            <div
                                className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0"/>
                                <p className="text-[10px] text-red-600 font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        {/* Khu vực hành động */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                    Tham gia phòng hiện có
                                </label>
                                <div className="relative group mt-2">
                                    <Input
                                        type="text"
                                        value={roomIdInput}
                                        onChange={(e) => {
                                            setRoomIdInput(e.target.value);
                                            setError('');
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                        placeholder="Nhập mã phòng (Room ID)..."
                                        className="h-12 pl-11 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-mono text-sm rounded-xl"
                                    />
                                    <Keyboard
                                        className="w-4 h-4 text-slate-300 absolute left-4 top-4 group-focus-within:text-indigo-500 transition-colors"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={isJoining || !hasInput}
                                    className={cn(
                                        "h-12 rounded-xl font-black text-xs transition-all shadow-lg",
                                        hasInput
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                                            : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed border-none"
                                    )}
                                >
                                    {isJoining ? (
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                    ) : (
                                        <>
                                            Tham gia ngay
                                            <ArrowRight className="w-3.5 h-3.5 ml-1.5"/>
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={isCreating}
                                    variant="outline"
                                    className="h-12 rounded-xl border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 transition-all hover:border-indigo-200 hover:text-indigo-600"
                                >
                                    {isCreating ? (
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5 mr-1.5"/>
                                            Tạo phòng mới
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Lưới tính năng (Dàn ngang) */}
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                            <FeatureBox
                                icon={<Code2 className="w-4 h-4"/>}
                                label="Trình Soạn Thảo Chung"
                            />
                            <FeatureBox
                                icon={<Video className="w-4 h-4"/>}
                                label="Gọi Video"
                            />
                            <FeatureBox
                                icon={<StickyNote className="w-4 h-4"/>}
                                label="Ghi Chú Chung"
                            />
                        </div>
                    </div>

                    {/* Footer nhỏ gọn */}
                    {/*<div*/}
                    {/*    className="bg-slate-50 px-8 py-3.5 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">*/}
                    {/*    <span className="flex items-center gap-1.5"><ShieldCheck*/}
                    {/*        className="w-3 h-3"/> Mã hóa bảo mật</span>*/}
                    {/*    <div className="flex items-center gap-4">*/}
                    {/*        <span className="flex items-center gap-1.5 text-indigo-500"><Sparkles className="w-3 h-3"/> Hỗ trợ bởi AI</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};
const FeatureBox = ({icon, label}: { icon: React.ReactNode, label: string }) => (
    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
        <div
            className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:shadow-sm transition-all shrink-0">
            {icon}
        </div>
        <span
            className="text-[9px] font-black text-slate-500 uppercase tracking-tight text-center whitespace-nowrap">{label}</span>
    </div>
);

const ShieldAlert = ({className}: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="M12 8v4"/>
        <path d="M12 16h.01"/>
    </svg>
);
export default CallHomePage;