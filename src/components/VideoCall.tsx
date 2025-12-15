'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketProvider';
import { WebRTCService } from '@/lib/webrtc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Loader2 } from 'lucide-react';
import { StompSubscription } from '@stomp/stompjs';
import {apiGet, apiPost} from "@/lib/api";
import {notify} from "@/components/notify";
interface VideoRoomResponse {
    roomId: string;
    creatorEmail: string;
    createdAt: string;
}

interface RoomValidationResponse{
    valid: boolean;
    roomId: string;
    userEmail: string;
}
export default function VideoCall() {
    const { subscribe, send, client } = useSocket();

    const [roomId, setRoomId] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');
    const [isInCall, setIsInCall] = useState(false);
    const [isInitiator, setIsInitiator] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [remoteConnected, setRemoteConnected] = useState(false);
    const [hasReceivedUserJoined, setHasReceivedUserJoined] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const rtcServiceRef = useRef<WebRTCService | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const offerSentRef = useRef(false);
    const isInitiatorRef = useRef(false); // Add ref to track initiator

    // Create room
    const createRoom = async () => {
        try {
            setIsConnecting(true);
            const response = await apiPost<VideoRoomResponse>("/interview", {})
            setRoomId(response.roomId);
            await joinCall(response.roomId, true);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Join existing room
    const joinExistingRoom = async () => {
        if (!inputRoomId.trim()) return;

        try {
            setIsConnecting(true);
            const response = await apiGet<RoomValidationResponse>(`/interview/${inputRoomId}`)
            if(response.valid){
                await joinCall(inputRoomId, false);
            }else{
                notify("error", {
                    title: "Lỗi",
                    description: "Phòng không tồn tại"
                })
            }
            await joinCall(inputRoomId, false);
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please check the room ID.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Join call logic
    const joinCall = async (targetRoomId: string, initiator: boolean) => {
        try {
            console.log('=== Joining call ===', { targetRoomId, initiator });

            // Set refs FIRST before anything else
            isInitiatorRef.current = initiator;
            offerSentRef.current = false;
            setHasReceivedUserJoined(false);

            // Then set state
            setIsInitiator(initiator);

            console.log('🔧 Setup - isInitiatorRef:', isInitiatorRef.current);

            // Initialize WebRTC service
            rtcServiceRef.current = new WebRTCService();

            // Get local stream
            const stream = await rtcServiceRef.current.initializeLocalStream();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Subscribe to room signals BEFORE joining
            console.log('📡 Subscribing to topic:', `/topic/video/${targetRoomId}`);
            subscriptionRef.current = subscribe(`/topic/video/${targetRoomId}`, (message) => {
                console.log('🔔 Subscription callback fired:', message.type, 'from:', message.from);
                handleSignalMessage(message);
            });

            // Small delay to ensure subscription is active
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create peer connection
            rtcServiceRef.current.createPeerConnection({
                onIceCandidate: (candidate) => {
                    console.log('📤 Sending ICE candidate');
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
                    console.log('🔗 Connection state changed:', state);
                    if (state === 'connected') {
                        setRemoteConnected(true);
                    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                        setRemoteConnected(false);
                    }
                },
            });

            // Send join message
            console.log('📤 Sending join message');
            send('/app/video/join', { roomId: targetRoomId });

            setIsInCall(true);
            setRoomId(targetRoomId);
        } catch (error) {
            console.error('Error joining call:', error);
            alert('Failed to join call: ' + (error as Error).message);
            await cleanup();
        }
    };

    // Handle WebSocket signals
    const handleSignalMessage = async (message: any) => {
        const myEmail = localStorage.getItem('email')?.toLowerCase().trim();
        const fromEmail = message.from?.toLowerCase().trim();

        console.log('📨 Received signal:', message.type, 'from:', message.from);
        console.log('   My email:', myEmail, '| Match:', fromEmail === myEmail);

        // Ignore messages from myself
        if (fromEmail === myEmail) {
            console.log('⏭️ Ignoring message from myself');
            return;
        }

        try {
            switch (message.type) {
                case 'user-joined':
                    console.log('👤 User joined:', message.from);
                    console.log('   DEBUG - isInitiatorRef.current:', isInitiatorRef.current);
                    console.log('   DEBUG - offerSentRef.current:', offerSentRef.current);
                    console.log('   DEBUG - rtcServiceRef.current:', !!rtcServiceRef.current);
                    setHasReceivedUserJoined(true);

                    // Only initiator sends offer, and only once
                    if (isInitiatorRef.current && !offerSentRef.current && rtcServiceRef.current) {
                        offerSentRef.current = true;
                        console.log('✅ All conditions met - sending offer');

                        await new Promise(resolve => setTimeout(resolve, 500));

                        try {
                            const offer = await rtcServiceRef.current.createOffer();
                            console.log('📤 Offer created, sending to backend');
                            send('/app/video/offer', {
                                roomId: message.roomId,
                                data: offer,
                            });
                        } catch (error) {
                            console.error('❌ Error creating/sending offer:', error);
                        }
                    } else {
                        console.log('❌ NOT sending offer - conditions:', {
                            isInitiator: isInitiatorRef.current,
                            offerNotSent: !offerSentRef.current,
                            hasRTC: !!rtcServiceRef.current
                        });
                    }
                    break;

                case 'offer':
                    console.log('📨 Received offer');
                    if (rtcServiceRef.current) {
                        await rtcServiceRef.current.setRemoteDescription(message.data);
                        const answer = await rtcServiceRef.current.createAnswer();
                        console.log('📤 Sending answer');
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
                    console.log('📨 Received ICE candidate');
                    if (message.data && rtcServiceRef.current) {
                        await rtcServiceRef.current.addIceCandidate(message.data);
                    }
                    break;

                case 'user-left':
                    console.log('👋 User left:', message.from);
                    setRemoteConnected(false);
                    setHasReceivedUserJoined(false);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Error handling signal:', error);
        }
    };

    // Leave call
    const leaveCall = async () => {
        if (roomId) {
            console.log('📤 Sending leave message');
            send('/app/video/leave', { roomId });
        }
        await cleanup();
    };

    // Cleanup
    const cleanup = async () => {
        console.log('🧹 Cleaning up...');

        offerSentRef.current = false;
        isInitiatorRef.current = false;
        setHasReceivedUserJoined(false);

        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }

        if (rtcServiceRef.current) {
            rtcServiceRef.current.cleanup();
            rtcServiceRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsInCall(false);
        setRoomId('');
        setRemoteConnected(false);
    };

    // Toggle controls
    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        rtcServiceRef.current?.toggleAudio(!newState);
    };

    const toggleVideo = () => {
        const newState = !isVideoOff;
        setIsVideoOff(newState);
        rtcServiceRef.current?.toggleVideo(!newState);
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    // Pre-call screen
    if (!isInCall) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">Video Call</h1>
                        <p className="text-gray-600">Start or join a video call</p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={createRoom}
                            disabled={isConnecting || !client?.connected}
                            className="w-full h-12 text-lg"
                            size="lg"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-5 w-5" />
                                    Create New Room
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or join existing</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Input
                                placeholder="Enter Room ID"
                                value={inputRoomId}
                                onChange={(e) => setInputRoomId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && joinExistingRoom()}
                                className="h-12"
                                disabled={isConnecting}
                            />
                            <Button
                                onClick={joinExistingRoom}
                                disabled={!inputRoomId || isConnecting || !client?.connected}
                                className="w-full h-12"
                                variant="outline"
                            >
                                {isConnecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Room'
                                )}
                            </Button>
                        </div>

                        {!client?.connected && (
                            <div className="text-center text-sm text-amber-600 flex items-center justify-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Connecting to server...</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    // In-call screen
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Room ID Banner */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-400">Room ID:</span>
                        <code className="px-3 py-1 bg-gray-700 text-white rounded font-mono text-sm">
                            {roomId}
                        </code>
                        <Button
                            onClick={copyRoomId}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${remoteConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-sm text-gray-400">
              {remoteConnected ? 'Connected' : hasReceivedUserJoined ? 'Connecting...' : 'Waiting for participant...'}
            </span>
                        {isInitiator && (
                            <span className="text-xs text-blue-400 ml-2">(Host)</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative p-4">
                {/* Remote Video (Main) */}
                <div className="absolute inset-4 bg-gray-800 rounded-lg overflow-hidden">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!remoteConnected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="text-center text-gray-500 space-y-4">
                                <Video className="h-16 w-16 mx-auto opacity-50" />
                                <div>
                                    <p className="text-lg font-medium">Waiting for other participant...</p>
                                    <p className="text-sm mt-2">Share the Room ID above</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video (Picture in Picture) */}
                <div className="absolute bottom-8 right-8 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-xs text-white">
                        You
                    </div>
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <VideoOff className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-gray-800 border-t border-gray-700 p-6">
                <div className="max-w-md mx-auto flex items-center justify-center space-x-4">
                    <Button
                        onClick={toggleMute}
                        size="lg"
                        variant={isMuted ? "destructive" : "secondary"}
                        className="h-14 w-14 rounded-full"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>

                    <Button
                        onClick={toggleVideo}
                        size="lg"
                        variant={isVideoOff ? "destructive" : "secondary"}
                        className="h-14 w-14 rounded-full"
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </Button>

                    <Button
                        onClick={leaveCall}
                        size="lg"
                        variant="destructive"
                        className="h-14 w-14 rounded-full"
                        title="Leave call"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}