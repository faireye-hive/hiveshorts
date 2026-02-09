import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, LogOut, Settings as SettingsIcon, Bell, Lock,
    Info, HelpCircle, Github, FileText, Shield, ExternalLink,
    Tv, Volume2, Wifi
} from 'lucide-react';

const SettingsPage = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [inputUsername, setInputUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // App Settings State (localStorage)
    const [autoplay, setAutoplay] = useState(() =>
        localStorage.getItem('autoplay') !== 'false'
    );
    const [dataSaver, setDataSaver] = useState(() =>
        localStorage.getItem('dataSaver') === 'true'
    );
    const [defaultMuted, setDefaultMuted] = useState(() =>
        localStorage.getItem('defaultMuted') !== 'false'
    );

    // Notification Settings
    const [notifyComments, setNotifyComments] = useState(true);
    const [notifyFollowers, setNotifyFollowers] = useState(true);
    const [notifyLikes, setNotifyLikes] = useState(false);

    // Privacy Settings
    const [privateAccount, setPrivateAccount] = useState(false);
    const [allowComments, setAllowComments] = useState('everyone');

    // Save to localStorage when settings change
    useEffect(() => {
        localStorage.setItem('autoplay', autoplay);
    }, [autoplay]);

    useEffect(() => {
        localStorage.setItem('dataSaver', dataSaver);
    }, [dataSaver]);

    useEffect(() => {
        localStorage.setItem('defaultMuted', defaultMuted);
    }, [defaultMuted]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(inputUsername);
        } catch (err) {
            console.error(err);
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = () => {
        if (user) {
            navigate(`/profile/${user.username}`);
        }
    };

    return (
        <div className="settings-container">
            {/* Modern Header */}
            <div className="settings-header-modern">
                <SettingsIcon size={28} />
                <h2 className="settings-title">Settings</h2>
            </div>

            {/* Profile Card (Logged In) */}
            {user ? (
                <div className="settings-profile-card">
                    <img
                        src={`https://images.hive.blog/u/${user.username}/avatar`}
                        alt={user.username}
                        className="settings-profile-avatar"
                    />
                    <div className="settings-profile-info">
                        <h3 className="settings-profile-name">@{user.username}</h3>
                        <p className="settings-profile-status">
                            <span className="status-dot"></span>
                            Active
                        </p>
                    </div>
                    <div className="settings-profile-actions">
                        <button onClick={handleViewProfile} className="view-profile-btn">
                            <User size={16} />
                            View Profile
                        </button>
                        <button onClick={logout} className="settings-logout-btn">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="settings-login-card">
                    <div className="login-card-icon">
                        <User size={48} />
                    </div>
                    <h3>Login to Continue</h3>
                    <p>Connect with Hive Keychain to unlock all features</p>
                    <form onSubmit={handleLogin} className="settings-login-form">
                        <input
                            type="text"
                            placeholder="Enter your Hive username"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            className="settings-login-input"
                            disabled={loading}
                        />
                        <button type="submit" className="settings-login-btn" disabled={loading}>
                            {loading ? 'Connecting...' : 'Login with Keychain'}
                        </button>
                        {error && <p className="settings-error-msg">{error}</p>}
                    </form>
                </div>
            )}

            {/* App Preferences */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <Tv size={20} />
                    <h3>App Preferences</h3>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label>Autoplay Videos</label>
                        <span className="setting-description">Automatically play next video</span>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={autoplay}
                            onChange={(e) => setAutoplay(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <Wifi size={18} />
                        <div>
                            <label>Data Saver</label>
                            <span className="setting-description">Reduce video quality on cellular</span>
                        </div>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={dataSaver}
                            onChange={(e) => setDataSaver(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <Volume2 size={18} />
                        <div>
                            <label>Start Muted</label>
                            <span className="setting-description">Videos start without sound</span>
                        </div>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={defaultMuted}
                            onChange={(e) => setDefaultMuted(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* Notifications (UI Only) */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <Bell size={20} />
                    <h3>Notifications</h3>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label>Comments on my videos</label>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={notifyComments}
                            onChange={(e) => setNotifyComments(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label>New followers</label>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={notifyFollowers}
                            onChange={(e) => setNotifyFollowers(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label>Likes on my videos</label>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={notifyLikes}
                            onChange={(e) => setNotifyLikes(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* Privacy (UI Only) */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <Lock size={20} />
                    <h3>Privacy & Safety</h3>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label>Private Account</label>
                        <span className="setting-description">Only followers can see your shorts</span>
                    </div>
                    <label className="settings-toggle">
                        <input
                            type="checkbox"
                            checked={privateAccount}
                            onChange={(e) => setPrivateAccount(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item clickable">
                    <div className="setting-info">
                        <Shield size={18} />
                        <div>
                            <label>Blocked Accounts</label>
                            <span className="setting-description">Manage blocked users</span>
                        </div>
                    </div>
                    <ExternalLink size={18} className="setting-arrow" />
                </div>
            </div>

            {/* About & Support */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <Info size={20} />
                    <h3>About & Support</h3>
                </div>

                <div className="setting-item clickable" onClick={() => window.open('https://github.com', '_blank')}>
                    <div className="setting-info">
                        <Github size={18} />
                        <label>Source Code</label>
                    </div>
                    <ExternalLink size={18} className="setting-arrow" />
                </div>

                <div className="setting-item clickable">
                    <div className="setting-info">
                        <HelpCircle size={18} />
                        <label>Help & Feedback</label>
                    </div>
                    <ExternalLink size={18} className="setting-arrow" />
                </div>

                <div className="setting-item clickable">
                    <div className="setting-info">
                        <FileText size={18} />
                        <label>Terms of Service</label>
                    </div>
                    <ExternalLink size={18} className="setting-arrow" />
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="app-version-label">Version</label>
                    </div>
                    <span className="app-version-number">1.0.0</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
