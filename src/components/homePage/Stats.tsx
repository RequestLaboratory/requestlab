import React from 'react';
import { Users, Zap, Globe, Award, TrendingUp, Clock } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: 'Active Developers',
      description: 'Trust RequestLab daily',
      trend: '+23% this month'
    },
    {
      icon: Zap,
      value: '10M+',
      label: 'API Tests Executed',
      description: 'Every month on our platform',
      trend: '+45% growth'
    },
    {
      icon: Globe,
      value: '99.9%',
      label: 'Uptime SLA',
      description: 'Reliable service guarantee',
      trend: 'Enterprise grade'
    },
    {
      icon: Award,
      value: '4.9/5',
      label: 'User Rating',
      description: 'Based on 5K+ reviews',
      trend: 'Industry leading'
    },
    {
      icon: TrendingUp,
      value: '500+',
      label: 'Enterprise Clients',
      description: 'Fortune 500 companies',
      trend: 'Trusted globally'
    },
    {
      icon: Clock,
      value: '<100ms',
      label: 'Response Time',
      description: 'Average API response',
      trend: 'Lightning fast'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Developed for Developers by Developers
            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Born from the need to compare and share JSON results, RequestLab has evolved into a complete development platform. 
            We've eliminated the hassle of switching between multiple tools, bringing all your development needs into one powerful solution.
          </p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-2xl mb-4 group-hover:from-orange-100 group-hover:to-orange-200 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-300 border border-orange-100 dark:border-gray-600">
                <div className="inline-flex p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mb-6">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{stat.label}</div>
                <div className="text-gray-600 dark:text-gray-400 mb-3">{stat.description}</div>
                <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Additional metrics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">150+</div>
            <div className="text-gray-600 dark:text-gray-300">Countries Served</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Up time</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Developer</div>
            <div className="text-gray-600 dark:text-gray-300">Support</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Secure</div>
            <div className="text-gray-600 dark:text-gray-300">Data stored in browser</div>
          </div>
        </div>
      </div>
    </section>
  );
}