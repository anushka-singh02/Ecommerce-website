import { fetcher } from '@/lib/fetcher';
import { ApiResponse, IUser } from '@/types/api';


interface ProfileUpdateData {
  name?: string;
  phone?: string;
  // add other fields as needed
}
export const userService = {

  getOrders: async () => {
    return await fetcher<any[]>('/user/orders');
  
  },

  getProfile: async () => {
    return fetcher("/user/profile", {
      method: "GET",
    });
  },

  // 2. Get Cart
  getCart: async () => {
    return fetcher("/user/cart", {
      method: "GET",
    });
  },

  // 3. Add to Cart (or Update Quantity)
  addToCart: async (data: { 
    productId: string; 
    size: string; 
    color: string; 
    quantity: number 
  }) => {
    return fetcher("/user/cart", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 4. Remove Item from Cart
  removeFromCart: async (itemId: string) => {
    return fetcher(`/user/cart/${itemId}`, {
      method: "DELETE",
    });
  },

  // 5. Clear Cart
  clearCart: async () => {
    return fetcher("/user/cart", {
      method: "DELETE",
    });
  },

  getWishlist: async () => {
    return fetcher("/user/wishlist", { method: "GET" });
  },

  addToWishlist: async (productId: string) => {
    return fetcher("/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist: async (productId: string) => {
    return fetcher(`/user/wishlist/${productId}`, { method: "DELETE" });
  },

  // Helper to check if a specific product is liked
  checkWishlistStatus: async (productId: string) => {
    return fetcher(`/user/wishlist/check/${productId}`);
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
}