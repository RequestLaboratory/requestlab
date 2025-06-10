import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react';

const LoginButton: React.FC = () => {
  const { user, login, logout } = useAuth();

  useEffect(() => {
    console.log('LoginButton - Current user:', user);
  }, [user]);

  return (
    <button
      onClick={user ? logout : login}
      className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
    >
      {user ? (
        <>
          <img
            src={user.picture}
            alt={user.name}
            className="w-5 h-5 rounded-full mr-3"
          />
          <span className="font-medium truncate">{user.name}</span>
          <LogOut className="h-5 w-5 ml-auto" />
        </>
      ) : (
        <>
          <LogIn className="h-5 w-5" />
          <span className="ml-3 font-medium">Login</span>
        </>
      )}
    </button>
  );
};

export default LoginButton; 