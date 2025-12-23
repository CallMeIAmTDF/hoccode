"use client"

import React, {useEffect, useState} from "react";
import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";


export default function HomePage() {
    const problem = {
        "title": "Two Sum",
        "description": "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n<p>You can return the answer in any order.</p>",
        "constrains": "<ul>\n  <li>2 <= nums.length <= 10^4</li>\n  <li>-10^9 <= nums[i] <= 10^9</li>\n  <li>-10^9 <= target <= 10^9</li>\n  <li>Only one valid answer exists.</li>\n</ul>",
        "followUp": "Can you come up with an algorithm that is less than O(n2) time complexity?",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "difficulty": "EASY",
        "isContestProblem": false,
        "point": 100,
        "categories": [
            "ARRAY",
            "HASH_TABLE"
        ],
        "hints": [
            {
                "description": "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions just for completeness. It is from these brute force solutions that you can come up with optimizations."
            },
            {
                "description": "So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?"
            },
            {
                "description": "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?"
            }
        ],
        "testCases": [
            {
                "input": "2 7 11 15\n9",
                "expectedOutput": "0 1",
                "isHidden": false
            },
            {
                "input": "3 2 4\n6",
                "expectedOutput": "1 2",
                "isHidden": false
            },
            {
                "input": "3 3\n6",
                "expectedOutput": "0 1",
                "isHidden": false
            }
        ]
    }
    return (
        <>
            {problem.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none"
                     dangerouslySetInnerHTML={{__html: problem.description}}/>
            )}
            <Separator/>

            {problem.constrains && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Ràng buộc</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none"
                         dangerouslySetInnerHTML={{__html: problem.constrains}}/>
                </div>
            )}
            {problem.followUp && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Mở rộng</h3>
                    <div
                        className="prose prose-sm text-muted-foreground dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{__html: problem.followUp}}/>
                </div>
            )}

            <div>
                <h3 className="text-sm font-semibold mb-2">Ví dụ</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Đầu vào</TableHead>
                            <TableHead>Đầu ra</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problem.testCases?.filter((t) => !t.isHidden).map((tc, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                                                    <pre
                                                                        className="whitespace-pre-wrap text-xs">{tc.input}</pre>
                                </TableCell>
                                <TableCell>
                                                                    <pre
                                                                        className="whitespace-pre-wrap text-xs">{tc.expectedOutput}</pre>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!problem.testCases?.filter((t) => !t.isHidden).length && (
                            <TableRow>
                                <TableCell colSpan={3}
                                           className="text-muted-foreground text-sm">Không
                                    có ví dụ mẫu</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hints">
                    <AccordionTrigger className="text-sm">Gợi ý</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {problem.hints?.length ? (problem.hints.map((h, idx) => (
                                <li key={idx}>{h.description}</li>
                            ))) : (<li>Không có gợi ý</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}