import React, { useState } from 'react';
import { Play, Loader2, Code } from 'lucide-react';
import CurlPreview from './CurlPreview';

interface CurlInputProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => Promise<void>;
  isLoading: boolean;
  label: string;
  placeholder?: string;
}

const CurlInput: React.FC<CurlInputProps> = ({
  value,
  onChange,
  onExecute,
  isLoading,
  label,
  placeholder = 'Enter your cURL command here...'
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const validateCurl = (curl: string): boolean => {
    // Basic validation to check if it's a curl command
    const trimmed = curl.trim();
    if (!trimmed.toLowerCase().startsWith('curl')) {
      setError('Command must start with "curl"');
      return false;
    }
    setError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateCurl(newValue);
  };

  const handleExecute = async () => {
    if (validateCurl(value)) {
      await onExecute();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {label}
        </label>
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {'Text'}
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                showPreview ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={showPreview}
            >
              <span className={`absolute left-1 inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                showPreview ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <Code className="ml-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {'Editor'}
            </span>
          </div>
          <button
            onClick={handleExecute}
            disabled={isLoading || !value.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-600 dark:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Execute cURL"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Execute</span>
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        {showPreview ? (
          <CurlPreview curlCommand={value} onUpdate={onChange} />
        ) : (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full h-full p-2 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-500' : 'border-transparent'
            }`}
          />
        )}
        {error && !showPreview && (
          <div className="absolute bottom-2 left-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurlInput; 