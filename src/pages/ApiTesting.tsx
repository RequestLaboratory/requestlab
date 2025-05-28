import React, { useState } from 'react';
import { executeApiRequest } from '../utils/apiTestingUtils';
import { parseCurlCommand } from '../utils/curlParser';

interface RequestDetails {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  queryParams: Record<string, string>;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string | Record<string, unknown>;
  time: number;
  size: number;
}

const ApiTesting: React.FC = () => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    queryParams: {}
  });
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'pre-request' | 'tests'>('params');
  const [bodyType, setBodyType] = useState<'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded'>('none');
  const [contentType, setContentType] = useState('application/json');

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const startTime = Date.now();
      const result = await executeApiRequest({
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          ...requestDetails.headers,
          'Content-Type': contentType
        },
        body: requestDetails.body || undefined,
        followRedirects: true
      });
      const endTime = Date.now();

      if (result.error) {
        setError(result.error);
        return;
      }
      
      const responseData = result.data as { response: unknown; status: number; headers: Record<string, string> };
      setResponse({
        status: responseData.status,
        statusText: '',
        headers: responseData.headers,
        data: responseData.response,
        time: endTime - startTime,
        size: typeof responseData.response === 'string' 
          ? responseData.response.length 
          : JSON.stringify(responseData.response).length
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to execute request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if the pasted text looks like a cURL command
    if (pastedText.trim().toLowerCase().startsWith('curl')) {
      try {
        const parsedCurl = parseCurlCommand(pastedText);
        
        // Update all fields based on the parsed cURL
        setRequestDetails(prev => ({
          ...prev,
          method: parsedCurl.method || 'GET',
          url: parsedCurl.url || '',
          headers: parsedCurl.headers || {},
          body: parsedCurl.body || '',
          queryParams: parsedCurl.queryParams || {}
        }));
        
        // Convert headers array to the format we use
        const newHeaders = Object.entries(parsedCurl.headers).map(([key, value]) => ({
          key,
          value: value as string
        }));
        setRequestDetails(prev => ({
          ...prev,
          headers: newHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {})
        }));
        
        // Set body type if present
        if (parsedCurl.body) {
          setBodyType('raw');
          
          // Try to detect content type from headers
          const contentTypeHeader = newHeaders.find(h => 
            h.key.toLowerCase() === 'content-type'
          );
          if (contentTypeHeader) {
            setContentType(contentTypeHeader.value);
          }
        }
        
        // Prevent the default paste behavior
        e.preventDefault();
      } catch (err) {
        console.error('Failed to parse cURL command:', err);
        // If parsing fails, allow normal paste behavior
      }
    }
  };

  const handleMethodChange = (method: string) => {
    setRequestDetails(prev => ({ ...prev, method }));
  };

  const handleUrlChange = (url: string) => {
    setRequestDetails(prev => ({ ...prev, url }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setRequestDetails(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }));
  };

  const handleBodyChange = (body: string) => {
    setRequestDetails(prev => ({ ...prev, body }));
  };

  const handleQueryParamChange = (key: string, value: string) => {
    setRequestDetails(prev => ({
      ...prev,
      queryParams: { ...prev.queryParams, [key]: value }
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <select
          value={requestDetails.method}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
        <input
          type="text"
          value={requestDetails.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onPaste={handleUrlPaste}
          placeholder="Enter Request URL"
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Request Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('params')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'params'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Params
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'headers'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'body'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('pre-request')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pre-request'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Pre-request Script
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tests'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Tests
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-auto">
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="col-span-4">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                {Object.entries(requestDetails.queryParams).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-12 gap-4">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleQueryParamChange(e.target.value, value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleQueryParamChange(key, e.target.value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Description"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleQueryParamChange('', '')}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >
                  + Add Parameter
                </button>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="col-span-4">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                {Object.entries(requestDetails.headers).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-12 gap-4">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleHeaderChange(e.target.value, value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleHeaderChange(key, e.target.value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Description"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleHeaderChange('', '')}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >
                  + Add Header
                </button>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setBodyType('raw')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'raw'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    raw
                  </button>
                  <button
                    onClick={() => setBodyType('form-data')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'form-data'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    form-data
                  </button>
                  <button
                    onClick={() => setBodyType('x-www-form-urlencoded')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'x-www-form-urlencoded'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    x-www-form-urlencoded
                  </button>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option>JSON</option>
                    <option>Text</option>
                    <option>JavaScript</option>
                    <option>HTML</option>
                    <option>XML</option>
                  </select>
                </div>
                <textarea
                  value={requestDetails.body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Enter request body"
                />
              </div>
            )}

            {activeTab === 'pre-request' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <select className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>JavaScript</option>
                  </select>
                </div>
                <textarea
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="// Write your pre-request script here"
                />
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <select className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>JavaScript</option>
                  </select>
                </div>
                <textarea
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="// Write your test script here"
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        {response && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Response</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Status: {response.status}</span>
                  <span>Time: {response.time}ms</span>
                  <span>Size: {response.size} B</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-md shadow-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ApiTesting; 