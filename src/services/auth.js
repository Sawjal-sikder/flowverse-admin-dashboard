import axios from 'axios';

// export const API_BASE_URL = 'https://rentoapi.dsrt321.online/api/v1';
export const API_BASE_URL = 'http://10.10.7.76:14060/api/v1';
export const PIC_BASE_URL = 'http://10.10.7.76:14060';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    try {
      
      const response = await api.post('/auth/login/', credentials);
      
      const { access, refresh } = response.data;
      
      if (access) {
        // Store the access token as the main auth token
        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);

        // Fetch user profile to verify admin access
        const profileResponse = await api.get('/user/profile/details/', {
          headers: { Authorization: `Bearer ${access}` },
        });
        const profile = profileResponse.data;

        if (!profile.is_admin) {
          // Not an admin — clear tokens and reject
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          throw { message: 'Access denied. Only admins can access this panel.', status: 403 };
        }

        const userInfo = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          profile_image: profile.profile_image,
          is_admin: profile.is_admin,
          is_premium: profile.is_premium,
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
      }

      return {
        token: access,
        user: JSON.parse(localStorage.getItem('user')),
        access,
        refresh
      };
    } catch (error) {
      // Re-throw admin access denial as-is
      if (error.status === 403) {
        throw error;
      }

      console.error('Login error:', error);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Login failed';

      throw { message: errorMessage, status: error.response?.status };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default api;