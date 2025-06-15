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
  noLoginRequired: boolean;
  setNoLoginRequired: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [noLoginRequired, setNoLoginRequired] = useState(false); // Default to true for development

  useEffect(() => {
    let mounted = true;

    const handleInitialAuth = async () => {
      try {
        // Check for session ID in URL first (from callback)
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session');
        
        console.log('=== Auth Flow Debug ===');
        console.log('URL Session ID:', sessionId);
        console.log('Current URL:', window.location.href);
        console.log('All URL params:', Object.fromEntries(urlParams));
        console.log('Current localStorage:', localStorage.getItem('sessionId'));
        
        if (sessionId) {
          console.log('Found session ID in URL:', sessionId);
          
          // Check the session first
          console.log('Starting session check...');
          setIsCheckingSession(true);
          const isAuthenticated = await checkSession(sessionId);
          console.log('Session check result:', isAuthenticated);
          
          if (isAuthenticated && mounted) {
            console.log('Session is valid, storing in localStorage');
            localStorage.setItem('sessionId', sessionId);
            console.log('Stored session ID in localStorage:', localStorage.getItem('sessionId'));
            
            // Only clean up URL after successful storage and a small delay
            setTimeout(() => {
              if (mounted) {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('session');
                window.history.replaceState({}, document.title, newUrl.toString());
                console.log('Cleaned up URL:', window.location.href);
              }
            }, 1000);
          } else {
            console.log('Session check failed or component unmounted, not storing session');
          }
          setIsCheckingSession(false);
        } else {
          console.log('No session ID in URL, checking localStorage');
          const storedSessionId = localStorage.getItem('sessionId');
          console.log('Stored session ID from localStorage:', storedSessionId);
          if (storedSessionId) {
            console.log('Found stored session, checking validity...');
            setIsCheckingSession(true);
            await checkSession(storedSessionId);
            setIsCheckingSession(false);
          } else {
            console.log('No stored session found');
          }
        }
      } catch (error) {
        console.error('Error in handleInitialAuth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    handleInitialAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const checkSession = async (sessionId: string): Promise<boolean> => {
    try {
      console.log('=== Session Check Debug ===');
      console.log('Checking session with ID:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID provided');
        return false;
      }

      console.log('Making session check request to worker...');
      const response = await fetch('https://googleauth.yadev64.workers.dev/auth/session', {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      console.log('Session check response status:', response.status);
      const data = await response.json();
      console.log('Session check response data:', data);
      
      if (data.authenticated === false) {
        console.log('Session not authenticated');
        localStorage.removeItem('sessionId');
        setUser(null);
        return false;
      } else {
        console.log('Session authenticated, setting user:', data.user);
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('sessionId');
      setUser(null);
      return false;
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
    <AuthContext.Provider value={{ user, isLoading: isLoading || isCheckingSession, login, logout, noLoginRequired, setNoLoginRequired }}>
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