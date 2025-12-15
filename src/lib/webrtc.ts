export interface WebRTCCallbacks {
    onIceCandidate: (candidate: RTCIceCandidate) => void;
    onTrack: (stream: MediaStream) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private pendingIceCandidates: RTCIceCandidateInit[] = [];
    private isRemoteDescriptionSet: boolean = false;

    private configuration: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ],
    };

    async initializeLocalStream(
        constraints: MediaStreamConstraints = { video: true, audio: true }
    ): Promise<MediaStream> {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw new Error('Unable to access camera/microphone. Please check permissions.');
        }
    }

    createPeerConnection(callbacks: WebRTCCallbacks): RTCPeerConnection {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.isRemoteDescriptionSet = false;
        this.pendingIceCandidates = [];

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });
        }

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Local ICE candidate generated');
                callbacks.onIceCandidate(event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            console.log('Remote track received');
            callbacks.onTrack(event.streams[0]);
        };

        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection?.connectionState;
            console.log('Connection state:', state);
            if (callbacks.onConnectionStateChange && state) {
                callbacks.onConnectionStateChange(state);
            }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        };

        this.peerConnection.onsignalingstatechange = () => {
            console.log('Signaling state:', this.peerConnection?.signalingState);
        };

        return this.peerConnection;
    }

    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) throw new Error('Peer connection not initialized');

        console.log('Creating offer');
        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });
        await this.peerConnection.setLocalDescription(offer);
        console.log('Local description (offer) set');
        return offer;
    }

    async createAnswer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) throw new Error('Peer connection not initialized');

        console.log('Creating answer');
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        console.log('Local description (answer) set');
        return answer;
    }

    async setRemoteDescription(description: RTCSessionDescriptionInit) {
        if (!this.peerConnection) throw new Error('Peer connection not initialized');

        const currentState = this.peerConnection.signalingState;
        console.log('Setting remote description. Current state:', currentState, 'Type:', description.type);

        // Check if we're in correct state
        if (description.type === 'offer' && currentState !== 'stable' && currentState !== 'have-local-offer') {
            console.warn('Ignoring offer in wrong state:', currentState);
            return;
        }

        if (description.type === 'answer' && currentState !== 'have-local-offer') {
            console.warn('Ignoring answer in wrong state:', currentState);
            return;
        }

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
            this.isRemoteDescriptionSet = true;
            console.log('Remote description set successfully');

            // Process pending ICE candidates
            await this.processPendingIceCandidates();
        } catch (error) {
            console.error('Error setting remote description:', error);
            throw error;
        }
    }

    async addIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.peerConnection) throw new Error('Peer connection not initialized');

        // Queue ICE candidate if remote description not set yet
        if (!this.isRemoteDescriptionSet) {
            console.log('Queueing ICE candidate (remote description not set yet)');
            this.pendingIceCandidates.push(candidate);
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE candidate added successfully');
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
            // Don't throw - ICE candidate errors are usually non-fatal
        }
    }

    private async processPendingIceCandidates() {
        if (this.pendingIceCandidates.length === 0) return;

        console.log(`Processing ${this.pendingIceCandidates.length} pending ICE candidates`);

        for (const candidate of this.pendingIceCandidates) {
            try {
                await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding queued ICE candidate:', error);
            }
        }

        this.pendingIceCandidates = [];
    }

    toggleAudio(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    toggleVideo(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    getConnectionState(): RTCPeerConnectionState | null {
        return this.peerConnection?.connectionState ?? null;
    }

    cleanup() {
        console.log('Cleaning up WebRTC resources');

        this.isRemoteDescriptionSet = false;
        this.pendingIceCandidates = [];

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }
}