import React, { useState, useEffect } from 'react';
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
}



export default function InterceptorList({ onSelectInterceptor, onCreateInterceptor }: Props) {
  const { user, noLoginRequired } = useAuth();
  const [interceptors, setInterceptors] = useState<Interceptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user || noLoginRequired) {
      fetchInterceptors();
    } else {
      setLoading(false);
    }
  }, [user, noLoginRequired]);

  const fetchInterceptors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.INTERCEPTORS);
      setInterceptors(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interceptors');
    } finally {
      setLoading(false);
    }
  };

  const deleteInterceptor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interceptor?')) return;
    
    try {
      await apiClient.delete(`${API_ENDPOINTS.INTERCEPTORS}/${id}`);
      setInterceptors(interceptors.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interceptor');
    }
  };

  const copyProxyUrl = async (id: string) => {
    const proxyUrl = `${API_BASE_URL}/${id}`;
    await navigator.clipboard.writeText(proxyUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user && !noLoginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Please log in to use the API interceptor.
            </div>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          API Interceptors
        </h1>
        <button
          onClick={onCreateInterceptor}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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