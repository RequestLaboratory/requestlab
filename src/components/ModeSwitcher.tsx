import React from 'react';
import { Code, Terminal } from 'lucide-react';

export type ComparisonMode = 'json' | 'curl';

interface ModeSwitcherProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => onModeChange('json')}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
            mode === 'json'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span>JSON</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('curl')}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
            mode === 'curl'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>cURL</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ModeSwitcher; 