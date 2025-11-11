import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import InterceptorList from '../components/ApiInterceptor/InterceptorList';
import InterceptorModal from '../components/ApiInterceptor/InterceptorModal';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config';

interface Interceptor {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
  is_active: boolean;
}

const MAX_INTERCEPTORS_PER_USER = 3;

export default function ApiInterceptor() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterceptor, setEditingInterceptor] = useState<Interceptor | undefined>();
  const [interceptorCount, setInterceptorCount] = useState(0);
  const { user, noLoginRequired, login } = useAuth();

  const handleCreateInterceptor = async (data: { name: string; baseUrl: string; isActive: boolean }) => {
    try {
      // Check limit before creating
      if (interceptorCount >= MAX_INTERCEPTORS_PER_USER) {
        throw new Error(`Maximum ${MAX_INTERCEPTORS_PER_USER} interceptors per user reached. Please delete an existing interceptor to create a new one.`);
      }

      // Transform the data to match the API format
      const apiData = {
        name: data.name,
        base_url: data.baseUrl,
        is_active: data.isActive,
      };
      
      const response = await apiClient.post(API_ENDPOINTS.INTERCEPTORS, apiData);
      const newInterceptor = response.data;
      setInterceptorCount(prev => prev + 1);
      navigate(`/interceptors/${newInterceptor.id}/logs`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Authentication required. Please log in to create interceptors.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create interceptor';
        alert(errorMessage);
      } else {
        const errorMessage = err.message || err.response?.data?.message || 'Failed to create interceptor';
        alert(errorMessage);
      }
      throw err; // Re-throw to let modal handle it
    }
  };

  const handleSelectInterceptor = (interceptor: Interceptor) => {
    navigate(`/interceptors/${interceptor.id}/logs`);
  };

  if (!user && !noLoginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to use the API Interceptor. Create and manage interceptors to monitor your API requests.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <InterceptorList
            onSelectInterceptor={handleSelectInterceptor}
            onCreateInterceptor={() => {
              if (interceptorCount >= MAX_INTERCEPTORS_PER_USER) {
                alert(`Maximum ${MAX_INTERCEPTORS_PER_USER} interceptors per user reached. Please delete an existing interceptor to create a new one.`);
                return;
              }
              setEditingInterceptor(undefined);
              setIsModalOpen(true);
            }}
            onInterceptorCountChange={setInterceptorCount}
          />
        </div>
      </div>

      <InterceptorModal
        interceptor={editingInterceptor ? {
          id: editingInterceptor.id,
          name: editingInterceptor.name,
          baseUrl: editingInterceptor.base_url,
          createdAt: editingInterceptor.created_at,
          isActive: editingInterceptor.is_active,
        } : undefined}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInterceptor(undefined);
        }}
        onSave={handleCreateInterceptor}
      />
    </div>
  );
} 