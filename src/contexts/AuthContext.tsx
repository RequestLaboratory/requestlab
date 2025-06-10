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
    const handleInitialAuth = async () => {
      // Check for session ID in URL first (from callback)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      console.log('URL Session ID:', sessionId);
      console.log('Current URL:', window.location.href);
      console.log('All URL params:', Object.fromEntries(urlParams));
      
      if (sessionId) {
        // Store the session ID and remove it from URL
        localStorage.setItem('sessionId', sessionId);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('session');
        window.history.replaceState({}, document.title, newUrl.toString());
        console.log('Stored session ID:', sessionId);
        console.log('New URL after cleanup:', window.location.href);
        
        // Immediately check the session
        await checkSession(sessionId);
      } else {
        console.log('No session ID in URL, checking localStorage');
        const storedSessionId = localStorage.getItem('sessionId');
        console.log('Stored session ID from localStorage:', storedSessionId);
        if (storedSessionId) {
          await checkSession(storedSessionId);
        } else {
          setIsLoading(false);
        }
      }
    };

    handleInitialAuth();
  }, []);

  const checkSession = async (sessionId: string) => {
    try {
      console.log('Checking session with ID:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID found');
        setIsLoading(false);
        return;
      }

      console.log('Making session check request...');
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