'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useVideoCall } from '@/hooks/useVideoCall';
import { roomApi } from '@/lib/test/roomApi';

const MonacoEditorComponent = dynamic(() => import("@/components/hoccodeeditor"), { ssr: false });

interface VideoCallRoomProps {
    roomId: string;
    onLeave?: () => void;
}

type TabType = 'code' | 'notes';
type LanguageType = 'java' | 'python' | 'cpp';

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomId, onLeave }) => {
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [isValidating, setIsValidating] = useState(true);
    const [isValidRoom, setIsValidRoom] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('code');
    const [code, setCode] = useState('// Write your code here...\n\n');
    const [notes, setNotes] = useState('');
    const [language, setLanguage] = useState<LanguageType>('java');
    const [leftPanelWidth, setLeftPanelWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const [remoteUserFocused, setRemoteUserFocused] = useState(true);
    const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
    const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
    const [isSyncingFromRemote, setIsSyncingFromRemote] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pipVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Validate room
    useEffect(() => {
        const validateRoom = async () => {
            try {
                const validation = await roomApi.validateRoom(roomId);
                if (validation.valid) {
                    setIsValidRoom(true);
                } else {
                    setValidationError('This room does not exist or has expired.');
                }
            } catch (error) {
                console.error('Room validation error:', error);
                setValidationError('Failed to validate room. Please try again.');
            } finally {
                setIsValidating(false);
            }
        };

        validateRoom();
    }, [roomId]);

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
            console.log('🎥 Adding remote stream for user:', userId);
            setRemoteStreams((prev) => new Map(prev).set(userId, stream));
        },
        onUserJoined: (userId) => {
            console.log('👋 User joined:', userId);
        },
        onUserLeft: (userId) => {
            console.log('👋 User left:', userId);
            setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        },
        onUserFocusChange: (userId, isFocused) => {
            console.log(`👁️ User ${userId} focus: ${isFocused}`);
            setRemoteUserFocused(isFocused);
        },
        onUserMediaStateChange: (userId, audioEnabled, videoEnabled) => {
            console.log(`🎤📹 User ${userId} media: audio=${audioEnabled}, video=${videoEnabled}`);
            setRemoteAudioEnabled(audioEnabled);
            setRemoteVideoEnabled(videoEnabled);
        },
        onCodeSync: (codeFromRemote, lang, fromUser) => {
            console.log('📥 Received code sync from', fromUser);
            setIsSyncingFromRemote(true);

            // Clear any pending sync timer
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }

            setCode(codeFromRemote);
            setLanguage(lang as LanguageType);

            // Reset flag after a short delay
            setTimeout(() => {
                setIsSyncingFromRemote(false);
            }, 500);
        },
        onNotesSync: (notesFromRemote, fromUser) => {
            console.log('📥 Received notes sync from', fromUser);
            setIsSyncingFromRemote(true);

            // Clear any pending sync timer
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }

            setNotes(notesFromRemote);

            // Reset flag after a short delay
            setTimeout(() => {
                setIsSyncingFromRemote(false);
            }, 500);
        },
    });

    // Auto start call
    useEffect(() => {
        if (isValidRoom && !isConnected) {
            startCall();
        }
    }, [isValidRoom, isConnected, startCall]);

    // Cleanup sync timer on unmount
    useEffect(() => {
        return () => {
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }
        };
    }, []);

    // Set local video
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Set PIP video separately
    useEffect(() => {
        if (pipVideoRef.current && localStream) {
            pipVideoRef.current.srcObject = localStream;
        }
    }, [localStream, remoteStreams.size]); // Re-run when remote streams change

    // Set remote video
    useEffect(() => {
        if (remoteVideoRef.current && remoteStreams.size > 0) {
            const firstRemoteStream = Array.from(remoteStreams.values())[0];
            remoteVideoRef.current.srcObject = firstRemoteStream;
        }
    }, [remoteStreams]);

    // Handle resize
    const handleMouseDown = () => {
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const newWidth = e.clientX;

            const minWidth = containerWidth * 0.2;
            const maxWidth = containerWidth * 0.8;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setLeftPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleEndCall = () => {
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
        }
        endCall();
        onLeave?.();
    };

    // Debounced code sync
    const handleCodeChange = (newCode: string) => {
        setCode(newCode);

        if (!isSyncingFromRemote && isConnected && participants.length > 1) {
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }

            syncTimerRef.current = setTimeout(() => {
                console.log('🔄 Syncing code to remote...');
                syncCode(newCode, language);
            }, 300); // Sync after 1 second of no typing
        }
    };

    // Debounced notes sync
    const handleNotesChange = (newNotes: string) => {
        setNotes(newNotes);

        if (!isSyncingFromRemote && isConnected && participants.length > 1) {
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }

            syncTimerRef.current = setTimeout(() => {
                console.log('🔄 Syncing notes to remote...');
                syncNotes(newNotes);
            }, 300);
        }
    };

    // Sync language change immediately
    const handleLanguageChange = (newLang: LanguageType) => {
        setLanguage(newLang);
        if (isConnected && participants.length > 1) {
            console.log('🔄 Syncing language to remote:', newLang);
            syncCode(code, newLang);
        }
    };

    // Loading
    if (isValidating) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg">Validating room...</p>
                </div>
            </div>
        );
    }

    // Invalid room
    if (!isValidRoom) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl text-gray-900 font-bold mb-2">Room Not Found</h2>
                    <p className="text-gray-600 mb-6">{validationError}</p>
                    <button
                        onClick={onLeave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Code Interview</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">Room: {roomId.slice(0, 8)}...</p>
                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                {participants.length} participant(s)
              </span>
                            {!remoteUserFocused && participants.length > 1 && (
                                <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <EyeOffIcon className="w-3 h-3" />
                  Interviewer away
                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleEndCall}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm"
                >
                    End Interview
                </button>
            </div>

            {/* Main Content */}
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {/* Left Panel - Video */}
                <div
                    className="bg-white border-r border-gray-200 flex flex-col"
                    style={{ width: `${leftPanelWidth}px` }}
                >
                    {/* Main Video */}
                    <div className="flex-1 relative bg-gray-900">
                        {remoteStreams.size > 0 ? (
                            // Remote video as main
                            <>
                                {remoteVideoEnabled ? (
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <VideoOffIcon className="w-12 h-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-300 text-lg font-medium">Camera is off</p>
                                            <p className="text-gray-500 text-sm mt-1">Interviewer turned off the camera</p>
                                        </div>
                                    </div>
                                )}

                                {/* Remote audio muted indicator - Always visible when muted */}
                                {!remoteAudioEnabled && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg animate-pulse">
                                        <MicOffIcon className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Microphone is muted</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Local video when no remote
                            <>
                                {isVideoEnabled ? (
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <VideoOffIcon className="w-12 h-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-300 text-lg font-medium">Your camera is off</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Label */}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
                            {remoteStreams.size > 0 ? 'Interviewer' : 'Waiting for participant...'}
                        </div>

                        {/* PIP Video - Your video when remote is showing */}
                        {remoteStreams.size > 0 && (
                            <div className="absolute bottom-4 right-4 w-36 sm:w-44 md:w-52 aspect-video rounded-lg overflow-hidden border-3 border-white shadow-2xl bg-gray-900">
                                {isVideoEnabled ? (
                                    <video
                                        ref={pipVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <VideoOffIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}

                                {/* PIP Status Bar */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-8 pb-2 px-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-xs font-medium">You</span>
                                        <div className="flex items-center gap-1">
                                            {!isAudioEnabled && (
                                                <div className="bg-red-500 p-1 rounded">
                                                    <MicOffIcon className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            {!isVideoEnabled && (
                                                <div className="bg-red-500 p-1 rounded">
                                                    <VideoOffIcon className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Controls */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={toggleAudio}
                                className={`p-3.5 rounded-full transition shadow-sm ${
                                    isAudioEnabled
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                                title={isAudioEnabled ? 'Mute' : 'Unmute'}
                            >
                                {isAudioEnabled ? (
                                    <MicIcon className="w-5 h-5" />
                                ) : (
                                    <MicOffIcon className="w-5 h-5" />
                                )}
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`p-3.5 rounded-full transition shadow-sm ${
                                    isVideoEnabled
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                            >
                                {isVideoEnabled ? (
                                    <VideoIcon className="w-5 h-5" />
                                ) : (
                                    <VideoOffIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors"
                    onMouseDown={handleMouseDown}
                >
                    {/*<div className="absolute inset-y-0 -left-1 -right-1" />*/}
                </div>

                {/* Right Panel - Code Editor & Notes */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Tabs */}
                    <div className="bg-white border-b border-gray-200 flex items-center">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                                activeTab === 'code'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-600 border-transparent hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <CodeIcon className="w-4 h-4" />
                                Code Editor
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                                activeTab === 'notes'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-600 border-transparent hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <DocumentIcon className="w-4 h-4" />
                                Notes
                            </div>
                        </button>

                        {activeTab === 'code' && (
                            <div className="ml-auto mr-4 flex items-center gap-2">
                                <label className="text-sm text-gray-600 font-medium">Language:</label>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value as LanguageType)}
                                    className="bg-gray-50 text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'code' ? (
                            <MonacoEditorComponent
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(v) => handleCodeChange(v ?? "")}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        ) : (
                            <textarea
                                value={notes}
                                onChange={(e) => handleNotesChange(e.target.value)}
                                placeholder="Take notes during the interview..."
                                className="w-full h-full bg-white text-gray-900 p-4 text-sm resize-none focus:outline-none placeholder-gray-400"
                                style={{ lineHeight: '1.6' }}
                            />
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-4">
                            <span className="font-medium">Lines: {(activeTab === 'code' ? code : notes).split('\n').length}</span>
                            <span className="font-medium">Characters: {(activeTab === 'code' ? code : notes).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSyncingFromRemote ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-gray-500">
                {isSyncingFromRemote ? 'Syncing...' : participants.length > 1 ? 'Synced' : 'No sync'}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Icons
const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const MicOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const VideoOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);