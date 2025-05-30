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
import Layout from './components/Layout';
import Header from './components/Header';
import { decodeJsonFromUrl } from './utils/urlUtils';
import { formatCurlResponse } from './utils/curlUtils';
import ApiTesting from './pages/ApiTesting';
import { GitCompare, Sun, Moon } from 'lucide-react';
import { ThemeContext } from './contexts/ThemeContext';
import WelcomePopup from './components/WelcomePopup';
import ApiInterceptor from './pages/ApiInterceptor';
import InterceptorLogs from './pages/InterceptorLogs';

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
  const [activePage, setActivePage] = useState<'compare' | 'api-testing' | 'api-interceptor'>('compare');
  const [mode, setMode] = useState<ComparisonMode>('json');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const jsonComparison = useJsonComparison();
  const curlComparison = useCurlComparison();

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

  const [leftCurl, setLeftCurl] = useState<string>(`curl 'https://api.github.com/repos/facebook/react' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: RequestLab'`);

  const [rightCurl, setRightCurl] = useState<string>(`curl 'https://api.github.com/repos/vuejs/vue' \\
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

  // Update activePage based on current route
  useEffect(() => {
    if (location.pathname === '/api-testing') {
      setActivePage('api-testing');
    } else if (location.pathname === '/api-interceptor') {
      setActivePage('api-interceptor');
    } else {
      setActivePage('compare');
    }
  }, [location.pathname]);

  // Handle mode change
  const handleModeChange = (newMode: ComparisonMode) => {
    setMode(newMode);
    // When switching from curl to json mode, populate JSON inputs with curl responses
    if (newMode === 'json' && (leftResponse || rightResponse)) {
      if (leftResponse) {
        updateLeftJson(formatCurlResponse(leftResponse));
      }
      if (rightResponse) {
        updateRightJson(formatCurlResponse(rightResponse));
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

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, 500); // Increased delay to 500ms
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      />
      
      {/* Left Sidebar */}
      <div 
        className={`relative transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-64' : 'w-14'
        } border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex flex-col h-full ${
          isSidebarExpanded ? 'px-0 py-4' : 'px-0 py-4'
        }`}>
          <div className={`flex items-center mb-8 ${
            isSidebarExpanded ? 'px-2' : 'justify-center'
          }`}>
            <GitCompare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {isSidebarExpanded && (
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white transition-all duration-300 truncate">
                RequestLab
              </h1>
            )}
          </div>

          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => navigate('/')}
              className={`group relative flex items-center rounded-lg ${
                isSidebarExpanded ? 'p-2.5' : 'p-2.5 mx-1'
              } ${
                location.pathname === '/'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className={`flex items-center ${
                isSidebarExpanded ? 'w-full' : 'w-9 justify-center'
              }`}>
                <svg 
                  className={`w-5 h-5 ${
                    isSidebarExpanded ? '' : 'mx-auto'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className={`ml-3 font-medium transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  JSON Compare
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/api-testing')}
              className={`group relative flex items-center rounded-lg ${
                isSidebarExpanded ? 'p-2.5' : 'p-2.5 mx-1'
              } ${
                location.pathname === '/api-testing'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className={`flex items-center ${
                isSidebarExpanded ? 'w-full' : 'w-9 justify-center'
              }`}>
                <svg 
                  className={`w-5 h-5 ${
                    isSidebarExpanded ? '' : 'mx-auto'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`ml-3 font-medium transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  API Testing
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/api-interceptor')}
              className={`group relative flex items-center rounded-lg ${
                isSidebarExpanded ? 'p-2.5' : 'p-2.5 mx-1'
              } ${
                location.pathname === '/api-interceptor'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors duration-200`}
            >
              <div className={`flex items-center ${
                isSidebarExpanded ? 'w-full' : 'w-9 justify-center'
              }`}>
                <svg 
                  className={`w-5 h-5 ${
                    isSidebarExpanded ? '' : 'mx-auto'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={`ml-3 font-medium transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  API Interceptor
                </span>
              </div>
            </button>
          </nav>

          {/* Dark Mode Toggle at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center ${
                isSidebarExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'
              } rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
              {isSidebarExpanded && (
                <span className="ml-3 font-medium whitespace-nowrap">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={
            <div className="flex-1 overflow-auto p-4">
              <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
              {mode === 'json' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <JsonInput
                    value={jsonLeftInput}
                    onChange={updateLeftJson}
                    onFormat={formatLeftJson}
                    isValid={leftValid}
                    placeholder="Enter or paste JSON here..."
                  />
                  <JsonInput
                    value={jsonRightInput}
                    onChange={updateRightJson}
                    onFormat={formatRightJson}
                    isValid={rightValid}
                    placeholder="Enter or paste JSON here..."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CurlInput
                    value={curlLeftInput}
                    onChange={setCurlLeftInput}
                    onExecute={executeLeftCurl}
                    isLoading={isLeftLoading}
                    placeholder="Enter cURL command here..."
                  />
                  <CurlInput
                    value={curlRightInput}
                    onChange={setCurlRightInput}
                    onExecute={executeRightCurl}
                    isLoading={isRightLoading}
                    placeholder="Enter cURL command here..."
                  />
                </div>
              )}
              <ExampleButton onLeftExample={handleLeftExample} onRightExample={handleRightExample} />
              <DiffViewer
                leftInput={mode === 'json' ? jsonLeftInput : formatCurlResponse(leftResponse)}
                rightInput={mode === 'json' ? jsonRightInput : formatCurlResponse(rightResponse)}
                diff={mode === 'json' ? jsonDiff : curlDiff}
                error={mode === 'json' ? jsonError : curlError}
              />
            </div>
          } />
          <Route path="/api-testing" element={<ApiTesting />} />
          <Route path="/api-interceptor" element={<ApiInterceptor />} />
          <Route path="/interceptors/:id/logs" element={<InterceptorLogs />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;