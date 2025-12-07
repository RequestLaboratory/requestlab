import { ArrowRight, Zap, Shield, Gauge, CheckCircle, Terminal, GitCompare, Network, Database, Wand2, Package, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

interface HeroProps {
  onGetStartedClick: () => void;
}

export default function Hero({ onGetStartedClick }: HeroProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Initialize particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(initialParticles);
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${isDarkMode ? 'from-black via-gray-900 to-gray-950' : 'from-gray-50 via-white to-gray-100'}`}>
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-orange-950/10 via-transparent to-orange-950/5' : 'from-orange-100/30 via-transparent to-orange-50/20'}`}></div>

      {/* Interactive constellation particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => {
          // Calculate distance from mouse
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 30;

          // Particles move away from cursor
          const moveX = distance < maxDistance ? -dx * (1 - distance / maxDistance) * 0.5 : 0;
          const moveY = distance < maxDistance ? -dy * (1 - distance / maxDistance) * 0.5 : 0;

          return (
            <div
              key={particle.id}
              className={`absolute w-1 h-1 rounded-full transition-all duration-300 ease-out ${isDarkMode ? 'bg-orange-500' : 'bg-orange-600'}`}
              style={{
                left: `${particle.x + moveX}%`,
                top: `${particle.y + moveY}%`,
                opacity: distance < maxDistance ? 0.8 : 0.3,
                boxShadow: distance < maxDistance
                  ? (isDarkMode ? '0 0 8px rgba(249, 115, 22, 0.6)' : '0 0 8px rgba(234, 88, 12, 0.5)')
                  : (isDarkMode ? '0 0 2px rgba(249, 115, 22, 0.3)' : '0 0 2px rgba(234, 88, 12, 0.2)'),
              }}
            ></div>
          );
        })}

        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {particles.map((particle, i) => {
            return particles.slice(i + 1).map((otherParticle, j) => {
              const dx = particle.x - otherParticle.x;
              const dy = particle.y - otherParticle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 15) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${particle.x}%`}
                    y1={`${particle.y}%`}
                    x2={`${otherParticle.x}%`}
                    y2={`${otherParticle.y}%`}
                    stroke={isDarkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(234, 88, 12, 0.12)'}
                    strokeWidth="1"
                  />
                );
              }
              return null;
            });
          })}
        </svg>
      </div>

      {/* Realistic Moon */}
      <div className={`absolute top-20 right-20 w-64 h-64 ${isDarkMode ? 'opacity-30' : 'opacity-25'}`}>
        <div className="relative w-full h-full animate-float">
          {/* Moon base with gradient */}
          <div className={`absolute inset-0 rounded-full ${isDarkMode
              ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
              : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400'
            } shadow-2xl`}
            style={{
              boxShadow: isDarkMode
                ? '0 0 60px rgba(156, 163, 175, 0.3), inset -20px -20px 40px rgba(0, 0, 0, 0.3), inset 20px 20px 40px rgba(255, 255, 255, 0.1)'
                : '0 0 50px rgba(156, 163, 175, 0.25), inset -20px -20px 40px rgba(0, 0, 0, 0.2), inset 20px 20px 40px rgba(255, 255, 255, 0.15)'
            }}
          ></div>

          {/* Crater textures - multiple overlapping circles */}
          <div className="absolute top-8 left-12 w-8 h-8 rounded-full bg-gray-500/40 blur-sm"></div>
          <div className="absolute top-16 right-16 w-12 h-12 rounded-full bg-gray-600/30 blur-sm"></div>
          <div className="absolute bottom-20 left-16 w-10 h-10 rounded-full bg-gray-500/35 blur-sm"></div>
          <div className="absolute top-24 left-24 w-6 h-6 rounded-full bg-gray-600/40 blur-sm"></div>
          <div className="absolute bottom-16 right-20 w-14 h-14 rounded-full bg-gray-500/30 blur-sm"></div>
          <div className="absolute top-12 right-24 w-7 h-7 rounded-full bg-gray-600/35 blur-sm"></div>

          {/* Highlight for 3D effect */}
          <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/20 blur-xl"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className={`inline-flex items-center px-6 py-3 glass rounded-full text-sm font-medium mb-8 border animate-fadeIn backdrop-blur-md ${isDarkMode ? 'text-orange-300 border-orange-500/30' : 'text-orange-700 border-orange-400/40'
            }`}>
            <Sparkles className="h-4 w-4 mr-2 animate-glow-pulse" />
            Complete API Development & Testing Platform
          </div>

          {/* Headline */}
          <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-fadeIn ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Professional API Testing
            <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mt-4" style={{
              textShadow: isDarkMode ? '0 0 30px rgba(249, 115, 22, 0.3)' : '0 0 20px rgba(234, 88, 12, 0.2)',
            }}>
              Made Simple
            </span>
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed animate-fadeIn ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            RequestLab provides everything you need for API development. All in one powerful platform.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-5xl mx-auto">
            {[
              { icon: Terminal, text: 'API Development' },
              { icon: GitCompare, text: 'JSON Comparison' },
              { icon: Wand2, text: 'JSON Formatter' },
              { icon: Terminal, text: 'cURL Testing' },
              { icon: Zap, text: 'Load Testing' },
              { icon: Network, text: 'API Interception' },
              { icon: Database, text: 'MySQL Schema Comparison' },
              { icon: Package, text: 'NPM Analyzer' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 glass px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 backdrop-blur-md ${isDarkMode
                    ? 'border-orange-500/20 hover:border-orange-400/40'
                    : 'border-orange-400/30 hover:border-orange-500/50'
                    }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`h-4 w-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={onGetStartedClick}
              className="group relative bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(249, 115, 22, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span className="relative z-10 flex items-center">
                Your Complete API & Database Toolkit
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 max-w-3xl mx-auto">
            {[
              'No Setup Required',
              'Real-time Results',
              'Enterprise Ready'
            ].map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 glass px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-300 ${isDarkMode
                  ? 'border-green-500/30 hover:border-green-400/50'
                  : 'border-green-600/40 hover:border-green-500/60'
                  }`}
              >
                <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Feature highlights with glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: 'Enterprise Security', color: 'from-orange-500 to-orange-600' },
              { icon: Gauge, text: 'High Performance', color: 'from-orange-600 to-red-600' },
              { icon: Zap, text: 'Lightning Fast', color: 'from-orange-500 to-yellow-600' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-center space-x-3 p-8 rounded-2xl glass border transition-all duration-300 hover:scale-105 backdrop-blur-md group ${isDarkMode
                    ? 'border-white/10 hover:border-orange-500/30'
                    : 'border-gray-300/40 hover:border-orange-400/50'
                    }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${isDarkMode ? 'from-black' : 'from-gray-50'} to-transparent`}></div>
    </section>
  );
}
