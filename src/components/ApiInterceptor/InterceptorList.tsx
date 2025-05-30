import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Interceptor {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  isActive: boolean;
}

interface Props {
  onSelectInterceptor: (interceptor: Interceptor) => void;
  onCreateInterceptor: () => void;
  onEditInterceptor: (interceptor: Interceptor) => void;
}

const API_BASE_URL = 'https://interceptorworker.yadev64.workers.dev';

export default function InterceptorList({ onSelectInterceptor, onCreateInterceptor, onEditInterceptor }: Props) {
  const [interceptors, setInterceptors] = useState<Interceptor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterceptors();
  }, []);

  const fetchInterceptors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/interceptors`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch interceptors: ${errorText}`);
      }
      const data = await response.json();
      setInterceptors(data);
    } catch (err) {
      console.error('Error fetching interceptors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interceptors');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInterceptor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interceptor?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/interceptors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete interceptor: ${errorText}`);
      }
      await fetchInterceptors();
    } catch (err) {
      console.error('Error deleting interceptor:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete interceptor');
    }
  };

  const copyProxyUrl = async (id: string) => {
    const proxyUrl = `${API_BASE_URL}/${id}`;
    await navigator.clipboard.writeText(proxyUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          API Interceptors
        </h2>
        <button
          onClick={onCreateInterceptor}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          New Interceptor
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {interceptors.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No interceptors found. Create one to get started.
          </div>
        ) : (
          interceptors.map((interceptor) => (
            <div key={interceptor.id}>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Proxy URL</div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-sm font-mono">
                        {`${API_BASE_URL}/${interceptor.id}`}
                      </code>
                      <button
                        onClick={() => copyProxyUrl(interceptor.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Copy to clipboard"
                      >
                        {copiedId === interceptor.id ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => onSelectInterceptor(interceptor)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {interceptor.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interceptor.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {interceptor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="truncate">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                          {interceptor.id}
                        </span>
                        {' → '}
                        {interceptor.baseUrl}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditInterceptor(interceptor);
                      }}
                      className={`p-1 rounded-md ${
                        interceptor.isActive
                          ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                          : 'text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700'
                      }`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInterceptor(interceptor.id);
                      }}
                      className="p-1 rounded-md text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <TrashIcon className="h-5 w-5" />
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