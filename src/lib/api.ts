// API utility functions for frontend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window === 'undefined' ? 'http://localhost:3000' : '');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface BikeData {
  _id: string;
  brand: string;
  model: string;
  year: number;
  cc: number;
  mileage: number;
  buyPrice?: number;
  sellPrice: number;
  profit?: number;
  description?: string;
  images: string[];
  status: 'available' | 'sold' | 'reserved' | 'maintenance';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  freeWash: boolean;
  documents?: {
    type: string;
    url: string;
  }[];
  repairs?: {
    description: string;
    cost: number;
    date: string;
  }[];
  partnerInvestments?: {
    partnerId: string;
    amount: number;
    percentage: number;
  }[];
  listedDate: string;
  soldDate?: string;
  buyerInfo?: {
    name: string;
    phone: string;
    email: string;
    nid: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewData {
  _id: string;
  name: string;
  rating: number;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Public API functions (no authentication required)
export const publicApi = {
  // Get all available bikes
  getBikes: async (params?: {
    page?: number;
    limit?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    minYear?: number;
    maxYear?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
  }): Promise<ApiResponse<{ bikes: BikeData[]; pagination: PaginationData }>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/bikes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<{ bikes: BikeData[]; pagination: PaginationData }>(endpoint);
  },

  // Get single bike by ID
  getBike: async (id: string): Promise<ApiResponse<{ bike: BikeData }>> => {
    return apiCall<{ bike: BikeData }>(`/api/bikes/${id}`);
  },

  // Get all active reviews
  getReviews: async (params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ApiResponse<{ reviews: ReviewData[]; pagination: PaginationData }>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<{ reviews: ReviewData[]; pagination: PaginationData }>(endpoint);
  }
};

// Admin API functions (require authentication)
export const adminApi = {
  // Authentication
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return apiCall('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<ApiResponse<any>> => {
    return apiCall('/api/admin/auth/logout', {
      method: 'POST',
    });
  },

  // Bikes management
  getBikes: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ bikes: BikeData[]; pagination: PaginationData }>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/admin/bikes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<{ bikes: BikeData[]; pagination: PaginationData }>(endpoint);
  },

  createBike: async (bikeData: Partial<BikeData>): Promise<ApiResponse<BikeData>> => {
    return apiCall<BikeData>('/api/admin/bikes', {
      method: 'POST',
      body: JSON.stringify(bikeData),
    });
  },

  updateBike: async (id: string, bikeData: Partial<BikeData>): Promise<ApiResponse<BikeData>> => {
    return apiCall<BikeData>(`/api/admin/bikes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bikeData),
    });
  },

  deleteBike: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/api/admin/bikes/${id}`, {
      method: 'DELETE',
    });
  },

  // Dashboard
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiCall('/api/admin/dashboard');
  },

  // Reviews management
  getReviews: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
    rating?: number;
  }): Promise<ApiResponse<{ reviews: ReviewData[]; pagination: PaginationData }>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/admin/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<{ reviews: ReviewData[]; pagination: PaginationData }>(endpoint);
  },

  createReview: async (reviewData: Partial<ReviewData>): Promise<ApiResponse<ReviewData>> => {
    return apiCall<ReviewData>('/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export type { BikeData, ReviewData, ApiResponse, PaginationData };