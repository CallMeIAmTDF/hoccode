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
    MonitorPlay, Code2, Zap, ShieldCheck, Keyboard, Sparkles
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
            router.push(`/test/call/${room.roomId}`);
        } catch (err) {
            setError('Failed to create room. Please try again.');
            console.error('Create room error:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!roomIdInput.trim()) {
            setError('Please enter a room ID');
            return;
        }

        try {
            setIsJoining(true);
            setError('');

            // Validate room trước khi join
            const validation = await roomApi.validateRoom(roomIdInput);

            if (!validation.valid) {
                setError('Room not found. Please check the room ID.');
                return;
            }

            // Redirect đến room
            router.push(`/test/call/${roomIdInput}`);
        } catch (err) {
            setError('Failed to join room. Please try again.');
            console.error('Join room error:', err);
        } finally {
            setIsJoining(false);
        }
    };
    const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Header/>

            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <div
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">

                    {/* Header Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => {
                                setActiveTab('join');
                                setError('');
                            }}
                            className={cn(
                                "flex-1 py-4 text-sm font-semibold transition-all relative",
                                activeTab === 'join'
                                    ? "text-indigo-600 bg-white"
                                    : "text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-50/80"
                            )}
                        >
                            Tham gia phòng
                            {activeTab === 'join' &&
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"/>}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('create');
                                setError('');
                            }}
                            className={cn(
                                "flex-1 py-4 text-sm font-semibold transition-all relative",
                                activeTab === 'create'
                                    ? "text-indigo-600 bg-white"
                                    : "text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-50/80"
                            )}
                        >
                            Tạo phòng mới
                            {activeTab === 'create' &&
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"/>}
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div
                                className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="p-1 bg-red-100 rounded-full mt-0.5 shrink-0">
                                    <ShieldCheck className="w-3 h-3 text-red-600"/>
                                </div>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {activeTab === 'join' ? (
                            <div className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <div
                                        className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Video className="w-6 h-6 text-indigo-600"/>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Tham gia phỏng vấn</h2>
                                    <p className="text-gray-500 text-sm">Nhập mã phòng bạn nhận được để bắt đầu</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Room
                                            ID</label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={roomIdInput}
                                                onChange={(e) => setRoomIdInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                                placeholder="e.g. 123-abc-789"
                                                className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all font-mono text-base shadow-sm"
                                            />
                                            <Keyboard className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"/>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleJoinRoom}
                                        disabled={isJoining || !roomIdInput.trim()}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-100 transition-all"
                                    >
                                        {isJoining ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                                                Đang kết nối...
                                            </>
                                        ) : (
                                            <>
                                                Tham gia ngay
                                                <ArrowRight className="w-5 h-5 ml-2"/>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center space-y-4">
                                    <div
                                        className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                                        <Sparkles className="w-6 h-6 text-purple-600"/>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold text-gray-900">Tạo không gian mới</h2>
                                        <p className="text-gray-500 text-sm">
                                            Khởi tạo phòng phỏng vấn Coding & Video Real-time.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"/>
                                        <span>Trình soạn thảo code đa ngôn ngữ (Java, Python, C++)</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"/>
                                        <span>Video call & Chat độ trễ thấp</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"/>
                                        <span>Ghi chú dùng chung theo thời gian thực</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={isCreating}
                                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-semibold text-base shadow-lg transition-all"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                                            Đang khởi tạo...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 mr-2"/>
                                            Tạo phòng ngay
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Icons
const VideoIcon: React.FC<{ className?: string }> = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
    </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
    </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default CallHomePage;