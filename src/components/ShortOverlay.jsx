import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, DollarSign } from 'lucide-react';

const ShortOverlay = ({ title, author, authorAvatar, views, likes = 0, comments = 0, payout = "0.00", onOpenComments, onVote, hasVoted }) => {
    return (
        <div className="overlay-container">
            {/* Bottom Left: Video Info */}
            <div className="overlay-info">
                <Link to={`/profile/${author}`} className="username-link">
                    @{author}
                </Link>
                <p className="video-title">{title}</p>
            </div>

            {/* Right Side: Actions */}
            <div className="side-actions">
                {/* Avatar Action */}
                <Link to={`/profile/${author}`} className="action-item avatar-action">
                    {authorAvatar ? (
                        <img src={authorAvatar} alt={author} className="side-avatar" />
                    ) : (
                        <div className="side-avatar" style={{ background: '#555' }} />
                    )}
                    {/* Optional: Add a '+' icon here if we implement following later */}
                </Link>

                <div className="action-item" onClick={onVote}>
                    <div className="action-icon-bg">
                        <Heart
                            size={32}
                            fill={hasVoted ? "red" : "white"}
                            color={hasVoted ? "red" : "white"}
                            className="drop-shadow-icon"
                        />
                    </div>
                    <span className="action-text">{likes}</span>
                </div>

                <div className="action-item" onClick={onOpenComments}>
                    <div className="action-icon-bg">
                        <MessageCircle size={32} fill="white" className="drop-shadow-icon" />
                    </div>
                    <span className="action-text">{comments}</span>
                </div>

                <div className="action-item">
                    <div className="action-icon-bg">
                        <DollarSign size={32} className="drop-shadow-icon" />
                    </div>
                    <span className="action-text">{payout}</span>
                </div>

                <div className="action-item">
                    {/* Placeholder for Share/More */}
                    <div className="action-icon-bg">
                        <Eye size={28} className="drop-shadow-icon" />
                    </div>
                    <span className="action-text">{views}</span>
                </div>
            </div>
        </div>
    );
};

export default ShortOverlay;
