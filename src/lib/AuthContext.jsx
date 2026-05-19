// @ts-nocheck
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth as apiAuth } from '@/api/entities';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Campi mantenuti per compatibilità con componenti che li leggono
  const isLoadingPublicSettings = false;
  const authError = null;
  const appPublicSettings = null;

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      if (!apiAuth.isAuthenticated()) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      const userData = await apiAuth.me();
      setUser(userData);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('navigate_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Legge il token dall'URL (callback OAuth Google)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('navigate_token', token);
      // Rimuove il token dall'URL
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState({}, '', newUrl);
      checkAuth();
    }
  }, [checkAuth]);

  const login = async (email, password) => {
    const { token, user: userData } = await apiAuth.login(email, password);
    localStorage.setItem('navigate_token', token);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = () => {
    apiAuth.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      navigateToLogin,
      checkAppState: checkAuth,
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
