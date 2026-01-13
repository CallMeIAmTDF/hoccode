// useVideoCall.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketProvider';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            urls: [
                'turn:turn.hoccode.cloud:3478?transport=udp',
                'turn:turn.hoccode.cloud:3478?transport=tcp'
            ],
            username: 'iamtdf',
            credential: 'iamtdf123'
        }
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
                             }: any) => {
    const { subscribe, send } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<string[]>([]);

    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    // Quan trọng: Dùng Ref cho các callback để tránh useEffect phụ thuộc quá nhiều biến
    const callbacksRef = useRef({
        onRemoteStream, onUserJoined, onUserLeft, onUserFocusChange,
        onUserMediaStateChange, onCodeSync, onNotesSync
    });

    useEffect(() => {
        callbacksRef.current = {
            onRemoteStream, onUserJoined, onUserLeft, onUserFocusChange,
            onUserMediaStateChange, onCodeSync, onNotesSync
        };
    }, [onRemoteStream, onUserJoined, onUserLeft, onUserFocusChange, onUserMediaStateChange, onCodeSync, onNotesSync]);

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

    const sendMediaState = useCallback((audioEnabled: boolean, videoEnabled: boolean) => {
        if (isConnected) {
            send('/app/call/media-state', {
                type: 'CALL_MEDIA_STATE',
                data: { roomId, audioEnabled, videoEnabled },
            });
        }
    }, [isConnected, roomId, send]);

    const createPeerConnection = useCallback((userId: string) => {
        // Nếu đã có kết nối với user này, đóng cái cũ
        if (peerConnectionsRef.current.has(userId)) {
            peerConnectionsRef.current.get(userId)?.close();
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
                    data: { roomId, targetUser: userId, candidate: event.candidate },
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams[0]) {
                callbacksRef.current.onRemoteStream?.(event.streams[0], userId);
            }
        };

        peerConnectionsRef.current.set(userId, pc);
        return pc;
    }, [roomId, send]);

    const handleOffer = useCallback(async (fromUser: string, offer: RTCSessionDescriptionInit) => {
        const pc = createPeerConnection(fromUser);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            send('/app/call/answer', {
                type: 'CALL_ANSWER',
                data: { roomId, targetUser: fromUser, answer },
            });

            const pending = pendingCandidatesRef.current.get(fromUser) || [];
            for (const candidate of pending) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidatesRef.current.delete(fromUser);
        } catch (e) { console.error("Error handling offer", e); }
    }, [createPeerConnection, roomId, send]);

    const handleAnswer = useCallback(async (fromUser: string, answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionsRef.current.get(fromUser);
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                const pending = pendingCandidatesRef.current.get(fromUser) || [];
                for (const candidate of pending) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidatesRef.current.delete(fromUser);
            } catch (e) { console.error("Error handling answer", e); }
        }
    }, []);

    const handleIceCandidate = useCallback(async (fromUser: string, candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionsRef.current.get(fromUser);
        if (pc && pc.remoteDescription) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) { console.error(e); }
        } else {
            const pending = pendingCandidatesRef.current.get(fromUser) || [];
            pending.push(candidate);
            pendingCandidatesRef.current.set(fromUser, pending);
        }
    }, []);

    const startCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setLocalStream(stream);
            setIsConnected(true);
            send('/app/call/join', { type: 'CALL_JOIN', data: { roomId } });
            sendMediaState(true, true);
        } catch (error) { console.error('❌ Media error:', error); }
    }, [roomId, send, sendMediaState]);

    const endCall = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();
        setLocalStream(null);
        setIsConnected(false);
        send('/app/call/leave', { type: 'CALL_LEAVE', data: { roomId } });
    }, [roomId, send]);

    // --- EFFECT CHÍNH: QUẢN LÝ SOCKET ---
    useEffect(() => {
        if (!isConnected) return;

        const roomSub = subscribe(`/topic/call/${roomId}`, (msg: any) => {
            if (msg.type === 'CALL_JOIN') {
                setParticipants(msg.data.participants);
                if (msg.data.userEmail !== localStorage.getItem('email')) {
                    callbacksRef.current.onUserJoined?.(msg.data.userEmail);
                    // Delay nhỏ để đảm bảo PC phía bên kia đã sẵn sàng
                    setTimeout(async () => {
                        const pc = createPeerConnection(msg.data.userEmail);
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        send('/app/call/offer', {
                            type: 'CALL_OFFER',
                            data: { roomId, targetUser: msg.data.userEmail, offer },
                        });
                    }, 800);
                }
            } else if (msg.type === 'CALL_LEAVE') {
                setParticipants(msg.data.participants);
                peerConnectionsRef.current.get(msg.data.userEmail)?.close();
                peerConnectionsRef.current.delete(msg.data.userEmail);
                callbacksRef.current.onUserLeft?.(msg.data.userEmail);
            }
        });

        const queueSub = subscribe('/user/queue/call', (msg: any) => {
            const data = msg.data;
            switch (msg.type) {
                case 'CALL_OFFER': handleOffer(data.fromUser, data.offer); break;
                case 'CALL_ANSWER': handleAnswer(data.fromUser, data.answer); break;
                case 'CALL_ICE_CANDIDATE': handleIceCandidate(data.fromUser, data.candidate); break;
                case 'CALL_FOCUS_CHANGE': callbacksRef.current.onUserFocusChange?.(data.fromUser, data.isFocused); console.log(data.isFocused); break;
                case 'CALL_MEDIA_STATE': callbacksRef.current.onUserMediaStateChange?.(data.fromUser, data.audioEnabled, data.videoEnabled); break;
                case 'CALL_SYNC_CODE': callbacksRef.current.onCodeSync?.(data.code, data.language, data.fromUser);console.log("CALL_SYNC_CODE"); break;
                case 'CALL_SYNC_NOTES': callbacksRef.current.onNotesSync?.(data.notes, data.fromUser); break;
            }
        });

        return () => {
            // TUYỆT ĐỐI không stop track ở đây. Chỉ hủy subscribe socket.
            roomSub?.unsubscribe();
            queueSub?.unsubscribe();
        };
    }, [isConnected, roomId, subscribe, createPeerConnection, handleOffer, handleAnswer, handleIceCandidate, send]);

    return { localStream, isAudioEnabled, isVideoEnabled, isConnected, participants, startCall, endCall, toggleAudio: () => {
            if (localStreamRef.current) {
                const track = localStreamRef.current.getAudioTracks()[0];
                track.enabled = !track.enabled;
                setIsAudioEnabled(track.enabled);
                sendMediaState(track.enabled, isVideoEnabled);
            }
        }, toggleVideo: () => {
            if (localStreamRef.current) {
                const track = localStreamRef.current.getVideoTracks()[0];
                track.enabled = !track.enabled;
                setIsVideoEnabled(track.enabled);
                sendMediaState(isAudioEnabled, track.enabled);
            }
        }, syncCode: (code: string, lang: string) => send('/app/call/sync-code', { type: 'CALL_SYNC_CODE', data: { roomId, code, language: lang } }),
        syncNotes: (notes: string) => send('/app/call/sync-notes', { type: 'CALL_SYNC_NOTES', data: { roomId, notes } })
    };
};