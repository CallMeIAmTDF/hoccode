import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketProvider';

interface UseVideoCallOptions {
    roomId: string;
    onRemoteStream?: (stream: MediaStream, userId: string) => void;
    onUserJoined?: (userId: string) => void;
    onUserLeft?: (userId: string) => void;
    onUserFocusChange?: (userId: string, isFocused: boolean) => void;
    onUserMediaStateChange?: (userId: string, audioEnabled: boolean, videoEnabled: boolean) => void;
    onCodeSync?: (code: string, language: string, fromUser: string) => void;
    onNotesSync?: (notes: string, fromUser: string) => void;
}

// STUN servers
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useVideoCall = ({
                                 roomId,
                                 onRemoteStream,
                                 onUserJoined,
                                 onUserLeft,
                                 onUserFocusChange,
                                 onUserMediaStateChange,
                                 onCodeSync,
                                 onNotesSync
                             }: UseVideoCallOptions) => {
    const { subscribe, send } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<string[]>([]);

    // Map lưu peer connections và state
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    /**
     * Track page visibility
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isFocused = !document.hidden;

            if (isConnected) {
                send('/app/call/focus-change', {
                    type: 'CALL_FOCUS_CHANGE',
                    data: {
                        roomId,
                        isFocused,
                    },
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isConnected, roomId, send]);

    /**
     * Send media state changes
     */
    const sendMediaState = useCallback((audioEnabled: boolean, videoEnabled: boolean) => {
        if (isConnected) {
            send('/app/call/media-state', {
                type: 'CALL_MEDIA_STATE',
                data: {
                    roomId,
                    audioEnabled,
                    videoEnabled,
                },
            });
        }
    }, [isConnected, roomId, send]);

    /**
     * Tạo peer connection
     */
    const createPeerConnection = useCallback((userId: string) => {
        // Nếu đã tồn tại, close và tạo mới
        const existingPc = peerConnectionsRef.current.get(userId);
        if (existingPc) {
            existingPc.close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                send('/app/call/ice-candidate', {
                    type: 'CALL_ICE_CANDIDATE',
                    data: {
                        roomId,
                        targetUser: userId,
                        candidate: event.candidate,
                    },
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('📹 Received remote stream from', userId);
            if (onRemoteStream && event.streams[0]) {
                onRemoteStream(event.streams[0], userId);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${userId}:`, pc.connectionState);
            if (pc.connectionState === 'failed') {
                console.error('Connection failed, will retry...');
            }
        };

        peerConnectionsRef.current.set(userId, pc);
        return pc;
    }, [roomId, send, onRemoteStream]);

    /**
     * Bắt đầu video call
     */
    const startCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            send('/app/call/join', {
                type: 'CALL_JOIN',
                data: { roomId },
            });

            setIsConnected(true);

            // Send initial media state
            sendMediaState(true, true);
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            throw error;
        }
    }, [roomId, send, sendMediaState]);

    /**
     * Tạo offer - ONLY when WE initiate
     */
    const createOffer = useCallback(async (userId: string) => {
        const pc = createPeerConnection(userId);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            send('/app/call/offer', {
                type: 'CALL_OFFER',
                data: {
                    roomId,
                    targetUser: userId,
                    offer: offer,
                },
            });

            console.log('📤 Sent offer to', userId);
        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }, [createPeerConnection, roomId, send]);

    /**
     * Xử lý nhận offer - CREATE answer
     */
    const handleOffer = useCallback(async (fromUser: string, offer: RTCSessionDescriptionInit) => {
        console.log('📥 Received offer from', fromUser);
        const pc = createPeerConnection(fromUser);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            send('/app/call/answer', {
                type: 'CALL_ANSWER',
                data: {
                    roomId,
                    targetUser: fromUser,
                    answer: answer,
                },
            });

            console.log('📤 Sent answer to', fromUser);

            // Process pending ICE candidates
            const pendingCandidates = pendingCandidatesRef.current.get(fromUser) || [];
            for (const candidate of pendingCandidates) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidatesRef.current.delete(fromUser);

        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }, [createPeerConnection, roomId, send]);

    /**
     * Xử lý answer - ONLY set remote description
     */
    const handleAnswer = useCallback(async (fromUser: string, answer: RTCSessionDescriptionInit) => {
        console.log('📥 Received answer from', fromUser);
        const pc = peerConnectionsRef.current.get(fromUser);

        if (pc && pc.signalingState === 'have-local-offer') {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('✅ Set remote description for', fromUser);

                // Process pending ICE candidates
                const pendingCandidates = pendingCandidatesRef.current.get(fromUser) || [];
                for (const candidate of pendingCandidates) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidatesRef.current.delete(fromUser);
            } catch (error) {
                console.error('❌ Error handling answer:', error);
            }
        } else {
            console.warn('⚠️ Received answer but PC not in correct state:', pc?.signalingState);
        }
    }, []);

    /**
     * Xử lý ICE candidate
     */
    const handleIceCandidate = useCallback(async (fromUser: string, candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionsRef.current.get(fromUser);

        if (pc && pc.remoteDescription) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('❌ Error adding ICE candidate:', error);
            }
        } else {
            // Queue candidate until remote description is set
            const pending = pendingCandidatesRef.current.get(fromUser) || [];
            pending.push(candidate);
            pendingCandidatesRef.current.set(fromUser, pending);
        }
    }, []);

    /**
     * Toggle audio
     */
    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
                sendMediaState(audioTrack.enabled, isVideoEnabled);
            }
        }
    }, [isVideoEnabled, sendMediaState]);

    /**
     * Toggle video
     */
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                sendMediaState(isAudioEnabled, videoTrack.enabled);
            }
        }
    }, [isAudioEnabled, sendMediaState]);

    /**
     * Send code sync
     */
    const syncCode = useCallback((code: string, language: string) => {
        if (isConnected) {
            send('/app/call/sync-code', {
                type: 'CALL_SYNC_CODE',
                data: {
                    roomId,
                    code,
                    language,
                },
            });
        }
    }, [isConnected, roomId, send]);

    /**
     * Send notes sync
     */
    const syncNotes = useCallback((notes: string) => {
        if (isConnected) {
            send('/app/call/sync-notes', {
                type: 'CALL_SYNC_NOTES',
                data: {
                    roomId,
                    notes,
                },
            });
        }
    }, [isConnected, roomId, send]);

    /**
     * Kết thúc call
     */
    const endCall = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
                console.log('🛑 Stopped track:', track.kind);
            });
            localStreamRef.current = null;
            setLocalStream(null);
        }

        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        pendingCandidatesRef.current.clear();

        send('/app/call/leave', {
            type: 'CALL_LEAVE',
            data: { roomId },
        });

        setIsConnected(false);
        setParticipants([]);
    }, [roomId, send]);

    /**
     * Subscribe to WebSocket messages
     */
    useEffect(() => {
        if (!isConnected) return;

        const roomSub = subscribe(`/topic/call/${roomId}`, (message: any) => {
            console.log('📨 Room message:', message);

            switch (message.type) {
                case 'CALL_JOIN':
                    const joinedUser = message.data.userEmail;
                    const currentEmail = localStorage.getItem('email');

                    setParticipants(message.data.participants);

                    if (joinedUser !== currentEmail) {
                        onUserJoined?.(joinedUser);
                        // Only create offer if WE are already in the room (joined first)
                        setTimeout(() => createOffer(joinedUser), 1000);
                    }
                    break;

                case 'CALL_LEAVE':
                    const leftUser = message.data.userEmail;
                    setParticipants(message.data.participants);

                    const pc = peerConnectionsRef.current.get(leftUser);
                    if (pc) {
                        pc.close();
                        peerConnectionsRef.current.delete(leftUser);
                    }
                    pendingCandidatesRef.current.delete(leftUser);

                    onUserLeft?.(leftUser);
                    break;
            }
        });

        const queueSub = subscribe('/user/queue/call', (message: any) => {
            console.log('📨 Personal message:', message);

            switch (message.type) {
                case 'CALL_OFFER':
                    handleOffer(message.data.fromUser, message.data.offer);
                    break;

                case 'CALL_ANSWER':
                    handleAnswer(message.data.fromUser, message.data.answer);
                    break;

                case 'CALL_ICE_CANDIDATE':
                    handleIceCandidate(message.data.fromUser, message.data.candidate);
                    break;

                case 'CALL_FOCUS_CHANGE':
                    if (onUserFocusChange) {
                        onUserFocusChange(message.data.fromUser, message.data.isFocused);
                    }
                    break;

                case 'CALL_MEDIA_STATE':
                    if (onUserMediaStateChange) {
                        onUserMediaStateChange(
                            message.data.fromUser,
                            message.data.audioEnabled,
                            message.data.videoEnabled
                        );
                    }
                    break;

                case 'CALL_SYNC_CODE':
                    if (onCodeSync) {
                        onCodeSync(
                            message.data.code,
                            message.data.language,
                            message.data.fromUser
                        );
                    }
                    break;

                case 'CALL_SYNC_NOTES':
                    if (onNotesSync) {
                        onNotesSync(
                            message.data.notes,
                            message.data.fromUser
                        );
                    }
                    break;
            }
        });

        return () => {
            roomSub?.unsubscribe();
            queueSub?.unsubscribe();
        };
    }, [
        isConnected,
        roomId,
        subscribe,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        onUserJoined,
        onUserLeft,
        onUserFocusChange,
        onUserMediaStateChange,
        onCodeSync,
        onNotesSync
    ]);

    return {
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
    };
};