import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
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
          <div className="mb-6">
            <button
              onClick={() => navigate('/api-interceptor')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Interceptors
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {interceptor.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {interceptor.base_url}
                  </p>
                </div>
                <button
                  onClick={copyProxyUrl}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4 mr-1" />
                      Copy Proxy URL
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4">
                <RequestLogViewer
                  interceptorId={interceptor.id}
                  onSelectLog={setSelectedLog}
                  selectedLogId={selectedLog?.id}
                />
              </div>
              <div className="p-4">
                {selectedLog ? (
                  <LogDetails log={selectedLog} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Select a request to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 