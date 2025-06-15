import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import RequestLogViewer from '../components/ApiInterceptor/RequestLogViewer';
import LogDetails from '../components/ApiInterceptor/LogDetails';
import { useAuth } from '../contexts/AuthContext';

interface Interceptor {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
  is_active: boolean;
}

interface Log {
  id: string;
  timestamp: string;
  method: string;
  originalUrl: string;
  proxyUrl: string;
  status: number;
  duration: number;
  headers: Record<string, string>;
  body: string | null;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string | null;
  };
}

const API_BASE_URL = 'https://interceptorworker.yadev64.workers.dev';

export default function InterceptorLogs() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interceptor, setInterceptor] = useState<Interceptor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, noLoginRequired } = useAuth();

  useEffect(() => {
    if (user || noLoginRequired) {
      fetchInterceptor();
    } else {
      setError('Please log in to view interceptor logs');
      setIsLoading(false);
    }
  }, [id, user, noLoginRequired]);

  const fetchInterceptor = async () => {
    try {
      setIsLoading(true);
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId && !noLoginRequired) {
        throw new Error('No session ID found');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (noLoginRequired) {
        headers['Authorization'] = 'Bearer no-login';
      } else {
        headers['Authorization'] = `Bearer ${sessionId}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/interceptors`, {
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch interceptors');
      }
      const interceptors = await response.json();
      const found = interceptors.find((i: Interceptor) => i.id === id);
      if (found) {
        setInterceptor(found);
      } else {
        setError('Interceptor not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interceptor');
    } finally {
      setIsLoading(false);
    }
  };

  const copyProxyUrl = () => {
    const proxyUrl = `${API_BASE_URL}/${interceptor?.id}`;
    navigator.clipboard.writeText(proxyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user && !noLoginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Please log in to view interceptor logs.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !interceptor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error || 'Interceptor not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/api-interceptor')}
                className="inline-flex items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {interceptor.name}
                </h2>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {interceptor.base_url}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Proxy URL:</span>
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded flex-1 truncate">
                        {`${API_BASE_URL}/${interceptor.id}`}
                      </code>
                      <button
                        onClick={copyProxyUrl}
                        className="inline-flex items-center p-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                        title="Copy Proxy URL"
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Request Logs */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <RequestLogViewer
              interceptorId={interceptor.id}
              onSelectLog={setSelectedLog}
              selectedLogId={selectedLog?.id}
              searchQuery={searchQuery}
            />
          </div>

          {/* Log Details Modal */}
          {selectedLog && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <LogDetails log={selectedLog} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 