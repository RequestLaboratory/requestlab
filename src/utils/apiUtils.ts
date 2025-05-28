interface ApiResponse {
  data: string | Record<string, unknown>;
  status: number;
  headers: Record<string, string>;
}

interface ApiRequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export async function executeApiRequest(url: string, options: ApiRequestOptions): Promise<ApiResponse> {
  try {
    const response = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body
    });

    // Get response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Get response body
    let data: string | Record<string, unknown>;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      data,
      status: response.status,
      headers
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute API request: ${error.message}`);
    }
    throw new Error('Failed to execute API request: Unknown error');
  }
}

export const formatApiResponse = (response: ApiResponse): string => {
  return JSON.stringify(response.data, null, 2);
}; 