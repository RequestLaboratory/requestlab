import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useJsonComparison } from './hooks/useJsonComparison';
import { useCurlComparison } from './hooks/useCurlComparison';
import JsonInput from './components/JsonInput';
import CurlInput from './components/CurlInput';
import DiffViewer from './components/DiffViewer';
import ShareLink from './components/ShareLink';
import ExampleButton from './components/ExampleButton';
import ModeSwitcher, { ComparisonMode } from './components/ModeSwitcher';
import { decodeJsonFromUrl } from './utils/urlUtils';
import ApiTesting from './pages/ApiTesting';
import { GitCompare, Sun, Moon } from 'lucide-react';
import { ThemeContext } from './contexts/ThemeContext';
import WelcomePopup from './components/WelcomePopup';
import ApiInterceptor from './pages/ApiInterceptor';
import InterceptorLogs from './pages/InterceptorLogs';
import SQLCompare from './components/sqlCompare';
import CollectionsSidebar from './components/CollectionsSidebar';
import { ApiCollectionsProvider } from './contexts/ApiCollectionsContext';
import Loader from './components/Loader';
import { LoaderProvider, useLoader } from './contexts/LoaderContext';
import { AuthProvider } from './contexts/AuthContext';
import LoginButton from './components/LoginButton';

const leftExample = JSON.stringify({
  name: "Ford Mustang GT",
  year: 2024,
  engine: {
    type: "5.0L V8",
    horsepower: 460,
    torque: 420,
    transmission: "10-speed automatic",
    fuelSystem: "Direct Injection",
    fuelCapacity: 16.0,
    emissions: {
      co2: 350,
      rating: "Tier 3",
      certification: "EPA"
    }
  },
  performance: {
    zeroToSixty: 4.1,
    topSpeed: 155,
    quarterMile: 12.4,
    braking: {
      sixtyToZero: 110,
      system: "Brembo 6-piston"
    },
    trackModes: ["Normal", "Sport", "Track", "Drag", "Snow/Wet"]
  },
  features: [
    "Track Apps",
    "Line Lock",
    "Launch Control",
    "Selectable Drive Modes",
    "SYNC 4 Infotainment",
    "12-inch Digital Cluster"
  ],
  dimensions: {
    length: 188.5,
    width: 75.4,
    height: 54.3,
    wheelbase: 107.1,
    groundClearance: 5.1,
    cargoVolume: 13.5
  },
  price: {
    base: 42995,
    destination: 1495,
    total: 44490,
    options: {
      premium: 2495,
      performance: 3995,
      appearance: 1995
    }
  },
  colors: {
    standard: ["Oxford White", "Shadow Black", "Race Red"],
    premium: ["Grabber Blue", "Twister Orange", "Eruption Green"],
    special: ["Dark Matter Gray", "Atlas Blue"]
  },
  warranty: {
    basic: "3 years/36,000 miles",
    powertrain: "5 years/60,000 miles",
    maintenance: {
      included: true,
      duration: "2 years/24,000 miles",
      services: ["Oil Changes", "Tire Rotations", "Multi-point Inspection"]
    }
  },
  safety: {
    rating: 5,
    features: [
      "Blind Spot Monitoring",
      "Lane Departure Warning",
      "Pre-Collision Assist",
      "Adaptive Cruise Control"
    ],
    airbags: 8
  },
  production: {
    plant: "Flat Rock Assembly Plant",
    location: "Michigan, USA",
    startDate: "2023-09-01",
    estimatedUnits: 50000
  }
}, null, 2);

const rightExample = JSON.stringify({
  name: "Chevrolet Camaro SS",
  year: 2024,
  engine: {
    type: "6.2L V8",
    horsepower: 455,
    torque: 455,
    transmission: "10-speed automatic",
    fuelSystem: "Direct Injection",
    fuelCapacity: 19.0,
    emissions: {
      co2: 345,
      rating: "Tier 3",
      certification: "EPA",
      compliance: ["Federal", "California"]
    }
  },
  performance: {
    zeroToSixty: 4.0,
    topSpeed: 165,
    quarterMile: 12.3,
    braking: {
      sixtyToZero: 105,
      system: "Brembo 6-piston",
      rotors: "Vented Disc"
    },
    trackModes: ["Tour", "Sport", "Track", "Competition", "Snow/Ice"]
  },
  features: [
    "Performance Traction Management",
    "Launch Control",
    "Line Lock",
    "Track Mode",
    "Competition Mode",
    "Chevrolet Infotainment 3",
    "8-inch Digital Cluster"
  ],
  dimensions: {
    length: 188.3,
    width: 74.7,
    height: 52.4,
    wheelbase: 110.7,
    groundClearance: 4.8,
    cargoVolume: 9.1
  },
  price: {
    base: 43995,
    destination: 1295,
    total: 45290,
    options: {
      premium: 2795,
      performance: 4495,
      appearance: 2295
    }
  },
  colors: {
    standard: ["Summit White", "Black", "Riverside Blue"],
    premium: ["Shock", "Wild Cherry Tintcoat", "Vivid Orange"],
    special: ["Rapid Blue", "Sharkskin Metallic"]
  },
  warranty: {
    basic: "3 years/36,000 miles",
    powertrain: "5 years/60,000 miles",
    corrosion: "6 years/100,000 miles",
    maintenance: {
      included: true,
      duration: "2 years/24,000 miles",
      services: ["Oil Changes", "Tire Rotations", "Multi-point Inspection", "Wheel Alignment"]
    }
  },
  trackPackage: {
    available: true,
    includes: [
      "Magnetic Ride Control",
      "Brembo Brakes",
      "Recaro Seats",
      "Performance Suspension"
    ],
    price: 6995,
    weight: 75
  },
  safety: {
    rating: 5,
    features: [
      "Forward Collision Alert",
      "Lane Keep Assist",
      "Following Distance Indicator",
      "Automatic Emergency Braking"
    ],
    airbags: 8,
    cameras: 2
  },
  production: {
    plant: "Lansing Grand River Assembly",
    location: "Michigan, USA",
    startDate: "2023-08-15",
    estimatedUnits: 45000,
    qualityChecks: ["Pre-delivery", "Performance", "Safety"]
  }
}, null, 2);

function AppContent() {
  const [mode, setMode] = useState<ComparisonMode>('json');
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const jsonComparison = useJsonComparison();
  const curlComparison = useCurlComparison();
  const { isLoading } = useLoader();

  const {
    leftInput: jsonLeftInput,
    rightInput: jsonRightInput,
    diff: jsonDiff,
    error: jsonError,
    leftValid,
    rightValid,
    updateLeftJson,
    updateRightJson,
    formatLeftJson,
    formatRightJson,
  } = jsonComparison;

  const {
    leftInput: curlLeftInput,
    rightInput: curlRightInput,
    leftResponse,
    rightResponse,
    diff: curlDiff,
    error: curlError,
    isLeftLoading,
    isRightLoading,
    setLeftInput: setCurlLeftInput,
    setRightInput: setCurlRightInput,
    executeLeftCurl,
    executeRightCurl,
  } = curlComparison;

  const [leftCurl] = useState<string>(`curl 'https://api.github.com/repos/facebook/react' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: RequestLab'`);

  const [rightCurl] = useState<string>(`curl 'https://api.github.com/repos/vuejs/vue' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: RequestLab'`);

  // Load data from URL on initial render
  useEffect(() => {
    const data = decodeJsonFromUrl();
    if (data.mode) {
      setMode(data.mode);
    }
    if (data.leftJson) {
      updateLeftJson(data.leftJson);
    }
    if (data.rightJson) {
      updateRightJson(data.rightJson);
    }
    if (data.mode === 'curl') {
      if (data.leftCurl) {
        setCurlLeftInput(data.leftCurl);
      }
      if (data.rightCurl) {
        setCurlRightInput(data.rightCurl);
      }
    }
  }, []);

  // Update activePage based on current route, but only if there's no session in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    // Only navigate if there's no session in URL
    if (!sessionId) {
      if (location.pathname === '/') {
        navigate('/');
      } else if (location.pathname === '/json-compare') {
        navigate('/json-compare');
      } else if (location.pathname === '/api-interceptor') {
        navigate('/api-interceptor');
      } else if (location.pathname === '/sql-compare') {
        navigate('/sql-compare');
      }
    }
  }, [location.pathname, navigate]);

  // Handle mode change
  const handleModeChange = (newMode: ComparisonMode) => {
    setMode(newMode);
    // When switching from curl to json mode, populate JSON inputs with curl responses
    if (newMode === 'json' && (leftResponse || rightResponse)) {
      if (leftResponse) {
        updateLeftJson(leftResponse);
      }
      if (rightResponse) {
        updateRightJson(rightResponse);
      }
    }
  };

  const handleLeftExample = () => {
    if (mode === 'json') {
      updateLeftJson(leftExample);
    } else {
      setCurlLeftInput(leftCurl);
    }
  };

  const handleRightExample = () => {
    if (mode === 'json') {
      updateRightJson(rightExample);
    } else {
      setCurlRightInput(rightCurl);
    }
  };

  const showCollections = location.pathname === '/';

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      />
      
      {/* Left Sidebar - Now persistent */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="flex flex-col h-full px-0 py-4">
          <div className="flex items-center mb-8 px-2">
            <button 
              onClick={() => {
                localStorage.removeItem('welcomePopupLastShown');
                setShowWelcomePopup(true);
              }}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <GitCompare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                RequestLab
              </h1>
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => navigate('/')}
              className={`group relative flex items-center rounded-lg p-2.5 ${
                location.pathname === '/'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className="flex items-center w-full">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-3 font-medium">
                  API Testing
                </span>
              </div>
            </button>

            {showCollections && (
              <div
                className="ml-4 mt-1 max-h-[50vh] overflow-y-auto overflow-x-hidden"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <style>{`
                  .sidebar-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="sidebar-scrollbar">
                  <CollectionsSidebar />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/json-compare')}
              className={`group relative flex items-center rounded-lg p-2.5 ${
                location.pathname === '/json-compare'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className="flex items-center w-full">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="ml-3 font-medium">
                  JSON Compare
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/api-interceptor')}
              className={`group relative flex items-center rounded-lg p-2.5 ${
                location.pathname === '/api-interceptor'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className="flex items-center w-full">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="ml-3 font-medium">
                  API Interceptor
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/sql-compare')}
              className={`group relative flex items-center rounded-lg p-2.5 ${
                location.pathname === '/sql-compare'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className="flex items-center w-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <ellipse cx="12" cy="7" rx="8" ry="3" />
                  <path d="M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7" />
                </svg>
                <span className="ml-3 font-medium">
                  SQL Compare
                </span>
              </div>
            </button>
          </nav>

          {/* Login Button and Dark Mode Toggle at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <LoginButton />
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
              <span className="ml-3 font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && <Loader />}
        <Routes>
          <Route path="/" element={<ApiTesting />} />
          <Route path="/json-compare" element={
            <div className="h-full overflow-auto">
              <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    RequestLab
                  </h1>
                  <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Compare two JSON objects or cURL responses side by side, visualize the differences, and share the results with a unique URL.
                  </p>
                  
                  {/* SEO content - hidden from users but visible to crawlers */}
                  <div className="sr-only" aria-hidden="true">
                    <h2>RequestLab - All-in-One API Development Platform</h2>
                    <p>Your comprehensive API playground for testing, comparison, and debugging. Compare JSON objects, test APIs with cURL commands, and analyze responses in real-time. The most powerful and intuitive API development tool available.</p>
                    
                    <h3>Why Choose RequestLab?</h3>
                    <ul>
                      <li>Comprehensive API testing with full request configuration</li>
                      <li>Advanced JSON and cURL comparison with instant results</li>
                      <li>Real-time response analysis and visualization</li>
                      <li>Intuitive difference highlighting with color coding</li>
                      <li>Share results via unique, secure URLs</li>
                      <li>Support for multiple request methods and content types</li>
                      <li>Dark mode support for reduced eye strain</li>
                      <li>Responsive design for all devices</li>
                    </ul>

                    <h3>Key Features</h3>
                    <ul>
                      <li>JSON object comparison with visual diff</li>
                      <li>cURL command testing and response analysis</li>
                      <li>API endpoint testing with full request configuration</li>
                      <li>Headers and query parameters management</li>
                      <li>Request body formatting and validation</li>
                      <li>Response time and size tracking</li>
                    </ul>

                    <h3>Advanced Capabilities</h3>
                    <ul>
                      <li>Deep JSON comparison with nested object support</li>
                      <li>Real-time API response visualization</li>
                      <li>cURL command execution and analysis</li>
                      <li>Request/response history tracking</li>
                      <li>Secure URL sharing with encoded parameters</li>
                      <li>Cross-browser compatibility</li>
                    </ul>

                    <p>RequestLab is your all-in-one API development platform. Test APIs, compare JSON objects, and analyze cURL responses with ease. No installation required, works directly in your browser. Share your API testing results with team members using unique URLs. Supports both light and dark themes for comfortable viewing. The most powerful and intuitive API development tool available online.</p>

                    <h3>Top Search Terms</h3>
                    <p>API testing tool, JSON comparison, cURL testing, API debugging, JSON diff, API development platform, request testing, API response analysis, JSON visualization, cURL comparison, API playground, request lab, API testing platform, JSON validation, API development tool</p>

                    <h3>RequestLab Benefits</h3>
                    <ul>
                      <li>Streamline API development workflow</li>
                      <li>Accelerate API testing and debugging</li>
                      <li>Simplify JSON comparison and validation</li>
                      <li>Enhance team collaboration with shareable results</li>
                      <li>Improve API development efficiency</li>
                    </ul>
                  </div>
                </div>

                <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
                <ExampleButton onLeftExample={handleLeftExample} onRightExample={handleRightExample} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
                    {mode === 'json' ? (
                      <JsonInput
                        value={jsonLeftInput}
                        onChange={updateLeftJson}
                        onFormat={formatLeftJson}
                        isValid={leftValid}
                        label="Left JSON"
                        placeholder="Paste your JSON here..."
                      />
                    ) : (
                      <CurlInput
                        value={curlLeftInput}
                        onChange={setCurlLeftInput}
                        onExecute={executeLeftCurl}
                        isLoading={isLeftLoading}
                        label="Left cURL"
                        placeholder="Enter your cURL command here..."
                      />
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
                    {mode === 'json' ? (
                      <JsonInput
                        value={jsonRightInput}
                        onChange={updateRightJson}
                        onFormat={formatRightJson}
                        isValid={rightValid}
                        label="Right JSON"
                        placeholder="Paste your JSON here..."
                      />
                    ) : (
                      <CurlInput
                        value={curlRightInput}
                        onChange={setCurlRightInput}
                        onExecute={executeRightCurl}
                        isLoading={isRightLoading}
                        label="Right cURL"
                        placeholder="Enter your cURL command here..."
                      />
                    )}
                  </div>
                </div>

                <ShareLink 
                  leftJson={mode === 'json' ? jsonLeftInput : leftResponse} 
                  rightJson={mode === 'json' ? jsonRightInput : rightResponse} 
                  leftCurl={mode === 'curl' ? curlLeftInput : ''}
                  rightCurl={mode === 'curl' ? curlRightInput : ''}
                  mode={mode}
                  isValid={mode === 'json' ? (leftValid && rightValid && !!jsonLeftInput && !!jsonRightInput) : (!!leftResponse && !!rightResponse)} 
                />

                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-[calc(100vh-600px)] min-h-[400px] overflow-y-auto">
                    <DiffViewer 
                      diff={mode === 'json' ? jsonDiff : curlDiff} 
                      error={(mode === 'json' ? jsonError : curlError) || undefined} 
                      leftJson={mode === 'json' ? jsonLeftInput : leftResponse}
                      rightJson={mode === 'json' ? jsonRightInput : rightResponse}
                    />
                  </div>
                </div>
              </div>
            </div>
          } />
          <Route path="/api-interceptor" element={<ApiInterceptor />} />
          <Route path="/interceptors/:id/logs" element={<InterceptorLogs />} />
          <Route path="/sql-compare" element={<SQLCompare />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ApiCollectionsProvider>
          <LoaderProvider>
            <AppContent />
          </LoaderProvider>
        </ApiCollectionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;