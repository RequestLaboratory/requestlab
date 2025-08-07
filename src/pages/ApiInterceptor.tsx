import React, { useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterceptor, setEditingInterceptor] = useState<Interceptor | undefined>();
  const { user, noLoginRequired } = useAuth();

  const handleCreateInterceptor = async (data: { name: string; baseUrl: string; isActive: boolean }) => {
    // Transform the data to match the API format
    const apiData = {
      name: data.name,
      base_url: data.baseUrl,
      is_active: data.isActive,
    };
    
    const response = await apiClient.post(API_ENDPOINTS.INTERCEPTORS, apiData);
    const newInterceptor = response.data;
    navigate(`/interceptors/${newInterceptor.id}/logs`);
  };

  const handleSelectInterceptor = (interceptor: Interceptor) => {
    navigate(`/interceptors/${interceptor.id}/logs`);
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
              setIsModalOpen(true);
            }}
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