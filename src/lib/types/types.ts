export interface FileCard {
    id: string;
    name: string;
    category: string;
    description: string;
    createdAt: string;
    size: number;
    url: string;
}

export interface Message {
    id: string;
    userId: string;
    content: string;
    page: number;
    role: 'USER' | 'BOT';
    file?: FileCard | null;
}

export interface FileSearchRequest {
    keyword?: string;
    categories?: string[];
    page?: number;
    size?: number;
}

export interface ApiResponse<T> {
    code: number;
    message?: string;
    data: T;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
}

export interface LoginResponse {
    user: User;
    access_token: string;
    refresh_token: string;
}

export interface Pageable<T>{
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    totalElements: number;
    totalPages: number;
    pageable: Page;
}

export interface Page{
    pageNumber: number;
    paged: boolean;
}

export interface MessageStats{
    date: string;
    count: number;
}

export interface FileStats{
    category: string;
    count: number;
}

export interface AdminDashboardResponse {
    totalUsers: number;
    totalFiles: number;
    totalMessages: number;
    messageStats: MessageStats[];
    fileStats: FileStats[];
}

export interface FileStatsResponse {
    id: string;
    name: string;
    category: string;
    description: string;
    createdAt: string;
    size: number;
    url: string;
    deleted: boolean;
}
//
//
// export interface Pageable {
//
// }