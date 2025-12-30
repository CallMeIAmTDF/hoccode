"use client"

import React, {useEffect, useState} from "react";
import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Chatbot} from "@/components/Chatbot";


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
        <Chatbot></Chatbot>
        </>
    );
}