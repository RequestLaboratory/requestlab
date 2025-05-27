interface CurlResponse {
  data: any;
  error: string | null;
}

export const executeCurl = async (curlCommand: string): Promise<CurlResponse> => {
  try {
    // Extract the URL from the curl command
    const urlMatch = curlCommand.match(/(?:curl\s+)(['"]?)(https?:\/\/[^'"]+)\1/);
    if (!urlMatch) {
      return { data: null, error: 'Invalid cURL command: Could not extract URL' };
    }

    const url = urlMatch[2];

    // Extract headers
    const headers: Record<string, string> = {};
    const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    for (const match of headerMatches) {
      const [_, header] = match;
      const [key, value] = header.split(':').map(s => s.trim());
      headers[key] = value;
    }

    // Extract method
    let method = 'GET';
    const methodMatch = curlCommand.match(/-X\s+['"]?([A-Z]+)['"]?/);
    if (methodMatch) {
      method = methodMatch[1];
    }

    // Extract body
    let body: string | undefined;
    const dataMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      body = dataMatch[1];
    }

    // Make the request
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to execute cURL command',
    };
  }
};

export const formatCurlResponse = (response: CurlResponse): string => {
  if (response.error) {
    return JSON.stringify({ error: response.error }, null, 2);
  }
  return JSON.stringify(response.data, null, 2);
}; 