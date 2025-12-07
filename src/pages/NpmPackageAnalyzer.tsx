import { useState, useCallback, useRef } from 'react';
import { Upload, FileJson, Search, AlertCircle, CheckCircle, Loader2, ExternalLink, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import snykLogo from '../assets/snyk-logo.png';

interface AnalysisResult {
  reportId: string;
  packageCount: number;
}

export default function NpmPackageAnalyzer() {
  const [packageJson, setPackageJson] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [parsedDeps, setParsedDeps] = useState<Record<string, string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePackageJson = useCallback((content: string): Record<string, string> | null => {
    try {
      const parsed = JSON.parse(content);
      const allDeps: Record<string, string> = {};
      
      // Combine all dependency types
      if (parsed.dependencies) {
        Object.assign(allDeps, parsed.dependencies);
      }
      if (parsed.devDependencies) {
        Object.assign(allDeps, parsed.devDependencies);
      }
      if (parsed.peerDependencies) {
        Object.assign(allDeps, parsed.peerDependencies);
      }
      if (parsed.optionalDependencies) {
        Object.assign(allDeps, parsed.optionalDependencies);
      }

      if (Object.keys(allDeps).length === 0) {
        throw new Error('No dependencies found in package.json');
      }

      return allDeps;
    } catch (e: any) {
      if (e.message.includes('No dependencies')) {
        throw e;
      }
      throw new Error('Invalid JSON format. Please paste a valid package.json');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setPackageJson(value);
    setError(null);
    setResult(null);
    
    if (value.trim()) {
      try {
        const deps = parsePackageJson(value);
        setParsedDeps(deps);
      } catch (e: any) {
        setParsedDeps(null);
      }
    } else {
      setParsedDeps(null);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPackageJson(content);
      setError(null);
      setResult(null);
      
      try {
        const deps = parsePackageJson(content);
        setParsedDeps(deps);
        toast.success(`Loaded ${Object.keys(deps || {}).length} dependencies`);
      } catch (err: any) {
        setParsedDeps(null);
        setError(err.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [parsePackageJson]);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!packageJson.trim()) {
      setError('Please paste or upload a package.json file');
      return;
    }

    let dependencies: Record<string, string>;
    try {
      dependencies = parsePackageJson(packageJson) || {};
    } catch (e: any) {
      setError(e.message);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Use interceptor server as proxy to avoid CORS issues
      const response = await fetch(`${API_BASE_URL}/api/snyk/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dependencies }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.reportId) {
        setResult({
          reportId: data.reportId,
          packageCount: Object.keys(dependencies).length,
        });
        toast.success('Analysis complete! Opening report...');
        
        // Open the report in a new tab
        window.open(`https://snyk.io/advisor/check/npm/${data.reportId}/healthy`, '_blank');
      } else {
        throw new Error('No report ID received from the server');
      }
    } catch (e: any) {
      console.error('Analysis error:', e);
      setError(e.message || 'Failed to analyze packages. Please try again.');
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setPackageJson('');
    setParsedDeps(null);
    setError(null);
    setResult(null);
  };

  const loadSamplePackageJson = () => {
    const sample = {
      name: "sample-project",
      version: "1.0.0",
      dependencies: {
        "express": "^4.18.2",
        "axios": "^1.6.0",
        "lodash": "^4.17.21",
        "moment": "^2.29.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "typescript": "^5.3.0",
        "jest": "^29.7.0",
        "eslint": "^8.55.0"
      }
    };
    const content = JSON.stringify(sample, null, 2);
    setPackageJson(content);
    setError(null);
    setResult(null);
    
    try {
      const deps = parsePackageJson(content);
      setParsedDeps(deps);
    } catch (e) {
      setParsedDeps(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              NPM Package Analyzer
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <img 
                src={snykLogo} 
                alt="Snyk" 
                className="w-5 h-5 object-contain"
              />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Snyk</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Analyze your npm dependencies for security vulnerabilities, maintenance status, and overall health using Snyk Advisor.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-orange-500" />
                package.json
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadSamplePackageJson}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Load Sample
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  Upload
                </label>
                {packageJson && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={packageJson}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder='Paste your package.json content here...\n\n{\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}'
              className="w-full h-[400px] p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              spellCheck="false"
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Dependencies Count */}
            {parsedDeps && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Valid package.json</h3>
                </div>
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {Object.keys(parsedDeps).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  dependencies found
                </p>
                <div className="mt-3 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(parsedDeps).slice(0, 10).map((dep) => (
                      <span
                        key={dep}
                        className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {dep}
                      </span>
                    ))}
                    {Object.keys(parsedDeps).length > 10 && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                        +{Object.keys(parsedDeps).length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-400">Error</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-700 dark:text-green-400">Analysis Complete!</h3>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      Analyzed {result.packageCount} packages
                    </p>
                    <a
                      href={`https://snyk.io/advisor/check/npm/${result.reportId}/healthy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
                    >
                      View Report
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !packageJson.trim()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isAnalyzing || !packageJson.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Packages
                </>
              )}
            </button>

            {/* Powered by Snyk */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={snykLogo} 
                  alt="Snyk Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-semibold text-white">Powered by Snyk</h3>
                  <p className="text-xs text-purple-200">Security Intelligence</p>
                </div>
              </div>
              <ul className="text-sm text-purple-100 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  Security vulnerability detection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  Package health scoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  Maintenance status check
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  Community activity analysis
                </li>
              </ul>
              <a 
                href="https://snyk.io/advisor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-xs text-purple-200 hover:text-white transition-colors"
              >
                Learn more about Snyk Advisor
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="font-bold text-orange-500">1.</span>
              <p>Paste your <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">package.json</code> content or upload the file</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-orange-500">2.</span>
              <p>Click "Analyze Packages" to send dependencies to Snyk Advisor</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-orange-500">3.</span>
              <p>View the detailed health report in the new tab that opens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

