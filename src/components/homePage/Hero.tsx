import React from 'react';
import { ArrowRight, Zap, Shield, Gauge, Play, CheckCircle, Terminal, GitCompare, Network, Database, Wand2 } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export default function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-800 dark:text-orange-300 text-sm font-medium mb-8 border border-orange-200 dark:border-orange-700">
            <Zap className="h-4 w-4 mr-2" />
            Complete API Development & Testing Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Professional API Testing
            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            RequestLab provides everything you need for API development. All in one powerful platform.
          </p>

          {/* Breadcrumbs UI */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Terminal className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">API Development</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <GitCompare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">JSON Comparison</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Wand2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">JSON Formatter</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Terminal className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">cURL Testing</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Load Testing</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Network className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">API Interception</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
              <Database className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">MySQL Schema Comparison</span>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 dark:border-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No Setup Required</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 dark:border-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Results</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-100 dark:border-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enterprise Ready</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStartedClick}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
            >
              Your Complete API & Database Toolkit

              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            {/* <button className="group px-8 py-4 rounded-xl text-lg font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hover:bg-orange-50 dark:hover:bg-gray-800 flex items-center">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </button> */}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-6 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600 transition-all duration-200 hover:shadow-lg">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600 transition-all duration-200 hover:shadow-lg">
              <Gauge className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">High Performance</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600 transition-all duration-200 hover:shadow-lg">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Lightning Fast</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}