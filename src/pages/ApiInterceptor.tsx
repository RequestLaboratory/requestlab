import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterceptorList from '../components/ApiInterceptor/InterceptorList';
import InterceptorModal from '../components/ApiInterceptor/InterceptorModal';

interface Interceptor {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  isActive: boolean;
}

const API_BASE_URL = 'https://interceptorworker.yadev64.workers.dev';

export default function ApiInterceptor() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterceptor, setEditingInterceptor] = useState<Interceptor | undefined>();

  const handleCreateInterceptor = async (data: Omit<Interceptor, 'id' | 'createdAt'>) => {
    const response = await fetch(`${API_BASE_URL}/api/interceptors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create interceptor: ${errorText}`);
    }
    const newInterceptor = await response.json();
    navigate(`/interceptors/${newInterceptor.id}/logs`);
  };

  const handleSelectInterceptor = (interceptor: Interceptor) => {
    navigate(`/interceptors/${interceptor.id}/logs`);
  };

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
            onEditInterceptor={(interceptor) => {
              setEditingInterceptor(interceptor);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      <InterceptorModal
        interceptor={editingInterceptor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInterceptor(undefined);
        }}
        onSave={editingInterceptor ? handleCreateInterceptor : handleCreateInterceptor}
      />
    </div>
  );
} 