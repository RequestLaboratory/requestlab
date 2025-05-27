import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} JSON Diff Viewer
          </p>
          <div className="flex items-center mt-2 sm:mt-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by Yadev Jayachandran
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;