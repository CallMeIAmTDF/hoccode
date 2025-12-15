"use client"

import React, { useState } from 'react';
import { Crown, Check, Zap, Bot, Code, MessageCircle, ArrowRight, X, Lock } from 'lucide-react';
import {Header} from "@/components/header";

export default function UpgradePage() {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const freeFeatures = [
        {
            icon: <Code className="h-5 w-5" />,
            title: "Giải bài tập cơ bản",
            description: "Truy cập hơn 500+ bài tập lập trình miễn phí",
            status: "free"
        },
        {
            icon: <Bot className="h-5 w-5" />,
            title: "AI Code Helper",
            description: "5 lượt hỗ trợ AI mỗi ngày",
            status: "limited"
        },
        {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "AI Code Review",
            description: "3 lần review code mỗi tuần",
            status: "limited"
        }
    ];

    const premiumFeatures = [
        {
            icon: <Zap className="h-5 w-5" />,
            title: "AI Code Helper không giới hạn",
            description: "Sử dụng AI để giải thích, debug và tối ưu code bất cứ lúc nào",
            status: "premium"
        },
        {
            icon: <Bot className="h-5 w-5" />,
            title: "AI Code Review không giới hạn",
            description: "Nhận feedback chi tiết về code từ AI với quality cao",
            status: "premium"
        },
        {
            icon: <Code className="h-5 w-5" />,
            title: "Truy cập tất cả bài tập Premium",
            description: "Hơn 1000+ bài tập nâng cao và contest độc quyền",
            status: "premium"
        },
        {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "AI Interview Practice",
            description: "Luyện tập phỏng vấn với AI mentor cá nhân hóa",
            status: "premium"
        }
    ];

    const handleUpgrade = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = () => {
        localStorage.setItem("premium", "true");
        setShowPaymentModal(false);
        alert("🎉 Chúc mừng! Bạn đã nâng cấp thành công lên Premium!");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header></Header>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-6 text-center">
                        <div
                            className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-2">
                            <Crown className="h-4 w-4"/>
                            <span>Nâng cấp Premium</span>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Mở khóa toàn bộ chức năng
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-3">
                            Nâng cao kỹ năng lập trình với AI không giới hạn và tất cả tính năng
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Current vs Premium Comparison */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-16">
                        {/* Free Plan */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Miễn phí</h3>
                                <p className="text-gray-600">Hiện tại của bạn</p>
                            </div>

                            <div className="space-y-4">
                                {freeFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="bg-gray-100 rounded-lg p-2 text-gray-600 mt-1">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                            {feature.status === 'limited' && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Lock className="h-3 w-3 text-orange-500"/>
                                                    <span
                                                        className="text-xs text-orange-600 font-medium">Có giới hạn</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-white rounded-xl border-2 border-orange-200 p-6 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Premium
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Lifetime</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="text-3xl font-bold text-gray-900">10,000</span>
                                    <span className="text-gray-600">vnđ</span>
                                </div>
                                <p className="text-sm text-gray-600">Trả một lần, sử dụng trọn đời</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {premiumFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="bg-orange-100 rounded-lg p-2 text-orange-600 mt-1">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                        </div>
                                        <div className="bg-green-100 rounded-full p-1 mt-1">
                                            <Check className="h-3 w-3 text-green-600"/>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                            >
                                <Crown className="h-5 w-5"/>
                                Nâng cấp Premium
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    </div>

                    {/* Why Premium */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                            Tại sao nên chọn Premium?
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div
                                    className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Bot className="h-8 w-8 text-blue-600"/>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">AI Không giới hạn</h3>
                                <p className="text-sm text-gray-600">
                                    Sử dụng AI helper và code review bao nhiêu lần cũng được, không lo hết quota
                                </p>
                            </div>

                            <div className="text-center">
                                <div
                                    className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Code className="h-8 w-8 text-green-600"/>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Nội dung độc quyền</h3>
                                <p className="text-sm text-gray-600">
                                    Truy cập 1000+ bài tập nâng cao và các contest chỉ dành cho thành viên Premium
                                </p>
                            </div>

                            <div className="text-center">
                                <div
                                    className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-8 w-8 text-purple-600"/>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Trả một lần</h3>
                                <p className="text-sm text-gray-600">
                                    Không như các dịch vụ khác, bạn chỉ cần trả một lần và sử dụng trọn đời
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Được hơn 10,000+ lập trình viên tin tưởng
                        </p>
                        <div className="flex justify-center gap-1 text-orange-400">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                                    <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Xác nhận nâng cấp</h3>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5"/>
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <div
                                    className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Crown className="h-8 w-8 text-orange-500"/>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Premium Lifetime</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Truy cập không giới hạn tất cả tính năng AI và nội dung premium
                                </p>
                                <div className="text-2xl font-bold text-gray-900">
                                    2,990,000đ
                                </div>
                                <p className="text-sm text-gray-500">Trả một lần • Sử dụng trọn đời</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePaymentConfirm}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Xác nhận thanh toán
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Hoàn tiền 100% trong vòng 7 ngày nếu không hài lòng
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}