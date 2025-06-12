import { DatabaseIcon } from 'lucide-react';
import SqlCompare from './SqlCompare';

function SQLCompare() {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DatabaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold">SQL Schema Compare</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto container mx-auto px-4 py-6">
        <SqlCompare />
      </main>
      {/* <footer className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        SQL Schema Compare Tool &copy; {new Date().getFullYear()}
      </footer> */}
    </div>
  );
}

export default SQLCompare;