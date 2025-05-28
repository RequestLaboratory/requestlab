import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <p>© {new Date().getFullYear()} RequestLab</p>
      </div>
    </footer>
  );
};

export default Footer;