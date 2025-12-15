"use client"
import Link from "next/link"
import {Code2, Trophy, Swords, Users, LogIn, UserPlus, BookOpen, Brain, Rocket, Target} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Header} from "@/components/header";
import {useAuth} from "@/lib/AuthProvider";


export default function LandingPage() {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    // const pathname = usePathname();
    //
    // useEffect(() => {
    //     const token = localStorage.getItem('accessToken');
    //     setIsLoggedIn(!!token);
    // }, [pathname]);
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <Header/>

            {/* Hero Section */}
            <section className="py-20 text-center bg-gradient-to-b from-blue-700/10 to-background">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Học Lập Trình & Rèn Luyện Thuật Toán
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Nâng cao kỹ năng lập trình của bạn với các bài tập thực hành, cuộc thi thuật toán và mô phỏng
                        phỏng vấn thực tế.
                    </p>
                    <div className="flex justify-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <Link href="/auth/signin">
                                    <Button size="lg" className="bg-blue-700 hover:bg-blue-700/90">
                                        <UserPlus className="h-5 w-5 mr-2"/>
                                        Bắt Đầu Ngay
                                    </Button>
                                </Link>
                                <Link href="/learn">
                                    <Button size="lg" variant="outline">
                                        Xem Bài Tập
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/learn">
                                    <Button size="lg" className="bg-blue-700 hover:bg-blue-700/90">
                                        <Code2 className="h-4 w-4"/>
                                        Xem Bài Tập
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Tại Sao Chọn HocCode.io?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
                            <BookOpen className="h-12 w-12 text-blue-700 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Học Từng Bước</h3>
                            <p className="text-muted-foreground">
                                Các bài tập được thiết kế từ cơ bản đến nâng cao, phù hợp mọi trình độ.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
                            <Trophy className="h-12 w-12 text-blue-700 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Cuộc Thi Hấp Dẫn</h3>
                            <p className="text-muted-foreground">
                                Tham gia các cuộc thi thuật toán để thử thách và nâng cao kỹ năng.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
                            <Swords className="h-12 w-12 text-blue-700 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Thực Chiến</h3>
                            <p className="text-muted-foreground">
                                Luyện tập với các bài toán thực tế từ các công ty công nghệ hàng đầu.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
                            <Brain className="h-12 w-12 text-blue-700 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Học Hiệu Quả</h3>
                            <p className="text-muted-foreground">
                                Hệ thống gợi ý thông minh giúp bạn cải thiện điểm yếu nhanh chóng.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {
                !isLoggedIn && (
                    <section className="py-20 bg-blue-700/10 text-center">
                        <div className="mx-auto max-w-4xl px-6">
                            <h2 className="text-3xl font-bold mb-6">
                                Sẵn Sàng Chinh Phục Thế Giới Lập Trình?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Tham gia cùng hàng nghìn lập trình viên để rèn luyện kỹ năng và xây dựng sự nghiệp mơ ước.
                            </p>
                            <Link href="/auth/signin">
                                <Button size="lg" className="bg-blue-700 hover:bg-blue-700/90">
                                    <Rocket className="h-5 w-5 mr-2"/>
                                    Đăng Ký Miễn Phí
                                </Button>
                            </Link>
                        </div>
                    </section>
                )
            }

            {/* Footer */}
            <footer className="py-8 bg-background border-t">
                <div className="mx-auto max-w-7xl px-6">
                    {/*<div className="grid md:grid-cols-4 gap-8">*/}
                    {/*    <div>*/}
                    {/*        <h3 className="text-lg font-semibold mb-4">HocCode.io</h3>*/}
                    {/*        <p className="text-muted-foreground">*/}
                    {/*            Nền tảng học lập trình và luyện thuật toán hàng đầu.*/}
                    {/*        </p>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        <h3 className="text-lg font-semibold mb-4">Liên Kết</h3>*/}
                    {/*        <ul className="space-y-2">*/}
                    {/*            <li><Link href="/learn" className="text-muted-foreground hover:text-foreground">Luyện*/}
                    {/*                tập</Link></li>*/}
                    {/*            <li><Link href="/contest" className="text-muted-foreground hover:text-foreground">Thi*/}
                    {/*                đấu</Link></li>*/}
                    {/*            <li><Link href="/combat" className="text-muted-foreground hover:text-foreground">Thực*/}
                    {/*                chiến</Link></li>*/}
                    {/*            <li><Link href="/interview" className="text-muted-foreground hover:text-foreground">Phỏng*/}
                    {/*                vấn</Link></li>*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        <h3 className="text-lg font-semibold mb-4">Hỗ Trợ</h3>*/}
                    {/*        <ul className="space-y-2">*/}
                    {/*            <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>*/}
                    {/*            </li>*/}
                    {/*            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Liên*/}
                    {/*                hệ</Link></li>*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        <h3 className="text-lg font-semibold mb-4">Theo Dõi</h3>*/}
                    {/*        <ul className="space-y-2">*/}
                    {/*            <li><Link href="#"*/}
                    {/*                      className="text-muted-foreground hover:text-foreground">Twitter</Link></li>*/}
                    {/*            <li><Link href="#" className="text-muted-foreground hover:text-foreground">GitHub</Link>*/}
                    {/*            </li>*/}
                    {/*            <li><Link href="#"*/}
                    {/*                      className="text-muted-foreground hover:text-foreground">Discord</Link></li>*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="mt-8 text-center text-muted-foreground">
                        &copy; 2025 HocCode.io. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}