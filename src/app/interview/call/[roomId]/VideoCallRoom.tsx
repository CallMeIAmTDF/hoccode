
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useVideoCall } from '@/hooks/useVideoCall';
import { roomApi } from '@/lib/test/roomApi';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Code2,
    StickyNote,
    EyeOff,
    Users,
    LogOut,
    CheckCircle2,
    Loader2,
    Wifi,
    Copy,
    Check,
    Share2,
    X,
    PhoneOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { notify } from "@/components/notify";

// Fix: Added any type to dynamic import to resolve IntrinsicAttributes error in TypeScript where inferred type lacked props
const MonacoEditorComponent = dynamic<any>(() => import("@/components/hoccodeeditor"), { ssr: false });

interface VideoCallRoomProps {
    roomId: string;
    onLeave?: () => void;
}

type TabType = 'code' | 'notes';
type LanguageType = 'java' | 'python' | 'cpp';

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomId, onLeave }) => {
    // --- State ---
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [isValidating, setIsValidating] = useState(true);
    const [isValidRoom, setIsValidRoom] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('code');
    const [code, setCode] = useState('// Write your code here...\n\n');
    const [notes, setNotes] = useState('');
    const [language, setLanguage] = useState<LanguageType>('java');
    const [leftPanelWidth, setLeftPanelWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);
    const [remoteUserFocused, setRemoteUserFocused] = useState(true);
    const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
    const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // --- Refs ---
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pipVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Lưu trữ giá trị cuối cùng được đồng bộ để tránh loop
    const lastSyncedCode = useRef(code);
    const lastSyncedNotes = useRef(notes);

    // --- Validate Room ---
    useEffect(() => {
        const validateRoom = async () => {
            try {
                const validation = await roomApi.validateRoom(roomId);
                if (validation.valid) {
                    setIsValidRoom(true);
                } else {
                    setValidationError('Phòng này không tồn tại hoặc đã hết hạn.');
                }
            } catch (error) {
                console.error('Room validation error:', error);
                setValidationError('Lỗi xác thực phòng. Vui lòng thử lại.');
            } finally {
                setIsValidating(false);
            }
        };
        validateRoom();
    }, [roomId]);

    // --- Hooks ---
    const {
        localStream,
        isAudioEnabled,
        isVideoEnabled,
        isConnected,
        participants,
        startCall,
        endCall,
        toggleAudio,
        toggleVideo,
        syncCode,
        syncNotes,
    } = useVideoCall({
        roomId,
        onRemoteStream: (stream, userId) => {
            setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.set(userId, stream);
                return newMap;
            });
        },
        onUserJoined: (userId) => console.log('👋 User joined:', userId),
        onUserLeft: (userId) => {
            setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        },
        onUserFocusChange: (userId, isFocused) => setRemoteUserFocused(isFocused),
        onUserMediaStateChange: (userId, audioEnabled, videoEnabled) => {
            setRemoteAudioEnabled(audioEnabled);
            setRemoteVideoEnabled(videoEnabled);
        },
        onCodeSync: (codeFromRemote, lang, fromUser) => {
            if (codeFromRemote !== lastSyncedCode.current) {
                lastSyncedCode.current = codeFromRemote;
                setCode(codeFromRemote);
                setLanguage(lang as LanguageType);
                triggerSyncPulse();
            }
        },
        onNotesSync: (notesFromRemote, fromUser) => {
            if (notesFromRemote !== lastSyncedNotes.current) {
                lastSyncedNotes.current = notesFromRemote;
                setNotes(notesFromRemote);
                triggerSyncPulse();
            }
        },
    });

    const triggerSyncPulse = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 800);
    };

    // --- Browser Tab Close Handling ---
    // Ngăn chặn video bị "đóng băng" ở phía đối phương khi mình đóng tab đột ngột
    useEffect(() => {
        const handleUnload = () => {
            endCall(); // Gọi hàm dọn dẹp và ngắt socket/webrtc
        };

        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [endCall]);

    // --- Video Stream Binding ---
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (pipVideoRef.current && localStream) {
            pipVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isVideoEnabled]);

    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            remoteStreams.forEach(stream => {
                stream.getTracks().forEach(track => track.stop());
            });
        };
    }, [localStream, remoteStreams]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStreams.size > 0) {
            const firstRemoteStream = Array.from(remoteStreams.values())[0];
            remoteVideoRef.current.srcObject = firstRemoteStream;
        }
    }, [remoteStreams, remoteVideoEnabled]);

    // --- Auto Start ---
    useEffect(() => {
        if (isValidRoom && !isConnected) startCall();
    }, [isValidRoom, isConnected, startCall]);

    // --- Resize Logic ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const newWidth = e.clientX;
            if (newWidth > 300 && newWidth < window.innerWidth - 400) {
                setLeftPanelWidth(newWidth);
            }
        };
        const handleMouseUp = () => setIsResizing(false);
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // --- Handlers ---
    const handleEndCall = async () => {
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        remoteStreams.forEach(stream => {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        if (pipVideoRef.current) {
            pipVideoRef.current.srcObject = null;
        }

        endCall();

        await new Promise(resolve => setTimeout(resolve, 100));

        onLeave?.();
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        notify("success", { title: "Đã sao chép link phòng", description: "Bạn có thể gửi link này cho ứng viên." });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);
        if (newCode !== lastSyncedCode.current) {
            lastSyncedCode.current = newCode;
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                syncCode(newCode, language);
            }, 300);
        }
    }, [language, syncCode]);

    const handleNotesChange = useCallback((newNotes: string) => {
        setNotes(newNotes);
        if (newNotes !== lastSyncedNotes.current) {
            lastSyncedNotes.current = newNotes;
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                syncNotes(newNotes);
            }, 300);
        }
    }, [syncNotes]);

    const handleLanguageChange = (newLang: LanguageType) => {
        setLanguage(newLang);
        syncCode(code, newLang);
    };

    if (isValidating) {
        return (
            <div className="h-screen flex flex-col bg-white">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Loader2 className="w-6 h-6 text-indigo-600 absolute animate-pulse" />
                    </div>
                    <p className="mt-4 text-slate-500 font-bold text-sm uppercase tracking-widest">Khởi tạo môi trường...</p>
                </div>
            </div>
        );
    }

    if (!isValidRoom) {
        return (
            <div className="h-screen flex flex-col bg-slate-50">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <Card className="max-w-md w-full p-10 rounded-[2rem] shadow-xl border-slate-200 bg-white">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Phòng không hợp lệ</h2>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{validationError}</p>
                        <Button onClick={onLeave} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100">
                            Quay lại trang chủ
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden text-slate-900 font-sans">
            {/* Main Header Only */}
            <Header />

            {/* Main Workspace */}
            <div ref={containerRef} className="flex-1 flex overflow-hidden relative bg-slate-50">

                {/* --- Left Panel: Video --- */}
                <div className="relative flex flex-col bg-slate-950 shadow-2xl z-20 overflow-hidden shrink-0" style={{ width: `${leftPanelWidth}px` }}>

                    {/* Floating Indicator: User Unfocused */}
                    {!remoteUserFocused && participants.length > 1 && remoteStreams.size > 0 && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg border border-amber-400/50 text-[10px] font-black  tracking-widest">
                                <EyeOff className="w-3.5 h-3.5 animate-pulse" />
                                Người dùng không tập trung
                            </div>
                        </div>
                    )}

                    {/* Main Video View */}
                    <div className="flex-1 relative flex items-center justify-center">
                        {remoteStreams.size > 0 ? (
                            <>
                                {remoteVideoEnabled ? (
                                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 border border-slate-800 shadow-inner">
                                            <VideoOff className="w-8 h-8" />
                                        </div>
                                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Máy ảnh đã tắt</p>
                                    </div>
                                )}
                                {!remoteAudioEnabled && (
                                    <div className="absolute bottom-6 left-6 bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-xl shadow-lg animate-in zoom-in">
                                        <MicOff className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center p-8">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-6 animate-pulse">
                                    <Users className="w-8 h-8 text-indigo-500/50" />
                                </div>
                                <h3 className="text-white text-base font-black mb-1">Đang chờ người tham gia...</h3>
                                <p className="text-slate-500 text-[11px] font-medium max-w-[200px] leading-relaxed">
                                    Mời tham gia bằng cách chia sẻ đường dẫn bên dưới.
                                </p>
                            </div>
                        )}

                        {/* Control Bar Overlay - Tích hợp Kết thúc cuộc gọi */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-slate-900/90 backdrop-blur-3xl rounded-[28px] border border-slate-800 shadow-2xl z-40 transition-all hover:scale-[1.02]">
                            <TooltipProvider>
                                <div className="flex items-center gap-1.5">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={toggleAudio}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                                    isAudioEnabled ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-red-500 text-white hover:bg-red-600"
                                                )}
                                            >
                                                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white text-[10px] font-bold">
                                            <span>{isAudioEnabled ? "Tắt mic" : "Mở mic"}</span>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={toggleVideo}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                                    isVideoEnabled ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-red-500 text-white hover:bg-red-600"
                                                )}
                                            >
                                                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white text-[10px] font-bold">
                                            <span>{isVideoEnabled ? "Dừng video" : "Mở video"}</span>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopyLink}
                                                className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white text-[10px] font-bold">
                                            <span>Chia sẻ</span>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                <div className="w-px h-8 bg-slate-800 mx-1 opacity-50"></div>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleEndCall}
                                            className="w-16 h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-all shadow-lg active:scale-95"
                                        >
                                            <PhoneOff className="w-5 h-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-red-600 border-none text-white text-[10px] font-bold">
                                        <span>Kết thúc</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* PIP: My Camera */}
                    <div className="absolute top-6 right-6 w-32 aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl z-30 transition-transform hover:scale-105">
                        {isVideoEnabled ? (
                            <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                    <VideoOff className="w-4 h-4 text-slate-700" />
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest">Bạn</div>
                    </div>
                </div>

                {/* --- Resize Handler --- */}
                <div
                    className="w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize transition-colors z-30 group"
                    onMouseDown={() => setIsResizing(true)}
                >
                    <div className="h-full w-full opacity-0 group-hover:opacity-100 bg-indigo-500" />
                </div>

                {/* --- Right Panel: Content Area --- */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-[400px]">

                    {/* Workspace Tabs - Gộp thêm Room ID Badge ở đây */}
                    <div className="h-12 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                        <div className="flex items-center gap-4 h-full">
                            <div className="flex items-center gap-1 h-full">
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className={cn(
                                        "h-full px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                                        activeTab === 'code' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    Code
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={cn(
                                        "h-full px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                                        activeTab === 'notes' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <StickyNote className="w-3.5 h-3.5" />
                                    Notes
                                </button>
                            </div>

                            {/*<Badge variant="outline" className="hidden sm:flex text-[8px] h-4.5 px-2 font-black font-mono tracking-widest border-slate-100 text-slate-400 bg-slate-50 uppercase">*/}
                            {/*    ID: {roomId}*/}
                            {/*</Badge>*/}
                        </div>

                        {activeTab === 'code' && (
                            <Select value={language} onValueChange={(val) => handleLanguageChange(val as LanguageType)}>
                                <SelectTrigger className="w-[110px] h-8 text-[10px] font-black bg-slate-50 border-slate-100 focus:ring-0 rounded-lg uppercase tracking-tighter">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Editor / Notes Panel */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'code' ? (
                            <MonacoEditorComponent
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(v: any) => handleCodeChange(v ?? "")}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    fontFamily: 'JetBrains Mono, Menlo, monospace',
                                    lineHeight: 1.6,
                                    padding: { top: 20 },
                                    renderLineHighlight: 'none',
                                    scrollbar: { vertical: 'hidden' }
                                }}
                            />
                        ) : (
                            <div className="h-full w-full p-10 bg-slate-50/20">
                                <textarea
                                    value={notes}
                                    onChange={(e) => handleNotesChange(e.target.value)}
                                    placeholder="Hãy bắt đầu ghi chú..."
                                    className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-700 text-sm leading-loose placeholder-slate-300 font-medium"
                                />
                            </div>
                        )}

                        {/* Sync Status Badge */}
                        <div className="absolute bottom-6 right-8 pointer-events-none">
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-500",
                                isSyncing
                                    ? "bg-indigo-50 border-indigo-100 text-indigo-600 translate-y-0 opacity-100"
                                    : "bg-white border-slate-100 text-slate-400 opacity-0 translate-y-2"
                            )}>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Đang đồng bộ...</span>
                            </div>
                        </div>
                    </div>

                    {/* Workspace Footer */}
                    <div className="h-8 border-t border-slate-100 px-6 flex items-center justify-between bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-emerald-500" /> Stable</span>
                            <span>{activeTab === 'code' ? `Code: ${code.length}` : `Notes: ${notes.length}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {participants.length > 1 ? (
                                <span className="text-indigo-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Synced
                                </span>
                            ) : (
                                <span className="animate-pulse">Solo Mode</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
