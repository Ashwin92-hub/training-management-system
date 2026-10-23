import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { access_token, role, name, user_id } = response.data;
    localStorage.setItem('lms_token', access_token);
    setToken(access_token);
    setUser({ id: user_id, name, email, role });
    return response.data;
  };

  const loginAsDemo = async (roleName) => {
    const demoCredentials = {
      ADMIN: { email: 'admin@lms.com', password: 'admin123' },
      INSTRUCTOR: { email: 'instructor@lms.com', password: 'instructor123' },
      LEARNER: { email: 'learner@lms.com', password: 'learner123' }
    };
    const cred = demoCredentials[roleName];
    if (cred) {
      return await login(cred.email, cred.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsDemo, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
