import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Client } from '@hiveio/dhive';
import { useAuth } from './AuthContext';

const MessagingContext = createContext(null);

// Using a stable Hive RPC node
const client = new Client(["https://api.hive.blog", "https://anyx.io", "https://api.openhive.network"]);
const CHAT_ID = 'shorts_chat_v1';

export const MessagingProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState({});
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch account history and process chat messages
    const fetchMessages = useCallback(async (isInitial = false) => {
        if (!user) return;
        if (isInitial) setLoading(true);
        else setIsRefreshing(true);

        try {
            // Fetch account history (fetching last 100 operations for simplicity/performance in this demo)
            // In a real app, you might want a more advanced sync strategy
            const history = await client.database.getAccountHistory(user.username, -1, 100);

            const newConversations = { ...conversations };
            let hasNewMessages = false;

            for (const op of history) {
                const [index, item] = op;
                const { op: operation, timestamp } = item;

                if (operation[0] === 'custom_json' && operation[1].id === CHAT_ID) {
                    try {
                        const data = JSON.parse(operation[1].json);
                        const sender = operation[1].required_posting_auths[0];

                        // We only care about messages involving the current user
                        if (sender === user.username || data.recipient === user.username) {
                            const recipient = sender === user.username ? data.recipient : sender;

                            if (!newConversations[recipient]) {
                                newConversations[recipient] = [];
                            }

                            // Avoid duplicates based on transaction id or timestamp+sender (simplification)
                            const msgId = `${timestamp}_${sender}_${index}`;
                            if (!newConversations[recipient].find(m => m.id === msgId)) {
                                newConversations[recipient].push({
                                    id: msgId,
                                    sender,
                                    recipient: data.recipient,
                                    encryptedMessage: data.message,
                                    timestamp,
                                    isEncrypted: true,
                                    content: null // Will be decrypted on demand or automatically
                                });
                                hasNewMessages = true;
                            }
                        }
                    } catch (e) {
                        console.error("Failed to parse chat json", e);
                    }
                }
            }

            if (hasNewMessages) {
                // Sort messages by timestamp within each conversation
                Object.keys(newConversations).forEach(key => {
                    newConversations[key].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                });
                setConversations(newConversations);
            }
        } catch (error) {
            console.error("History fetch error:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user, conversations]);

    // Decrypt a specific message using Hive Keychain
    const decryptMessage = async (message) => {
        if (!window.hive_keychain) return null;
        if (message.content) return message.content;

        return new Promise((resolve) => {
            window.hive_keychain.requestVerifyKey(user.username, message.encryptedMessage, 'Memo', (response) => {
                if (response.success) {
                    // Hive Keychain returns the decrypted message in the response if decoded
                    // Note: requestVerifyKey is often used, but requestDecodeMessage is specifically for memo decryption
                    window.hive_keychain.requestDecodeMessage(user.username, message.encryptedMessage, 'Memo', (decryptResponse) => {
                        if (decryptResponse.success) {
                            // Extract content (dealing with keychain response format which might include '#' prefix)
                            let content = decryptResponse.result;
                            if (content.startsWith('#')) content = content.substring(1);

                            // Update local state to cache decrypted content
                            setConversations(prev => {
                                const next = { ...prev };
                                const convo = next[message.sender === user.username ? message.recipient : message.sender];
                                const msgIndex = convo.findIndex(m => m.id === message.id);
                                if (msgIndex > -1) {
                                    convo[msgIndex] = { ...convo[msgIndex], content };
                                }
                                return next;
                            });
                            resolve(content);
                        } else {
                            resolve(null);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        });
    };

    // Send an encrypted message
    const sendMessage = async (recipient, text) => {
        if (!user || !window.hive_keychain) return false;

        return new Promise((resolve) => {
            // 1. Encrypt message for recipient
            // Note: In Hive, encryption is typically done with Memo Key. 
            // Keychain's requestEncodeMessage handles this.
            window.hive_keychain.requestEncodeMessage(user.username, recipient, `#${text}`, 'Memo', (encodeResponse) => {
                if (encodeResponse.success) {
                    const encrypted = encodeResponse.result;

                    // 2. Broadcast via custom_json
                    const jsonContent = JSON.stringify({
                        recipient,
                        message: encrypted,
                        v: '1.0'
                    });

                    window.hive_keychain.requestCustomJson(
                        user.username,
                        CHAT_ID,
                        'Posting',
                        jsonContent,
                        `Chat with ${recipient}`,
                        (jsonResponse) => {
                            if (jsonResponse.success) {
                                // Refresh to see the new message
                                fetchMessages();
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                    );
                } else {
                    resolve(false);
                }
            });
        });
    };

    // Auto-refresh messages every 30 seconds if user is logged in
    useEffect(() => {
        if (user) {
            fetchMessages(true);
            const interval = setInterval(() => fetchMessages(), 30000);
            return () => clearInterval(interval);
        } else {
            setConversations({});
        }
    }, [user]);

    return (
        <MessagingContext.Provider value={{
            conversations,
            loading,
            isRefreshing,
            sendMessage,
            fetchMessages,
            decryptMessage
        }}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessaging = () => useContext(MessagingContext);
