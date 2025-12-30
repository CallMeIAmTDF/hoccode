import {Bot, Flag, HelpCircle, Loader2, MessageCircle, Send, Sparkles, Terminal, Trash2, X} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import {apiGet, apiPost} from "@/lib/api";

const SUGGESTIONS = [
    "Làm sao để cải thiện tư duy thuật toán?",
    "Giải thích về độ phức tạp thời gian O(n)?",
    "Lộ trình học tập cho người mới bắt đầu?"
];

const COMMANDS = [
    {cmd: '/help', desc: 'Hiển thị hướng dẫn sử dụng', icon: <HelpCircle className="w-4 h-4"/>},
    {cmd: '/report', desc: 'Báo cáo lỗi (VD: /report Lỗi giao diện)', icon: <Flag className="w-4 h-4"/>},
    {cmd: '/clear', desc: 'Xóa lịch sử trò chuyện', icon: <Trash2 className="w-4 h-4"/>},
];

interface ChatResponse {
    answer: string
}

const PROMPT_MESSAGE = "Bạn cần gợi ý gì không?"

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot' | 'system', text: string }[]>([
        {
            role: 'bot',
            text: 'Chào bạn! Mình là HocCodeBot. Nhấn `/` để xem các lệnh hỗ trợ hoặc chọn gợi ý bên dưới nhé!'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [promptIndex, setPromptIndex] = useState(0);
    const [showPrompt, setShowPrompt] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setShowPrompt(false);
            return;
        }

        let showTimeout: ReturnType<typeof setTimeout>;
        let hideTimeout: ReturnType<typeof setTimeout>;
        let loopTimeout: ReturnType<typeof setTimeout>;

        const loop = () => {
            showTimeout = setTimeout(() => {
                setShowPrompt(true);
                hideTimeout = setTimeout(() => {
                    setShowPrompt(false);
                    loopTimeout = setTimeout(loop, 4000);
                }, 2000);
            }, 2000);
        };

        loop();

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
            clearTimeout(loopTimeout);
        };
    }, [isOpen]);

    const handleCommand = (fullText: string) => {
        const parts = fullText.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        setShowCommands(false);

        if (cmd === '/clear') {
            setMessages([{role: 'bot', text: 'Lịch sử đã được dọn dẹp. Mình có thể giúp gì thêm cho bạn?'}]);
            return true;
        }

        if (cmd === '/help') {
            setMessages(prev => [
                ...prev,
                {role: 'user', text: '/help'},
                {
                    role: 'bot',
                    text: 'Đây là danh sách lệnh của mình:\n- `/help`: Xem trợ giúp\n- `/report [nội dung]`: Báo cáo lỗi hoặc góp ý\n- `/clear`: Xóa lịch sử chat hiện tại.'
                }
            ]);
            return true;
        }

        if (cmd === '/report') {
            return false;
        }

        return false;
    };

    const handleSend = async (forcedMessage?: string) => {
        const textToSend = forcedMessage || input.trim();
        if (!textToSend || isTyping) return;

        setInput('');
        setShowCommands(false);

        if (textToSend.startsWith('/')) {
            const wasCommand = handleCommand(textToSend);
            if (wasCommand) return;
        }

        setMessages(prev => [...prev, {role: 'user', text: textToSend}]);
        setIsTyping(true);
        setMessages(prev => [...prev, { role: 'bot', text: "" }]);

        try {
            const body = {
                question: textToSend
            }
            const message = await apiPost<ChatResponse>(`/chat`, body);

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = message.answer;
                return newMessages;
            });
        } catch (error : any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {role: 'bot', text: 'Hệ thống đang bận một chút, bạn thử lại sau nhé!'}]);
        } finally {
            setIsTyping(false);
        }
    };

    const onInputChange = (val: string) => {
        setInput(val);
        if (val === '/') setShowCommands(true);
        else if (!val.startsWith('/')) setShowCommands(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="mb-4 w-[310px] sm:w-[330px] h-[460px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
                    {/* Header */}
                    <div
                        className="p-3.5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div
                                    className={`w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/20 ${isTyping ? 'animate-pulse' : ''}`}>
                                    <Bot className="w-4 h-4 text-white"/>
                                </div>
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-indigo-700 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[12px] leading-none">HocCodeBot</h3>
                                <p className="text-[9px] opacity-70 mt-1 uppercase tracking-tighter font-semibold">Trực
                                    tuyến</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-all active:scale-90">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>

                    {/* Messages Area - Font size 11.5px */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 no-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx}
                                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-[11.5px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-200/50 rounded-tl-none'
                                    }`}>
                                    {msg.text || (
                                        <div className="flex gap-1 py-1">
                                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div
                                                className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>

                    {/* Suggestions */}
                    {!isTyping && messages.length < 4 && (
                        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                            {SUGGESTIONS.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s)}
                                        className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input - Font size 12px */}
                    <div className="p-3 bg-white border-t border-slate-50 relative">
                        {showCommands && (
                            <div
                                className="absolute bottom-full left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-xl mb-2 overflow-hidden animate-in slide-in-from-bottom-2">
                                {COMMANDS.map((c) => (
                                    <button key={c.cmd} onClick={() => {
                                        setInput(c.cmd === '/report' ? '/report ' : c.cmd);
                                        setShowCommands(false);
                                        if (c.cmd !== '/report') handleSend(c.cmd);
                                    }}
                                            className="w-full p-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                        <div
                                            className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">{c.icon}</div>
                                        <div className="text-left"><span
                                            className="block text-[11px] font-bold text-slate-700">{c.cmd}</span><span
                                            className="text-[9px] text-slate-400">{c.desc}</span></div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Nhập '/' hoặc đặt câu hỏi..."
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (e.target.value === '/') setShowCommands(true); else if (!e.target.value.startsWith('/')) setShowCommands(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border-none rounded-xl text-[12px] focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none text-slate-800"
                            />
                            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                                    className="absolute right-1 w-8 h-8 flex items-center justify-center text-indigo-600 disabled:opacity-20 transition-all active:scale-90">
                                {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> :
                                    <Send className="w-3.5 h-3.5"/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Engagement Tooltip - Optimized for Smooth Transition */}
            {!isOpen && (
                <div
                    className={`mb-3 px-4 py-2 bg-white border border-indigo-100 rounded-2xl shadow-xl
        text-[11px] font-bold text-indigo-600 transition-all duration-700 ease-in-out
        transform cursor-pointer whitespace-nowrap relative
        ${showPrompt ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}
                    onClick={() => setIsOpen(true)}
                >
                    {PROMPT_MESSAGE}
                    <div
                        className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-indigo-100 rotate-45"/>
                </div>
            )}

            {/* Toggle Button */}
            <div className="relative group">
                {!isOpen && (
                    <div
                        className="absolute inset-0 bg-indigo-500 rounded-2xl blur-md opacity-30 animate-pulse group-hover:opacity-60 transition-opacity"></div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                        isOpen ? 'bg-white text-indigo-600 border border-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    {isOpen ? <X className="w-5 h-5"/> : (
                        <div className="relative">
                            <MessageCircle className="w-6 h-6"/>

                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
