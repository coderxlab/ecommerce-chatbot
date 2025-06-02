import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo) {
      setUser(userInfo);
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/users/login', { email, password });
      
      // Check if user is admin
      if (!data.isAdmin) {
        throw new Error('Not authorized as admin');
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? new Error(error.response.data.message)
        : error;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
