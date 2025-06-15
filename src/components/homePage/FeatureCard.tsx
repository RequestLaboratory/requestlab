import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  capabilities: string[];
  color: string;
  isPopular?: boolean;
  onTryNow: () => void;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  capabilities,
  color,
  isPopular = false,
  onTryNow
}: FeatureCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col min-h-[500px]">
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <button
          onClick={onTryNow}
          className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

      <div className="space-y-6 flex-grow">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Capabilities</h4>
          <ul className="space-y-2">
            {capabilities.map((capability, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onTryNow}
        className="mt-8 w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 border-orange-500/50 dark:border-orange-500/30 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 dark:hover:border-orange-500"
      >
        Try Now
        <ArrowRight className="ml-2 h-5 w-5 text-orange-500 dark:text-orange-400 transition-colors duration-200" />
      </button>
    </div>
  );
}