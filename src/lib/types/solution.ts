export interface CreateSolutionRequest {
    language: string;
    code: string;
    time: string; // Time Complexity (O(n), O(1), ...)
    space: string; // Space Complexity
    note: string; // Solution Description/Notes
    pid: number; // Problem ID
}

export interface Solution {
    id: number;
    pid: number;
    language: string;
    code: string;
    time: string;
    space: string;
    note: string;
    createdAt: string; // LocalDateTime
    createdBy: string; // Tên/Email người tạo
    updatedAt: string; // LocalDateTime
    updatedBy: string; // Tên/Email người cập nhật
}
export const mockSolutions : Solution[] = [
    { id: 101, pid: 1, language: "python", code: "return sum(nums)", time: "O(N)", space: "O(1)", note: "Python solution.", createdBy: "admin@dev.com", createdAt: "2025-10-01T10:00:00Z", updatedBy: "admin@dev.com", updatedAt: "2025-10-01T10:00:00Z" },
    { id: 102, pid: 1, language: "java", code: "int sum=0; for(int n:nums) sum+=n; return sum;", time: "O(N)", space: "O(1)", note: "Java solution.", createdBy: "moderator@dev.com", createdAt: "2025-10-02T11:00:00Z", updatedBy: "moderator@dev.com", updatedAt: "2025-10-02T11:00:00Z" },
]