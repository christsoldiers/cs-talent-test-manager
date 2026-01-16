import React, { createContext, useState, useContext } from 'react';
import FirebaseService from '../services/FirebaseService';

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

  const loginAdmin = async (username, password) => {
    if (await FirebaseService.validateAdmin(username, password)) {
      const adminUser = { username, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginJudge = async (username, password) => {
    const result = await FirebaseService.validateJudge(username, password);
    if (result.valid) {
      const judgeUser = { 
        username, 
        role: 'judge',
        talentTestEventId: result.talentTestEventId,
        talentTestEventName: result.talentTestEventName
      };
      setUser(judgeUser);
      localStorage.setItem('currentUser', JSON.stringify(judgeUser));
      return { success: true };
    }
    return { success: false, error: result.error || 'Invalid credentials or not assigned to any event' };
  };

  const loginSection = async (username, password) => {
    const result = await FirebaseService.validateSection(username, password);
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
