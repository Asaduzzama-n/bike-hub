'use client';

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Specialized hook for bikes
export function useBikes(params?: {
  page?: number;
  limit?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  search?: string;
  status?: string;
}) {
  const { publicApi } = require('@/lib/api');
  
  return useApi(
    () => publicApi.getBikes(params),
    [JSON.stringify(params)]
  );
}

// Specialized hook for reviews
export function useReviews(params?: {
  page?: number;
  limit?: number;
  rating?: number;
}) {
  const { publicApi } = require('@/lib/api');
  
  return useApi(
    () => publicApi.getReviews(params),
    [JSON.stringify(params)]
  );
}