import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ff_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - redirecting to login');
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const storiesAPI = {
  getAllStories: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/stories?${queryParams.toString()}`);
  },

  getStories: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/stories?${queryParams.toString()}`);
  },

  // ✅ FIXED: Updated to match UserProfile component needs
  getStoriesByAuthor: async (authorUsername, params = {}) => {
    try {
      console.log('📡 Fetching stories for author:', authorUsername);
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      const response = await api.get(`/stories/author/${authorUsername}?${queryParams.toString()}`);
      console.log('✅ Stories API response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Stories fetch error:', error);
      throw error;
    }
  },

  getStoryById: (id) => api.get(`/stories/${id}`),
  createStory: (storyData) => api.post('/stories', storyData),
  updateStory: (id, storyData) => api.put(`/stories/${id}`, storyData),
  deleteStory: (id) => api.delete(`/stories/${id}`),
  likeStory: (id) => api.patch(`/stories/${id}/like`),
  
  // ✅ ADD: Track story view
  trackStoryView: async (storyId) => {
    try {
      console.log('📊 Tracking story view:', storyId);
      const response = await api.post(`/stories/${storyId}/view`);
      console.log('✅ Story view tracked:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Story view tracking error:', error);
      throw error;
    }
  },

  addComment: (id, commentData) => api.post(`/stories/${id}/comment`, commentData),
  getComments: (id, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/stories/${id}/comments?${queryParams.toString()}`);
  }
};

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData)
};

export const dashboardAPI = {
  testConnection: () => api.get('/health'),
  testUserRoutes: () => api.get('/users/test'),
  debugUserStories: () => api.get('/users/debug/stories'),
  
  getDashboard: async () => {
    try {
      console.log('🔄 Fetching dashboard data from:', `${API_BASE_URL}/users/dashboard`);
      const response = await api.get('/users/dashboard');
      console.log('✅ Dashboard data received:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Dashboard API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  getUserStats: () => api.get('/users/me/stats'),
  getUserStories: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/users/me/stories?${queryParams.toString()}`);
  },
  getUserAnalytics: () => api.get('/users/me/analytics'),
  getLikedStories: () => api.get('/users/me/liked-stories'),
  getUserActivity: () => api.get('/users/me/activity'),
  getUserProfile: () => api.get('/users/me/profile'),
  updateUserProfile: (profileData) => api.put('/users/me/profile', profileData)
};

export const userAPI = {
  // ✅ FIXED: Updated to match UserProfile component needs
  getUserProfile: async (username) => {
    try {
      console.log('📡 Fetching user profile:', username);
      const response = await api.get(`/users/profile/${username}`);
      console.log('✅ User profile API response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ User profile fetch error:', error);
      throw error;
    }
  },

  // ✅ ADD: Track profile view
  trackProfileView: async (profileId) => {
    try {
      console.log('📊 Tracking profile view:', profileId);
      const response = await api.post(`/users/profile/${profileId}/view`);
      console.log('✅ Profile view tracked:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Profile view tracking error:', error);
      throw error;
    }
  },
  
  followUser: async (username) => {
    try {
      console.log('📡 Following user via API:', username);
      const response = await api.post(`/users/${username}/follow`);
      console.log('✅ Follow API response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Follow API error:', error);
      throw error;
    }
  },

  getUserFollowers: (username, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/users/${username}/followers?${queryParams.toString()}`);
  },

  getUserFollowing: (username, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/users/${username}/following?${queryParams.toString()}`);
  },

  getUserFeed: async (params = {}) => {
    try {
      console.log('📡 Fetching user feed via API with params:', params);
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      const response = await api.get(`/users/me/feed?${queryParams.toString()}`);
      console.log('✅ Feed API response:', {
        success: response.data.success,
        storiesCount: response.data.stories?.length || 0,
        totalStories: response.data.pagination?.totalStories || 0,
        debug: response.data.debug
      });
      return response;
    } catch (error) {
      console.error('❌ Feed API error:', error);
      throw error;
    }
  },

  getSuggestedUsers: () => api.get('/users/suggested'),

  searchUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/users/search?${queryParams.toString()}`);
  }
};

export const usersAPI = {
  followUser: userAPI.followUser,
  getUserProfile: userAPI.getUserProfile,
  trackProfileView: userAPI.trackProfileView,
  getUserFollowers: userAPI.getUserFollowers,
  getUserFollowing: userAPI.getUserFollowing,
  getUserFeed: userAPI.getUserFeed,
  getSuggestedUsers: userAPI.getSuggestedUsers,
  updateProfile: (profileData) => api.put('/users/me/profile', profileData),
  searchUsers: userAPI.searchUsers
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  createDirectChat: (userId) => api.post('/chats/direct', { userId }),
  getChatMessages: (chatId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/chats/${chatId}/messages?${queryParams.toString()}`);
  }
};

export const analyticsAPI = {
  getStoryPerformance: (id) => api.get(`/stories/${id}/analytics`),
  getViewTrends: (period = '30d') => api.get(`/users/me/trends?period=${period}`),
  getEngagementMetrics: () => api.get('/users/me/engagement')
};

export default api;
