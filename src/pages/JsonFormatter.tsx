import { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle, Wand2, Trash2, Download } from 'lucide-react';
import { toast } from 'react-toastify';

interface FormatError {
  message: string;
  line?: number;
  column?: number;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<FormatError | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError({ message: 'Please enter some JSON to format' });
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
      toast.success('JSON formatted successfully!');
    } catch (e: any) {
      // Try to extract line and column info from the error message
      const errorMessage = e.message || 'Invalid JSON';
      const positionMatch = errorMessage.match(/position (\d+)/);
      
      let errorInfo: FormatError = { message: errorMessage };
      
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const lines = input.substring(0, position).split('\n');
        errorInfo.line = lines.length;
        errorInfo.column = lines[lines.length - 1].length + 1;
      }
      
      setError(errorInfo);
      setOutput('');
    }
  }, [input, indentSize]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError({ message: 'Please enter some JSON to minify' });
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      toast.success('JSON minified successfully!');
    } catch (e: any) {
      setError({ message: e.message || 'Invalid JSON' });
      setOutput('');
    }
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }, [output]);

  const downloadJson = useCallback(() => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON downloaded!');
  }, [output]);

  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.success('Pasted from clipboard!');
    } catch (err) {
      toast.error('Failed to read from clipboard');
    }
  }, []);

  const loadSample = useCallback(() => {
    const sampleJson = {
      "name": "RequestLab",
      "version": "1.0.0",
      "description": "API testing and development toolkit",
      "features": [
        "API Testing",
        "JSON Compare",
        "JSON Formatter",
        "API Interceptor"
      ],
      "settings": {
        "theme": "dark",
        "autoFormat": true,
        "indentSize": 2
      },
      "author": {
        "name": "Developer",
        "email": "dev@example.com"
      }
    };
    setInput(JSON.stringify(sampleJson));
    setError(null);
    setOutput('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            JSON Formatter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Format, validate, and beautify your JSON data. Minify for production or prettify for readability.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={formatJson}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Format
          </button>
          
          <button
            onClick={minifyJson}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Minify
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="text-sm text-gray-600 dark:text-gray-400">Indent:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="1">1 tab</option>
            </select>
          </div>

          <button
            onClick={loadSample}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Load Sample
          </button>

          <button
            onClick={handlePaste}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Paste
          </button>

          <button
            onClick={clearAll}
            className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-medium">Invalid JSON</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error.message}</p>
              {error.line && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  Line {error.line}, Column {error.column}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Input JSON
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"paste": "your JSON here"}'
              className="w-full h-[500px] p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              spellCheck="false"
            />
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Formatted Output
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters
                </span>
                {output && (
                  <>
                    <button
                      onClick={downloadJson}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Download JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        copied
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative h-[500px]">
              {output ? (
                <pre className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm overflow-auto whitespace-pre">
                  {output}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Formatted JSON will appear here</p>
                    <p className="text-sm mt-1">Enter JSON on the left and click Format</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Use <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Format</kbd> to beautify minified JSON</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Use <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Minify</kbd> to compress for production</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Error messages show the exact location of JSON syntax errors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

