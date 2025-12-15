import {Button} from "@/components/ui/button";
import { Clock, Edit, Lightbulb, MemoryStick, PlusCircle, Trash2} from "lucide-react";
import React from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Solution} from "@/lib/types/solution";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import MonacoEditorComponent from "@/components/hoccodeeditor";
import {Badge} from "@/components/ui/badge";

interface SolutionListTabProps {
    solutions: Solution[];
    onEdit: (solution: Solution) => void;
    onDelete: (solutionId: number, solutionName: string) => void;
    onAdd: () => void;
}
const formatDateTime = (isoString: string) => {
    try {
        // Format sang múi giờ địa phương (ví dụ: dd/mm/yyyy, hh:mm)
        return new Date(isoString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return "N/A";
    }
}
const SolutionListTab: React.FC<SolutionListTabProps> = ({ solutions, onEdit, onDelete, onAdd }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold">Tổng số {solutions.length} Giải pháp</h3>
                <Button onClick={onAdd} className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Thêm Giải pháp
                </Button>
            </div>

            {solutions.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground">
                    <Lightbulb className="w-8 h-8 mx-auto mb-3 text-primary"/>
                    <p>Bài toán này chưa có giải pháp nào được thêm vào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {solutions.map((sol) => (
                        <Card key={sol.id} className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader
                                className="flex flex-row items-center justify-between py-3 px-4 bg-indigo-50 dark:bg-card/50">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg">{sol.language.toUpperCase()} Solution</span>
                                    <Badge className="flex items-center gap-1" variant="outline">
                                        <Clock className="w-3 h-3"/> Time: {sol.time}
                                    </Badge>
                                    <Badge className="flex items-center gap-1" variant="outline">
                                        <MemoryStick className="w-3 h-3"/> Space: {sol.space}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(sol)}>
                                        <Edit className="w-4 h-4 mr-1"/> Sửa
                                    </Button>
                                    <Button size="sm" variant="destructive"
                                            onClick={() => onDelete(sol.id, `${sol.language} Solution`)}>
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1" className="border-none">
                                        <AccordionTrigger className="font-semibold text-base py-2 hover:no-underline">Mô
                                            tả và Code</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                                                {sol.note || "Không có mô tả chi tiết."}
                                            </p>
                                            <div className="relative border rounded-lg overflow-hidden h-[300px]">
                                                {/* Hiển thị Code Editor ở chế độ Read-Only */}
                                                <MonacoEditorComponent
                                                    height="100%"
                                                    language={sol.language}
                                                    value={sol.code}
                                                    options={{
                                                        readOnly: true,
                                                        fontSize: 13,
                                                        minimap: {enabled: false},
                                                    }}
                                                />
                                            </div>

                                            {/* CẬP NHẬT FOOTER DỰA TRÊN BASEENTITY */}
                                            <div className="text-xs text-right mt-2 text-muted-foreground space-x-2">
                                                <span>Được tạo bởi: **{sol.createdBy}** vào {formatDateTime(sol.createdAt)}</span>
                                                {sol.updatedAt && sol.updatedAt !== sol.createdAt && (
                                                    <span>| Cập nhật lần cuối bởi <b>{sol.updatedBy || sol.createdBy}</b> vào {formatDateTime(sol.updatedAt)}</span>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};