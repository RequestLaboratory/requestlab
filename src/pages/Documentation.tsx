import React, { useState, useEffect } from 'react';
import { BookOpen, Code, Terminal, Database, Zap, Play, BarChart2, Users, Settings, FileText, Globe, Shield, Download, Upload, Share2, Eye, EyeOff, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, ExternalLink, Copy, Check } from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Documentation: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('api-testing');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock: React.FC<{ code: string; language: string; label?: string }> = ({ code, language, label }) => (
    <div className="relative bg-gray-900 rounded-lg p-4 my-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400 uppercase tracking-wide">{language}</span>
        {label && (
          <button
            onClick={() => copyToClipboard(code, label)}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            {copiedCode === label ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      <pre className="text-gray-100 overflow-x-auto whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );

  const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          {icon}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );

  const sections: DocumentationSection[] = [
    {
      id: 'api-testing',
      title: 'API Testing',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started with API Testing</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              RequestLab's API Testing feature provides a comprehensive platform for testing REST APIs with advanced features like load testing, collections management, and real-time response analysis.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg mr-4">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">Key Highlights</h3>
                  <ul className="space-y-2 text-orange-800 dark:text-orange-200">
                    <li className="flex items-center">
                      <Database className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>IndexDB: &nbsp;</strong> All APIs and collections are automatically saved in your browser's IndexDB for persistent storage.
                    </li>
                    <li className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Multi-Tab Interface: &nbsp;</strong> Work on multiple API requests simultaneously with Postman-like tabbed interface
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Auto-Save: &nbsp;</strong> Changes are automatically saved after 1 second of inactivity - no manual saving required
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Load Testing: &nbsp;</strong> Built-in load testing capabilities to test API performance under various load conditions
                    </li>
                    <li className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Real-time Analysis: &nbsp;</strong> Live response visualization with syntax highlighting and performance metrics
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Navigate to the API Testing page from the sidebar</li>
              <li>Configure your request method, URL, headers, and body</li>
              <li>Execute the request and analyze the response</li>
              <li>Use "Add to Collection" button to save requests for future use</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Multi-Tab Interface</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Work on multiple API requests simultaneously with our Postman-like tabbed interface:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FeatureCard
                title="Open APIs in Tabs"
                description="Click any API from the Collections sidebar to open it in a new tab. Each tab maintains its own state independently."
                icon={<FileText className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Create New Requests"
                description="Click the + button to create a fresh request tab. New tabs start with an empty URL ready for configuration."
                icon={<Code className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Unsaved Indicators"
                description="An orange circle appears next to tabs and APIs with unsaved changes, helping you track what needs attention."
                icon={<Eye className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Auto-Save"
                description="Changes are automatically saved after 1 second of inactivity. The orange indicator disappears once saved."
                icon={<CheckCircle className="w-5 h-5 text-orange-500" />}
              />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Request Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FeatureCard
                title="HTTP Methods"
                description="Support for GET, POST, PUT, DELETE, PATCH, and other HTTP methods with proper request formatting."
                icon={<Globe className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Headers Management"
                description="Add, edit, and manage request headers with key-value pairs. Common headers are pre-configured."
                icon={<Settings className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Request Body"
                description="Support for raw JSON, form-data, and x-www-form-urlencoded body types with syntax highlighting."
                icon={<FileText className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Query Parameters"
                description="Easily add and manage URL query parameters with a user-friendly interface."
                icon={<Code className="w-5 h-5 text-orange-500" />}
              />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Collections Management</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Organize your API requests into collections for better workflow management and team collaboration. All collections and APIs are automatically saved in your browser's IndexDB for persistent storage.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Create Collection</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm font-medium">Import cURL</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm font-medium">Import Collection</span>
              </button>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Creating Collections</h4>
            <CodeBlock
              code={`// Example: Creating a new collection
{
  "name": "GitHub API",
  "description": "Collection for GitHub API endpoints",
  "apis": [
    {
      "name": "Get Repository",
      "method": "GET",
      "url": "https://api.github.com/repos/{owner}/{repo}",
      "headers": {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "RequestLab"
      }
    }
  ]
}`}
              language="json"
              label="collection-example"
            />

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Importing Collections</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You can import collections from JSON files or Postman collections. The import feature supports:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6">
              <li>Postman Collection v2.1 format</li>
              <li>Custom JSON format</li>
              <li>Pre-request scripts and tests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Load Testing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Test your API's performance under various load conditions with our built-in load testing feature.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <BarChart2 className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Load Testing Configuration</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li><strong>Concurrent Users:</strong> Number of simultaneous requests</li>
                    <li><strong>Duration:</strong> How long to run the test</li>
                    <li><strong>Ramp-up Time:</strong> Gradual increase in load</li>
                    <li><strong>Request Rate:</strong> Requests per second</li>
                  </ul>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Load Test Example</h4>
            <CodeBlock
              code={`// Load Test Configuration
{
  "concurrentUsers": 10,
  "duration": 60,
  "numberOfRequests": 100,
  "targetEndpoint": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {{token}}"
  }
}`}
              language="json"
              label="load-test-config"
            />

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics Graphs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-semibold text-gray-900 dark:text-white">Response Time</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average, min, max response times</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-semibold text-gray-900 dark:text-white">Throughput</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Requests per second (RPS)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-semibold text-gray-900 dark:text-white">Error Rate</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Percentage of failed requests</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Examples</h3>
            
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GitHub API Example</h4>
            <CodeBlock
              code={`// GET Request to GitHub API
Method: GET
URL: https://api.github.com/repos/facebook/react
Headers:
  Accept: application/vnd.github.v3+json
  User-Agent: RequestLab

// Response will include repository information
{
  "id": 70107786,
  "name": "react",
  "full_name": "facebook/react",
  "description": "The library for web and native user interfaces",
  "stargazers_count": 200000,
  "language": "JavaScript"
}`}
              language="json"
              label="github-example"
            />

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">POST Request Example</h4>
            <CodeBlock
              code={`// POST Request with JSON Body
Method: POST
URL: https://api.example.com/users
Headers:
  Content-Type: application/json
  Authorization: Bearer your-token

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

// Expected Response
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}`}
              language="json"
              label="post-example"
            />
            
            </div>
          </div>
        )
      },
      {
        id: 'json-compare',
        title: 'JSON/cURL Comparison',
        icon: <Terminal className="w-5 h-5" />,
        content: (
          <div className="space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">JSON and cURL Comparison</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Compare two JSON objects or cURL responses side by side with intelligent difference highlighting and sharing capabilities.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FeatureCard
                  title="Smart Difference Highlighting"
                  description="🔴 Red for fields in left but missing in right, 🟢 Green for fields in right but missing in left, ⚫ Gray for different values."
                  icon={<Eye className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="cURL Command Execution"
                  description="Execute cURL commands directly and compare their responses in real-time."
                  icon={<Terminal className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Deep JSON Comparison"
                  description="Compare nested objects and arrays with detailed difference visualization."
                  icon={<Code className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Shareable Results"
                  description="Generate unique URLs to share comparison results with team members."
                  icon={<Share2 className="w-5 h-5 text-orange-500" />}
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Usage Examples</h3>
              
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">JSON Comparison</h4>
              <CodeBlock
                code={`// Left JSON
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}

// Right JSON
{
  "name": "John Doe",
  "age": 31,
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "phone": "+1-555-0123"
}`}
                language="json"
                label="json-comparison-example"
              />

              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">cURL Comparison</h4>
              <CodeBlock
                code={`// Left cURL
curl 'https://api.github.com/repos/facebook/react' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: RequestLab'

// Right cURL
curl 'https://api.github.com/repos/vuejs/vue' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: RequestLab'`}
                language="bash"
                label="curl-comparison-example"
              />
            </div>
          </div>
        )
      },
    {
      id: 'json-formatter',
      title: 'JSON Formatter',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">JSON Formatter</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Format, validate, and beautify your JSON data with our powerful frontend-only JSON formatter. Minify for production or prettify for readability.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg mr-4">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">Key Features</h3>
                  <ul className="space-y-2 text-orange-800 dark:text-orange-200">
                    <li className="flex items-center">
                      <Code className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Format & Beautify:</strong>&nbsp; Convert minified JSON to readable, indented format
                    </li>
                    <li className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Minify:</strong>&nbsp; Compress JSON to a single line for production use
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Validation:</strong>&nbsp; Instant error detection with line and column information
                    </li>
                    <li className="flex items-center">
                      <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                      <strong>Export:</strong>&nbsp; Download formatted JSON or copy to clipboard
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How to Use</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Navigate to the JSON Formatter page from the sidebar</li>
              <li>Paste your JSON in the left input panel</li>
              <li>Click "Format" to beautify or "Minify" to compress</li>
              <li>Copy the result or download as a file</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FeatureCard
                title="Configurable Indentation"
                description="Choose between 2 spaces, 4 spaces, or tab indentation for formatted output."
                icon={<Settings className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Error Detection"
                description="Detailed error messages with exact line and column numbers for invalid JSON."
                icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="One-Click Copy"
                description="Instantly copy formatted output to clipboard with visual confirmation."
                icon={<Copy className="w-5 h-5 text-orange-500" />}
              />
              <FeatureCard
                title="Download Support"
                description="Download your formatted JSON as a .json file for easy sharing."
                icon={<Download className="w-5 h-5 text-orange-500" />}
              />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Example Usage</h3>
            
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Before (Minified)</h4>
            <CodeBlock
              code={`{"name":"RequestLab","version":"1.0.0","features":["API Testing","JSON Compare","JSON Formatter"],"settings":{"theme":"dark","autoFormat":true}}`}
              language="json"
              label="minified-json"
            />

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">After (Formatted)</h4>
            <CodeBlock
              code={`{
  "name": "RequestLab",
  "version": "1.0.0",
  "features": [
    "API Testing",
    "JSON Compare",
    "JSON Formatter"
  ],
  "settings": {
    "theme": "dark",
    "autoFormat": true
  }
}`}
              language="json"
              label="formatted-json"
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">100% Client-Side</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    All JSON processing happens in your browser. Your data never leaves your computer, ensuring complete privacy and security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-interceptor',
      title: 'API Interceptor',
      icon: <Zap className="w-5 h-5" />,
        content: (
          <div className="space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Interceptor</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create custom interceptors to monitor and analyze API requests in real-time. Perfect for debugging, testing, and understanding API behavior.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FeatureCard
                  title="Request Interception"
                  description="Intercept requests to any API endpoint and forward them to the original destination."
                  icon={<Eye className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Real-time Logging"
                  description="Monitor requests and responses in real-time using Server-Sent Events (SSE)."
                  icon={<Clock className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Proxy URLs"
                  description="Generate unique proxy URLs for each interceptor to use in your applications."
                  icon={<Globe className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Detailed Analysis"
                  description="View headers, body, timing, and response data for each intercepted request."
                  icon={<FileText className="w-5 h-5 text-orange-500" />}
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li>Create a new interceptor with a name and base URL</li>
                <li>Configure any path mappings if needed</li>
                <li>Use the generated proxy URL in your application</li>
                <li>Monitor requests through the logs interface</li>
              </ol>

              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Example Configuration</h4>
              <CodeBlock
                code={`// Interceptor Configuration
{
  "name": "GitHub API Interceptor",
  "baseUrl": "https://api.github.com",
  "pathMappings": {
    "/repos": "/repositories",
    "/users": "/accounts"
  },
  "proxyUrl": "https://your-proxy.requestlab.com/github-api",
  "status": "active"
}`}
                language="json"
                label="interceptor-config"
              />
            </div>
          </div>
        )
      },
      {
        id: 'sql-compare',
        title: 'SQL Schema Comparison',
        icon: <Database className="w-5 h-5" />,
        content: (
          <div className="space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">MySQL Schema Comparison</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Compare MySQL database schemas to identify differences in table structures, indexes, and constraints.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FeatureCard
                  title="Schema Analysis"
                  description="Compare table structures, column definitions, and data types between schemas."
                  icon={<Database className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Visual Differences"
                  description="Highlight differences in table structures with color-coded indicators."
                  icon={<Eye className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="File Upload Support"
                  description="Upload SQL dump files or paste schema definitions directly."
                  icon={<Upload className="w-5 h-5 text-orange-500" />}
                />
                <FeatureCard
                  title="Export Results"
                  description="Export comparison results in various formats for documentation."
                  icon={<Download className="w-5 h-5 text-orange-500" />}
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Comparison Categories</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Tables/Fields Removed</h4>
                  </div>
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Tables and fields that exist in the left schema but are missing in the right schema. These are highlighted in red to indicate removal.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Tables/Fields Added</h4>
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    New tables and fields that exist in the right schema but are not present in the left schema. These are highlighted in green to indicate addition.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Modified Fields</h4>
                  </div>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Fields that exist in both schemas but have different properties (data type, constraints, default values, etc.). These are highlighted in yellow to indicate modification.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interactive Table Comparison</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg mr-4">
                    <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expandable Table Details</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li><strong>Click on each table</strong> to expand and view detailed field comparisons</li>
                      <li><strong>Side-by-side view</strong> of left and right schema fields</li>
                      <li><strong>Color-coded differences</strong> for easy identification</li>
                      <li><strong>Detailed field properties</strong> including data types, constraints, and indexes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How to Use</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li>Upload or paste your MySQL schema dumps in the left and right panels</li>
                <li>Click "Compare Schemas" to analyze the differences</li>
                <li>Review the summary of changes (removed, added, modified)</li>
                <li>Click on any table name to expand and see detailed field comparisons</li>
                <li>Use the color coding to quickly identify differences:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li><span className="text-red-600 dark:text-red-400">🔴 Red:</span> Removed fields/tables</li>
                    <li><span className="text-green-600 dark:text-green-400">🟢 Green:</span> Added fields/tables</li>
                    <li><span className="text-yellow-600 dark:text-yellow-400">🟡 Yellow:</span> Modified fields</li>
                  </ul>
                </li>
              </ol>

              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Example Schema Comparison</h4>
              <CodeBlock
                code={`-- Schema A
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schema B
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`}
                language="sql"
                label="schema-comparison"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" id="export-ai-migration">Export and AI Migration Assistant</h3>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">🔴 Export Differences & AI Migration</h4>
                <a
                  href="https://chat.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6467zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                  </svg>
                  <span className="text-sm font-medium">Open in ChatGPT</span>
                </a>
              </div>
              <p className="text-purple-800 dark:text-purple-200 mb-4">
                Export the schema differences as JSON and use ChatGPT to generate SQL migration scripts automatically.
              </p>
                  
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📋 ChatGPT Prompt for Migration</h5>
                <CodeBlock
                  code={`You are a database migration assistant.

I will give you a schema difference JSON object between two versions of the same table, where:
- "left" refers to the current schema
- "right" refers to the target schema

The keys in the JSON may include:
- changedColumns: columns that changed (e.g., data type, nullability, default value)
- indexes: index differences — includes all indexes and keys that exist in the **target** but may be missing in the current

Please do the following:
1. Accurately summarize the differences between the left and right schemas, including:
   - Column type or constraint changes
   - New or missing indexes, including unique and regular indexes
2. Generate SQL migration queries to convert the left schema into the right schema.
   - Only include SQL for **changes that are required**.
   - Do not generate SQL for things already matching.
   - Ensure that **missing indexes in the left schema are added** if they exist in the right schema.

Here is the schema diff:`}
                  language="text"
                  label="chatgpt-prompt"
                />
              </div>
                  
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100 text-sm">Export Feature</span>
                </div>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                  <li>• Click the <strong>Export</strong> button to download schema differences as JSON</li>
                  <li>• Copy the exported JSON and paste it into ChatGPT</li>
                  <li>• Use the provided prompt to generate SQL migration scripts</li>
                  <li>• Review and execute the generated SQL in your database</li>
                </ul>
              </div>
            </div>
          </div>
        )
      }
    ];

  // Add scroll listener to highlight current section
  useEffect(() => {
    const sectionIds = sections.map(section => section.id);
    
    // Handle anchor links on page load
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.substring(1); // Remove the # symbol
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to ensure content is rendered
    }
    
    // Use Intersection Observer for better section detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionIds.includes(sectionId)) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        root: document.querySelector('.scrollbar-hide'),
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    // Observe all section elements
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RequestLab Documentation</h1>
            </div>
            <button
              onClick={() => window.open('/api-testing', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              <Code className="w-5 h-5" />
              <span className="font-medium">DevKit</span>
            </button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Comprehensive guide to using RequestLab's API testing and comparison tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-orange-100 dark:bg-orange-900/20 font-medium text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-orange-500">
                        {section.icon}
                      </div>
                      <span className="ml-3 font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide h-[80vh]">
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {sections.map((section, index) => (
                <div key={section.id} id={section.id} className="block">
                  {section.content}
                  {index < sections.length - 1 && (
                    <div className="my-12 border-t-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center -mt-3">
                        <div className="bg-white dark:bg-gray-800 px-4">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 