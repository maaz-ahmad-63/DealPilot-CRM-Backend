import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

function getStoredAuthSession() {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!savedToken || !savedUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token: savedToken,
      user: JSON.parse(savedUser),
    };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
}

function persistAuthSession(nextToken, nextUser) {
  localStorage.setItem('token', nextToken);
  localStorage.setItem('user', JSON.stringify(nextUser));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuthSession().user);
  const [token, setToken] = useState(() => getStoredAuthSession().token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const session = getStoredAuthSession();
    if (session.token && session.user) {
      setToken(session.token);
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔐 Attempting login with:', { email });
      console.log('📡 API Base URL:', import.meta.env.VITE_API_URL);
      const response = await authAPI.login(email, password);
      console.log('✅ Login successful:', response.data);
      const { token, user } = response.data;
      persistAuthSession(token, user);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      console.error('❌ Login error:', err);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.signup({ email, password, name });
      const { token, user } = response.data;
      persistAuthSession(token, user);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updates) => {
    setUser((current) => {
      const nextUser = { ...current, ...updates };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token), loading, error, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
