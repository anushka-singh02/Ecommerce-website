import { create } from 'zustand'
import { fetcher } from '@/lib/fetcher' 

// Define what your User looks like
interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  checkAuth: () => Promise<void>
  login: (user: User, accessToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true so we don't show "Login" button immediately on refresh

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Hit your API to validate token and get fresh user data
      // Replace '/auth/me' with your actual profile endpoint
      const userData = await fetcher<User>('/auth/me'); 
      
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      console.error("Auth check failed:", error);
      // If check fails, assume logged out
    //   localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // If you use it
    set({ user: null, isAuthenticated: false });
    window.location.href = '/'; // Force redirect
  },
}))