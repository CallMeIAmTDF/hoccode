export interface Complexity {
    time: string;
    space: string;
}

export interface Attempt {
    attempt_number: number;
    approach: string;
    complexity: Complexity;
    strengths: string[];
    weaknesses: string[];
    improvements_from_previous?: string[] | null;
}

export interface ProblemAnalysis {
    inferred_problem_type: string;
    key_concepts: string[];
}

export interface ProgressionSummary {
    key_insights: string[];
    best_attempt: number;
    best_attempt_reason: string;
}

export interface InDepthCodeAnalysisResponse {
    problem_analysis: ProblemAnalysis;
    attempts: Attempt[];
    progression_summary: ProgressionSummary;
    recommendations: string[];
}