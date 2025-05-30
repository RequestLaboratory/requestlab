import React, { useState } from 'react';
import { format } from 'date-fns';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface LogDetailsProps {
  log: {
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
  } | null;
}

type Tab = 'request' | 'response';

export default function LogDetails({ log }: LogDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('request');
  const [copied, setCopied] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!log) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a log to view details
      </div>
    );
  }

  const requestHeaders = log.headers || {};
  const responseHeaders = log.response.headers || {};

  const copyCurlCommand = () => {
    const curlCommand = `curl -X ${log.method} '${log.originalUrl}' \\
${Object.entries(requestHeaders)
  .map(([key, value]) => `  -H '${key}: ${value}'`)
  .join(' \\\n')}${log.body ? ` \\
  -d '${log.body}'` : ''}`;
    
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyResponseBody = () => {
    if (log.response.body) {
      navigator.clipboard.writeText(log.response.body);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="h-[calc(100vh-20rem)] flex flex-col">
      {/* Fixed Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('request')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'request'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'response'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Response
          </button>
        </nav>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {activeTab === 'request' ? (
            <>
              {/* Basic Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Method:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{log.method}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {typeof log.duration === 'number' ? `${log.duration.toFixed(2)}ms` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Time:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">URLs</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Original URL:</span>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                      <code className="text-sm text-gray-900 dark:text-white break-all">{log.originalUrl}</code>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Proxy URL:</span>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                      <code className="text-sm text-gray-900 dark:text-white break-all">{log.proxyUrl}</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* cURL Command */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">cURL Command</h3>
                  <button
                    onClick={copyCurlCommand}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    title="Copy cURL command"
                  >
                    {copied ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ClipboardIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                    {`curl -X ${log.method} '${log.originalUrl}' \\
${Object.entries(requestHeaders)
  .map(([key, value]) => `  -H '${key}: ${value}'`)
  .join(' \\\n')}${log.body ? ` \\
  -d '${log.body}'` : ''}`}
                  </pre>
                </div>
              </div>

              {/* Request Headers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Request Headers</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                    {Object.entries(requestHeaders)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n')}
                  </pre>
                </div>
              </div>

              {/* Request Body */}
              {log.body && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Request Body</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                      {log.body}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Response Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 font-medium ${
                      log.response.status >= 200 && log.response.status < 300 ? 'text-green-600 dark:text-green-400' :
                      log.response.status >= 400 ? 'text-red-600 dark:text-red-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {log.response.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {typeof log.duration === 'number' ? `${log.duration.toFixed(2)}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Response Body */}
              {log.response.body && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Body</h3>
                    <button
                      onClick={copyResponseBody}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      title="Copy response body"
                    >
                      {copiedResponse ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                      {log.response.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response Headers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Response Headers</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                    {Object.entries(responseHeaders)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n')}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 