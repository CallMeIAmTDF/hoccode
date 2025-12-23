"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Clock,
    MemoryStick,
    CalendarCheck2,
    CalendarX2, Check
} from "lucide-react"
import { ProblemFilters } from "@/components/problem-filters"
import React from "react";
import {FilterState, Problem} from "@/lib/types/problem";

export interface ProblemListProps {
    problems: Problem[]
    dailyProblem: Problem
    dailyProblemId: number
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    onProblemClick: (problemId: number) => void
    onRandom: () => void
}


const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case "EASY":
            return "bg-green-100 text-green-800 hover:bg-green-100"
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        case "HARD":
            return "bg-red-100 text-red-800 hover:bg-red-100"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
}

const getCategoryColor = (category: string) => {
    const colors = [
        "bg-blue-100 text-blue-800 hover:bg-blue-100",
        "bg-purple-100 text-purple-800 hover:bg-purple-100",
        "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
        "bg-pink-100 text-pink-800 hover:bg-pink-100",
        "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
    ]
    return colors[category.length % colors.length]
}

export function ProblemList({ problems, dailyProblem, dailyProblemId, filters, onFiltersChange, onProblemClick, onRandom }: ProblemListProps) {
    const otherProblems = problems.filter(p => p.id !== dailyProblemId)

    return (
        <div className="space-y-4">
            <ProblemFilters filters={filters} onFiltersChange={onFiltersChange} onRandom={onRandom} />

            <div className="rounded-lg border bg-card" id="tour-list">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="font-semibold">Thử thách</TableHead>
                            <TableHead className="font-semibold">Độ khó</TableHead>
                            <TableHead className="font-semibold">Danh mục</TableHead>
                            <TableHead className="font-semibold text-center">Điểm thưởng</TableHead>
                            <TableHead className="font-semibold text-center">Giới hạn</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow
                            key={dailyProblem.id}
                            id="tour-daily"
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => onProblemClick(dailyProblem.id)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {dailyProblem.accepted ? (
                                        <CalendarCheck2 className="h-4 w-4"/>
                                    ) : (
                                        <CalendarX2 className="h-4 w-4"/>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div
                                    className="font-medium text-foreground hover:text-blue-700">{dailyProblem.title}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={getDifficultyColor(dailyProblem.difficulty)}>
                                    {dailyProblem.difficulty}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {dailyProblem.categories.slice(0, 1).map((category) => (
                                        <Badge key={category} variant="outline" className={`text-xs ${getCategoryColor(category)}`}>
                                            {category.replaceAll("_", " ")}
                                        </Badge>
                                    ))}
                                    {dailyProblem.categories.length > 1 && (
                                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                            +{dailyProblem.categories.length - 1}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-medium text-blue-700">{dailyProblem.point}</span>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {dailyProblem.timeLimit}s
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MemoryStick className="h-3 w-3" />
                                        {dailyProblem.memoryLimit}KB
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                        {otherProblems.map((problem) => {
                            return (
                                <TableRow
                                    key={problem.id}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => onProblemClick(problem.id)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {problem.accepted ? (
                                                <Check className="h-4 w-4 text-green-600"/>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="font-medium text-foreground hover:text-blue-700">{problem.title}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getDifficultyColor(problem.difficulty)}>
                                            {problem.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {problem.categories.slice(0, 1).map((category) => (
                                                <Badge key={category} variant="outline" className={`text-xs ${getCategoryColor(category)}`}>
                                                    {category}
                                                </Badge>
                                            ))}
                                            {problem.categories.length > 1 && (
                                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                                    +{problem.categories.length - 1}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-medium text-blue-700">{problem.point}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {problem.timeLimit}s
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MemoryStick className="h-3 w-3" />
                                                {problem.memoryLimit}KB
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {problems.length === 0 && !dailyProblem && (
                <div className="text-center py-8 text-muted-foreground">Không tìm thấy vấn đề nào phù hợp.</div>
            )}
        </div>
    )
}
