// app/admin/problems/page.tsx
"use client"

import React, {useState, useMemo, useEffect} from 'react';
// Import các component UI
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
// Import Lucide Icons
import {
    FileText, PlusCircle, Search, Trash2, Edit, AlertTriangle, ArrowRight, Save,
    X, ListChecks, Clock, MemoryStick, MinusCircle, Lightbulb, Tag, Eye, Upload, Download, Code, Globe
} from 'lucide-react';
import {apiGet, apiPost, apiPut} from "@/lib/api";
import {toast} from "sonner";
import {notify} from "@/components/notify";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {mockSolutions, Solution} from "@/lib/types/solution";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import {SolutionEditorModal, SolutionProvider, useSolution} from "@/components/SolutionEditorModal";
import { Editor } from '@tinymce/tinymce-react';

// ====================================================================
// TYPES & MOCK DATA
// ====================================================================

interface Hint {
    id: number;
    description: string;
}

interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface Problem {
    id: number;
    title: string;
    description: string;
    constrains: string;
    followUp: string;
    timeLimit: number;
    memoryLimit: number;
    difficulty: string;
    point: number;
    categories: string[];
    accepted: boolean;
    passCount: number;
    failCount: number;
    hints?: Hint[];
    allTestCases?: TestCase[];
}

export interface AdminProblem extends Problem {
    deleted: boolean;
}

const CATEGORIES = [
    "ARRAY", "STRING", "HASH_TABLE", "DYNAMIC_PROGRAMMING", "MATH", "SORTING", "GREEDY",
    "DEPTH_FIRST_SEARCH", "BINARY_SEARCH", "DATABASE", "MATRIX", "TREE", "BREADTH_FIRST_SEARCH",
    "BIT_MANIPULATION", "TWO_POINTERS", "PREFIX_SUM", "HEAP", "SIMULATION", "BINARY_TREE",
    "GRAPH", "STACK", "COUNTING", "SLIDING_WINDOW", "DESIGN", "ENUMERATION", "BACKTRACKING",
    "UNION_FIND", "LINKED_LIST", "NUMBER_THEORY", "ORDERED_SET", "MONOTONIC_STACK",
    "SEGMENT_TREE", "TRIE", "COMBINATORICS", "BITMASK", "QUEUE", "RECURSION",
    "DIVIDE_AND_CONQUER", "BINARY_INDEXED_TREE", "MEMOIZATION", "GEOMETRY", "HASH_FUNCTION",
    "BINARY_SEARCH_TREE", "STRING_MATCHING", "SHORTEST_PATH", "TOPOLOGICAL_SORT", "ROLLING_HASH",
    "GAME_THEORY", "INTERACTIVE", "DATA_STREAM", "MONOTONIC_QUEUE", "BRAINTEASER",
    "DOUBLY_LINKED_LIST", "RANDOMIZED", "MERGE_SORT", "COUNTING_SORT", "ITERATOR",
    "CONCURRENCY", "PROBABILITY_AND_STATISTICS", "QUICKSELECT", "SUFFIX_ARRAY", "LINE_SWEEP",
    "MINIMUM_SPANNING_TREE", "BUCKET_SORT", "SHELL", "RESERVOIR_SAMPLING",
    "STRONGLY_CONNECTED_COMPONENT", "EULERIAN_CIRCUIT", "RADIX_SORT", "REJECTION_SAMPLING",
    "BICONNECTED_COMPONENT"
];

const mockProblems: AdminProblem[] = [
    {
        id: 1001,
        title: "Two Sum",
        difficulty: "EASY",
        point: 100,
        categories: ["ARRAY", "HASH_TABLE"],
        passCount: 12100,
        failCount: 3300,
        deleted: false,
        description: "Tìm hai số trong mảng có tổng bằng target.",
        constrains: "",
        followUp: "",
        timeLimit: 1,
        memoryLimit: 256,
        accepted: false,
        hints: [{
            id: 1, description: "Sử dụng Hash Map để lưu trữ các giá trị đã thấy."
        }],
        allTestCases: [
            {id: 1, input: "nums = [2,7,11,15]\ntarget = 9", expectedOutput: "[0, 1]", isHidden: false},
            {id: 2, input: "nums = [3,2,4]\ntarget = 6", expectedOutput: "[1, 2]", isHidden: true},
        ]
    },
    {
        id: 1002,
        title: "Merge Sorted Arrays",
        difficulty: "MEDIUM",
        point: 200,
        categories: ["ARRAY", "SORTING"],
        passCount: 5100,
        failCount: 3100,
        deleted: false,
        description: "Hợp nhất hai mảng đã sắp xếp.",
        constrains: "",
        followUp: "",
        timeLimit: 2,
        memoryLimit: 512,
        accepted: false
    },
    {
        id: 1003,
        title: "Longest Substring",
        difficulty: "HARD",
        point: 400,
        categories: ["STRING", "SLIDING_WINDOW"],
        passCount: 1200,
        failCount: 3300,
        deleted: false,
        description: "Tìm chuỗi con dài nhất không lặp ký tự.",
        constrains: "",
        followUp: "",
        timeLimit: 3,
        memoryLimit: 1024,
        accepted: false
    },
    {
        id: 1004,
        title: "Binary Tree Traversal",
        difficulty: "MEDIUM",
        point: 200,
        categories: ["TREE", "DEPTH_FIRST_SEARCH"],
        passCount: 3800,
        failCount: 2300,
        deleted: true,
        description: "Duyệt cây nhị phân.",
        constrains: "",
        followUp: "",
        timeLimit: 1.5,
        memoryLimit: 256,
        accepted: false
    },
    {
        id: 1005,
        title: "Dynamic Programming Challenge",
        difficulty: "EXPERT",
        point: 600,
        categories: ["DYNAMIC_PROGRAMMING"],
        passCount: 150,
        failCount: 1050,
        deleted: false,
        description: "Giải bài toán DP.",
        constrains: "",
        followUp: "",
        timeLimit: 5,
        memoryLimit: 1024,
        accepted: false
    },
    {
        id: 1012,
        title: "Longest Increasing Subsequence",
        difficulty: "HARD",
        point: 500,
        categories: ["DYNAMIC_PROGRAMMING", "ARRAY"],
        passCount: 900,
        failCount: 2100,
        deleted: false,
        description: "",
        constrains: "",
        followUp: "",
        timeLimit: 2,
        memoryLimit: 512,
        accepted: false
    },
];

const initialProblemState: AdminProblem = {
    id: 0, title: '', description: '', constrains: '', followUp: '',
    timeLimit: 1, memoryLimit: 256, difficulty: 'EASY', point: 100,
    categories: [], accepted: false, passCount: 0, failCount: 0, deleted: false,
    hints: [],
    allTestCases: []
};

// ====================================================================
// HELPERS (Giữ nguyên)
// ====================================================================

const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
        case "EASY":
            return <Badge variant="outline"
                          className="bg-green-100 text-green-600 border-green-300 font-semibold">Dễ</Badge>;
        case "MEDIUM":
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-300 font-semibold">Trung
                bình</Badge>;
        case "HARD":
            return <Badge variant="outline"
                          className="bg-orange-100 text-orange-600 border-orange-300 font-semibold">Khó</Badge>;
        case "EXPERT":
            return <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200 font-semibold">Chuyên
                gia</Badge>;
        default:
            return <Badge variant="outline" className="bg-gray-100 text-gray-600">Khác</Badge>;
    }
};

const getStatusBadge = (deleted: boolean) => {
    if (deleted) {
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Đã xóa (Ẩn)</Badge>;
    }
    return <Badge className="bg-blue-600 hover:bg-blue-700">Đang hoạt động</Badge>;
};


interface ProblemListViewProps {
    problems: AdminProblem[];
    onEdit: (problem: AdminProblem) => void;
    onAdd: () => void;
    onUpdateProblemStatus: (problemId: number, newDeletedStatus: boolean) => void;
}

const ProblemListView: React.FC<ProblemListViewProps> = (props) => {
    const {problems, onEdit, onAdd, onUpdateProblemStatus} = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const {openModal} = useSolution();

    // Phân trang States
    const [currentPage, setCurrentPage] = useState(1);
    const [problemsPerPage, setProblemsPerPage] = useState(5);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDifficulty]);

    const filteredProblems = useMemo(() => {
        return problems.filter(problem => {
            const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                problem.id.toString().includes(searchTerm.toLowerCase());
            const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty.toUpperCase() === filterDifficulty;
            return matchesSearch && matchesDifficulty;
        });
    }, [problems, searchTerm, filterDifficulty]);

    // Phân trang Logic
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);

    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleToggleDelete = async (problemId: number, isDeleted: boolean) => {
        try {
            const data = await apiPost<any>(`/problem/${problemId}`, {
            });
            notify("success", {
                title: "Thành công",
                description: `${isDeleted ? 'Khôi phục' : 'Xóa mềm'} thành công`
            })
            onUpdateProblemStatus(problemId, !isDeleted);

        } catch (err: any) {
            notify("error", {
                title: "Lỗi",
                description: `${isDeleted ? 'Khôi phục' : 'Xóa mềm'} không thành công`
            })
        }
    };

    // UI code giữ nguyên
    return (
        <div className="space-y-6">
            <Card className="shadow-md">
                <CardContent className="px-4 flex flex-col md:flex-row gap-4 items-center">

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
                        <Input
                            placeholder="Tìm kiếm theo ID hoặc Tiêu đề..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select onValueChange={setFilterDifficulty} defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Lọc theo Độ khó"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Độ khó</SelectItem>
                            <SelectItem value="EASY">Dễ</SelectItem>
                            <SelectItem value="MEDIUM">Trung bình</SelectItem>
                            <SelectItem value="HARD">Khó</SelectItem>
                            {/*<SelectItem value="EXPERT">Chuyên gia</SelectItem>*/}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={onAdd}
                        className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                    >
                        <PlusCircle className="w-5 h-5 mr-2"/>
                        Thêm mới
                    </Button>
                </CardContent>
            </Card>

            {/* Bảng Danh sách Problems */}
            <Card className="shadow-lg gap-1">
                <CardHeader className="pb-1">
                    <CardTitle className="text-xl font-semibold">Danh sách Thử thách</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[50px]">ID</TableHead>
                                <TableHead className="w-[330px]">Tiêu đề</TableHead>
                                <TableHead className="w-[110px]">Category</TableHead>
                                <TableHead className="w-[100px] text-center">Độ khó</TableHead>
                                <TableHead className="w-[50px] text-center">Điểm</TableHead>
                                <TableHead className="w-[80px] text-center">Tỉ lệ giải quyết</TableHead>
                                <TableHead className="w-[60px] text-center">Trạng thái</TableHead>
                                <TableHead className="w-[50px] text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentProblems.length > 0 ? (
                                currentProblems.map((problem) => {
                                    const totalSubmissions = problem.passCount + problem.failCount;
                                    const successRate = totalSubmissions > 0
                                        ? ((problem.passCount / totalSubmissions) * 100).toFixed(1)
                                        : '0.0';

                                    const displayedCategories = problem.categories.slice(0, 2);
                                    const remainingCategories = problem.categories.length - 2;

                                    return (
                                        <TableRow key={problem.id}
                                                  className={`hover:bg-blue-50/50 cursor-pointer ${problem.deleted ? 'opacity-70 bg-red-50/50' : ''}`}
                                                  onClick={() => onEdit(problem)}>
                                            <TableCell className="font-medium text-blue-600">{problem.id}</TableCell>
                                            <TableCell
                                                className="font-semibold text-gray-700">{problem.title}</TableCell>

                                            {/* CELL CATEGORY ĐÃ THÊM/CẬP NHẬT */}
                                            <TableCell className="py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {displayedCategories.map((category, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="text-xs bg-slate-100 text-slate-700 border-slate-300 font-medium"
                                                        >
                                                            {category}
                                                        </Badge>
                                                    ))}
                                                    {remainingCategories > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs bg-gray-100 text-gray-500 border-gray-300"
                                                        >
                                                            + {remainingCategories}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell
                                                className="text-center">{getDifficultyBadge(problem.difficulty)}</TableCell>
                                            <TableCell
                                                className="text-center font-bold text-orange-600">{problem.point}</TableCell>
                                            <TableCell className="text-center text-sm font-mono">
                                                {successRate}% ({problem.passCount}/{totalSubmissions})
                                            </TableCell>
                                            <TableCell
                                                className="text-center">{getStatusBadge(problem.deleted)}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    title={problem.deleted ? "Khôi phục" : "Xóa mềm"}
                                                    className="cursor-pointer"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleToggleDelete(problem.id, problem.deleted)
                                                    }}
                                                >
                                                    <Trash2
                                                        className={`w-4 h-4 ${problem.deleted ? 'text-green-500' : 'text-red-500'}`}/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8}
                                               className="h-24 text-center text-gray-500"> {/* CẬP NHẬT COLSPAN */}
                                        <AlertTriangle className="w-6 h-6 inline mr-2"/>
                                        Không tìm thấy Problems nào phù hợp với điều kiện tìm kiếm/lọc.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Footer (Phân trang) */}
                <div className="p-4 border-t flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span className="mr-2">Hiển thị:</span>
                        <Select onValueChange={(val) => setProblemsPerPage(Number(val))}
                                defaultValue={problemsPerPage.toString()}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue placeholder={problemsPerPage}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="hidden sm:inline">
                             Thử thách/trang
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                         <span className="font-semibold text-gray-700">
                            Trang {currentPage} trên {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <ArrowRight className="w-4 h-4 mr-1 rotate-180"/> Trước
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}>
                            Sau <ArrowRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


interface ProblemEditorViewProps {
    problem: AdminProblem;
    isNew: boolean;
    onCancel: () => void;
}

const ProblemEditorView: React.FC<ProblemEditorViewProps> = ({problem: initialProblem, isNew, onCancel}) => {
    const [problem, setProblem] = useState<AdminProblem>(initialProblem);
    const [loading, setLoading] = useState(false);
    const [selectedNewCategory, setSelectedNewCategory] = useState<string | null>(null);
    const [activeTestCaseId, setActiveTestCaseId] = useState<string>('0');
    // State mới để lưu thông báo lỗi validation
    const [validationError, setValidationError] = useState<string | null>(null);

    // LeetCode Import States
    const [isLeetCodeModalOpen, setIsLeetCodeModalOpen] = useState(false);
    const [leetCodeUrl, setLeetCodeUrl] = useState("");
    const [importingLeetCode, setImportingLeetCode] = useState(false);

    const {solutions, openModal, deleteSolution} = useSolution();
    const [problemSolutions, setProblemSolutions] = useState<Solution[]>([]);

    useEffect(() => {
        const fetchSolution = async () => {
            if (initialProblem != null){
                try {
                    const sol : Solution[] = await apiGet(`/admin/solution/${initialProblem?.id}`);
                    setProblemSolutions(sol);
                }catch (err: any){

                }
            }

        }
        fetchSolution()
    }, [initialProblem, solutions]);

    // Cập nhật Tab Test Case active khi data thay đổi
    React.useEffect(() => {
        if (problem.allTestCases && problem.allTestCases.length > 0) {
            const firstId = problem.allTestCases[0].id.toString();
            if (!problem.allTestCases.find(tc => tc.id.toString() === activeTestCaseId)) {
                setActiveTestCaseId(firstId);
            } else if (activeTestCaseId === '0') {
                setActiveTestCaseId(firstId);
            }
        }
    }, [problem.allTestCases, activeTestCaseId]);

    // --- Handlers chung ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setProblem(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
        // Reset validation error khi người dùng thay đổi input
        setValidationError(null);
    };

    const handleDifficultyChange = (value: string) => {
        setProblem(prev => ({...prev, difficulty: value}));
        setValidationError(null);
    };

    // --- Handlers Categories ---
    const handleAddCategory = (category: string) => {
        if (category && !problem.categories.includes(category)) {
            setProblem(prev => ({
                ...prev,
                categories: [...prev.categories, category]
            }));
        }
        setSelectedNewCategory(null);
    };

    const handleRemoveCategory = (category: string) => {
        setProblem(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category)
        }));
    };

    // --- Handlers Hints ---
    const handleAddHint = () => {
        setProblem(prev => ({
            ...prev,
            hints: [
                ...(prev.hints || []),
                {id: Date.now(), description: ""}
            ]
        }));
    };

    const handleHintChange = (id: number, value: string) => {
        setProblem(prev => ({
            ...prev,
            hints: (prev.hints || []).map(hint =>
                hint.id === id ? {...hint, description: value} : hint
            )
        }));
    };

    const handleRemoveHint = (id: number) => {
        setProblem(prev => ({
            ...prev,
            hints: (prev.hints || []).filter(hint => hint.id !== id)
        }));
    };

    // --- Handlers Test Cases ---
    const handleAddTestCase = () => {
        const newId = Date.now();
        const newTc: TestCase = {
            id: newId,
            input: "",
            expectedOutput: "",
            isHidden: true
        };
        setProblem(prev => ({
            ...prev,
            allTestCases: [
                ...(prev.allTestCases || []),
                newTc
            ]
        }));
        setActiveTestCaseId(newId.toString()); // Chuyển sang Tab mới
    };

    const handleTestCaseChange = (id: number, field: keyof TestCase, value: string | boolean) => {
        setProblem(prev => ({
            ...prev,
            allTestCases: (prev.allTestCases || []).map(tc =>
                tc.id === id ? {...tc, [field]: value} : tc
            )
        }));
        setValidationError(null);
    };

    const handleRemoveTestCase = (id: number) => {
        setProblem(prev => ({
            ...prev,
            allTestCases: (prev.allTestCases || []).filter(tc => tc.id !== id)
        }));
        // Nếu xóa tab đang active, chuyển về tab đầu tiên
        if (id.toString() === activeTestCaseId) {
            const remainingTcs = (problem.allTestCases || []).filter(tc => tc.id !== id);
            if (remainingTcs.length > 0) {
                setActiveTestCaseId(remainingTcs[0].id.toString());
            } else {
                setActiveTestCaseId('0');
            }
        }
    };

    // --- LeetCode Import Logic ---
    const handleImportFromLeetCode = async () => {
        if (!leetCodeUrl.trim()) {
            notify("error", { title: "Lỗi", description: "Vui lòng nhập URL LeetCode" });
            return;
        }

        setImportingLeetCode(true);
        try {
            // Giả định API endpoint là /admin/problem/leetcode và truyền url trong body
            const data = await apiPost<any>(`/problem/crawl`, { url: leetCodeUrl });

            // Map dữ liệu từ API LeetCode sang state của chúng ta
            // API return hints as array of objects { description: string }
            // API return testCases as array of objects { input, expectedOutput, isHidden }

            const importedHints = (data.hints || []).map((h: any, idx: number) => ({
                id: Date.now() + idx,
                description: h.description || ""
            }));

            const importedTestCases = (data.testCases || []).map((tc: any, idx: number) => ({
                id: Date.now() + 1000 + idx,
                input: tc.input || "",
                expectedOutput: tc.expectedOutput || "",
                isHidden: tc.isHidden ?? true
            }));

            setProblem(prev => ({
                ...prev,
                title: data.title || prev.title,
                description: data.description || prev.description,
                constrains: data.constrains || prev.constrains,
                followUp: data.followUp || prev.followUp,
                timeLimit: data.timeLimit || prev.timeLimit,
                memoryLimit: data.memoryLimit || prev.memoryLimit,
                difficulty: data.difficulty || prev.difficulty,
                point: data.point || prev.point,
                categories: data.categories || prev.categories,
                hints: importedHints,
                allTestCases: importedTestCases
            }));

            notify("success", {
                title: "Thành công",
                description: "Đã nạp dữ liệu từ LeetCode thành công!"
            });
            setIsLeetCodeModalOpen(false);
            setLeetCodeUrl("");
        } catch (err: any) {
            console.error(err);
            notify("error", {
                title: "Lỗi nhập liệu",
                description: "Không thể lấy dữ liệu từ LeetCode. Vui lòng kiểm tra lại URL hoặc thử lại sau."
            });
        } finally {
            setImportingLeetCode(false);
        }
    };

    // --- Import/Export Handlers ---
    const handleDownloadTemplate = () => {
        const template: TestCase[] = [
            {id: 1, input: "Input hàng 1\nInput hàng 2", expectedOutput: "Output hàng 1", isHidden: false},
            {id: 2, input: "Input khác", expectedOutput: "Output khác", isHidden: true},
        ];
        const jsonString = JSON.stringify(template, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test_case_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const importedCases: TestCase[] = JSON.parse(content);

                let currentMaxId = problem.allTestCases?.length || 0;
                const newTestCases: TestCase[] = importedCases.map((tc, index) => ({
                    ...tc,
                    id: Date.now() + index + (currentMaxId++),
                    input: String(tc.input || ''),
                    expectedOutput: String(tc.expectedOutput || ''),
                    isHidden: Boolean(tc.isHidden || false)
                }));

                setProblem(prev => ({
                    ...prev,
                    allTestCases: [...(prev.allTestCases || []), ...newTestCases]
                }));
                alert(`Import thành công ${newTestCases.length} Test Cases!`);
            } catch (error) {
                alert('Lỗi: File JSON không hợp lệ hoặc sai định dạng.');
                console.error("Import JSON Error:", error);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // --- HÀM VALIDATION MỚI (CẬP NHẬT) ---
    const validateProblem = (): string | null => {
        // 1. Kiểm tra các trường dữ liệu chung
        if (!problem.title.trim()) {
            return 'Tiêu đề Problem không được để trống.';
        }
        if (!problem.description.trim()) {
            return 'Mô tả Problem không được để trống.';
        }
        if (!problem.constrains.trim()) {
            return 'Ràng buộc (Constraints) không được để trống.';
        }

        // 2. Kiểm tra các trường số
        if (problem.point <= 0 || isNaN(problem.point)) {
            return 'Điểm phải là một số dương hợp lệ.';
        }
        if (problem.timeLimit <= 0 || isNaN(problem.timeLimit)) {
            return 'Giới hạn Thời gian (s) phải là một số dương hợp lệ.';
        }
        if (problem.memoryLimit <= 0 || isNaN(problem.memoryLimit)) {
            return 'Giới hạn Bộ nhớ (MB) phải là một số dương hợp lệ.';
        }

        // 3. Kiểm tra số lượng Test Case
        const testCases = problem.allTestCases || [];
        if (testCases.length === 0) {
            return 'Problem phải có ít nhất một Test Case.';
        }

        return null;
    };


    // --- Mock Save (Cập nhật gọi hàm Validation) ---
    const handleSave = async () => {
        const error = validateProblem();
        if (error) { // KIỂM TRA LỖI
            notify("error", {
                title: "Lỗi",
                description: error
            })
            return;
        }
        setLoading(true);
        console.log(`[ACTION MOCK] Dữ liệu Problem cuối cùng:`, problem);
        const createProblemRequest = {
            title: problem.title,
            description: problem.description,
            constrains: problem.constrains,
            followUp: problem.followUp,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            difficulty: problem.difficulty,
            point: problem.point,
            categories: problem.categories,
            hints: problem.hints?.map(h => h.description) || [],
            testCases: problem.allTestCases?.map(tc => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden
            })) || []
        };

        try {
            if (isNew) {
                const data = await apiPost<any>(`/problem`, createProblemRequest);
                notify("success", {
                    title: "Thành công",
                    description: `Thêm thành công Thử thách #${data.id}`
                })
            } else {
                const data = await apiPut<any>(`/problem/${initialProblem.id}`, {
                    ...createProblemRequest,
                    isContestProblem: false
                });
                notify("success", {
                    title: "Thành công",
                    description: `Sửa Thử thách #${initialProblem.id} thành công`
                })
            }
        } catch (err: any) {
            notify("error", {
                title: "Lỗi",
                description: `${isNew ? "Thêm" : "Sửa"} không thành công`
            })
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Edit className="w-7 h-7 text-orange-500"/>
                    {isNew ? 'Thêm Thử thách mới' : `Chỉnh sửa Thử thách #${problem.id}`}
                </h1>
                <div className="flex items-center gap-2">
                    {isNew && (
                        <Button
                            variant="outline"
                            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setIsLeetCodeModalOpen(true)}
                        >
                            {/*<Globe className="w-4 h-4 mr-2" />*/}
                            Nhập từ LeetCode
                        </Button>
                    )}
                    {/*<Button variant="outline" onClick={onCancel} disabled={loading}>*/}
                    {/*    /!*<X className="w-5 h-5 mr-2"/>*!/*/}
                    {/*    Hủy bỏ*/}
                    {/*</Button>*/}
                </div>
            </div>

            {/* HIỂN THỊ LỖI VALIDATION */}
            {validationError && (
                <div className="flex items-center p-3 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="flex-shrink-0 inline w-4 h-4 mr-3"/>
                    <span className="font-medium">Lỗi Validation:</span> {validationError}
                </div>
            )}

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tiêu đề & Độ khó */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="title">Tiêu đề Thử thách <span className="text-red-500">*</span></Label>
                            <Input id="title" name="title" value={problem.title} onChange={handleChange} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Độ khó <span className="text-red-500">*</span></Label>
                            <Select onValueChange={handleDifficultyChange} value={problem.difficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Độ khó"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">Dễ</SelectItem>
                                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                    <SelectItem value="HARD">Khó</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Giới hạn Cấu hình */}
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-2">
                        {/* Điểm */}
                        <div className="space-y-2 col-span-1">
                            <Label htmlFor="point">Điểm <span className="text-red-500">*</span></Label>
                            <Input id="point" name="point" type="number" min="10" value={problem.point}
                                   onChange={handleChange}/>
                        </div>
                        {/* Giới hạn thời gian */}
                        <div className="space-y-2 col-span-1">
                            <Label htmlFor="timeLimit">Giới hạn Thời gian (s) <span
                                className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input id="timeLimit" name="timeLimit" type="number" step="0.5" min="0.5"
                                       value={problem.timeLimit} onChange={handleChange} className="pr-10"/>
                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
                            </div>
                        </div>
                        {/* Giới hạn bộ nhớ */}
                        <div className="space-y-2 col-span-1">
                            <Label htmlFor="memoryLimit">Giới hạn Bộ nhớ (MB) <span
                                className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input id="memoryLimit" name="memoryLimit" type="number" min="64"
                                       value={problem.memoryLimit} onChange={handleChange} className="pr-12"/>
                                <MemoryStick
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
                            </div>
                        </div>
                        <div className="hidden lg:block lg:col-span-3"></div>
                        <div className="hidden md:block md:col-span-1 lg:hidden"></div>
                    </div>


                    {/* Categories/Tags */}
                    <div className="space-y-3 pt-2">
                        <Label htmlFor="categories" className="flex items-center gap-1 font-semibold">
                            Danh mục
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {problem.categories.map((tag, index) => (
                                <Badge
                                    key={index}
                                    className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                    onClick={() => handleRemoveCategory(tag)}
                                >
                                    {tag} <X className="w-3 h-3 ml-1"/>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Select onValueChange={setSelectedNewCategory} value={selectedNewCategory || ""}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Chọn Category để thêm..."/>
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.filter(c => !problem.categories.includes(c)).map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={() => selectedNewCategory && handleAddCategory(selectedNewCategory)}
                                disabled={!selectedNewCategory}
                                variant="secondary"
                            >
                                Thêm
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Mô tả chi tiết */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Mô tả chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả thử thách<span
                            className="text-red-500">*</span></Label>
                        <div className="border rounded-md overflow-hidden bg-white min-h-[250px]">
                            <Editor
                                apiKey="c7g3bowjbi9v4vokvur1e5uskxie7ky57ykmuzyouehu6hfh"
                                value={problem.description}
                                onEditorChange={(content) => {
                                    setProblem(prev => ({ ...prev, description: content }));
                                    setValidationError(null);
                                }}
                                init={{
                                    height: 250,
                                    menubar: false,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | code | help',
                                    content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px }',
                                    placeholder: 'Nhập mô tả đề bài chi tiết...'
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="constrains">Ràng buộc (Constraints) <span className="text-red-500">*</span></Label>
                            <Textarea id="constrains" name="constrains" rows={4} value={problem.constrains}
                                      onChange={handleChange} placeholder="VD: 1 <= n <= 10^5"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="followUp">Yêu cầu mở rộng (Follow Up)</Label>
                            <Textarea id="followUp" name="followUp" rows={4} value={problem.followUp}
                                      onChange={handleChange} placeholder="Yêu cầu tối ưu hoặc giải pháp thay thế."/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quản lý Hints */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        Gợi ý ({problem.hints?.length || 0})
                    </CardTitle>
                    <Button variant="secondary" size="sm" onClick={handleAddHint}>
                        Thêm Gợi ý
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(problem.hints || []).map((hint, index) => (
                            <div key={hint.id} className="flex items-center space-x-3">
                                <span className="font-medium text-gray-600 w-5 text-center">{index + 1}.</span>
                                <Input
                                    placeholder={`Nội dung Hint ${index + 1}...`}
                                    value={hint.description}
                                    onChange={(e) => handleHintChange(hint.id, e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveHint(hint.id)}
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                >
                                    <MinusCircle className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                        {(problem.hints?.length === 0) && (
                            <p className="text-center text-gray-500 italic">Chưa có gợi ý nào.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quản lý Test Cases */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        Test Cases <span
                        className="text-red-500">*</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                        {/* Import JSON */}
                        <label htmlFor="import-tc"
                               className="flex items-center justify-center h-9 px-4 py-2 bg-slate-100 text-sm font-medium rounded-md hover:bg-slate-200 cursor-pointer">
                            <Upload className="w-4 h-4 mr-1"/> Import JSON
                            <Input
                                id="import-tc"
                                type="file"
                                accept="application/json"
                                onChange={handleImportJson}
                                className="hidden"
                            />
                        </label>
                        {/* Download Template */}
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="w-4 h-4 mr-1"/> JSON mẫu
                        </Button>
                        {/* Add New Test Case */}
                        <Button variant="secondary" size="sm" onClick={handleAddTestCase}>
                            Thêm Test Case
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    {(problem.allTestCases?.length || 0) > 0 ? (
                        <Tabs value={activeTestCaseId} onValueChange={setActiveTestCaseId}>
                            <TabsList className="w-full justify-start overflow-x-auto">
                                {(problem.allTestCases || []).map((tc, index) => (
                                    <TabsTrigger
                                        key={tc.id}
                                        value={tc.id.toString()}
                                        className="relative group data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                                    >
                                        <div className="flex items-center">
                                            <Eye
                                                className={`w-3 h-3 mr-1 ${tc.isHidden ? 'text-red-500' : 'text-green-500'}`}/>
                                            TC #{index + 1}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {(problem.allTestCases || []).map((tc) => (
                                <TabsContent key={tc.id} value={tc.id.toString()}
                                             className="mt-4 border p-4 rounded-lg bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Input <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                rows={6}
                                                value={tc.input}
                                                onChange={(e) => handleTestCaseChange(tc.id, 'input', e.target.value)}
                                                placeholder="Nhập Input cho Test Case (mỗi giá trị/hàng)"
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expected Output <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                rows={6}
                                                value={tc.expectedOutput}
                                                onChange={(e) => handleTestCaseChange(tc.id, 'expectedOutput', e.target.value)}
                                                placeholder="Nhập Expected Output"
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <div className="flex items-center space-x-2 cursor-pointer">
                                            <Checkbox
                                                className="cursor-pointer"
                                                id={`hidden-${tc.id}`}
                                                checked={tc.isHidden}
                                                onCheckedChange={(checked) => handleTestCaseChange(tc.id, 'isHidden', checked as boolean)}
                                            />
                                            <label htmlFor={`hidden-${tc.id}`} className="text-sm font-medium cursor-pointer">
                                                Ẩn Test Case này (Hidden Test)
                                            </label>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveTestCase(tc.id)}
                                        >
                                            Xóa Test Case
                                        </Button>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : (
                        <p className="text-center text-red-500 italic font-medium">
                            <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5"/>
                            Cần ít nhất một Test Case để lưu Thử thách. Hãy thêm thủ công hoặc tải từ JSON.
                        </p>
                    )}
                </CardContent>
            </Card>

            {!isNew && (
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            Lời giải ({problemSolutions.length})
                        </CardTitle>
                        <Button size="sm" onClick={() => openModal(initialProblem)}>
                            Thêm Lời giải
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {problemSolutions.length === 0 ? (
                            <p className="text-center text-gray-500 py-8 italic">Chưa có lời nào cho bài này.</p>
                        ) : (
                            <div className="space-y-4">
                                {problemSolutions.map(sol => (
                                    <div key={sol.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="default">{sol.language}</Badge>
                                                    <span className="font-medium">Time: {sol.time}</span>
                                                    <span className="font-medium">Space: {sol.space}</span>
                                                </div>
                                                {sol.note && <p className="text-sm text-gray-700 mt-1">{sol.note}</p>}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Tạo bởi {sol.createdBy.split("@")[0]} • {new Date(sol.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openModal(initialProblem, sol)}>
                                                    <Edit className="w-4 h-4"/>
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => deleteSolution(sol.id)}>
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end space-x-4 sticky bottom-0 bg-white p-4 border-t shadow-inner z-10">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    {/*<X className="w-5 h-5 mr-2"/>*/}
                    Hủy bỏ
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {/*<Save className="w-5 h-5 mr-2"/>*/}
                    {loading ? (isNew ? 'Đang tạo...' : 'Đang lưu...') : (isNew ? 'Tạo Thử thách' : 'Lưu thay đổi')}
                </Button>
            </div>

            {/* Modal Nhập từ LeetCode */}
            <Dialog open={isLeetCodeModalOpen} onOpenChange={setIsLeetCodeModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nhập từ LeetCode</DialogTitle>
                        <DialogDescription>
                            Dán URL bài tập LeetCode vào bên dưới để tự động điền thông tin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="leetcode-url">URL Bài tập LeetCode</Label>
                            <Input
                                id="leetcode-url"
                                placeholder="https://leetcode.com/problems/two-sum/"
                                value={leetCodeUrl}
                                onChange={(e) => setLeetCodeUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLeetCodeModalOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleImportFromLeetCode}
                            disabled={importingLeetCode || !leetCodeUrl.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {importingLeetCode ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang lấy dữ liệu...
                                </>
                            ) : "Bắt đầu lấy dữ liệu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ====================================================================
// ROOT COMPONENT
// ====================================================================

const ProblemManagerRoot: React.FC = () => {
    const [editorMode, setEditorMode] = useState<AdminProblem | null>(null);
    const [problems, setProblems] = useState<AdminProblem[]>(mockProblems);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const data = await apiGet<AdminProblem[]>("/admin/problems")
                setProblems(data)
            } catch (err: any) {
                notify("error", {
                    title: "Lỗi",
                    description: "Không đủ quyền truy cập"
                })
            } finally {
                setLoading(false);
            }
        }

        if (!editorMode) {
            fetchProblem()
        }
    }, [editorMode]);

    const handleEdit = (problem: AdminProblem) => {
        setEditorMode(problem);
    };

    const handleUpdateProblemStatus = (problemId: number, newDeletedStatus: boolean) => {
        setProblems(prevProblems =>
            prevProblems.map(p =>
                p.id === problemId ? { ...p, deleted: newDeletedStatus } : p
            )
        );
    };

    const handleAdd = () => {
        const newId = problems.length > 0 ? Math.max(...problems.map(p => p.id)) + 1 : 1000;
        setEditorMode({...initialProblemState, id: newId});
    };

    const handleCancel = () => {
        setEditorMode(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner/>
            </div>
        );
    }

    return (
        <SolutionProvider>
            <div className="container mx-auto py-6">
                {editorMode ? (
                    <ProblemEditorView
                        problem={editorMode}
                        isNew={!problems.find(p => p.id === editorMode.id)}
                        onCancel={handleCancel}
                    />
                ) : (
                    <ProblemListView
                        problems={problems}
                        onEdit={handleEdit}
                        onAdd={handleAdd}
                        onUpdateProblemStatus={handleUpdateProblemStatus}
                    />
                )}
                <SolutionEditorModal/>
            </div>
        </SolutionProvider>
    );
};

export default ProblemManagerRoot;