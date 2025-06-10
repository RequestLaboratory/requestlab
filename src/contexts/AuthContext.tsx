import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for session ID in URL first (from callback)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    console.log('URL Session ID:', sessionId);
    console.log('Current URL:', window.location.href);
    
    if (sessionId) {
      // Store the session ID and remove it from URL
      localStorage.setItem('sessionId', sessionId);
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('Stored session ID:', sessionId);
      checkSession();
    } else {
      console.log('No session ID in URL, checking localStorage');
      checkSession();
    }
  }, []);

  const checkSession = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      console.log('Checking session with ID:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://googleauth.yadev64.workers.dev/auth/session', {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      const data = await response.json();
      console.log('Session check response:', data);
      
      if (data.authenticated === false) {
        console.log('Session not authenticated');
        localStorage.removeItem('sessionId');
        setUser(null);
      } else {
        console.log('Session authenticated, setting user:', data.user);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('sessionId');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    console.log('Initiating login...');
    window.location.href = 'https://googleauth.yadev64.workers.dev/auth/google';
  };

  const logout = async () => {
    console.log('Initiating logout...');
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      try {
        await fetch('https://googleauth.yadev64.workers.dev/auth/logout', {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    localStorage.removeItem('sessionId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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