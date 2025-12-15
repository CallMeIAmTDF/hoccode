import React from 'react';
import {DifficultyConfig, DifficultyStats, Stats, StatsProps} from "@/lib/types/profile";

const difficultyOrder: (keyof DifficultyStats)[] = ["easy", "medium", "hard"];
const LeetCodeStats: React.FC<StatsProps> = ({stats}) => {
    const solvedPercentage = (stats.solved / stats.total) * 100;
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (solvedPercentage / 100) * circumference;

    const difficultyConfig: Record<keyof DifficultyStats, DifficultyConfig> = {
        easy: {
            label: "Easy",
            color: "text-emerald-700",
            bgColor: "bg-emerald-100",
            progressColor: "bg-emerald-500",
        },
        medium: {
            label: "Medium",
            color: "text-amber-700",
            bgColor: "bg-amber-100",
            progressColor: "bg-amber-400",
        },
        hard: {
            label: "Hard",
            color: "text-red-700",
            bgColor: "bg-red-100",
            progressColor: "bg-red-500",
        },
    };

    return (
    <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between gap-6">
            {/* Circular Progress */}
            <div className="relative">
                <svg className="w-34 h-34 transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 ease-in-out"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981"/>
                            <stop offset="50%" stopColor="#F59E0B"/>
                            <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-gray-800">
                    {stats.solved}
                        <span className="text-lg text-gray-500">/{stats.total}</span>
                    </div>
                </div>
            </div>

            {/* Difficulty Bars */}
            <div className="flex-1 space-y-4">
                {difficultyOrder.map((key) => {
                    const data = stats.difficulty[key];
                    const config = difficultyConfig[key];
                    const progressPercent = (data.solved / data.total) * 100;

                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                                <span className="text-xs text-gray-600">{data.solved}/{data.total}</span>
                            </div>

                            <div className={`w-full h-2 rounded-full ${config.bgColor}`}>
                                <div
                                    className={`h-full rounded-full ${config.progressColor} transition-all duration-500 ease-in-out`}
                                    style={{width: `${Math.min(progressPercent, 100)}%`}}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
};

export default LeetCodeStats;