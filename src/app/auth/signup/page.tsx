'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Scale, Eye, EyeOff, Mail, Lock, User, Code2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import {notify} from "@/components/notify";

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const shownToast = useRef(false)
    const dateRef = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token && !shownToast.current) {
            shownToast.current = true
            toast.info('Đã đăng nhập', {
                description: 'Chuyển về trang chủ...',
                duration: 1500,
            })
            router.replace('/learn')
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            toast.error('Cảnh báo', {
                description: 'Mật khẩu không khớp',
                duration: 1500,
            })
            return
        }

        if (!formData.dob) {
            toast.error('Cảnh báo', {
                description: 'Ngày sinh là bắt buộc',
                duration: 1500,
            })
            return
        }

        setIsLoading(true)
        const body = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            dob: formData.dob,
        }

        try {
            const response = await apiPost('/auth/register', body)
            notify("success", {
                title: "Thành công",
                description: "Đăng ký thành công, chuyển đến trang đăng nhập...",
                duration: 1500,
            })
            router.replace('/auth/signin')
        } catch (err) {
            if (err instanceof Error) {
                switch (err.message) {
                    case 'HTTP error! status: 409':
                        notify("error", {
                            title: "Cảnh báo",
                            description: "Tài khoản đã được đăng ký",
                            duration: 1500,
                        })
                        break
                    default:
                        notify("error", {
                            title: "Lỗi",
                            description: "Có lỗi xảy ra, vui lòng thử lại",
                            duration: 1500,
                        })
                }
            }
        }
        setIsLoading(false)
    }

    const handleInputChange = ({field, value}: { field: any, value: any }) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/public" className="inline-flex items-center space-x-2 mb-4">
                        <Code2 className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-900">HocCode</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng Ký Tài Khoản</h1>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ Và Tên</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Họ và tên"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange({field: 'name', value: e.target.value})}
                                        className="pl-10 border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange({field: 'email', value: e.target.value})}
                                        className="pl-10 border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">Ngày Sinh</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleInputChange({ field: "dob", value: e.target.value })}
                                        className="pl-10 border-slate-300 focus:border-blue-500"
                                        required
                                        max={new Date().toISOString().split("T")[0]}
                                        ref={dateRef}
                                        onFocus={() => dateRef.current?.showPicker()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mật Khẩu</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange({field: 'password', value: e.target.value})}
                                        className="pl-10 pr-10 border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Xác nhận mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange({
                                            field: 'confirmPassword',
                                            value: e.target.value
                                        })}
                                        className="pl-10 pr-10 border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang Tạo Tài Khoản...' : 'Tạo Tài Khoản'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Bạn đã có tài khoản?{' '}
                                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}