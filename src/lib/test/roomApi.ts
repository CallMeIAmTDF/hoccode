interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

interface VideoRoomResponse {
    roomId: string;
    createdAt: string;
    creatorEmail: string;
}

interface RoomValidationResponse {
    valid: boolean;
    roomId: string;
    userEmail: string;
}

class RoomApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Tạo room mới
     */
    async createRoom(): Promise<VideoRoomResponse> {
        const response = await this.request<VideoRoomResponse>('/interview', {
            method: 'POST',
        });
        return response.data;
    }

    /**
     * Validate room có tồn tại không
     */
    async validateRoom(roomId: string): Promise<RoomValidationResponse> {
        const response = await this.request<RoomValidationResponse>(
            `/interview/${roomId}`,
            {
                method: 'GET',
            }
        );
        return response.data;
    }
}

export const roomApi = new RoomApiService();