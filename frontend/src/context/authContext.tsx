import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi, { AdminUser } from '../services/authClient';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Skip if already loading or if auth check is in progress
        if (loading || localStorage.getItem('authCheckInProgress') === 'true') {
          return;
        }
  
        localStorage.setItem('authCheckInProgress', 'true');
        setLoading(true);
  
        const response = await authApi.getCurrentUser();
        if (response.success && response.admin) {
          setUser(response.admin);
        } else {
          setUser(null); // Clear user state if not authenticated
        }
      } catch (error) {
        setUser(null); // Clear user state on error
        console.error('Failed to load user:', error);
      } finally {
        localStorage.removeItem('authCheckInProgress');
        setLoading(false);
      }
    };
  
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.admin) {
        setUser(response.admin);
        setLoading(false);
        return true;
      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if API call fails
      setUser(null);
      navigate('/login');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};