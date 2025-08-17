import React, { useState, useEffect } from 'react';
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

export default function ApiInterceptor() {
  const navigate = useNavigate();
  const [isInterceptorModalOpen, setIsInterceptorModalOpen] = useState(false);
  const [editingInterceptor, setEditingInterceptor] = useState<Interceptor | undefined>();
  const [interceptors, setInterceptors] = useState<Interceptor[]>([]);
  const { user, noLoginRequired } = useAuth();

  useEffect(() => {
    if (user || noLoginRequired) {
      fetchInterceptors();
    }
  }, [user, noLoginRequired]);

  const fetchInterceptors = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INTERCEPTORS);
      setInterceptors(response.data);
    } catch (error) {
      console.error('Failed to fetch interceptors:', error);
    }
  };

  const handleCreateInterceptor = async (data: { name: string; baseUrl: string; isActive: boolean }) => {
    const apiData = {
      name: data.name,
      base_url: data.baseUrl,
      is_active: data.isActive,
    };
    
    const response = await apiClient.post(API_ENDPOINTS.INTERCEPTORS, apiData);
    const newInterceptor = response.data;
    await fetchInterceptors(); // Refresh the list
    // Open new interceptor logs in a new tab
    const url = `/interceptors/${newInterceptor.id}/logs`;
    window.open(url, '_blank');
  };

  const handleSelectInterceptor = (interceptor: Interceptor) => {
    // Open interceptor logs in a new tab
    const url = `/interceptors/${interceptor.id}/logs`;
    window.open(url, '_blank');
  };

  if (!user && !noLoginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Please log in to use the API Interceptor.
            </div>
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
              setEditingInterceptor(undefined);
              setIsInterceptorModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <InterceptorModal
        interceptor={editingInterceptor ? {
          id: editingInterceptor.id,
          name: editingInterceptor.name,
          baseUrl: editingInterceptor.base_url,
          createdAt: editingInterceptor.created_at,
          isActive: editingInterceptor.is_active,
        } : undefined}
        isOpen={isInterceptorModalOpen}
        onClose={() => {
          setIsInterceptorModalOpen(false);
          setEditingInterceptor(undefined);
        }}
        onSave={handleCreateInterceptor}
      />
    </div>
  );
}