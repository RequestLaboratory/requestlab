import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, ArrowTopRightOnSquareIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import apiClient from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../config';

interface Interceptor {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
  is_active: boolean;
}

interface Props {
  onSelectInterceptor: (interceptor: Interceptor) => void;
  onCreateInterceptor: () => void;
  onInterceptorCountChange?: (count: number) => void;
}



const MAX_INTERCEPTORS_PER_USER = 3;

export default function InterceptorList({ onSelectInterceptor, onCreateInterceptor, onInterceptorCountChange }: Props) {
  const { user, login } = useAuth();
  const [interceptors, setInterceptors] = useState<Interceptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInterceptors = useCallback(async () => {
    // Don't fetch if user is not logged in (no session)
    const hasSession = localStorage.getItem('sessionId');
    if (!user && !hasSession) {
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.INTERCEPTORS);
      setInterceptors(response.data);
      // Notify parent component of interceptor count
      if (onInterceptorCountChange) {
        onInterceptorCountChange(response.data.length);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; userMessage?: string; message?: string };
      // Don't set error for 401 if user is not logged in - let the login prompt handle it
      const hasSession = localStorage.getItem('sessionId');
      if (error.response?.status === 401 && (!user && !hasSession)) {
        setError(null);
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in to view interceptors.');
      } else if (error.response?.status === 404) {
        setError(error.userMessage || 'Interceptors not found.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch interceptors');
      }
    } finally {
      setLoading(false);
    }
  }, [onInterceptorCountChange, user]);

  useEffect(() => {
    // Only fetch if user is logged in (has a session)
    const sessionId = localStorage.getItem('sessionId');
    if (user || sessionId) {
      fetchInterceptors();
    } else {
      // Clear any previous errors and stop loading when user is not logged in
      setError(null);
      setLoading(false);
    }
  }, [user, fetchInterceptors]);

  const deleteInterceptor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interceptor?')) return;
    
    try {
      await apiClient.delete(`${API_ENDPOINTS.INTERCEPTORS}/${id}`);
      const updatedInterceptors = interceptors.filter(i => i.id !== id);
      setInterceptors(updatedInterceptors);
      // Notify parent component of updated interceptor count
      if (onInterceptorCountChange) {
        onInterceptorCountChange(updatedInterceptors.length);
      }
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; userMessage?: string; message?: string };
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in to delete interceptors.');
      } else if (error.response?.status === 404) {
        setError(error.userMessage || 'Interceptor not found or you do not have permission to delete it.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to delete interceptor');
      }
    }
  };

  const copyProxyUrl = async (id: string) => {
    const proxyUrl = `${API_BASE_URL}/${id}`;
    await navigator.clipboard.writeText(proxyUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Always check login status first, before showing errors or loading
  // Check if user is actually logged in (has a session)
  // Since backend requires authentication, show login prompt if no session
  const hasSession = localStorage.getItem('sessionId');
  if (!user && !hasSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to use the API interceptor. Create and manage interceptors to monitor your API requests.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canCreateInterceptor = interceptors.length < MAX_INTERCEPTORS_PER_USER;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            API Interceptors
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Max {MAX_INTERCEPTORS_PER_USER} interceptors per user ({interceptors.length}/{MAX_INTERCEPTORS_PER_USER})
          </p>
        </div>
        <button
          onClick={onCreateInterceptor}
          disabled={!canCreateInterceptor}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            canCreateInterceptor
              ? 'text-white bg-blue-600 hover:bg-blue-700'
              : 'text-gray-400 bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
          title={!canCreateInterceptor ? `Maximum ${MAX_INTERCEPTORS_PER_USER} interceptors reached` : 'Create new interceptor'}
        >
          <PlusIcon className="h-4 w-4 mr-1.5" />
          New Interceptor
        </button>
      </div>

      <div className="space-y-2.5">
        {interceptors.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            No interceptors found. Create one to get started.
          </div>
        ) : (
          interceptors.map((interceptor) => (
            <div 
              key={interceptor.id} 
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => onSelectInterceptor(interceptor)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {interceptor.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          interceptor.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {interceptor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Target URL:</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {interceptor.base_url}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Proxy URL:</span>
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <code className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded flex-1 truncate">
                            {`${API_BASE_URL}/${interceptor.id}`}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyProxyUrl(interceptor.id);
                            }}
                            className="inline-flex items-center p-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                            title="Copy Proxy URL"
                          >
                            {copiedId === interceptor.id ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ClipboardIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInterceptor(interceptor);
                      }}
                      className="inline-flex items-center p-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                      title="View Logs"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInterceptor(interceptor.id);
                      }}
                      className="inline-flex items-center p-1.5 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                      title="Delete Interceptor"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 