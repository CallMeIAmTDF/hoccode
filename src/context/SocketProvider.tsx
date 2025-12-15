"use client";
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

type SocketContextType = {
    client: Client | null;
    isConnected: boolean;
    subscribe: (topic: string, callback: (message: any) => void) => StompSubscription | null;
    send: (destination: string, body: any) => void;
    reconnect: () => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [reconnectTrigger, setReconnectTrigger] = useState(0);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            console.log("🔌 Disconnecting existing client...");
            clientRef.current.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const reconnect = useCallback(() => {
        console.log("🔄 Manual reconnect triggered");
        disconnect();
        setReconnectTrigger(prev => prev + 1);
    }, [disconnect]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userEmail = localStorage.getItem("email");

        // Không connect nếu chưa có token
        if (!token) {
            console.log("⏸️ No token found, skipping WebSocket connection");
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

        console.log("🔌 Initializing WebSocket connection...");
        const socket = new SockJS(socketUrl);

        const client = new Client({
            webSocketFactory: () => socket as any,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                ...(userEmail ? { email: userEmail } : {}),
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log("STOMP:", str);
                }
            }
        });

        client.onConnect = () => {
            console.log("✅ WebSocket Connected");
            setIsConnected(true);
            clientRef.current = client;
        };

        client.onDisconnect = () => {
            console.log("🔌 WebSocket Disconnected");
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.error("❌ STOMP Error:", frame.headers['message']);
            setIsConnected(false);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [reconnectTrigger]); // Re-run khi reconnectTrigger thay đổi

    // Auto-reconnect khi phát hiện token mới
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("accessToken");
            const wasConnected = clientRef.current?.connected;

            // Nếu có token mới mà chưa connect, trigger reconnect
            if (token && !wasConnected) {
                console.log("🔄 Token detected, auto-reconnecting...");
                reconnect();
            }
        };

        // Check ngay lập tức
        checkToken();

        // Setup interval để check định kỳ (fallback)
        const interval = setInterval(checkToken, 1000);

        // Listen storage event (khi tab khác thay đổi localStorage)
        window.addEventListener('storage', checkToken);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkToken);
        };
    }, [reconnect]);

    const subscribe = useCallback((topic: string, callback: (message: any) => void): StompSubscription | null => {
        if (!clientRef.current?.connected) {
            console.warn(`⏳ Cannot subscribe to ${topic}: not connected`);
            return null;
        }

        console.log(`📡 Subscribing to ${topic}`);
        return clientRef.current.subscribe(topic, (msg: IMessage) => {
            try {
                callback(JSON.parse(msg.body));
            } catch {
                callback(msg.body);
            }
        });
    }, []);

    const send = useCallback((destination: string, body: any) => {
        if (!clientRef.current?.connected) {
            console.warn("⚠️ Cannot send message: not connected");
            return;
        }
        clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
        });
    }, []);

    return (
        <SocketContext.Provider value={{
            client: clientRef.current,
            isConnected,
            subscribe,
            send,
            reconnect
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
    return ctx;
};