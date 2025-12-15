'use client';

import InterviewVideoCall from '@/components/InterviewVideoCall';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function InterviewRoomContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const roomId = params.roomId as string;
    const isHost = searchParams.get('host') === 'true';

    console.log('📍 Room page loaded:', { roomId, isHost });

    return <InterviewVideoCall roomId={roomId} isHost={isHost} />;
}

export default function InterviewRoomPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-center text-muted-foreground">Loading...</p>
                    </div>
                </Card>
            </div>
        }>
            <InterviewRoomContent />
        </Suspense>
    );
}