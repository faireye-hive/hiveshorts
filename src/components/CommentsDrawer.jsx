import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { fetchHiveComments } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentsDrawer = ({ isOpen, onClose, author, permlink }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (isOpen && author && permlink) {
            setLoading(true);
            fetchHiveComments(author, permlink)
                .then(data => setComments(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, author, permlink]);

    const handlePostComment = () => {
        if (!user) {
            alert("Please login to comment!");
            return;
        }
        if (!newComment.trim()) return;

        setPosting(true);
        const commentPermlink = `re-${permlink}-${Date.now()}`;
        const jsonMetadata = JSON.stringify({
            app: 'shorts-app/0.1',
            tags: ['shorts', 'video']
        });

        if (window.hive_keychain) {
            window.hive_keychain.requestPost(
                user.username,
                newComment, // title (empty for comments)
                newComment, // body
                permlink,   // parent permlink
                author,     // parent author
                jsonMetadata,
                commentPermlink,
                (response) => {
                    if (response.success) {
                        // Optimistic update
                        const newCommentObj = {
                            id: Date.now(),
                            author: user.username,
                            body: newComment,
                            created: new Date().toISOString()
                        };
                        setComments(prev => [newCommentObj, ...prev]);
                        setNewComment("");
                    } else {
                        // Suppress "user canceled" error
                        if (response.message &&
                            (response.message.toLowerCase().includes("user canceled") ||
                                response.message.toLowerCase().includes("request was canceled"))) {
                            console.log("Comment post canceled by user");
                        } else {
                            alert("Comment failed: " + response.message);
                        }
                    }
                    setPosting(false);
                }
            );
        } else {
            alert("Hive Keychain not installed!");
            setPosting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="comments-drawer-overlay" onClick={onClose}>
            <div className="comments-drawer" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <h3>{comments.length} Comments</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="comments-list">
                    {loading ? (
                        <div className="drawer-loading">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="no-comments">No comments yet. Be the first!</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-avatar">
                                    <img
                                        src={`https://images.hive.blog/u/${comment.author}/avatar`}
                                        alt={comment.author}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                </div>
                                <div className="comment-content">
                                    <span className="comment-author">{comment.author}</span>
                                    <p className="comment-body">{comment.body}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input Area */}
                <div className="comment-input-area">
                    {user ? (
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={posting}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handlePostComment();
                                    }
                                }}
                            />
                            <button onClick={handlePostComment} disabled={!newComment.trim() || posting}>
                                <Send size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="login-prompt">
                            Please login to comment
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentsDrawer;
