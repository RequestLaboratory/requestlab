import React, { useState, useRef } from 'react';
import { FileUpIcon, CodeIcon, CopyIcon, CheckIcon } from 'lucide-react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ value, onChange, onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 rounded-t-md border border-gray-700 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <CodeIcon className="w-4 h-4 text-blue-400 mr-2" />
          <span className="text-sm text-gray-300 font-medium">SQL Schema</span>
          {value && value.trim() && (
            <span className="ml-2 text-xs text-green-400">Valid</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 hover:bg-gray-700 rounded transition-colors" 
            title="Expand"
          >
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
          <button 
            className="p-1 hover:bg-gray-700 rounded transition-colors" 
            title="Copy"
            onClick={handleCopy}
          >
            {isCopied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea
          className="w-full h-[350px] p-4 bg-gray-900 border-x border-b border-gray-700 rounded-b-md font-mono text-sm text-gray-100 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="-- Paste your SQL schema here..."
          spellCheck={false}
          style={{ 
            lineHeight: '1.5',
            tabSize: 2
          }}
        />
      </div>

      <div className="mt-2 flex items-center">
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUpIcon className="w-4 h-4" />
          <span className="text-sm">Upload SQL</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql"
            onChange={onFileUpload}
            className="hidden"
          />
        </button>
        <div className="ml-2 text-xs text-gray-400 flex-1">
          {value ? `${value.length} characters` : 'No SQL entered'}
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;