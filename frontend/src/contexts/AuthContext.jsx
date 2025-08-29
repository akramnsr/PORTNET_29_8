import React, { createContext, useState, useEffect } from 'react';
import { login as loginAPI, getCurrentUser } from '../api/auth';  // ../api/auth.js qui exporte ces fonctions


export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        try {
            const response = await loginAPI(email, password);
            const { token: newToken, role, superviseur, operateur } = response;

            localStorage.setItem('token', newToken);
            setToken(newToken);

            const userData = superviseur || operateur || { email, role };
            setUser(userData);

            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Charger l'utilisateur au montage ou quand token change
    useEffect(() => {
        const loadUserData = async () => {
            if (token && !user) {
                try {
                    const userData = await getCurrentUser(token);
                    const userInfo = userData.superviseur || userData.operateur || userData;
                    setUser(userInfo);
                } catch (error) {
                    logout(); // token invalide -> logout
                }
            }
            setLoading(false);
        };

        loadUserData();
    }, [token, user]);

    const value = {
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
