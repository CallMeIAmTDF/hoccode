'use client';

import {usePathname} from 'next/navigation';
import {Chatbot} from "@/components/Chatbot";
import {useAuth} from "@/lib/AuthProvider";

export default function ChatbotWrapper() {
    const {isLoggedIn} = useAuth();
    const pathname = usePathname();

    const shouldHideChatbot =
        pathname.startsWith('/admin') ||
        isLearnProblemDetail(pathname) ||
        isContestProblemDetail(pathname) ||
        isInterviewPage(pathname) ||
        isCombatPage(pathname) || !isLoggedIn;

    if (shouldHideChatbot) return null;

    return <Chatbot/>;
}

function isLearnProblemDetail(pathname: string) {
    // /learn/123
    return /^\/learn\/[^/]+$/.test(pathname);
}

function isContestProblemDetail(pathname: string) {
    // /contest/456/problem/789
    return /^\/contest\/[^/]+\/problem\/[^/]+$/.test(pathname);
}

function isInterviewPage(pathname: string) {
    return /^\/interview(\/.*)?$/.test(pathname);
}

function isCombatPage(pathname: string) {
    return /^\/combat(\/.*)?$/.test(pathname);
}