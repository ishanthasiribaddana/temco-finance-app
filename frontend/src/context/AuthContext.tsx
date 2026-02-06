import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  nic: string;
  roleId: number | null;
  roleCode: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios to include token and cookies in all requests
  useEffect(() => {
    axios.defaults.withCredentials = true; // Send cookies for SSO
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/me');
        setUser(res.data.user);
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  // Handle 401 responses globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      
      if (res.data.success) {
        const { token: newToken, expiresAt, user: userData } = res.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('tokenExpiry', expiresAt);
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: res.data.error || 'Login failed' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
