import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

interface Props {
  interceptorId: string;
  onSelectLog: (log: Log) => void;
  selectedLogId?: string;
}

const API_BASE_URL = 'https://interceptorworker.yadev64.workers.dev';

export default function RequestLogViewer({ interceptorId, onSelectLog, selectedLogId }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [interceptorId, autoRefresh]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interceptors/${interceptorId}/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Logs</h2>
        <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <span>Auto-refresh</span>
        </label>
      </div>

      <div className="flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No logs found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => onSelectLog(log)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  selectedLogId === log.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      log.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      log.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      log.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {log.method}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      log.response.status >= 200 && log.response.status < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      log.response.status >= 400 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {log.response.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white truncate">
                  {log.originalUrl}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {log.duration}ms
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 