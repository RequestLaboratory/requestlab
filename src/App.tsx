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
import { GitCompare, Sun, Moon, Monitor, Smartphone } from 'lucide-react';
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
import HomePage from './components/homePage';
import { WelcomePopupProvider } from './contexts/WelcomePopupContext';
import FloatingButton from './components/FloatingButton';
import Head from './components/Head';

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

// Add DesktopOnlyPrompt component
const DesktopOnlyPrompt: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900/95 dark:bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center transform transition-all duration-500 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Monitor className="w-16 h-16 text-orange-500 animate-bounce" />
            <Smartphone className="w-8 h-8 text-gray-400 absolute -bottom-2 -right-2 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Desktop Experience Required
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          RequestLab is optimized for desktop browsers to provide the best development experience. Please switch to a desktop device to access all features.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span>Full-screen code editor</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span>Advanced API testing tools</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span>Real-time response visualization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [mode, setMode] = useState<ComparisonMode>('json');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
      } else if (location.pathname === '/api-testing') {
        navigate('/api-testing');
        setShowWelcomePopup(true);
      } else if (location.pathname === '/json-compare') {
        navigate('/json-compare');
      } else if (location.pathname === '/api-interceptor') {
        navigate('/api-interceptor');
      } else if (location.pathname === '/sql-compare') {
        navigate('/sql-compare');
      }
    }
  }, [location.pathname, navigate]);

  // Handle welcome popup close
  const handleWelcomePopupClose = () => {
    setShowWelcomePopup(false);
  };

  // Add effect to show welcome popup when api-testing page is opened
  useEffect(() => {
    if (location.pathname === '/api-testing') {
      const lastShown = localStorage.getItem('welcomePopupLastShown');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        setShowWelcomePopup(true);
      }
    }
  }, [location.pathname]);

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

  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showCollections = location.pathname === '/api-testing';
  const isHomePage = location.pathname === '/';
  const showDesktopPrompt = isMobile && !isHomePage;

  // Update to use Google Form URL
  const sheetUrl = 'https://forms.gle/fE7FPEYsowmwKRnKA';

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {showDesktopPrompt && <DesktopOnlyPrompt />}
      
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={handleWelcomePopupClose} 
      />
      
      {/* Left Sidebar - Only show when not on home page */}
      {!isHomePage && (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          <div className="flex flex-col h-full px-0 py-4">
            <div className="flex items-center mb-8 px-2">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <GitCompare className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  RequestLab
                </h1>
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => navigate('/api-testing')}
                className={`group relative flex items-center rounded-lg p-2.5 ${
                  location.pathname === '/api-testing'
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
                    cURL / JSON Compare
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
                    MySQL Compare
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
      )}

      {/* Main Content */}
      <div 
        className={`flex-1 relative ${isHomePage ? 'overflow-y-auto' : 'overflow-hidden'} scrollbar-hide`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {isLoading && <Loader />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/api-testing" element={<ApiTesting />} />
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

      {/* Add FloatingButton */}
      {!isHomePage && <FloatingButton sheetUrl={sheetUrl} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Head />
      <AuthProvider>
        <ApiCollectionsProvider>
          <LoaderProvider>
            <WelcomePopupProvider>
              <AppContent />
            </WelcomePopupProvider>
          </LoaderProvider>
        </ApiCollectionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;