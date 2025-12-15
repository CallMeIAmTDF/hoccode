'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketProvider';
import { WebRTCService } from '@/lib/webrtc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Video, VideoOff, Mic, MicOff, PhoneOff,
    Users, Terminal, Code, NotebookPen, MessageSquare,
    Send, Maximize, X, Camera
} from 'lucide-react';
import { StompSubscription } from '@stomp/stompjs';

interface InterviewVideoCallProps {
    roomId: string;
    isHost: boolean;
}

export default function InterviewVideoCall({ roomId: propRoomId, isHost: propIsHost }: InterviewVideoCallProps) {
    const { subscribe, send, client } = useSocket();

    // Room state
    const [roomId, setRoomId] = useState('');
    const [isInCall, setIsInCall] = useState(false);
    const [isInitiator, setIsInitiator] = useState(false);

    // Video controls
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [remoteConnected, setRemoteConnected] = useState(false);

    // Interview tabs
    const [activeTab, setActiveTab] = useState('code');
    const [language, setLanguage] = useState('java');
    const [code, setCode] = useState('// Write your code here');
    const [note, setNote] = useState('');

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const rtcServiceRef = useRef<WebRTCService | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const offerSentRef = useRef(false);
    const isInitiatorRef = useRef(false);
    const localStreamRef = useRef<MediaStream | null>(null);

    // Join call (called from parent or on mount)
    const joinCall = async (targetRoomId: string, initiator: boolean) => {
        try {
            console.log('=== Joining call ===', { targetRoomId, initiator });

            isInitiatorRef.current = initiator;
            offerSentRef.current = false;
            setIsInitiator(initiator);
            setRoomId(targetRoomId);

            // Initialize WebRTC
            rtcServiceRef.current = new WebRTCService();

            // Get local stream
            const stream = await rtcServiceRef.current.initializeLocalStream();
            console.log('📹 Local stream obtained');
            localStreamRef.current = stream;

            // Subscribe to room signals
            console.log('📡 Subscribing to topic');
            subscriptionRef.current = subscribe(`/topic/video/${targetRoomId}`, (message) => {
                handleSignalMessage(message);
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            // Create peer connection
            rtcServiceRef.current.createPeerConnection({
                onIceCandidate: (candidate) => {
                    send('/app/video/ice-candidate', {
                        roomId: targetRoomId,
                        data: candidate,
                    });
                },
                onTrack: (stream) => {
                    console.log('📺 Received remote track');
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;
                        setRemoteConnected(true);
                    }
                },
                onConnectionStateChange: (state) => {
                    console.log('🔗 Connection state:', state);
                    if (state === 'connected') {
                        setRemoteConnected(true);
                    } else if (state === 'disconnected' || state === 'failed') {
                        setRemoteConnected(false);
                    }
                },
            });

            // Send join message
            console.log('📤 Sending join message');
            send('/app/video/join', { roomId: targetRoomId });

            setIsInCall(true);
        } catch (error) {
            console.error('Error joining call:', error);
            alert('Failed to join call: ' + (error as Error).message);
        }
    };

    // Handle WebSocket signals
    const handleSignalMessage = async (message: any) => {
        const myEmail = localStorage.getItem('email')?.toLowerCase().trim();
        const fromEmail = message.from?.toLowerCase().trim();

        if (fromEmail === myEmail) {
            console.log('⏭️ Ignoring message from myself');
            return;
        }

        console.log('📨 Received signal:', message.type, 'from:', message.from);

        try {
            switch (message.type) {
                case 'user-joined':
                    console.log('👤 User joined');
                    if (isInitiatorRef.current && !offerSentRef.current && rtcServiceRef.current) {
                        offerSentRef.current = true;
                        console.log('📤 Sending offer');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const offer = await rtcServiceRef.current.createOffer();
                        send('/app/video/offer', {
                            roomId: message.roomId,
                            data: offer,
                        });
                    }
                    break;

                case 'offer':
                    console.log('📨 Received offer');
                    if (rtcServiceRef.current) {
                        await rtcServiceRef.current.setRemoteDescription(message.data);
                        const answer = await rtcServiceRef.current.createAnswer();
                        send('/app/video/answer', {
                            roomId: message.roomId,
                            data: answer,
                        });
                    }
                    break;

                case 'answer':
                    console.log('📨 Received answer');
                    if (rtcServiceRef.current) {
                        await rtcServiceRef.current.setRemoteDescription(message.data);
                    }
                    break;

                case 'ice-candidate':
                    if (message.data && rtcServiceRef.current) {
                        await rtcServiceRef.current.addIceCandidate(message.data);
                    }
                    break;

                case 'user-left':
                    console.log('👋 User left');
                    setRemoteConnected(false);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Error handling signal:', error);
        }
    };

    // Attach local stream when component mounts and stream is ready
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            console.log('📹 Attaching local stream to video element');
            localVideoRef.current.srcObject = localStreamRef.current;
            localVideoRef.current.play().catch(() => {});
        }
    }, [localStreamRef.current, isInCall]);

    // Leave call
    const leaveCall = async () => {
        if (roomId) {
            send('/app/video/leave', { roomId });
        }
        cleanup();
    };

    // Cleanup
    const cleanup = () => {
        console.log('🧹 Cleaning up');

        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }

        if (rtcServiceRef.current) {
            rtcServiceRef.current.cleanup();
            rtcServiceRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        setIsInCall(false);
        setRemoteConnected(false);
        offerSentRef.current = false;
        isInitiatorRef.current = false;
    };

    // Toggle controls
    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !newState;
            });
        }
    };

    const toggleVideo = () => {
        const newState = !isVideoOff;
        setIsVideoOff(newState);
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !newState;
            });
        }
    };

    useEffect(() => {
        return () => cleanup();
    }, []);

    // Mock: Auto join call on mount (replace with real logic)
    useEffect(() => {
        // Example: Get roomId from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdParam = urlParams.get('roomId');
        const isHost = urlParams.get('host') === 'true';

        if (roomIdParam && client?.connected) {
            joinCall(roomIdParam, isHost);
        }
    }, [client?.connected]);

    if (!isInCall) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8">
                    <p className="text-center text-muted-foreground">Connecting to interview room...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-3">
                <h1 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Users className="w-5 h-5 text-primary" />
                    Phòng Phỏng Vấn: <span className="text-primary">{roomId}</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

                    {/* LEFT COLUMN: VIDEO CALL & PROBLEM */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* VIDEO CALL SECTION */}
                        <Card className="flex-1 shadow-xl bg-gray-900 overflow-hidden relative">
                            <CardContent className="h-full p-0 relative">

                                {/* Remote Video (Main) */}
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />

                                {!remoteConnected && (
                                    <div className="absolute inset-0 flex justify-center items-center text-white text-2xl bg-gray-800">
                                        <div className="text-center">
                                            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                            <p>Waiting for participant...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Local Video (Picture in Picture) */}
                                <div className="absolute top-4 right-4 w-40 h-28 bg-gray-700 rounded-lg border-2 border-white/50 overflow-hidden">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/60 rounded text-xs text-white">
                                        You
                                    </div>
                                    {isVideoOff && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                            <VideoOff className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Control Bar */}
                                <div className="absolute bottom-0 left-0 w-full p-3 bg-gray-800/80 backdrop-blur-sm flex justify-center items-center gap-4">
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={leaveCall}
                                    >
                                        <PhoneOff className="w-5 h-5" />
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant={isMuted ? "destructive" : "secondary"}
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant={isVideoOff ? "destructive" : "secondary"}
                                        onClick={toggleVideo}
                                    >
                                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                    </Button>

                                    <Button size="sm" variant="outline" className="ml-4">
                                        <Maximize className="w-4 h-4 mr-1" /> Full Screen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* PROBLEM STATEMENT */}
                        <Card className="shadow-lg h-[250px] flex-shrink-0 overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-indigo-600" /> Thử Thách Kỹ Thuật
                                </CardTitle>
                                <Button size="sm" variant="ghost">Xem chi tiết</Button>
                            </CardHeader>
                            <CardContent className="text-sm prose dark:prose-invert max-w-none px-6 pb-4">
                                <p><strong>Problem Title:</strong> Reverse Words in a String</p>
                                <p className="line-clamp-3">
                                    Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in s are separated by at least one space. Return a string of the words in reverse order concatenated by a single space.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: TABS (CODE, NOTES, CHAT) */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">

                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="code" className="flex items-center gap-1">
                                <Code className="w-4 h-4" /> Editor
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <NotebookPen className="w-4 h-4" /> Ghi Chú
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" /> Chat
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB: CODE EDITOR */}
                        <TabsContent value="code" className="flex-1 overflow-hidden p-0">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="flex-row items-center justify-between py-2">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="h-9 rounded-md border bg-background px-2 text-sm"
                                    >
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="python">Python</option>
                                    </select>
                                </CardHeader>
                                <CardContent className="flex-1 p-4 bg-gray-50 dark:bg-gray-950">
                                    <Textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="h-full font-mono text-sm resize-none"
                                        placeholder="Write your code here..."
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: NOTES */}
                        <TabsContent value="notes" className="flex-1 overflow-hidden p-0">
                            <Card className="h-full flex flex-col p-4">
                                <Label htmlFor="interview-notes" className="mb-2 font-semibold">
                                    Ghi chú của bạn (Chỉ bạn thấy)
                                </Label>
                                <Textarea
                                    id="interview-notes"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="flex-1 min-h-[300px] resize-none"
                                    placeholder="Ghi lại các đánh giá về thuật toán, kỹ năng giao tiếp, v.v..."
                                />
                            </Card>
                        </TabsContent>

                        {/* TAB: CHAT */}
                        <TabsContent value="chat" className="flex-1 overflow-hidden p-0">
                            <Card className="h-full flex flex-col">
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                                    <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <span className="font-medium text-primary">Interviewer:</span> Bạn có thể bắt đầu code không?
                                    </div>
                                    <div className="text-sm p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg ml-auto max-w-[80%]">
                                        <span className="font-medium">Candidate:</span> Tôi đã hiểu đề bài, tôi sẽ dùng cách tiếp cận hai con trỏ.
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t flex gap-2">
                                    <Input placeholder="Nhập tin nhắn..." className="flex-1" />
                                    <Button size="icon"><Send className="w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    );
}