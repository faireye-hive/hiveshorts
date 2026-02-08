import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => {
    const { user, login, logout } = useAuth();
    const [inputUsername, setInputUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="settings-container">
            <h2 className="settings-header">Settings</h2>

            <div className="settings-section">
                <h3>Account</h3>
                {user ? (
                    <div className="account-info">
                        <div className="logged-user">
                            <User size={40} />
                            <div>
                                <p className="username">@{user.username}</p>
                                <p className="status">Logged In</p>
                            </div>
                        </div>
                        <button onClick={logout} className="logout-btn-full">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="login-section">
                        <p>Login with Hive Keychain to interact.</p>
                        <form onSubmit={handleLogin} className="login-form">
                            <input
                                type="text"
                                placeholder="Hive Username"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                className="login-input"
                                disabled={loading}
                            />
                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login with Keychain'}
                            </button>
                            {error && <p className="error-msg">{error}</p>}
                        </form>
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h3>App Info</h3>
                <p className="app-version">Version 1.0.0</p>
                {/* Add more settings here later */}
            </div>
        </div>
    );
};

export default SettingsPage;
