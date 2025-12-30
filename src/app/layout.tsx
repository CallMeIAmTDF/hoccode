import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/sonner"
import {AuthProvider} from "@/lib/AuthProvider";
import {SocketProvider} from "@/context/SocketProvider";
import React from "react";
import Script from "next/script";
import ChatbotWrapper from "@/components/wrapper/ChatbotWrapper";
import("@monaco-editor/react");
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'HocCode - Code Để Học',
    description: 'Nền tảng hỗ trợ học lập trình',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <AuthProvider>
            <SocketProvider>
                {children}
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                />
                <ChatbotWrapper />
            </SocketProvider>
        </AuthProvider>

        <Toaster
            position="top-right"
            toastOptions={{
                duration: 2500,
                classNames: {
                    toast:
                        "rounded-xl shadow-lg border border-slate-200 bg-white p-4 flex items-start gap-3",
                    title: "font-semibold text-slate-800",
                    description: "text-sm text-slate-600",
                    actionButton:
                        "bg-blue-600 text-white rounded-lg px-3 py-1",
                    cancelButton:
                        "bg-slate-100 text-slate-600 rounded-lg px-3 py-1",
                },
            }}
        />
        </body>
        </html>
    );
}