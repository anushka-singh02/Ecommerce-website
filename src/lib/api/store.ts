// src/lib/api/store.ts
import { fetcher } from "@/lib/fetcher"

export const storeService = {
getAllProducts: async (params?: any) => {
    
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    
    return fetcher<any>(`/products?${queryString}`);
  },

  getProductById: async (id: string) => {
    return fetcher<any>(`/products/${id}`);
  },
}