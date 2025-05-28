import React, { useState, useEffect } from 'react';
import { executeApiRequest } from '../utils/apiTestingUtils';
import { parseCurlCommand } from '../utils/curlParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check, Expand, X } from 'lucide-react';

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
  const [requestDetails, setRequestDetails] = useState<RequestDetails>(() => {
    const savedState = sessionStorage.getItem('apiTestingState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        method: parsed.method || 'GET',
        url: parsed.url || '',
        headers: parsed.headers || { 'header-1': '' },
        body: parsed.body || '',
        queryParams: parsed.queryParams || {}
      };
    }
    return {
      method: 'GET',
      url: '',
      headers: { 'header-1': '' },
      body: '',
      queryParams: {}
    };
  });

  const [response, setResponse] = useState<ApiResponse | null>(() => {
    const savedResponse = sessionStorage.getItem('apiTestingResponse');
    return savedResponse ? JSON.parse(savedResponse) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'pre-request' | 'tests'>(() => {
    const savedTab = sessionStorage.getItem('apiTestingActiveTab');
    return (savedTab as any) || 'headers';
  });
  const [bodyType, setBodyType] = useState<'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded'>(() => {
    const savedBodyType = sessionStorage.getItem('apiTestingBodyType');
    return (savedBodyType as any) || 'none';
  });
  const [contentType, setContentType] = useState(() => {
    const savedContentType = sessionStorage.getItem('apiTestingContentType');
    return savedContentType || 'application/json';
  });
  const [isResponsePanelVisible, setIsResponsePanelVisible] = useState(() => {
    const savedVisibility = sessionStorage.getItem('apiTestingResponseVisible');
    return savedVisibility ? JSON.parse(savedVisibility) : true;
  });
  const [copied, setCopied] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);

  // Save state to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('apiTestingState', JSON.stringify(requestDetails));
  }, [requestDetails]);

  useEffect(() => {
    if (response) {
      sessionStorage.setItem('apiTestingResponse', JSON.stringify(response));
    }
  }, [response]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingBodyType', bodyType);
  }, [bodyType]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingContentType', contentType);
  }, [contentType]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingResponseVisible', JSON.stringify(isResponsePanelVisible));
  }, [isResponsePanelVisible]);

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

  const handleCopyResponse = () => {
    const responseText = typeof response?.data === 'string'
      ? response.data
      : JSON.stringify(response?.data, null, 2);
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {response && (
          <div className="relative">
            <button
              onClick={() => setIsResponsePanelVisible(!isResponsePanelVisible)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            >
              {isResponsePanelVisible ? (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Hide Response
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  Show Response
                </>
              )}
            </button>
            {!isResponsePanelVisible && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 animate-[gradient_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Request Area */}
        <div className={`flex-1 flex flex-col ${response && isResponsePanelVisible ? 'w-1/2' : 'w-full'}`}>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-4">
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
          <div className="flex-1 py-4 pl-4 overflow-hidden">
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
              <div className="flex flex-col h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  <div className="col-span-4">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 min-h-0">
                  <div className="space-y-4">
                    {Object.entries(requestDetails.headers).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-12 gap-4">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newHeaders = { ...requestDetails.headers };
                            delete newHeaders[key];
                            newHeaders[newKey] = value;
                            setRequestDetails(prev => ({
                              ...prev,
                              headers: newHeaders
                            }));
                          }}
                          className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                          placeholder="Key"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleHeaderChange(key, e.target.value)}
                          className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                          placeholder="Value"
                        />
                        <div className="col-span-4 flex items-center">
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                            placeholder="Description"
                          />
                          <button
                            onClick={() => {
                              const newHeaders = { ...requestDetails.headers };
                              delete newHeaders[key];
                              setRequestDetails(prev => ({
                                ...prev,
                                headers: newHeaders
                              }));
                            }}
                            className="ml-2 p-2 text-red-500 hover:text-red-600 dark:text-red-400 flex-shrink-0"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const newKey = `header-${Object.keys(requestDetails.headers).length + 1}`;
                      setRequestDetails(prev => ({
                        ...prev,
                        headers: { ...prev.headers, [newKey]: '' }
                      }));
                    }}
                    className="flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Header
                  </button>
                </div>
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
        {response && isResponsePanelVisible && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : response.status >= 300 && response.status < 400
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : response.status >= 400 && response.status < 500
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {response.time}ms
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {response.size} bytes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsResponseExpanded(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  title="Expand response"
                >
                  <Expand className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyResponse}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  title="Copy response"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-auto">
                <SyntaxHighlighter
                  language="json"
                  style={vs2015}
                  customStyle={{
                    margin: 0,
                    height: '100%',
                    fontSize: '0.875rem',
                    lineHeight: '1.5rem',
                  }}
                  showLineNumbers
                  wrapLines={false}
                >
                  {typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2)}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Response Modal */}
        {isResponseExpanded && response && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 w-[90vw] h-[90vh] rounded-lg shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : response.status >= 300 && response.status < 400
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : response.status >= 400 && response.status < 500
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.time}ms
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.size} bytes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResponse}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                    title="Copy response"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsResponseExpanded(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full overflow-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={vs2015}
                    customStyle={{
                      margin: 0,
                      height: '100%',
                      fontSize: '0.875rem',
                      lineHeight: '1.5rem',
                    }}
                    showLineNumbers
                    wrapLines={false}
                  >
                    {typeof response.data === 'string'
                      ? response.data
                      : JSON.stringify(response.data, null, 2)}
                  </SyntaxHighlighter>
                </div>
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

const styles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ApiTesting; 