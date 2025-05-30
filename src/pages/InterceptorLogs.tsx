import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import RequestLogViewer from '../components/ApiInterceptor/RequestLogViewer';
import LogDetails from '../components/ApiInterceptor/LogDetails';

interface Interceptor {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  isActive: boolean;
}

interface Log {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
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

  useEffect(() => {
    fetchInterceptor();
  }, [id]);

  const fetchInterceptor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/interceptors`);
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
              onClick={() => navigate('/interceptors')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Interceptors
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {interceptor.name}
            </h1>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {interceptor.id}
                  </span>
                  <span>→</span>
                  <span>{interceptor.baseUrl}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proxy URL:</span>
                <code className="flex-1 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {`${API_BASE_URL}/${interceptor.id}`}
                </code>
                <button
                  onClick={copyProxyUrl}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <RequestLogViewer 
                interceptorId={interceptor.id} 
                onSelectLog={setSelectedLog}
                selectedLogId={selectedLog?.id}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <LogDetails log={selectedLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 