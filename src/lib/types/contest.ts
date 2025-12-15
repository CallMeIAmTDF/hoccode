import {Problem} from "@/lib/types/problem";

export interface Contest {
    id: number;
    title: string;
    description: string;
    numAttendees: number
    startTime: string
    endTime: string
    hasPassword: boolean
}


export interface ContestDetail {
    id: number
    title: string
    description: string
    password: string | null
    startTime: string
    endTime: string
    numAttendees: number
    problems: Problem[]
    hasPassword: boolean
}

export interface ProblemStatus {
    problemName: string
    status: string
    acceptedCount: number
    wrongCount: number
}

export interface LeaderBoardEntry {
    username: string
    totalPoints: number
    problemStatuses: ProblemStatus[]
}

export interface LeaderBoard {
    contestName: string
    entries: LeaderBoardEntry[]
}



interface Hint {
    id: number;
    description: string;
    createdAt: string; // ISO date string
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string | null;
}

interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string | null;
}

interface ProblemEdit {
    id: number;
    title: string;
    description: string;
    constrains: string;
    followUp: string;
    timeLimit: number;
    memoryLimit: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    point: number;
    categories: string[];
    accepted: boolean | null;
    hints: Hint[];
    allTestCases: TestCase[];
    passCount: number;
    failCount: number;
}

export interface ContestEdit {
    id: number;
    title: string;
    description: string;
    password: string | null;
    startTime: string; // ISO date string
    endTime: string;   // ISO date string
    numAttendees: number;
    problems: ProblemEdit[];
    hasPassword: boolean;
}