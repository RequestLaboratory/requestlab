import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { mockApiStorage, MockApi } from '../../utils/mockApiStorage';
import { parseCurl, generateCurlFromComponents } from '../../utils/curlParser';
import { API_BASE_URL } from '../../config';

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

interface MockApiModalProps {
  mockApi?: MockApi;
  interceptorId: string;
  interceptor?: Interceptor;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  logForMocking?: Log;
}

type InputMode = 'curl' | 'manual';

const DEFAULT_CURL = `curl -X GET 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token'`;

export default function MockApiModal({ mockApi, interceptorId, interceptor, isOpen, onClose, onSave, logForMocking }: MockApiModalProps) {
  const [inputMode, setInputMode] = useState<InputMode>('curl');
  const [name, setName] = useState('');
  const [curlCommand, setCurlCommand] = useState(DEFAULT_CURL);
  
  // Manual input fields
  const [method, setMethod] = useState('GET');
  const [originalUrl, setOriginalUrl] = useState('');
  const [mockEndpoint, setMockEndpoint] = useState('');
  const [requestHeaders, setRequestHeaders] = useState('{"Content-Type": "application/json"}');
  const [requestBody, setRequestBody] = useState('');
  
  // Response fields
  const [responseStatus, setResponseStatus] = useState(200);
  const [responseHeaders, setResponseHeaders] = useState('{"Content-Type": "application/json"}');
  const [responseBody, setResponseBody] = useState('{"message": "Mock response"}');
  const [isActive, setIsActive] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mockApi) {
        setName(mockApi.name);
        setMethod(mockApi.method);
        setRequestHeaders(JSON.stringify(mockApi.headers, null, 2));
        setRequestBody(mockApi.body || '');
        setResponseStatus(mockApi.response.status);
        setResponseHeaders(JSON.stringify(mockApi.response.headers, null, 2));
        setResponseBody(mockApi.response.body);
        setIsActive(mockApi.isActive);
        setInputMode('manual'); // When editing, show manual mode
        
        // Extract mock endpoint from stored URL
        // The stored URL is like "https://interceptor.base_url/path/mock"
        // We need to extract the path part that comes after the base URL
        if (interceptor) {
          const baseUrl = interceptor.base_url.replace(/\/$/, '');
          if (mockApi.url.startsWith(baseUrl)) {
            setMockEndpoint(mockApi.url.substring(baseUrl.length));
            setOriginalUrl(mockApi.url.replace('/mock', ''));
          } else {
            // Fallback if URL doesn't start with base URL
            try {
              const url = new URL(mockApi.url);
              setMockEndpoint(url.pathname);
              setOriginalUrl(mockApi.url.replace('/mock', ''));
            } catch {
              setMockEndpoint(mockApi.url);
              setOriginalUrl(mockApi.url.replace('/mock', ''));
            }
          }
        }
      } else if (logForMocking) {
        // Populate fields from the selected log
        try {
          const url = new URL(logForMocking.originalUrl);
          const pathName = url.pathname;
          const mockPath = pathName.includes('/mock') ? pathName : pathName + '/mock';
          
          setName(`Mock for ${logForMocking.method} ${pathName}`);
          setMethod(logForMocking.method);
          setOriginalUrl(logForMocking.originalUrl);
          setMockEndpoint(mockPath);
          setRequestHeaders(JSON.stringify(logForMocking.headers, null, 2));
          setRequestBody(logForMocking.body || '');
          setResponseStatus(logForMocking.response.status);
          setResponseHeaders(JSON.stringify(logForMocking.response.headers, null, 2));
          setResponseBody(logForMocking.response.body || '{"message": "Mock response"}');
          setIsActive(true);
          setInputMode('manual'); // Show manual mode when creating from log
        } catch (error) {
          // Fallback if URL parsing fails
          setName(`Mock for ${logForMocking.method} request`);
          setMethod(logForMocking.method);
          setOriginalUrl(logForMocking.originalUrl);
          setMockEndpoint('/mock/api');
          setRequestHeaders(JSON.stringify(logForMocking.headers, null, 2));
          setRequestBody(logForMocking.body || '');
          setResponseStatus(logForMocking.response.status);
          setResponseHeaders(JSON.stringify(logForMocking.response.headers, null, 2));
          setResponseBody(logForMocking.response.body || '{"message": "Mock response"}');
          setIsActive(true);
          setInputMode('manual');
        }
      } else {
        // Reset form for new mock API
        setName('');
        setCurlCommand(DEFAULT_CURL);
        setMethod('GET');
        setOriginalUrl('');
        setMockEndpoint('');
        setRequestHeaders('{"Content-Type": "application/json"}');
        setRequestBody('');
        setResponseStatus(200);
        setResponseHeaders('{"Content-Type": "application/json"}');
        setResponseBody('{"message": "Mock response"}');
        setIsActive(true);
        setInputMode('curl');
      }
      setError(null);
    }
  }, [isOpen, mockApi, interceptor, logForMocking]);

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const parseCurlAndPopulate = () => {
    try {
      const parsed = parseCurl(curlCommand);
      
      if (!parsed.url) {
        setError('Invalid cURL command - no URL found');
        return;
      }

      // Set method
      setMethod(parsed.method);
      
      // Set original URL
      setOriginalUrl(parsed.url);
      
      // Extract path from the original URL and create mock endpoint
      try {
        const url = new URL(parsed.url);
        // If we have an interceptor, replace the base URL
        if (interceptor) {
          const interceptorBaseUrl = new URL(interceptor.base_url);
          if (url.hostname === interceptorBaseUrl.hostname) {
            // Same domain - just use the path + /mock
            setMockEndpoint(url.pathname + '/mock');
          } else {
            // Different domain - use full path + /mock
            setMockEndpoint(url.pathname + '/mock');
          }
        } else {
          setMockEndpoint(url.pathname + '/mock');
        }
      } catch {
        // If not a valid URL, treat as path
        const path = parsed.url.startsWith('/') ? parsed.url : '/' + parsed.url;
        setMockEndpoint(path + '/mock');
      }
      
      // Set request headers
      setRequestHeaders(JSON.stringify(parsed.headers, null, 2));
      
      // Set request body
      setRequestBody(parsed.body || '');
      
      // Auto-generate name from URL
      try {
        const url = new URL(parsed.url);
        const pathName = url.pathname.split('/').filter(Boolean).join('_') || 'api';
        setName(`${parsed.method} ${pathName}`);
      } catch {
        setName(`${parsed.method} API`);
      }
      
      // Switch to manual mode for editing
      setInputMode('manual');
      setError(null);
      
    } catch (err) {
      setError('Failed to parse cURL command');
    }
  };

  const buildMockUrl = () => {
    if (!interceptor || !mockEndpoint) return '';
    
    // Create the full mock URL that will be stored
    // This replaces the original base URL with the interceptor's base URL
    const baseUrl = interceptor.base_url.replace(/\/$/, '');
    const endpoint = mockEndpoint.startsWith('/') ? mockEndpoint : '/' + mockEndpoint;
    return baseUrl + endpoint;
  };

  const getProxyUrl = () => {
    if (!interceptor || !mockEndpoint) return '';
    
    // Create the proxy URL that users will call
    const endpoint = mockEndpoint.startsWith('/') ? mockEndpoint : '/' + mockEndpoint;
    return `${API_BASE_URL}/${interceptor.id}${endpoint}`;
  };

  const getOriginalProxyUrl = () => {
    if (!interceptor || !mockEndpoint) return '';
    
    // Show what the original (non-mock) proxy URL would be
    const endpoint = mockEndpoint.replace('/mock', '').startsWith('/') 
      ? mockEndpoint.replace('/mock', '') 
      : '/' + mockEndpoint.replace('/mock', '');
    return `${API_BASE_URL}/${interceptor.id}${endpoint}`;
  };

  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!mockEndpoint.trim()) {
      setError('Mock endpoint is required');
      return;
    }

    if (!mockEndpoint.includes('/mock')) {
      setError('Mock endpoint must contain "/mock" to differentiate from real APIs');
      return;
    }

    if (!validateJson(requestHeaders)) {
      setError('Request headers must be valid JSON');
      return;
    }

    if (!validateJson(responseHeaders)) {
      setError('Response headers must be valid JSON');
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();
      const fullMockUrl = buildMockUrl();
      
      const savedMockApi: MockApi = {
        id: mockApi?.id || crypto.randomUUID(),
        name: name.trim(),
        method: method,
        url: fullMockUrl,
        headers: JSON.parse(requestHeaders),
        body: requestBody.trim() || undefined,
        response: {
          status: responseStatus,
          headers: JSON.parse(responseHeaders),
          body: responseBody,
        },
        interceptorId,
        isActive,
        createdAt: mockApi?.createdAt || now,
        updatedAt: now,
      };

      await mockApiStorage.saveMockApi(savedMockApi);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save mock API:', error);
      setError('Failed to save mock API');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {mockApi ? 'Edit Mock API' : 'Create Mock API'}
            </h3>

            {/* Interceptor Details Header */}
            {interceptor && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Interceptor Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <div className="bg-white dark:bg-gray-800 rounded p-2 mt-1">
                      <code className="text-gray-900 dark:text-white">{interceptor.name}</code>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Base URL:</span>
                    <div className="bg-white dark:bg-gray-800 rounded p-2 mt-1">
                      <code className="text-gray-900 dark:text-white break-all">{interceptor.base_url}</code>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>How it works:</strong> Original URLs are replaced with the interceptor's base URL. Adding "/mock" to any endpoint returns the mock response instead of proxying to the real API.
                  </p>
                </div>
              </div>
            )}

            {/* Input Mode Toggle */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setInputMode('curl')}
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      inputMode === 'curl'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    cURL Input
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      inputMode === 'manual'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Manual Input
                  </button>
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name Field - Always visible */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="My Mock API"
                  required
                />
              </div>

              {inputMode === 'curl' ? (
                /* cURL Input Mode */
                <div className="space-y-4">
                  <div>
                    <label htmlFor="curl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      cURL Command
                    </label>
                    <textarea
                      id="curl"
                      value={curlCommand}
                      onChange={(e) => setCurlCommand(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                      rows={6}
                      placeholder={DEFAULT_CURL}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Paste your cURL command here and click "Parse cURL" to auto-populate all fields below.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={parseCurlAndPopulate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Parse cURL & Auto-populate
                  </button>
                </div>
              ) : null}

              {/* Request Section - Always visible in manual mode, visible after parsing in cURL mode */}
              {(inputMode === 'manual' || (inputMode === 'curl' && method && originalUrl)) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Request Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Method
                      </label>
                      <select
                        id="method"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Original URL
                      </label>
                      <input
                        type="text"
                        id="originalUrl"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="https://api.example.com/users"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        The original API URL that will be replaced
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="mockEndpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mock Endpoint *
                    </label>
                    <input
                      type="text"
                      id="mockEndpoint"
                      value={mockEndpoint}
                      onChange={(e) => setMockEndpoint(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="/api/users/mock"
                      required
                    />
                    {mockEndpoint && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <strong>Mock URL:</strong> <code>{getProxyUrl()}</code>
                        </p>
                        {mockEndpoint.includes('/mock') && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Real URL:</strong> <code>{getOriginalProxyUrl()}</code>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="requestHeaders" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Request Headers (JSON)
                    </label>
                    <textarea
                      id="requestHeaders"
                      value={requestHeaders}
                      onChange={(e) => setRequestHeaders(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                      rows={4}
                    />
                  </div>

                  {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <div className="mb-4">
                      <label htmlFor="requestBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Request Body
                      </label>
                      <textarea
                        id="requestBody"
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                        rows={4}
                        placeholder="Request body (optional)"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Response Section - Always visible when request details are shown */}
              {(inputMode === 'manual' || (inputMode === 'curl' && method && originalUrl)) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Response Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="responseStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status Code
                      </label>
                      <input
                        type="number"
                        id="responseStatus"
                        value={responseStatus}
                        onChange={(e) => setResponseStatus(parseInt(e.target.value) || 200)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        min="100"
                        max="599"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Active (intercept requests)
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="responseHeaders" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Headers (JSON)
                    </label>
                    <textarea
                      id="responseHeaders"
                      value={responseHeaders}
                      onChange={(e) => setResponseHeaders(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label htmlFor="responseBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Body
                    </label>
                    <textarea
                      id="responseBody"
                      value={responseBody}
                      onChange={(e) => setResponseBody(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm font-mono"
                      rows={6}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}