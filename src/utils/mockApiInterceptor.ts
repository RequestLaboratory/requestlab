import { mockApiStorage } from './mockApiStorage';

// Mock API request interceptor
class MockApiInterceptor {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🎭 Initializing Mock API interceptor...');
    
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      
      console.log('🌐 Fetch request:', { method, url });
      
      // Check if this is a mock API request (contains /mock or /mocks)
      if (url.includes('/mock')) {
        console.log(`🎭 Mock API detected: ${method} ${url}`);
        return this.generateMockResponse(url, method);
      }
      
      console.log(`🌍 Proceeding with real fetch: ${method} ${url}`);
      // If not a mock API, proceed with normal fetch
      return originalFetch(input, init);
    };

    this.isInitialized = true;
    console.log('🎭 Mock API interceptor initialized successfully');
  }

  private generateMockResponse(url: string, method: string): Response {
    // Extract path for the mock response
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Generate a consistent mock response
    const mockData = {
      message: "This is a mock response",
      method: method,
      path: path,
      originalUrl: url,
      timestamp: new Date().toISOString(),
      mockId: Math.floor(Math.random() * 1000),
      data: {
        id: Math.floor(Math.random() * 1000),
        name: "Mock Data",
        description: `Mock response for ${method} ${path}`,
        status: "success",
        items: [
          { id: 1, name: "Mock Item 1", value: "Sample Value 1" },
          { id: 2, name: "Mock Item 2", value: "Sample Value 2" },
          { id: 3, name: "Mock Item 3", value: "Sample Value 3" }
        ]
      },
      metadata: {
        isMock: true,
        generatedAt: new Date().toISOString(),
        requestMethod: method,
        requestPath: path
      }
    };

    // Create mock response with proper headers
    const response = new Response(JSON.stringify(mockData, null, 2), {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Mock-Response': 'true',
        'X-Mock-Timestamp': new Date().toISOString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      })
    });

    console.log('🎭 Generated mock response:', mockData);
    return response;
  }
}

export const mockApiInterceptor = new MockApiInterceptor(); 