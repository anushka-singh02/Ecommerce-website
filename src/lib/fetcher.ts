const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-backend-7b8z.onrender.com/api';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Add a custom type for our options
interface FetcherOptions extends RequestInit {
  _isRetry?: boolean; // <--- The Loop Breaker
}

export async function fetcher<T>(endpoint: string, options: FetcherOptions = {}): Promise<T> {
  const getHeaders = () => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      // DEBUG: Uncomment this to see what token is being sent
      // console.log("Sending Token:", token); 
    }
    return headers;
  };

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
    credentials: 'include', 
  });

  // --- HANDLE 401 ---
  if (res.status === 401) {
    // 🛑 LOOP BREAKER: If this request was ALREADY a retry, stop here.
    if (options._isRetry) {
      if (typeof window !== 'undefined') {
        // localStorage.removeItem('accessToken');
        // window.location.href = '/login';
      }
      throw new Error("Session expired. Please login again.");
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        // Retry queued requests with the _isRetry flag
        return fetcher<T>(endpoint, { ...options, _isRetry: true });
      }).catch((err) => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        // Make sure you access the token correctly based on your API response structure
        const newAccessToken = data.accessToken || data.data?.accessToken;

        if (newAccessToken) {
           localStorage.setItem('accessToken', newAccessToken);
           
           processQueue(null, newAccessToken);
           isRefreshing = false;

           // RETRY: Mark this as a retry so it doesn't loop if it fails again
           return fetcher<T>(endpoint, { ...options, _isRetry: true });
        }
      } 
      
      throw new Error('Refresh failed');
      
    } catch (error) {
      processQueue(error, null);
      isRefreshing = false;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        // Optional: Only redirect if not already on login
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
      }
      throw error;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.statusText}`);
  }

  return res.json();
}