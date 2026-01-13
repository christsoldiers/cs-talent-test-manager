import React, { createContext, useState, useContext } from 'react';
import StorageService from '../services/StorageService';

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

  const loginAdmin = (username, password) => {
    if (StorageService.validateAdmin(username, password)) {
      const adminUser = { username, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginJudge = (username, password) => {
    if (StorageService.validateJudge(username, password)) {
      const judgeUser = { username, role: 'judge' };
      setUser(judgeUser);
      localStorage.setItem('currentUser', JSON.stringify(judgeUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginSection = (username, password) => {
    const result = StorageService.validateSection(username, password);
    if (result.valid) {
      const sectionUser = { username, role: 'section', section: result.section };
      setUser(sectionUser);
      localStorage.setItem('currentUser', JSON.stringify(sectionUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const checkAuth = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      return true;
    }
    return false;
  };

  React.useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loginAdmin,
    loginJudge,
    loginSection,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isJudge: user?.role === 'judge',
    isSection: user?.role === 'section'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
