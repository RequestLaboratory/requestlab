import React, { useState } from 'react';
import { AlertTriangle, Check, Code, Copy, FileText } from 'lucide-react';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onFormat: () => void;
  isValid: boolean;
  label: string;
  placeholder?: string;
}

const JsonInput: React.FC<JsonInputProps> = ({
  value,
  onChange,
  onFormat,
  isValid,
  label,
  placeholder = 'Paste your JSON here...',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to paste text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center">
          <h2 className="text-lg font-medium dark:text-white">{label}</h2>
          {isValid ? (
            <span className="ml-2 text-green-500 flex items-center text-sm">
              <Check size={14} className="mr-1" />
              Valid
            </span>
          ) : value ? (
            <span className="ml-2 text-red-500 flex items-center text-sm">
              <AlertTriangle size={14} className="mr-1" />
              Invalid
            </span>
          ) : null}
        </div>

        <div className="flex space-x-1">
          <button
            onClick={onFormat}
            disabled={!isValid || !value}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Format JSON"
          >
            <Code size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleCopy}
            disabled={!value}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={copied ? "Copied!" : "Copy JSON"}
          >
            <Copy size={16} className={copied ? "text-green-500" : "text-gray-600 dark:text-gray-300"} />
          </button>
          <button
            onClick={handlePaste}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Paste from clipboard"
          >
            <FileText size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-grow relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-full p-4 font-mono text-sm rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
            value && !isValid ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
          }`}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default JsonInput;