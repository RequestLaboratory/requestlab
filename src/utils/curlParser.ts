export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export function parseCurl(curlCommand: string): ParsedCurl {
  // Remove leading/trailing whitespace and normalize
  const normalized = curlCommand.trim().replace(/\\\s*\n\s*/g, ' ');
  
  // Default values
  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | undefined;

  // Extract method
  const methodMatch = normalized.match(/-X\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  }

  // Extract URL - find the first URL after curl
  const urlMatch = normalized.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s]+)['"]?/);
  if (urlMatch) {
    url = urlMatch[1];
  }

  // Extract headers
  const headerMatches = normalized.matchAll(/-H\s+['"]([^'"]+)['"]/g);
  for (const match of headerMatches) {
    const headerLine = match[1];
    const colonIndex = headerLine.indexOf(':');
    if (colonIndex > 0) {
      const key = headerLine.substring(0, colonIndex).trim();
      const value = headerLine.substring(colonIndex + 1).trim();
      headers[key] = value;
    }
  }

  // Extract body data
  const bodyMatch = normalized.match(/-d\s+['"]([^'"]*)['"]/s) || 
                   normalized.match(/--data\s+['"]([^'"]*)['"]/s) ||
                   normalized.match(/--data-raw\s+['"]([^'"]*)['"]/s);
  if (bodyMatch) {
    body = bodyMatch[1];
  }

  return {
    method,
    url,
    headers,
    body
  };
}

// Export with old name for compatibility
export const parseCurlCommand = parseCurl;

export function generateCurlFromComponents(method: string, url: string, headers: Record<string, string>, body?: string): string {
  let curl = `curl -X ${method} '${url}'`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H '${key}: ${value}'`;
  });
  
  // Add body if present
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    curl += ` \\\n  -d '${body}'`;
  }
  
  return curl;
} 