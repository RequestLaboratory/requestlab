import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} RequestLab
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Made with ❤️
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;