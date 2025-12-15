'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    Code as CodeIcon,
    Timer,
    AreaChart,
    Lightbulb,
    CodeXml // Icon mới cho Language
} from 'lucide-react';

import { Solution } from "@/lib/types/solution";
import { getMonacoLanguage, processSolutions } from '@/utils/solution-utils';

// Import shadcn/ui components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from "next/dynamic";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false, loading: () => <div className="flex justify-center items-center w-full h-full"><Spinner/></div>,
})
interface SolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    solutions: Solution[];
}

// Giữ nguyên kích thước Editor, giảm padding trong modal
const MODAL_WIDTH = '72vw';
const EDITOR_HEIGHT = '250px'; // Giảm nhẹ chiều cao editor để dành chỗ cho Note

const SolutionModal: React.FC<SolutionModalProps> = ({ isOpen, onClose, solutions }) => {
    const processedSolutions = useMemo(() => processSolutions(solutions), [solutions]);
    const defaultTabValue = processedSolutions[0]?.key || '';

    const [activeTab, setActiveTab] = useState<string>(defaultTabValue);

    useEffect(() => {
        if (processedSolutions.length > 0 && activeTab !== defaultTabValue) {
            setActiveTab(defaultTabValue);
        }
    }, [processedSolutions, defaultTabValue]);

    const currentSolution = processedSolutions.find(s => s.key === activeTab);

    if (processedSolutions.length === 0) {
        // ... (Modal rỗng giữ nguyên) ...
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-w-[95vw] p-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CodeIcon className="w-5 h-5 mr-2" />
                            Sample Solutions
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-gray-500">
                        Không có solution mẫu nào được cung cấp.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={`sm:max-w-[${MODAL_WIDTH}] max-w-[80vw] max-h-[90vh] h-fit p-0 overflow-hidden flex flex-col`}
                style={{ width: MODAL_WIDTH }}
            >
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="flex items-center">
                        <CodeIcon className="w-5 h-5 mr-2" />
                        Sample Solutions
                    </DialogTitle>
                    <Separator className="mt-2" />
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
                    {/* Tabs List */}
                    <div className="px-4 pt-2 pb-0 overflow-x-auto whitespace-nowrap bg-gray-50 border-b">
                        <TabsList className="h-auto">
                            {processedSolutions.map((solution) => (
                                <TabsTrigger
                                    key={solution.key}
                                    value={solution.key}
                                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    {solution.tabName}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Content for each tab */}
                    {processedSolutions.map((solution) => (
                        <TabsContent key={solution.key} value={solution.key} className="flex-grow m-0 overflow-hidden">
                            <div className="p-4 pt-3 h-full flex flex-col gap-3"> {/* Giảm padding, tăng gap */}

                                {/* 🌟 HÀNG 1: Time, Space, Language (3 cột) */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* 1. Time Complexity Card */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <Timer className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-500">
                                                Time Complexity
                                            </span>
                                            <Badge variant="outline" className="text-indigo-600 font-bold text-sm h-6">
                                                {solution.time || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* 2. Space Complexity Card */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <AreaChart className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-500">
                                                Space Complexity
                                            </span>
                                            <Badge variant="outline" className="text-emerald-600 font-bold text-sm h-6">
                                                {solution.space || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* 3. Language Card (Mới) */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <CodeXml className="w-5 h-5 text-sky-600 flex-shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-500">
                                                Ngôn ngữ
                                            </span>
                                            <Badge variant="outline" className="text-sky-600 font-bold text-sm h-6">
                                                {solution.language || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* 🌟 HÀNG 2: Solution Note (1 cột) */}
                                <Card className="col-span-3 border-blue-200 bg-blue-50 gap-1 px-1 py-4">
                                    <CardHeader className="pb-0">
                                        <CardTitle className="text-l font-semibold text-blue-800 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-blue-600" />
                                            Lưu ý
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 pt-0">
                                        <div className="max-h-20 overflow-y-auto no-scrollbar">
                                            <p className="text-sm text-blue-900 leading-snug italic break-all">
                                                {solution.note || 'Không có ghi chú nào cho solution này.'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* HÀNG 3: Monaco Editor Container */}
                                <div
                                    className="border rounded-lg overflow-hidden shadow-md"
                                    style={{ height: EDITOR_HEIGHT }}
                                >
                                    <MonacoEditor className={"readonly"}
                                        width="100%"
                                        theme="vs-dark"
                                        height="100%"
                                        language={getMonacoLanguage(solution.language)}
                                        value={solution.code}
                                        options={{
                                            readOnly: true,
                                            domReadOnly: true,
                                            readOnlyMessage: {
                                                value: "This is an exemple message, replace me by an empty string to remove the popup",
                                                isTrusted: true
                                            },
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on',
                                            fontSize: 14,
                                            // renderValidationDecorations: "off"
                                        }}

                                    />
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default SolutionModal;