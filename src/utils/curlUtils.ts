interface CurlResponse {
  data: unknown;
  error: string | null;
}

interface CurlOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  insecure?: boolean;
  verbose?: boolean;
  timeout?: number;
  followRedirects?: boolean;
}

export const executeCurl = async (curlCommand: string): Promise<CurlResponse> => {
  try {
    // Extract the URL from the curl command
    const urlMatch = curlCommand.match(/(?:curl\s+)(['"]?)(https?:\/\/[^'"]+)\1/);
    if (!urlMatch) {
      return { data: null, error: 'Invalid cURL command: Could not extract URL' };
    }

    const options: CurlOptions = {
      url: urlMatch[2],
      method: 'GET',
      headers: {},
      insecure: false,
      verbose: false,
      followRedirects: true
    };

    // Extract headers
    const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    for (const match of headerMatches) {
      const [, header] = match;
      const [key, value] = header.split(':').map(s => s.trim());
      options.headers[key] = value;
    }

    // Extract method
    const methodMatch = curlCommand.match(/-X\s+['"]?([A-Z]+)['"]?/);
    if (methodMatch) {
      options.method = methodMatch[1];
    }

    // Extract body
    const dataMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      options.body = dataMatch[1];
    }

    // Extract other options
    if (curlCommand.includes('-k') || curlCommand.includes('--insecure')) {
      options.insecure = true;
    }
    if (curlCommand.includes('-v') || curlCommand.includes('--verbose')) {
      options.verbose = true;
    }
    if (curlCommand.includes('-L') || curlCommand.includes('--location')) {
      options.followRedirects = true;
    }
    const timeoutMatch = curlCommand.match(/-m\s+(\d+)/);
    if (timeoutMatch) {
      options.timeout = parseInt(timeoutMatch[1], 10);
    }

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

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    // Include verbose information if requested
    if (options.verbose) {
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
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out' };
      }
      return { data: null, error: error.message };
    }
    return { data: null, error: 'Failed to execute cURL command' };
  }
};

export const formatCurlResponse = (response: CurlResponse): string => {
  if (response.error) {
    return JSON.stringify({ error: response.error }, null, 2);
  }
  return JSON.stringify(response.data, null, 2);
}; 