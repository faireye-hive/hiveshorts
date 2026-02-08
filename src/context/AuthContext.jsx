import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('hive_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username) => {
        return new Promise((resolve, reject) => {
            if (!window.hive_keychain) {
                alert("Hive Keychain is not installed!");
                reject("Keychain not found");
                return;
            }

            const message = `Login to Shorts App at ${Date.now()}`;
            window.hive_keychain.requestSignBuffer(
                username,
                message,
                'Posting',
                (response) => {
                    if (response.success) {
                        const userData = { username };
                        setUser(userData);
                        localStorage.setItem('hive_user', JSON.stringify(userData));
                        resolve(userData);
                    } else {
                        reject(response.message);
                    }
                }
            );
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hive_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
