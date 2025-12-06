import { Linkedin, ExternalLink, GitCompare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                <GitCompare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">RequestLab</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Born from JSON comparison, evolved into a complete platform. All your development tools in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              {/* <a href="https://github.com/RequestLaboratory/requestlab" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center">
                <Github className="h-5 w-5 mr-2" />
                <span className="text-sm">Star on GitHub</span>
              </a> */}
              <a href="https://www.linkedin.com/in/yadev-jayachandran/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center">
                <Linkedin className="h-5 w-5 mr-2" />
                <span className="text-sm">Yadev</span>
              </a>
              <a href="https://www.linkedin.com/in/ashrit-v/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center">
                <Linkedin className="h-5 w-5 mr-2" />
                <span className="text-sm">Ashrit</span>
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Development Tools</h3>
            <ul className="space-y-2">
              <li><a href="/json-compare" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">JSON Compare <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/json-formatter" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">JSON Formatter <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/api-testing" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">cURL Testing <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/api-testing" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">API Testing <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/api-testing" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">Load Testing <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/api-interceptor" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">API Interceptor <ExternalLink className="h-3 w-3 ml-1" /></a></li>
              <li><a href="/sql-compare" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">MySQL Schema Compare <ExternalLink className="h-3 w-3 ml-1" /></a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 dark:border-gray-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 RequestLab. All rights reserved. Built for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}