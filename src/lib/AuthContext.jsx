import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('artsource-token');
    if (token) {
      const sessions = JSON.parse(localStorage.getItem('artsource-sessions') || '{}');
      const username = sessions[token];
      if (username) {
        setUser({ name: username });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('artsource-token');
      }
    }
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthChecked(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('artsource-token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {};

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings,
      authError, appPublicSettings, authChecked, logout, navigateToLogin,
      checkUserAuth: async () => {}, checkAppState: async () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
