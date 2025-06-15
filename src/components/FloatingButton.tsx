import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface FloatingButtonProps {
  sheetUrl: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ sheetUrl }) => {
  return (
    <a
      href={sheetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 border border-gray-200 dark:border-gray-700 group flex items-center space-x-2"
    >
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
        Report Bug
      </span>
      <FileSpreadsheet className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:animate-bounce" />
    </a>
  );
};

export default FloatingButton; 