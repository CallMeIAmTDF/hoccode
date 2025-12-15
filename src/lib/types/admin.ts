export interface DashboardStats {
    reports: Report[];
    stats: Stats[];
    chart: TypeCount[]
}

export interface Report {
    id: number;
    title: string;
    description: string;
    type: ReportTypeEnum;
    target: string;
    solved: boolean;
    solved_message: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface Stats {
    title: string;
    value: string;
    change: string;
}

export enum ReportTypeEnum {
    SYSTEM = "SYSTEM",
    PROBLEM = "PROBLEM",
    CONTEST = "CONTEST",
    SUBMISSION = "SUBMISSION",
    OTHER = "OTHER",
}

export interface TypeCount {
    type: ReportTypeEnum;
    count: number;
}