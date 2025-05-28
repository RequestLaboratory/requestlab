import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, Terminal, Github, Linkedin } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOptionSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white mb-2">
                Welcome to RequestLab 🚀
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your all-in-one API playground. Let's get started!
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handleOptionSelect('/')}
                  className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors duration-200 group"
                >
                  <GitCompare className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">JSON/cURL Comparison</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Compare and visualize differences between JSON objects or cURL responses
                  </p>
                </button>

                <button
                  onClick={() => handleOptionSelect('/api-testing')}
                  className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors duration-200 group"
                >
                  <Terminal className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">API Testing</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Test APIs with a powerful interface and real-time response analysis
                  </p>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <a
                    href="https://github.com/yadev64/jsoncompare"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <Github className="h-5 w-5 mr-2" />
                    <span className="text-sm">Star on GitHub ⭐</span>
                  </a>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <a
                      href="https://www.linkedin.com/in/yadev-jayachandran/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <span className="text-sm mr-2">Made with ☕ by Yadev | </span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/yadev-jayachandran/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup; 