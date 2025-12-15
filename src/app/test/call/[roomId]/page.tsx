'use client';

import { VideoCallRoom } from '@/app/test/call/[roomId]/VideoCallRoom';
import { useParams, useRouter } from 'next/navigation';

export default function CallPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    return (
        <VideoCallRoom
            roomId={roomId}
            onLeave={() => router.push('/test')}
        />
    );
}