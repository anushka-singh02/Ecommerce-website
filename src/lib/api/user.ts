import { fetcher } from '@/lib/fetcher';
import { ApiResponse, IUser } from '@/types/api';


interface ProfileUpdateData {
  name?: string;
  phone?: string;
  // add other fields as needed
}
export const userService = {

  getOrders: async () => {
    const data = await fetcher<any[]>('/user/orders');
  console.log(data);
  return data;
  },

  getWishlist: async () => {
    return fetcher<any[]>('/user/wishlist');
  },

  getAddresses: async () => {
    return fetcher<any[]>('/user/addresses');
  },

  updateProfile: async (data: ProfileUpdateData) => {
    return fetcher('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  addAddress: async (data: { street: string; city: string; state: string; zip: string }) => {
    return fetcher('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (id: string) => {
    return fetcher(`/user/addresses/${id}`, {
      method: 'DELETE',
    });
  },

getProfile: async () => {
    return fetcher<ApiResponse<IUser>>('/admin/me'); // Auto-attaches token
  },

};