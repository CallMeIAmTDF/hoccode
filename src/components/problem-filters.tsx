"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {Search, Filter, X, Shuffle} from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import React, { useState } from "react"
import {FilterState} from "@/lib/types/problem";

interface ProblemFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    onRandom?: () => void
}

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"]
const CATEGORIES = [
    "ARRAY",
    "STRING",
    "HASH_TABLE",
    "DYNAMIC_PROGRAMMING",
    "MATH",
    "SORTING",
    "GREEDY",
    "DEPTH_FIRST_SEARCH",
    "BINARY_SEARCH",
    "DATABASE",
    "MATRIX",
    "TREE",
    "BREADTH_FIRST_SEARCH",
    "BIT_MANIPULATION",
    "TWO_POINTERS",
    "PREFIX_SUM",
    "HEAP",
    "SIMULATION",
    "BINARY_TREE",
    "GRAPH",
    "STACK",
    "COUNTING",
    "SLIDING_WINDOW",
    "DESIGN",
    "ENUMERATION",
    "BACKTRACKING",
    "UNION_FIND",
    "LINKED_LIST",
    "NUMBER_THEORY",
    "ORDERED_SET",
    "MONOTONIC_STACK",
    "SEGMENT_TREE",
    "TRIE",
    "COMBINATORICS",
    "BITMASK",
    "QUEUE",
    "RECURSION",
    "DIVIDE_AND_CONQUER",
    "BINARY_INDEXED_TREE",
    "MEMOIZATION",
    "GEOMETRY",
    "HASH_FUNCTION",
    "BINARY_SEARCH_TREE",
    "STRING_MATCHING",
    "SHORTEST_PATH",
    "TOPOLOGICAL_SORT",
    "ROLLING_HASH",
    "GAME_THEORY",
    "INTERACTIVE",
    "DATA_STREAM",
    "MONOTONIC_QUEUE",
    "BRAINTEASER",
    "DOUBLY_LINKED_LIST",
    "RANDOMIZED",
    "MERGE_SORT",
    "COUNTING_SORT",
    "ITERATOR",
    "CONCURRENCY",
    "PROBABILITY_AND_STATISTICS",
    "QUICKSELECT",
    "SUFFIX_ARRAY",
    "LINE_SWEEP",
    "MINIMUM_SPANNING_TREE",
    "BUCKET_SORT",
    'SHELL',
    "RESERVOIR_SAMPLING",
    'STRONGLY_CONNECTED_COMPONENT',
    "EULERIAN_CIRCUIT",
    "RADIX_SORT",
    "REJECTION_SAMPLING",
    "BICONNECTED_COMPONENT"
]

export function ProblemFilters({ filters, onFiltersChange, onRandom }: ProblemFiltersProps) {
    const [categoryOpen, setCategoryOpen] = useState(false)

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters }
        onFiltersChange(updated)
    }

    const addCategory = (category: string) => {
        if (!filters.categories.includes(category)) {
            updateFilters({ categories: [...filters.categories, category] })
        }
        setCategoryOpen(false)
    }

    const removeCategory = (category: string) => {
        updateFilters({ categories: filters.categories.filter((c) => c !== category) })
    }

    const clearFilters = () => {
        onFiltersChange({ keyword: "", difficulty: "ALL", categories: [] })
    }

    const hasActiveFilters = filters.keyword || filters.difficulty !== "ALL" || filters.categories.length > 0

    return (
        <div className="space-y-4 mb-6" id="tour-filters">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm thử thách theo tiêu đề hoặc mô tả..."
                            value={filters.keyword}
                            onChange={(e) => updateFilters({ keyword: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Select value={filters.difficulty} onValueChange={(value) => updateFilters({ difficulty: value })}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả cấp độ</SelectItem>
                        {DIFFICULTIES.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                                {difficulty}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-[140px] justify-start bg-transparent">
                            <Filter className="h-4 w-4 mr-2" />
                            Danh mục
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Tìm kiếm thể loại..." />
                            <CommandList>
                                <CommandEmpty>Không có thể loại phù hợp.</CommandEmpty>
                                <CommandGroup>
                                    {CATEGORIES.map((category) => (
                                        <CommandItem key={category} onSelect={() => addCategory(category.replaceAll("_", " "))} className="cursor-pointer">
                                            {category.replaceAll("_", " ")}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={() => onRandom?.()} className="w-full sm:w-[140px]" id="tour-random">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Ngẫu nhiên
                </Button>
                {hasActiveFilters && (
                    <Button variant="destructive" onClick={clearFilters} className="w-full sm:w-auto">
                        {/*<X className="h-4 w-4 mr-2" />*/}
                        Xóa tìm kiếm
                    </Button>
                )}
            </div>

            {filters.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Danh mục:</span>
                    {filters.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="gap-1" onClick={() => removeCategory(category)}>
                            {category}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeCategory(category)} />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
