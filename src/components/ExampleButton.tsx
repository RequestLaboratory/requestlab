import React from 'react';
import { FileCode } from 'lucide-react';

interface ExampleButtonProps {
  onLeftExample: () => void;
  onRightExample: () => void;
}

const ExampleButton: React.FC<ExampleButtonProps> = ({ onLeftExample, onRightExample }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-2 my-4">
      <button
        onClick={onLeftExample}
        className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
      >
        <FileCode size={14} className="mr-1.5" />
        Load Left Example
      </button>
      <button
        onClick={onRightExample}
        className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
      >
        <FileCode size={14} className="mr-1.5" />
        Load Right Example
      </button>
    </div>
  );
};

export default ExampleButton;