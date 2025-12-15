'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Video,
    UserPlus,
    Loader2,
    Copy,
    Check,
    AlertCircle,
    Users,
    Calendar
} from 'lucide-react';
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

export default function InterviewLobbyPage() {
    const router = useRouter();

    // Create room state
    const [isCreating, setIsCreating] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState('');
    const [copied, setCopied] = useState(false);

    // Join room state
    const [joinRoomId, setJoinRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    // Create interview room
    const handleCreateRoom = async () => {
        try {
            setIsCreating(true);
            const response = await apiPost<VideoRoomResponse>("/interview", {})
            setCreatedRoomId(response.roomId);

            // Auto copy room ID
            navigator.clipboard.writeText(response.roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    // Start interview as host
    const handleStartInterview = () => {
        if (createdRoomId) {
            router.push(`/interview/${createdRoomId}?host=true`);
        }
    };

    // Copy room ID
    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(createdRoomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Join interview room
    const handleJoinRoom = async () => {
        if (!joinRoomId.trim()) {
            setJoinError('Please enter a room ID');
            return;
        }

        try {
            setIsJoining(true);
            setJoinError('');

            // Validate room exists
            const response = await apiGet<RoomValidationResponse>(`/interview/${joinRoomId.trim()}`)
            if(response.valid){
                router.push(`/interview/${joinRoomId}?host=false`);
            }else{
                notify("error", {
                    title: "Lỗi",
                    description: "Phòng không tồn tại"
                })
            }

        } catch (error) {
            console.error('Error joining room:', error);
            setJoinError('Invalid room ID or room does not exist');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Video className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Video Interview Platform
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Conduct technical interviews with real-time video and code collaboration
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="host" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="host" className="text-base">
                                <Users className="w-4 h-4 mr-2" />
                                I'm the Interviewer
                            </TabsTrigger>
                            <TabsTrigger value="candidate" className="text-base">
                                <UserPlus className="w-4 h-4 mr-2" />
                                I'm the Candidate
                            </TabsTrigger>
                        </TabsList>

                        {/* HOST TAB - Create Room */}
                        <TabsContent value="host">
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Create Interview Room</CardTitle>
                                    <CardDescription>
                                        Start a new interview session and invite candidates to join
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    {!createdRoomId ? (
                                        // Before creating room
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                    What happens next?
                                                </h3>
                                                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                                    <li className="flex items-start">
                                                        <span className="mr-2">1.</span>
                                                        <span>A unique room ID will be generated</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="mr-2">2.</span>
                                                        <span>Share the room ID with your candidate</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="mr-2">3.</span>
                                                        <span>Start the interview when they join</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <Button
                                                onClick={handleCreateRoom}
                                                disabled={isCreating}
                                                size="lg"
                                                className="w-full h-14 text-lg"
                                            >
                                                {isCreating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Creating Room...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Video className="mr-2 h-5 w-5" />
                                                        Create Interview Room
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        // After creating room
                                        <div className="space-y-6">
                                            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertDescription className="text-green-800 dark:text-green-200">
                                                    Room created successfully! Share the Room ID with your candidate.
                                                </AlertDescription>
                                            </Alert>

                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Room ID</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={createdRoomId}
                                                        readOnly
                                                        className="font-mono text-lg h-12"
                                                    />
                                                    <Button
                                                        onClick={handleCopyRoomId}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-12 w-12"
                                                    >
                                                        {copied ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Send this Room ID to your candidate via email or messaging app
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <Button
                                                    onClick={handleStartInterview}
                                                    size="lg"
                                                    className="w-full h-14 text-lg"
                                                >
                                                    <Video className="mr-2 h-5 w-5" />
                                                    Start Interview
                                                </Button>

                                                <Button
                                                    onClick={() => setCreatedRoomId('')}
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    Create Another Room
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* CANDIDATE TAB - Join Room */}
                        <TabsContent value="candidate">
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Join Interview Room</CardTitle>
                                    <CardDescription>
                                        Enter the room ID provided by your interviewer
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    <div className="space-y-3">
                                        <Label htmlFor="room-id" className="text-base font-semibold">
                                            Room ID
                                        </Label>
                                        <Input
                                            id="room-id"
                                            placeholder="Enter room ID (e.g., 1423103a-e189-4227-9e44-25e1ec675012)"
                                            value={joinRoomId}
                                            onChange={(e) => {
                                                setJoinRoomId(e.target.value);
                                                setJoinError('');
                                            }}
                                            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                            className="h-12 text-base font-mono"
                                            disabled={isJoining}
                                        />
                                        {joinError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{joinError}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Before you join
                                        </h3>
                                        <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                                            <li className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>Make sure you have a working camera and microphone</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>You'll need to grant browser permissions for camera/mic</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>Find a quiet place with good lighting</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={handleJoinRoom}
                                        disabled={!joinRoomId.trim() || isJoining}
                                        size="lg"
                                        className="w-full h-14 text-lg"
                                    >
                                        {isJoining ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Joining Room...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-5 w-5" />
                                                Join Interview
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Features Section */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                        <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold">HD Video Call</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Crystal clear video and audio communication
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-semibold">Code Editor</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Real-time collaborative coding environment
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold">Notes & Chat</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Take notes and communicate via text chat
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}