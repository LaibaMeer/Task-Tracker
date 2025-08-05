import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext - Initial token check:', token ? 'Token exists' : 'No token'); // Debug log
    
    if (token) {
      authService.verifyToken()
        .then(response => {
          console.log('AuthContext - Token verified, user:', response.data.user); // Debug log
          setUser(response.data.user);
        })
        .catch(error => {
          console.error('AuthContext - Token verification failed:', error); // Debug log
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Login attempt for:', email); // Debug log
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      console.log('AuthContext - Login successful, token received'); // Debug log
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('AuthContext - Login failed:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('AuthContext - Signup attempt for:', email); // Debug log
      const response = await authService.signup(name, email, password);
      const { token, user } = response.data;
      
      console.log('AuthContext - Signup successful, token received'); // Debug log
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('AuthContext - Signup failed:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    console.log('AuthContext - Logging out'); // Debug log
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};