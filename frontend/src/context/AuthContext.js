import React, { createContext, useState, useContext, useEffect } from 'react';
import API, { setAuthToken } from '../services/axiosConfig';

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
      // Set auth token in axios config
      setAuthToken(userInfo.token);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/api/users/login', { email, password });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      // Set auth token in axios config
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? new Error(error.response.data.message)
        : error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/api/users', { name, email, password });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      // Set auth token in axios config
      setAuthToken(data.token);
      
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
    // Remove auth token from axios config
    setAuthToken(null);
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await API.put('/api/users/profile', userData);
      
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? new Error(error.response.data.message)
        : error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
