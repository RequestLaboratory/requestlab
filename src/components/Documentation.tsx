import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

const Documentation: React.FC = () => {
  const openDocumentation = () => {
    const docUrl = '/documentation';
    window.open(docUrl, '_blank');
  };

  return (
    <button
      onClick={openDocumentation}
      className="group relative flex items-center rounded-lg p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
    >
      <div className="flex items-center w-full">
        <BookOpen className="w-5 h-5" />
        <span className="ml-3 font-medium">
          Documentation
        </span>
        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </button>
  );
};

export default Documentation; 