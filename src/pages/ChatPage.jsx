import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessaging } from '../context/MessagingContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, MoreVertical, Lock, Info, Check, CheckCheck } from 'lucide-react';

const ChatPage = () => {
    const { recipient } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { conversations, sendMessage, decryptMessage, isRefreshing } = useMessaging();
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContentRef = useRef(null);

    const messages = conversations[recipient] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Attempt to decrypt messages when they appear or change
    useEffect(() => {
        messages.forEach(msg => {
            if (!msg.content) {
                decryptMessage(msg);
            }
        });
    }, [messages, decryptMessage]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const success = await sendMessage(recipient, newMessage);
        if (success) {
            setNewMessage('');
        } else {
            alert("Failed to send encrypted message. Please try again.");
        }
        setIsSending(false);
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="back-btn" onClick={() => navigate('/inbox')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="chat-user-info" onClick={() => navigate(`/profile/${recipient}`)}>
                    <img
                        src={`https://images.hive.blog/u/${recipient}/avatar`}
                        alt={recipient}
                        className="chat-avatar"
                        onError={(e) => e.target.src = 'https://images.hive.blog/u/hive/avatar'}
                    />
                    <div className="chat-user-meta">
                        <span className="chat-name">@{recipient}</span>
                        <span className="chat-status">{isRefreshing ? 'updating...' : 'online'}</span>
                    </div>
                </div>
                <button className="icon-btn header-more">
                    <MoreVertical size={22} />
                </button>
            </header>

            <div className="chat-messages" ref={chatContentRef}>
                <div className="encryption-notice">
                    <Lock size={12} />
                    <span>Messages are end-to-end encrypted with your Hive Memo key.</span>
                </div>

                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <div className="empty-chat-visual">
                            <img src={`https://images.hive.blog/u/${recipient}/avatar`} alt="" />
                            <Lock size={20} className="lock-overlay" />
                        </div>
                        <h3>Private Chat with @{recipient}</h3>
                        <p>Say hello! Your conversation is secured on the blockchain.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.sender === user?.username;
                        const showDate = idx === 0 ||
                            new Date(messages[idx - 1].timestamp).toLocaleDateString() !== new Date(msg.timestamp).toLocaleDateString();

                        return (
                            <React.Fragment key={msg.id}>
                                {showDate && (
                                    <div className="chat-date-divider">
                                        <span>{new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                )}
                                <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className="bubble-content">
                                        {msg.content ? msg.content : (
                                            <div className="decrypting-placeholder">
                                                <div className="dot-flashing" />
                                                <span>Encrypted</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bubble-footer">
                                        <span className="msg-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMine && <CheckCheck size={14} className="msg-status-icon" />}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim() || isSending}>
                    {isSending ? <div className="spinner-small" /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default ChatPage;
