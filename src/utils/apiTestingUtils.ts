interface ApiResponse {
  data: unknown;
  error: string | null;
}

interface ApiOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
  followRedirects?: boolean;
  signal?: AbortSignal;
}

export interface LoadTestConfig {
  numUsers: number;
  requestsPerMinute: number;
}

export interface LoadTestResult {
  id: number;
  userId: number;
  method: string;
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  status?: number;
  statusText?: string;
  responseSize: number;
  error?: string;
  connectionInfo?: {
    protocol: string;
    host: string;
    keepAlive: boolean;
  };
}

export const executeApiRequest = async (options: ApiOptions): Promise<ApiResponse> => {
  try {
    // Make the request
    const controller = new AbortController();
    if (options.timeout) {
      setTimeout(() => controller.abort(), options.timeout * 1000);
    }

    // Use the CORS proxy for all requests
    const proxyUrl = `https://corsproxy.yadev64.workers.dev?url=${encodeURIComponent(options.url)}`;

    const response = await fetch(proxyUrl, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
      redirect: options.followRedirects ? 'follow' : 'manual'
    });

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    return {
      data: {
        response: data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      },
      error: null
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out' };
      }
      return { data: null, error: error.message };
    }
    return { data: null, error: 'Failed to execute API request' };
  }
};

export const formatApiResponse = (response: ApiResponse): string => {
  if (response.error) {
    return JSON.stringify({ error: response.error }, null, 2);
  }
  return JSON.stringify(response.data, null, 2);
}; 