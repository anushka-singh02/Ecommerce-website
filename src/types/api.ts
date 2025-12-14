// Define the shape of a single Product
export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
}

// Define the shape of the User (for Auth)
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Define generic API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  lowStockCount: number;
  lowStock: any[];
  recentOrders: any[];
}