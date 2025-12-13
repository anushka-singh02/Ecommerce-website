import { fetcher } from '@/lib/fetcher';
import { ApiResponse, IUser } from '@/types/api';

// Matches the backend response structure we built
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export const authService = {
  // Register
  register: async (data: any) => {
    return fetcher<ApiResponse<IUser>>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  //Login

  login: async (credentials: { email: string; password: string }) => {
    // 1. Call login
    const response: any = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // 2. Fix: Get Access Token directly from root object
    // We do NOT touch the refresh token (it's a cookie)
    if (response.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
      }
    }

    return response;
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      // 1. Call backend to clear the cookie
      try {
        await fetcher('/auth/logout', { method: 'POST' });
      } catch (e) {
        // ignore error if already logged out
      }

      // 2. Clear local access token
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  }
};
