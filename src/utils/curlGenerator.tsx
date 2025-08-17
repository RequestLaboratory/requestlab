import { MockApi } from './mockApiStorage';

export function generateCurl(mockApi: MockApi): string {
  const { method, url, headers, body } = mockApi;
  
  let curl = `curl -X ${method.toUpperCase()}`;
  
  // Add URL
  curl += ` '${url}'`;
  
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

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}