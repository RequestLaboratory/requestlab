import React, { useState, useEffect } from 'react';
import { Globe, List, FileText, Plus, Trash2 } from 'lucide-react';

interface Header {
  key: string;
  value: string;
}

interface CurlPreviewProps {
  curlCommand: string;
  onUpdate: (newCurl: string) => void;
}

type TabType = 'headers' | 'body';

const CurlPreview: React.FC<CurlPreviewProps> = ({ curlCommand, onUpdate }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('headers');

  useEffect(() => {
    parseCurlCommand(curlCommand);
  }, [curlCommand]);

  const parseCurlCommand = (command: string) => {
    // Extract method
    const methodMatch = command.match(/-X\s+['"]?([A-Z]+)['"]?/);
    if (methodMatch) {
      setMethod(methodMatch[1]);
    }

    // Extract URL
    const urlMatch = command.match(/(?:curl\s+)(['"]?)(https?:\/\/[^'"]+)\1/);
    if (urlMatch) {
      setUrl(urlMatch[2]);
    }

    // Extract headers
    const headerMatches = command.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    const newHeaders: Header[] = [];
    for (const match of headerMatches) {
      const header = match[1];
      const [key, value] = header.split(':').map(s => s.trim());
      newHeaders.push({ key, value });
    }
    setHeaders(newHeaders);

    // Extract body
    const dataMatch = command.match(/-d\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      try {
        // Try to format the JSON body
        const parsedBody = JSON.parse(dataMatch[1]);
        setBody(JSON.stringify(parsedBody, null, 2));
      } catch {
        setBody(dataMatch[1]);
      }
    } else {
      setBody('');
    }
  };

  const generateCurlCommand = () => {
    let command = `curl -X ${method}`;
    
    // Add headers
    headers.forEach(header => {
      if (header.key && header.value) {
        command += ` -H "${header.key}: ${header.value}"`;
      }
    });

    // Add body if present
    if (body && method !== 'GET') {
      command += ` -d '${body.replace(/'/g, "\\'")}'`;
    }

    // Add URL
    command += ` "${url}"`;
    
    return command;
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    onUpdate(generateCurlCommand());
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    onUpdate(generateCurlCommand());
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
    onUpdate(generateCurlCommand());
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
    onUpdate(generateCurlCommand());
  };

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    onUpdate(generateCurlCommand());
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Method and URL - Fixed height */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <select
          value={method}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <div className="flex-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter URL"
            className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('headers')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'headers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
            Headers
          </button>
          {method !== 'GET' && (
            <button
              onClick={() => setActiveTab('body')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'body'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Body
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'headers' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative">
              <div className="absolute bottom-3 right-5 z-10">
                <button
                  onClick={addHeader}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
              <div className="absolute inset-0 overflow-y-auto">
                <div className="px-3 pt-3 pb-[70px] space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        placeholder="Key"
                        className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 p-3 min-h-0">
              <textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Enter request body"
                className="w-full h-full min-h-[200px] p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurlPreview; 