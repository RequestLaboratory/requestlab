import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Copy, Edit, Trash2 } from 'lucide-react';
import { mockApiStorage, MockApi } from '../../utils/mockApiStorage';
import { generateCurl, copyToClipboard } from '../../utils/curlGenerator';
import { API_BASE_URL } from '../../config';
import MockApiDebugger from '../MockApiDebugger';

interface Interceptor {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
  is_active: boolean;
}

interface MockApiListProps {
  interceptorId: string;
  interceptor?: Interceptor;
  onCreateMockApi: () => void;
  onEditMockApi: (mockApi: MockApi) => void;
  refreshTrigger?: number; // Add this to trigger refresh
}

export default function MockApiList({ interceptorId, interceptor, onCreateMockApi, onEditMockApi, refreshTrigger }: MockApiListProps) {
  const [mockApis, setMockApis] = useState<MockApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMockApis();
  }, [interceptorId, refreshTrigger]); // Add refreshTrigger to dependencies

  const loadMockApis = async () => {
    try {
      setLoading(true);
      const apis = await mockApiStorage.getMockApisByInterceptor(interceptorId);
      setMockApis(apis);
    } catch (error) {
      console.error('Failed to load mock APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (mockApi: MockApi) => {
    try {
      const updatedMockApi = {
        ...mockApi,
        isActive: !mockApi.isActive,
        updatedAt: new Date().toISOString(),
      };
      await mockApiStorage.saveMockApi(updatedMockApi);
      setMockApis(prev => prev.map(api => api.id === mockApi.id ? updatedMockApi : api));
    } catch (error) {
      console.error('Failed to toggle mock API:', error);
    }
  };

  const handleCopyCurl = async (mockApi: MockApi) => {
    try {
      const curl = generateCurl(mockApi);
      const success = await copyToClipboard(curl);
      if (success) {
        setCopiedId(mockApi.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy CURL:', error);
    }
  };

  const handleDelete = async (mockApi: MockApi) => {
    if (window.confirm('Are you sure you want to delete this mock API?')) {
      try {
        await mockApiStorage.deleteMockApi(mockApi.id);
        setMockApis(prev => prev.filter(api => api.id !== mockApi.id));
      } catch (error) {
        console.error('Failed to delete mock API:', error);
      }
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
      case 'POST':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
      case 'PUT':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
      case 'DELETE':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800';
    }
  };

  const getPathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If it's not a valid URL, assume it's already a path or relative URL
      if (url.startsWith('/')) {
        return url;
      }
      // Try to extract path from relative URL
      const pathMatch = url.match(/\/[^?#]*/);
      return pathMatch ? pathMatch[0] : `/${url}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const proxyUrl = interceptor ? `${API_BASE_URL}/${interceptor.id}` : '';

  return (
    <div className="space-y-6">
      {/* Interceptor Details Header */}
      {interceptor && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interceptor Details</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                <code className="text-sm text-gray-900 dark:text-white">{interceptor.name}</code>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Original URL:</span>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                <code className="text-sm text-gray-900 dark:text-white break-all">{interceptor.base_url}</code>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Proxy URL:</span>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                <code className="text-sm text-gray-900 dark:text-white break-all">{proxyUrl}</code>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Mock API Behavior:</strong> Regular requests proxy to the real API. Add "/mock" to any path to get the mock response instead.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Example: <code>{proxyUrl}/users</code> → Real API | <code>{proxyUrl}/users/mock</code> → Mock API
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mock APIs</h3>
        <button
          onClick={onCreateMockApi}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Mock API
        </button>
      </div>

      {mockApis.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No mock APIs created yet</p>
          <p className="text-sm">Create your first mock API to start intercepting requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {mockApis.map((mockApi) => (
            <div
              key={mockApi.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {mockApi.name}
                  </h4>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMethodColor(mockApi.method)}`}>
                      {mockApi.method.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {mockApi.url}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      MOCK
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Status: {mockApi.response.status}</span>
                    <span>Created: {new Date(mockApi.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Proxy: {proxyUrl}{getPathFromUrl(mockApi.url)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(mockApi)}
                    className={`p-2 rounded-md transition-colors ${
                      mockApi.isActive
                        ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={mockApi.isActive ? 'Disable mock' : 'Enable mock'}
                  >
                    {mockApi.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleCopyCurl(mockApi)}
                    className={`p-2 rounded-md transition-colors ${
                      copiedId === mockApi.id
                        ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                        : 'text-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title={copiedId === mockApi.id ? 'Copied!' : 'Copy as CURL'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditMockApi(mockApi)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                    title="Edit mock API"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mockApi)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                    title="Delete mock API"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Temporary Debug Component */}
      <div className="mt-8">
        <MockApiDebugger />
      </div>
    </div>
  );
}