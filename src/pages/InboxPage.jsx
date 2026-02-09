import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '../context/MessagingContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, User, Clock, Search, Plus, MessageCircle } from 'lucide-react';

const InboxPage = () => {
    const navigate = useNavigate();
    const { conversations, loading, isRefreshing } = useMessaging();
    const { user } = useAuth();

    const handleStartNewChat = () => {
        const targetUser = prompt("Enter the Hive username to message:");
        if (targetUser && targetUser.trim()) {
            const cleanUser = targetUser.trim().toLowerCase().replace('@', '');
            navigate(`/inbox/${cleanUser}`);
        }
    };

    if (!user) {
        return (
            <div className="inbox-container empty">
                <div className="inbox-empty-card">
                    <div className="empty-icon-circle">
                        <MessageSquare size={48} />
                    </div>
                    <h3>Sign in to chat</h3>
                    <p>Contact and message other Hive users securely through Shorts Inbox.</p>
                    <button className="inbox-login-btn" onClick={() => navigate('/settings')}>
                        Go to Settings
                    </button>
                </div>
            </div>
        );
    }

    const conversationList = Object.keys(conversations).map(recipient => ({
        recipient,
        lastMessage: conversations[recipient][conversations[recipient].length - 1],
        unreadCount: 0 // Simplification for now
    })).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    return (
        <div className="inbox-container">
            <header className="inbox-header">
                <h2>Inbox</h2>
                <div className="header-actions">
                    <button className="icon-btn search-msg">
                        <Search size={22} />
                    </button>
                    {isRefreshing && <div className="refresh-indicator pulse" />}
                </div>
            </header>

            <div className="inbox-content">
                {loading ? (
                    <div className="inbox-loading">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="convo-skeleton-item">
                                <div className="skeleton-avatar" />
                                <div className="skeleton-info">
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line long" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversationList.length === 0 ? (
                    <div className="no-convos">
                        <MessageCircle size={64} color="rgba(255,255,255,0.1)" />
                        <h3>No messages yet</h3>
                        <p>Start a new conversation to see it here.</p>
                        <button className="start-chat-btn" onClick={handleStartNewChat}>
                            New Message
                        </button>
                    </div>
                ) : (
                    <div className="conversation-list">
                        {conversationList.map((convo) => (
                            <div
                                key={convo.recipient}
                                className="conversation-item"
                                onClick={() => navigate(`/inbox/${convo.recipient}`)}
                            >
                                <div className="convo-avatar">
                                    <img
                                        src={`https://images.hive.blog/u/${convo.recipient}/avatar`}
                                        alt={convo.recipient}
                                        onError={(e) => e.target.src = 'https://images.hive.blog/u/hive/avatar'}
                                    />
                                    <div className="status-indicator online" />
                                </div>
                                <div className="convo-preview">
                                    <div className="convo-header">
                                        <span className="convo-name">@{convo.recipient}</span>
                                        <div className="convo-meta">
                                            <Clock size={12} />
                                            <span className="convo-time">
                                                {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="last-message">
                                        {convo.lastMessage.sender === user.username ? 'You: ' : ''}
                                        {convo.lastMessage.content || 'Encrypted Message'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="floating-new-msg" onClick={handleStartNewChat}>
                <Plus size={28} />
            </button>
        </div>
    );
};

export default InboxPage;
