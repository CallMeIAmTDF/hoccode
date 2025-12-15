"use client"

import React, {useMemo, useState} from "react"
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js"
import {Radar} from "react-chartjs-2"
import {ApiCategory} from "@/lib/types/problem";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
)


// Mapping enum → group label
const GROUP_MAP: Record<string, string> = {
    ARRAY: "Linear",
    TWO_POINTERS: "Linear",
    SLIDING_WINDOW: "Linear",

    STRING: "String",
    STRING_MATCHING: "String",
    ROLLING_HASH: "String",
    SUFFIX_ARRAY: "String",

    TREE: "Tree",
    BINARY_TREE: "Tree",
    BINARY_SEARCH_TREE: "Tree",
    TRIE: "Tree",

    GRAPH: "Graph",
    SHORTEST_PATH: "Graph",
    MINIMUM_SPANNING_TREE: "Graph",
    STRONGLY_CONNECTED_COMPONENT: "Graph",
    TOPOLOGICAL_SORT: "Graph",
    BICONNECTED_COMPONENT: "Graph",
    EULERIAN_CIRCUIT: "Graph",

    DYNAMIC_PROGRAMMING: "DP",
    MEMOIZATION: "DP",

    SORTING: "Sort",
    MERGE_SORT: "Sort",
    QUICKSELECT: "Sort",
    RADIX_SORT: "Sort",
    COUNTING_SORT: "Sort",
    BUCKET_SORT: "Sort",
    SHELL: "Sort",

    HEAP: "DS",
    STACK: "DS",
    QUEUE: "DS",
    LINKED_LIST: "DS",
    DOUBLY_LINKED_LIST: "DS",
    MONOTONIC_STACK: "DS",
    MONOTONIC_QUEUE: "DS",
    ITERATOR: "DS",
    ORDERED_SET: "DS",

    MATH: "Math",
    NUMBER_THEORY: "Math",
    PROBABILITY_AND_STATISTICS: "Math",
    GEOMETRY: "Math",
    COMBINATORICS: "Math",

    HASH_TABLE: "Hash",
    HASH_FUNCTION: "Hash",

    BACKTRACKING: "Search",
    ENUMERATION: "Search",
    RECURSION: "Search",
    DIVIDE_AND_CONQUER: "Search",

    GREEDY: "Greedy",
    BIT_MANIPULATION: "Bitwise",
}

function aggregateByGroup(items: ApiCategory[]) {
    const agg: Record<string, number> = {}
    items.forEach(({category, count}) => {
        const group = GROUP_MAP[category] || "Other"
        agg[group] = (agg[group] || 0) + count
    })
    return agg
}

interface RadarProblemsChartProps {
    apiData: ApiCategory[]
}

const RadarProblemsChart: React.FC<RadarProblemsChartProps> = ({apiData}) => {

    const [open, setOpen] = useState<boolean>(false);

    const {labels, values, normalized} = useMemo(() => {
        const grouped = aggregateByGroup(apiData)
        const labels = Object.keys(grouped)
        const values = Object.values(grouped)
        const maxVal = Math.max(...values, 1)
        const normalized = values.map((v) => (v / maxVal) * 100)
        return {labels, values, normalized}
    }, [apiData])

    const chartData = {
        labels,
        datasets: [
            {
                data: normalized,
                fill: true,
                backgroundColor: "rgba(59,130,246,0.25)",
                borderColor: "rgb(59,130,246)",
                pointBackgroundColor: "rgb(59,130,246)",
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    showLabelBackdrop: false,
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ctx: any) => {
                        const raw = values[ctx.dataIndex]
                        const pct = normalized[ctx.dataIndex].toFixed(1)
                        return `${ctx.label}: ${raw} bài (${pct}% so với max)`
                    },
                },
            },
            legend: {
                display: false, // ẩn legend
            },
        },
    }

    return (
        <Card className="relative w-full flex flex-col gap-1">
            <CardHeader>
                <CardTitle>Phân tích theo nhóm chủ đề</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                {
                    apiData.length > 0 ? (
                        <div className="w-[210px] h-[210px]">
                            <Radar data={chartData} options={options}/>
                        </div>

                    ) : (
                        <div>Chưa có dữ liệu</div>
                    )
                }
            </CardContent>
        </Card>
    )
}

export default RadarProblemsChart