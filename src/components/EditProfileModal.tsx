
import React, {useEffect, useRef, useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {apiPost, apiPut} from '@/lib/api'; // Assuming apiPut exists, or use generic fetch
import { notify } from '@/components/notify';
import {Loader2, Save, User, Calendar, Image as ImageIcon, Pencil, Camera} from 'lucide-react';
import {UserInfo} from "@/lib/types/profile";
import {uploadToNuuls} from "@/utils/uploadToNuuls";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface EditProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: UserInfo | undefined;
    onUpdateSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
                                                                      open,
                                                                      onOpenChange,
                                                                      data,
                                                                      onUpdateSuccess,
                                                                  }) => {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        dob: '',
    });

    useEffect(() => {
        if (data) {
            let formattedDob = '';
            if (data.dob) {
                const date = new Date(data.dob);
                if (!isNaN(date.getTime())) {
                    formattedDob = date.toISOString().split('T')[0];
                }
            }

            setFormData({
                name: data.name || '',
                avatar: data.avatar || '',
                dob: formattedDob,
            });
        }
    }, [data, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAvatarClick = () => {
        if (!uploadingImage) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notify('error', { title: 'Lỗi định dạng', description: 'Vui lòng chọn file ảnh.' });
            return;
        }

        setUploadingImage(true);
        try {
            const url = await uploadToNuuls(file);

            await new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load image resource"));
            });

            setFormData(prev => ({ ...prev, avatar: url }));
            notify('success', { title: 'Upload thành công', description: 'Ảnh đại diện đã được tải lên.' });
        } catch (error) {
            console.error(error);
            notify('error', { title: 'Upload thất bại', description: 'Không thể tải ảnh lên server hoặc ảnh bị lỗi.' });
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiPost<any>('/users', {
                name: formData.name,
                avatar: formData.avatar,
                dob: formData.dob ? new Date(formData.dob).toISOString() : null
            });

            notify('success', {
                title: 'Cập nhật thành công',
                description: 'Thông tin cá nhân đã được lưu.',
            });

            onUpdateSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Update profile error:', error);
            notify('error', {
                title: 'Lỗi cập nhật',
                description: 'Không thể lưu thông tin. Vui lòng thử lại.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] bg-white overflow-hidden">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {/*<User className="w-5 h-5 text-indigo-600" />*/}
                        Chỉnh sửa hồ sơ
                    </DialogTitle>
                    <DialogDescription>
                        Thay đổi thông tin hiển thị của bạn trên hệ thống.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-6">

                    {/* Avatar Selection Section */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <Avatar className="w-28 h-28 border-4 border-slate-100 shadow-md transition-opacity group-hover:opacity-90">
                                <AvatarImage src={formData.avatar || formData.name?.charAt(0).toUpperCase()} className="object-cover" />
                                <AvatarFallback className="text-3xl bg-indigo-50 text-indigo-500 font-bold">
                                    {formData.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Loading Overlay */}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}

                            {/* Edit Icon Badge */}
                            {!uploadingImage && (
                                <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-200 z-10 hover:bg-slate-50 transition-colors">
                                    <Pencil className="w-4 h-4 text-slate-700" />
                                </div>
                            )}

                            {/* Hover Overlay Hint (Optional) */}
                            {!uploadingImage && (
                                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Nhấn vào ảnh để thay đổi</p>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-4 px-1">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 font-semibold flex items-center gap-2">
                                Tên hiển thị
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Nhập tên của bạn"
                                className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-indigo-500 h-11"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* DOB Input */}
                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-slate-700 font-semibold flex items-center gap-2">
                                {/*<Calendar className="w-4 h-4 text-indigo-500" />*/}
                                Ngày sinh
                            </Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-indigo-500 h-11 w-full"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading || uploadingImage}
                            className="h-11"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] h-11 shadow-sm"
                            disabled={loading || uploadingImage}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    {/*<Save className="w-4 h-4 mr-2" />*/}
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
