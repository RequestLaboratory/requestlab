import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Switch } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';

interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  original_url: string;
  proxy_url: string;
  response_status: number;
  duration: number;
  headers: string;
  body: string | null;
  response_headers: string;
  response_body: string | null;
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

interface Props {
  interceptorId: string;
  onSelectLog: (log: Log) => void;
  selectedLogId?: string;
  searchQuery: string;
}

export default function RequestLogViewer({ interceptorId, onSelectLog, selectedLogId, searchQuery }: Props) {
  const { noLoginRequired } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workerMode, setWorkerMode] = useState<'api' | 'sse' | null>(null);
  const [useSSE, setUseSSE] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check worker mode on component mount
  useEffect(() => {
    const checkWorkerMode = async () => {
      try {
        const response = await fetch('https://interceptorworker.yadev64.workers.dev/status');
        if (response.ok) {
          const status = await response.json();
          setWorkerMode(status.mode);
          setUseSSE(status.mode === 'sse');
        } else {
          // Default to SSE if status check fails
          setWorkerMode('sse');
          setUseSSE(true);
        }
      } catch (error) {
        console.error('Failed to check worker mode:', error);
        // Default to SSE if status check fails
        setWorkerMode('sse');
        setUseSSE(true);
      }
    };

    checkWorkerMode();
  }, []);

  // Function to fetch logs via API
  const fetchLogs = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header based on auth mode
      if (noLoginRequired) {
        headers['Authorization'] = 'Bearer no-login';
      } else if (sessionId) {
        headers['Authorization'] = `Bearer ${sessionId}`;
      }

      const response = await fetch(`https://interceptorworker.yadev64.workers.dev/api/interceptors/${interceptorId}/logs?limit=100&offset=0`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Transform the logs to match our interface
      const transformedLogs = data.map((log: ApiLog) => ({
        id: log.id,
        timestamp: log.timestamp,
        method: log.method,
        originalUrl: log.original_url,
        proxyUrl: log.proxy_url,
        status: log.response_status,
        duration: log.duration,
        headers: JSON.parse(log.headers),
        body: log.body,
        response: {
          status: log.response_status,
          headers: JSON.parse(log.response_headers),
          body: log.response_body
        }
      }));
      
      setLogs(transformedLogs);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs');
      setIsLoading(false);
    }
  };

  // Setup polling for API mode
  useEffect(() => {
    if (workerMode === 'api' || (!useSSE && workerMode === 'sse')) {
      // Initial fetch
      fetchLogs();
      
      // Setup polling every 5 seconds
      pollingIntervalRef.current = setInterval(fetchLogs, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [useSSE, interceptorId, workerMode]);

  // SSE connection setup
  useEffect(() => {
    if (workerMode !== 'sse' || !useSSE) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    let retryTimeout: NodeJS.Timeout;
    let isComponentMounted = true;
    let lastHeartbeat = Date.now();
    let heartbeatCheckInterval: NodeJS.Timeout;

    const connectSSE = () => {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Clear any existing heartbeat check
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }

      // Connect to SSE
      const eventSource = new EventSource('https://interceptorworker.yadev64.workers.dev/events', {
        withCredentials: false
      });
      eventSourceRef.current = eventSource;

      // Set up heartbeat check
      heartbeatCheckInterval = setInterval(() => {
        if (!isComponentMounted) return;
        
        const now = Date.now();
        if (now - lastHeartbeat > 35000) { // No heartbeat for 35 seconds
          console.log('No heartbeat received, reconnecting...');
          eventSource.close();
          connectSSE();
        }
      }, 5000); // Check every 5 seconds

      eventSource.onopen = () => {
        if (!isComponentMounted) return;
        console.log('SSE connected');
        setIsConnected(true);
        setIsLoading(false);
        retryCount = 0; // Reset retry count on successful connection
        lastHeartbeat = Date.now();
      };

      eventSource.onmessage = (event) => {
        if (!isComponentMounted) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'connected') {
            console.log('Received connected message');
            return;
          }
          if (message.type === 'heartbeat') {
            console.log('Received heartbeat');
            lastHeartbeat = Date.now();
            return;
          }
          if (message.type === 'log' && message.data.interceptor_id === interceptorId) {
            console.log('Received log message:', message.data);
            // Transform the log data to match our interface
            const log: Log = {
              id: message.data.id,
              timestamp: message.data.timestamp,
              method: message.data.method,
              originalUrl: message.data.original_url,
              proxyUrl: message.data.proxy_url,
              status: message.data.response_status,
              duration: message.data.duration,
              headers: JSON.parse(message.data.headers),
              body: message.data.body,
              response: {
                status: message.data.response_status,
                headers: JSON.parse(message.data.response_headers),
                body: message.data.response_body
              }
            };
            
            setLogs(prevLogs => [log, ...prevLogs]);
          }
        } catch (err) {
          console.error('Error processing SSE message:', err);
        }
      };

      eventSource.onerror = (error) => {
        if (!isComponentMounted) return;
        console.error('SSE error:', error);
        setError('Failed to connect to event stream');
        setIsLoading(false);
        setIsConnected(false);

        // Close the current connection
        eventSource.close();

        // Clear any existing retry timeout
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }

        // Attempt to reconnect if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
          retryTimeout = setTimeout(connectSSE, retryDelay);
        } else {
          setError('Failed to connect after multiple attempts. Please refresh the page.');
        }
      };
    };

    // Initial connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      isComponentMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [interceptorId, useSSE, workerMode]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.method.toLowerCase().includes(query) ||
      log.originalUrl.toLowerCase().includes(query) ||
      log.response.status.toString().includes(query) ||
      log.duration.toString().includes(query)
    );
  });

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
    <div className="h-[calc(100vh-20rem)] flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Logs</h2>
          {workerMode === 'sse' && useSSE && (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
              isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          )}
          {workerMode === 'api' && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              API Mode
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {workerMode === 'sse' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">API Mode</span>
              <Switch
                checked={!useSSE}
                onChange={() => setUseSSE(!useSSE)}
                className={`${
                  !useSSE ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    !useSSE ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm text-gray-500 dark:text-gray-400">SSE Mode</span>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'request' : 'requests'}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No matching requests found' : 'Waiting for requests...'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.duration}ms
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white truncate">
                  {log.originalUrl}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 