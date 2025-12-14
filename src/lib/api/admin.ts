import { fetcher } from '@/lib/fetcher';
// You might want to move these types to types/api.ts later
import { ApiResponse, IProduct, IUser , DashboardStats } from '@/types/api';

export const adminService = {
  // --- DASHBOARD & METRICS ---

  // GET /dashboard
  getDashboardStats: async () => {
    return fetcher<DashboardStats>('/admin/dashboard');
  },

  // GET /metrics?range=30d
  getMetrics: async (range: string = '30d') => {
    return fetcher<any>(`/admin/metrics?range=${range}`);
  },

  // --- PRODUCTS ---
  //GET PRODUCTS


  getProducts: async () => {
    return fetcher<ApiResponse<any>>('/products');
  },


  getProductById: async (id: string) => {
    return fetcher<ApiResponse<IProduct>>(`/products/${id}`); // Adjust URL if needed
  },
  // POST /products
  createProduct: async (productData: any) => {
    return fetcher<ApiResponse<IProduct>>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // PUT /products/:id
  updateProduct: async (id: string, productData: any) => {
    return fetcher<ApiResponse<IProduct>>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // DELETE /products/:id
  deleteProduct: async (id: string) => {
    return fetcher<ApiResponse<null>>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  uploadImage: async (formData: FormData) => {
    return fetcher<{ url: string }>("/admin/products/upload", {
      method: "POST",
      body: formData,
    });
  },

  // --- ORDERS ---

  // GET /orders?status=PAID&page=1
  getOrders: async (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());

    return fetcher<ApiResponse<any[]>>(`/admin/orders?${query.toString()}`);
  },

  getOrderById: async (id: string) => {
    return fetcher<any>(`/admin/orders/${id}`);
  },

  // PUT /orders/:id/status
  updateOrderStatus: async (id: string, status: string) => {
    return fetcher<ApiResponse<any>>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // POST /orders/:id/refund
  refundOrder: async (id: string, data: { items: any[]; reason: string }) => {
    return fetcher<ApiResponse<any>>(`/admin/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- CUSTOMERS ---

  // GET /customers
  getCustomers: async () => {
    return fetcher<ApiResponse<IUser[]>>('/admin/customers');
  },

  // PUT /customers/:id/notes
  updateCustomerNotes: async (id: string, notes: string) => {
    return fetcher<ApiResponse<any>>(`/admin/customers/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },

  // --- LOGS & EXPORTS ---

  // GET /activity
  getActivityLogs: async () => {
    return fetcher<ApiResponse<any[]>>('/admin/activity');
  },

  /**
   * SPECIAL CASE: CSV DOWNLOAD
   * We cannot use the standard 'fetcher' because it expects JSON.
   * This function fetches the Blob and triggers a browser download.
   */
  downloadOrdersCsv: async () => {
    const token = localStorage.getItem('accessToken');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/exports/orders.csv`, {
      headers,
    });

    if (!res.ok) throw new Error('Failed to download CSV');

    // Convert response to Blob (File)
    const blob = await res.blob();

    // Create a hidden link to trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};