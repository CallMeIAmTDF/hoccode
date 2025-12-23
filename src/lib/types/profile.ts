export interface ProfileStats {
    rank: number;
    info: UserResponse
    joined: string
    streak: Streak
    solved: number
    point: number
}

export interface Streak {
    id: number;
    maxStreak: number;
    currentStreak: number;
}

export interface UserResponse {
    id: string
    email: string
    name: string
    dob: string
    avatar: string
    noPassword: boolean
    isLocked: boolean
}


export interface Difficulty {
    solved: number;
    total: number;
}

export interface DifficultyStats {
    easy: Difficulty;
    medium: Difficulty;
    hard: Difficulty;
}

export interface Stats {
    solved: number;
    total: number;
    difficulty: DifficultyStats;
}

export interface DifficultyConfig {
    label: string;
    color: string;
    bgColor: string;
    progressColor: string;
}

export interface StatsProps {
    stats: Stats;
}

export interface DailySubmission {
    day: string;
    count: number;
}

export interface LanguageSummary {
    passed: number;
    failed: number;
    total: number;
}

export interface DailyTimeSlotAnalysis {
    EARLY_MORNING?: number;
    MORNING?: number;
    EVENING?: number;
    AFTERNOON?: number;
    [key: string]: number | undefined;
}

export interface UserStatsData {
    submissionSummary: {
        passedSubmissions: number;
        failedSubmissions: number;
    };
    dailyTimeSlotAnalysis?: DailyTimeSlotAnalysis;
    dayOfWeekAnalysis?: {
        busiestDay: string;
        busiestTimeSlot: string;
    };
    categorySubmissionCount?: {
        [key: string]: number;
    };
    languageSubmissionSummary?: {
        [key: string]: LanguageSummary;
    };
    stats: {
        rank: number;
        point: number;
        joined: string;
    };
}



export interface AIAnalysisOverview {
    totalSubmissions: number | null;
    passRateDescription: string | null;
    dominantLanguage: string | null;
    strongestCategory: string | null;
    activeTimeSlot: string | null;
    activeDay: string | null;
}

export interface AIAnalysisInsights {
    studyHabits: string | null;
    languageAnalysis: string | null;
    categoryAnalysis: string | null;
    behaviorPrediction: string | null;
}

export interface AIAnalysisAchievementScore {
    consistency: string | null;
    problemSolving: string | null;
    languageMastery: string | null;
    overall: string | null;
}

export interface AIAnalysisImprovementSuggestions {
    weakCategories: string | null;
    languageGrowth: string | null;
    timeOptimization: string | null;
    skillExpansion: string | null;
}

export interface AIAnalysis {
    overview: AIAnalysisOverview | null;
    insights: AIAnalysisInsights | null;
    highlights: string[] | null;
    achievementScore: AIAnalysisAchievementScore | null;
    funFacts: string[] | null;
    improvementSuggestions: AIAnalysisImprovementSuggestions | null;
}



export interface AnalysisOverview {
    totalSubmissions: number | null;
    passRateDescription: string | null;
    dominantLanguage: string | null;
    strongestCategory: string | null;
    activeTimeSlot: string | null;
    activeDay: string | null;
}

export interface AnalysisInsights {
    studyHabits: string | null;
    languageAnalysis: string | null;
    categoryAnalysis: string | null;
    behaviorPrediction: string | null;
}

export interface AchievementScore {
    consistency: string | null;
    problemSolving: string | null;
    languageMastery: string | null;
    overall: string | null;
}

export interface ImprovementSuggestions {
    weakCategories: string | null;
    languageGrowth: string | null;
    timeOptimization: string | null;
    skillExpansion: string | null;
}

export interface AnalysisReportData {
    overview: AnalysisOverview | null;
    insights: AnalysisInsights | null;
    highlights: string[] | null;
    achievementScore: AchievementScore | null;
    funFacts: string[] | null;
    improvementSuggestions: ImprovementSuggestions | null;
}


export interface UserInfo {
    id: string;
    name: string;
    email: string;
    avatar: string;
    dob: string;
}