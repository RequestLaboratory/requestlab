import { FileJson, Terminal, TestTube, Gauge, Shield, Database, ArrowRight, Wand2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from './FeatureCard';

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TestTube,
      title: 'API Testing',
      description: 'Comprehensive API testing with automated scenarios, assertions, and detailed reporting.',
      features: [
        'Create test scenarios',
        'Run automated tests',
        'Assert response data',
        'Generate test reports'
      ],
      capabilities: [
        'Save test collections',
        'Continuous testing'
      ],
      color: 'from-red-500 to-pink-500',
      isPopular: true,
      path: '/api-testing'
    },
    {
      icon: Gauge,
      title: 'Load Testing',
      description: 'Test API performance under load with configurable patterns and real-time monitoring.',
      features: [
        'Configure load patterns',
        'Monitor performance',
        'Identify bottlenecks',
        'Generate reports'
      ],
      capabilities: [
        'Save test scenarios',
        'Performance metrics',
        'Resource monitoring',
        'Custom thresholds'
      ],
      color: 'from-pink-500 to-purple-500',
      path: '/api-testing'
    },
    {
      icon: Shield,
      title: 'API Interceptor',
      description: 'Monitor and intercept API calls with advanced filtering and real-time logging.',
      features: [
        'Intercept API calls',
        'Log requests/responses',
        'Filter traffic',
        'Analyze patterns'
      ],
      capabilities: [
        'Save interceptors',
        'Traffic analysis',
        'Security checks',
        'Performance monitoring'
      ],
      color: 'from-purple-500 to-indigo-500',
      isPopular: true,
      path: '/api-interceptor'
    },
    {
      icon: Database,
      title: 'MySQL Schema Compare',
      description: 'Compare database schemas, generate migration scripts, and track changes.',
      features: [
        'Compare schemas',
        'Generate migrations',
        'Track changes',
        'Version control'
      ],
      capabilities: [
        'Save comparisons',
        'Migration scripts',
        'Change tracking',
        'Schema validation'
      ],
      color: 'from-indigo-500 to-blue-500',
      path: '/sql-compare'
    },
    {
      icon: FileJson,
      title: 'JSON Compare',
      description: 'Compare and share JSON objects with visual diff highlighting and intelligent formatting.',
      features: [
        'Visual diff highlighting',
        'Deep object comparison',
        'Share results via link',
        'Format and validate JSON'
      ],
      capabilities: [
        'Export comparison reports',
        'API response validation',
        'Schema validation',
        'Custom comparison rules'
      ],
      color: 'from-orange-500 to-orange-600',
      isPopular: true,
      path: '/json-compare'
    },
    {
      icon: Wand2,
      title: 'JSON Formatter',
      description: 'Format, validate, and beautify JSON data. Minify for production or prettify for readability.',
      features: [
        'Format & beautify JSON',
        'Minify for production',
        'Validate JSON syntax',
        'One-click copy'
      ],
      capabilities: [
        'Configurable indentation',
        'Error line detection',
        'Download as file',
        '100% client-side'
      ],
      color: 'from-orange-400 to-orange-600',
      path: '/json-formatter'
    },
    {
      icon: Terminal,
      title: 'cURL Testing',
      description: 'Test and compare API endpoints with cURL commands, analyze responses, and share results.',
      features: [
        'Execute cURL commands',
        'Compare API responses',
        'Analyze HTTP headers',
        'Share test results'
      ],
      capabilities: [
        'Save test collections',
        'Generate test cases',
        'Performance metrics',
        'Response validation'
      ],
      color: 'from-orange-500 to-red-500',
      path: '/api-testing'
    },
    {
      icon: Package,
      title: 'NPM Package Analyzer',
      description: 'Analyze npm dependencies for security vulnerabilities, maintenance status, and package health.',
      features: [
        'Security scanning',
        'Dependency health check',
        'Maintenance status',
        'Snyk Advisor integration'
      ],
      capabilities: [
        'Vulnerability detection',
        'Package scoring',
        'Community analysis',
        'Instant reports'
      ],
      color: 'from-blue-500 to-cyan-500',
      path: '/npm-analyzer'
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Complete API Development
            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Toolkit
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Born from JSON comparison, evolved into a complete platform. All your development tools in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              onTryNow={() => navigate(feature.path)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Ready to Simplify Your Development Workflow?</h3>
              <p className="text-xl mb-8 text-orange-100">
                Join developers who've eliminated the need for multiple tools. Everything you need, in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/api-testing')}
                  className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}