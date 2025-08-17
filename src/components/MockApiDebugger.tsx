import React, { useState } from 'react';

export default function MockApiDebugger() {
  const [interceptorId, setInterceptorId] = useState('skq8jd');
  const [testUrl, setTestUrl] = useState('http://localhost:3004/skq8jd/GET/mock/1');
  const [result, setResult] = useState<string>('');

  const testMockApi = async () => {
    try {
      setResult('Testing mock API...');
      console.log('🎭 Testing mock URL:', testUrl);
      
      const response = await fetch(testUrl);
      const data = await response.text();
      
      setResult(`
Status: ${response.status}
Status Text: ${response.statusText}
Headers: ${JSON.stringify(Object.fromEntries(response.headers))}
Body: ${data}
      `);
      console.log('🎭 Mock response:', { status: response.status, data });
    } catch (error) {
      setResult(`Fetch error: ${error}`);
      console.error('🎭 Fetch error:', error);
    }
  };

  const testRealApi = async () => {
    try {
      setResult('Testing real API (without /mock)...');
      const realUrl = testUrl.replace('/mock', '');
      console.log('🎭 Testing real API URL:', realUrl);
      
      const response = await fetch(realUrl);
      const data = await response.text();
      
      setResult(`
Real API Response:
Status: ${response.status}
Status Text: ${response.statusText}
Headers: ${JSON.stringify(Object.fromEntries(response.headers))}
Body: ${data}
      `);
      console.log('🎭 Real API response:', { status: response.status, data });
    } catch (error) {
      setResult(`Real API error: ${error}`);
      console.error('🎭 Real API error:', error);
    }
  };

  const testDifferentMockUrls = async () => {
    const testUrls = [
      `http://localhost:3004/${interceptorId}/users/mock`,
      `http://localhost:3004/${interceptorId}/api/v1/mock/data`,
      `http://localhost:3004/${interceptorId}/products/mock/123`,
      `http://localhost:3004/${interceptorId}/data/mocks/test`
    ];

    try {
      setResult('Testing different mock URLs...\n\n');
      
      for (const url of testUrls) {
        console.log(`🎭 Testing URL: ${url}`);
        
        try {
          const response = await fetch(url);
          const data = await response.text();
          const parsed = JSON.parse(data);
          
          setResult(prev => prev + `✅ ${url}:\nStatus: ${response.status}\nMessage: ${parsed.message}\nIs Mock: ${parsed.metadata?.isMock}\n\n`);
        } catch (error) {
          setResult(prev => prev + `❌ ${url}: Error - ${error}\n\n`);
        }
      }
    } catch (error) {
      setResult(`Test error: ${error}`);
    }
  };

  const testMocksVsReal = async () => {
    const baseUrl = `http://localhost:3004/${interceptorId}/users`;
    
    try {
      setResult('Comparing Mock vs Real API...\n\n');
      
      // Test real API
      console.log('🎭 Testing real API:', baseUrl);
      try {
        const realResponse = await fetch(baseUrl);
        const realData = await realResponse.text();
        setResult(prev => prev + `REAL API (${baseUrl}):\nStatus: ${realResponse.status}\nData: ${realData.substring(0, 200)}...\n\n`);
      } catch (error) {
        setResult(prev => prev + `REAL API ERROR: ${error}\n\n`);
      }
      
      // Test mock API
      const mockUrl = baseUrl + '/mock';
      console.log('🎭 Testing mock API:', mockUrl);
      try {
        const mockResponse = await fetch(mockUrl);
        const mockData = await mockResponse.text();
        const parsed = JSON.parse(mockData);
        setResult(prev => prev + `MOCK API (${mockUrl}):\nStatus: ${mockResponse.status}\nMessage: ${parsed.message}\nIs Mock: ${parsed.metadata.isMock}\n\n`);
      } catch (error) {
        setResult(prev => prev + `MOCK API ERROR: ${error}\n\n`);
      }
      
    } catch (error) {
      setResult(`Test error: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Mock API Debugger
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>✅ Mock APIs Working!</strong> Any URL containing "/mock" or "/mocks" will return a hardcoded mock response. 
            Both client-side and server-side interception are active.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interceptor ID
          </label>
          <input
            type="text"
            value={interceptorId}
            onChange={(e) => setInterceptorId(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test URL (with /mock)
          </label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={testMockApi}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test Mock API
          </button>
          <button
            onClick={testRealApi}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Real API
          </button>
          <button
            onClick={testDifferentMockUrls}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Test Different URLs
          </button>
          <button
            onClick={testMocksVsReal}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Compare Mock vs Real
          </button>
        </div>

        {result && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Result
            </label>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 