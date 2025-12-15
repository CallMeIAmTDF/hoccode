export interface Problem {
    id: number
    title: string
    description: string
    constrains: string
    followUp: string
    timeLimit: number
    memoryLimit: number
    difficulty: string
    point: number
    categories: string[]
    accepted: boolean
    passCount: number
    failCount: number
    hints?: Hint[]
    allTestCases?: TestCase[]
}

export interface AdminProblem extends Problem {
    deleted: boolean
}

interface Hint {
    id: number
    description: string
}
interface TestCase {
    id: number
    input: string
    expectedOutput: string
    isHidden: boolean
}

export interface FilterState {
    keyword: string
    difficulty: string
    categories: string[]
}

export interface FilterState {
    keyword: string
    difficulty: string
    categories: string[]
}

export interface LeaderboardItem {
    id: string
    point: number
    avatar: string
    name: string
}


export interface Result{
    case_id: number,
    status: string,
    message: string,
    time: number
}

export interface CodeRunnerResponse {
    message: string,
    passed: number,
    status: string,
    total: number,
    results: Result[]
}


export interface SubmissionResponse {
    detail: Submission,
    testcases: Result[]
}

export interface Submission {
    id: string,
    pid: number,
    status: string,
    totalTestCases: number,
    passedTestCase: number,
    message: string,
    maxTime: number,
}


export type ApiCategory = {
    category: string
    count: number
}

export interface CodeAnalysisContent {
    overview: string[];
    advantage: string[];
    disadvantages: string[];
    proposal: string[];
}

export interface CodeAnalysis {
    time_complexity: string;
    space_complexity?: string;
    content: CodeAnalysisContent;
}

export interface Recommendation {
    recommend: number;
}