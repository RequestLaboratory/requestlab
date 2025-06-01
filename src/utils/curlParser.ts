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

  // Clean up the command
  const cleanCommand = curlCommand
    .replace(/\\\n/g, ' ') // Replace line continuations with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Extract URL
  const urlMatch = cleanCommand.match(/(?:curl\s+)(?:--location\s+)?(?:--request\s+[A-Z]+\s+)?(['"]?)(https?:\/\/[^'"]+)\1/);
  if (urlMatch) {
    result.url = urlMatch[2];
  }

  // Extract method
  const methodMatch = cleanCommand.match(/(?:--request|-X)\s+['"]?([A-Z]+)['"]?/);
  if (methodMatch) {
    result.method = methodMatch[1];
  }

  // Extract headers
  const headerMatches = cleanCommand.matchAll(/(?:--header|-H)\s+['"]([^'"]+)['"]/g);
  for (const match of headerMatches) {
    const [, header] = match;
    const [key, value] = header.split(':').map(s => s.trim());
    if (key && value) {
      result.headers[key] = value;
    }
  }

  // Extract body (support --data, --data-raw, --data-binary, -d) with multiline and complex JSON support
  const dataFlagRegex = /(?:--data(?:-raw)?|--data-binary|-d)\s+(['"])([\s\S]*?)\1/g;
  let dataMatch;
  let body = '';
  while ((dataMatch = dataFlagRegex.exec(cleanCommand)) !== null) {
    // Concatenate all data flags (in case of multiple)
    body += (body ? '\n' : '') + dataMatch[2];
  }
  if (body) {
    result.body = body;
    if (!methodMatch) {
      result.method = 'POST';
    }
  }

  // Extract query parameters from URL
  try {
    const url = new URL(result.url);
    url.searchParams.forEach((value, key) => {
      result.queryParams[key] = value;
    });
  } catch (e) {
    console.error('Failed to parse URL:', e);
  }

  return result;
} 