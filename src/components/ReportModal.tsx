// src/components/ReportModal.tsx (Giả định)

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notify } from "@/components/notify";
import {Bug, CheckCircle, FileText, Settings, Trophy} from "lucide-react";
import {apiPost} from "@/lib/api"; // Giả định notify đã được import


export enum ReportTypeEnum {
    SYSTEM = "SYSTEM",
    PROBLEM = "PROBLEM",
    CONTEST = "CONTEST",
    SUBMISSION = "SUBMISSION",
    OTHER = "OTHER"
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: string;
    type?: ReportTypeEnum;
    defaultTitle?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, target, defaultTitle = "", type = ReportTypeEnum.SYSTEM }) => {
    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState('');
    const [reportType, setReportType] = useState<ReportTypeEnum>(type);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !reportType) {
            notify("error", {
                title: "Lỗi dữ liệu",
                description: "Vui lòng nhập đầy đủ thông tin"
            })
            return;
        }
        setIsSubmitting(true);
        try {
            const requestData = {
                title,
                description,
                type: reportType,
                target: target,
            };

            console.log("Submitting Report:", requestData);

            // Giả lập API call
            await apiPost<any>("/report", requestData)
            notify("success", { title: "Thành công", description: "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất." });
            onClose();
            setTitle(defaultTitle);
            setDescription('');
        } catch (error : any) {
            // console.log(error)
            if(error == "Error: Chứa từ ngữ nhạy cảm"){
                notify("error", {
                    title: "Lỗi gửi dữ liệu",
                    description: "Chứa từ ngữ nhạy cảm"
                })
            }else{
                notify("error", {
                    title: "Lỗi gửi dữ liệu",
                    description: "Dữ liệu không được gửi thành công"
                })
            }

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Báo cáo lỗi / Đóng góp ý kiến</DialogTitle>
                    <DialogDescription>
                        Báo cáo một lỗi, nội dung không chính xác hoặc đề xuất cải tiến giúp hệ thống phát tiển hơn.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Loại Report */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reportType" className="text-right">
                            Loại
                        </Label>
                        {/* THAY ĐỔI LOẠI REPORT Ở ĐÂY */}
                        <Select value={reportType} onValueChange={(value) => setReportType(value as ReportTypeEnum)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn loại báo cáo"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ReportTypeEnum.SYSTEM} className="flex items-center">
                                    <div className="flex items-center">
                                        <Settings className="w-4 h-4 mr-2 text-gray-500" />
                                        Lỗi Hệ thống
                                    </div>
                                </SelectItem>
                                <SelectItem value={ReportTypeEnum.PROBLEM} className="flex items-center">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                        Lỗi Thử Thách
                                    </div>
                                </SelectItem>
                                <SelectItem value={ReportTypeEnum.CONTEST} className="flex items-center">
                                    <div className="flex items-center">
                                        <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
                                        Lỗi Cuộc thi
                                    </div>
                                </SelectItem>
                                <SelectItem value={ReportTypeEnum.SUBMISSION} className="flex items-center">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                        Lỗi Kết quả chấm
                                    </div>
                                </SelectItem>
                                <SelectItem value={ReportTypeEnum.OTHER} className="flex items-center">
                                    <div className="flex items-center">
                                        <Bug className="w-4 h-4 mr-2 text-green-600" />
                                        Lỗi Khác
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tiêu đề */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Tiêu đề
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="Tóm tắt vấn đề bạn gặp phải"
                        />
                    </div>

                    {/* BỎ PHẦN Error ID - vì không cần thiết nữa */}

                    {/* Mô tả */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Mô tả chi tiết
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3 min-h-[100px]"
                            placeholder="Mô tả chi tiết lỗi, cách tái hiện, hoặc đề xuất của bạn."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportModal;