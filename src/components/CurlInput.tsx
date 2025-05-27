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
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            title={showPreview ? "Show cURL" : "Show Preview"}
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={handleExecute}
            disabled={isLoading || !value.trim()}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Execute cURL"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
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