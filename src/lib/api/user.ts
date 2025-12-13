import { fetcher } from '@/lib/fetcher';
import { ApiResponse, IUser } from '@/types/api';

export const userService = {
  getProfile: async () => {
    return fetcher<ApiResponse<IUser>>('/admin/me'); // Auto-attaches token
  },

  updateProfile: async (data: Partial<IUser>) => {
    return fetcher<ApiResponse<IUser>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};