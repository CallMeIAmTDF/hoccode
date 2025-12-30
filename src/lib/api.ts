import {notify} from "@/components/notify";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

function handleUnauthorized(code: number) {
    if (code === 401 || code === 99999) {
        localStorage.clear();
        localStorage.setItem('hasSeenOnboarding', 'true');
        localStorage.setItem('hasSeenLearnProblemOnboarding', 'true')
    }
}

function getAuthHeaders(
    contentType: 'json' | 'form' = 'json',
    extraHeaders: HeadersInit = {}
): HeadersInit {
    const token = localStorage.getItem('accessToken');
    const baseHeaders: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders
    };

    if (contentType === 'json') {
        return {
            'Content-Type': 'application/json',
            ...baseHeaders
        };
    }
    return baseHeaders;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        handleUnauthorized(res.status);
        console.log({"res.status": res.status});
        if (!res.ok) {
            handleUnauthorized(res.status);
            let message: string;
            try {
                const errorRes = await res.json();
                message = errorRes.message || `HTTP error! status: ${res.status}`;
            } catch {
                message = `HTTP error! status: ${res.status}`;
            }
            throw new Error(message);
        }
    }
    const response: ApiResponse<T> = await res.json();
    return response.data;
}

async function handleFetch<T>(fetchFn: () => Promise<Response>): Promise<T> {
    try {
        const res = await fetchFn();
        if (!res.ok) {
            handleUnauthorized(res.status);
            let message: string;
            try {
                const errorRes = await res.json();
                message = errorRes.message || `HTTP error! status: ${res.status}`;
            } catch {
                message = `HTTP error! status: ${res.status}`;
            }
            throw new Error(message);
        }
        const response: ApiResponse<T> = await res.json();
        return response.data;
    } catch (error: any) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            notify("error", {
                title: "Lỗi thao tác",
                description: "Vui lòng đăng nhập để tiếp tục"
            });
            localStorage.clear();
            localStorage.setItem('hasSeenOnboarding', 'true');
            localStorage.setItem('hasSeenLearnProblemOnboarding', 'true')
            if(!(window.location.pathname == "/")){
                window.location.href = "/auth/signin";
            }
        } else {
            // notify("error", {
            //     title: "Lỗi hệ thống",
            //     description: error.message
            // });
        }
        throw error;
    }
}

export function apiGet<T>(endpoint: string): Promise<T> {
    return handleFetch(() =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })
    );
}

export function apiPost<T, B = any>(endpoint: string, body?: B): Promise<T> {
    const isFormData = body instanceof FormData;

    return handleFetch(() =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(isFormData ? 'form' : 'json'),
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        })
    );
}

export function apiPut<T, B = any>(endpoint: string, body?: B): Promise<T> {
    return handleFetch(() =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        })
    );
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        handleUnauthorized(res.status);
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const response: ApiResponse<T> = await res.json();
    return response.data;
}


export async function apiGetFile(endpoint: string): Promise<Blob> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        handleUnauthorized(res.status);
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.blob();
}

export async function apiPostForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders('form'),
        body: formData,
    });
    if (!res.ok) {
        handleUnauthorized(res.status);
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const response: ApiResponse<T> = await res.json();
    return response.data;
}