import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Interceptor {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  isActive: boolean;
}

interface Props {
  interceptor?: Interceptor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Interceptor, 'id' | 'createdAt'>) => Promise<void>;
}

export default function InterceptorModal({ interceptor, isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interceptor) {
      setName(interceptor.name);
      setBaseUrl(interceptor.baseUrl);
    } else {
      setName('');
      setBaseUrl('');
    }
    setError(null);
  }, [interceptor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        name,
        baseUrl,
        isActive: true,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save interceptor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {interceptor ? 'Edit Interceptor' : 'New Interceptor'}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base URL
                  </label>
                  <input
                    type="url"
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="https://api.example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 