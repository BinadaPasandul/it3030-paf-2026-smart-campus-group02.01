import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = () => {
        // Redirect to Spring Boot backend OAuth endpoint
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const logout = () => {
        // Handle logout
        setUser(null);
    };

    useEffect(() => {
        // Check for authenticated user on load (e.g., fetch from /api/user)
        const checkAuth = async () => {
            try {
                // const res = await fetch('/api/user');
                // if (res.ok) setUser(await res.json());
            } catch (err) {
                console.error('Auth check failed', err);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
