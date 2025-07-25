import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterceptorList from '../components/ApiInterceptor/InterceptorList';
import InterceptorModal from '../components/ApiInterceptor/InterceptorModal';
import { useAuth } from '../contexts/AuthContext';

interface Interceptor {
  id: string;
  name: string;
  base_url: string;
  created_at: string;
  is_active: boolean;
}

const API_BASE_URL = 'https://interceptorserver.onrender.com';

export default function ApiInterceptor() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterceptor, setEditingInterceptor] = useState<Interceptor | undefined>();
  const { user, noLoginRequired } = useAuth();

  const handleCreateInterceptor = async (data: Omit<Interceptor, 'id' | 'created_at'>) => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId && !noLoginRequired) {
      throw new Error('No session ID found');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (noLoginRequired) {
      headers['Authorization'] = 'Bearer no-login';
    } else {
      headers['Authorization'] = `Bearer ${sessionId}`;
    }

    headers['ngrok-skip-browser-warning'] = 'true';
    const response = await fetch(`${API_BASE_URL}/api/interceptors`, {
      method: 'POST',
      headers,
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