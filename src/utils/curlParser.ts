interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  queryParams: Record<string, string>;
}

export function parseCurlCommand(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    queryParams: {}
  };

  // Extract URL
  const urlMatch = curlCommand.match(/(?:curl\s+)(['"]?)(https?:\/\/[^'"]+)\1/);
  if (urlMatch) {
    result.url = urlMatch[2];
  }

  // Extract method
  const methodMatch = curlCommand.match(/-X\s+['"]?([A-Z]+)['"]?/);
  if (methodMatch) {
    result.method = methodMatch[1];
  }

  // Extract headers
  const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
  for (const match of headerMatches) {
    const [, header] = match;
    const [key, value] = header.split(':').map(s => s.trim());
    if (key && value) {
      result.headers[key] = value;
    }
  }

  // Extract body
  const dataMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
  if (dataMatch) {
    result.body = dataMatch[1];
  }

  // Extract query parameters from URL
  const url = new URL(result.url);
  url.searchParams.forEach((value, key) => {
    result.queryParams[key] = value;
  });

  return result;
} 