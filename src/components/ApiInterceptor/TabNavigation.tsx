import React from 'react';
import { Activity, Zap } from 'lucide-react';

export type TabType = 'interceptor' | 'mock';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  interceptorName?: string;
}

export default function TabNavigation({ activeTab, onTabChange, interceptorName }: TabNavigationProps) {
  const tabs = [
    {
      id: 'interceptor' as TabType,
      label: 'Live Interceptor',
      icon: Activity,
      description: 'Real-time API interception and logging',
    },
    {
      id: 'mock' as TabType,
      label: 'Mock APIs',
      icon: Zap,
      description: 'Mock responses stored locally',
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {interceptorName || 'API Interceptor'}
        </h1>
      </div>
      
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                activeTab === tab.id
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}