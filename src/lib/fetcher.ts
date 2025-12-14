const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

let isRefreshing = false;

export async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 1. Prepare Headers
  const getHeaders = () => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>), // Start with any custom headers passed in
    };

    // --- FIX START ---
    // If the body is FormData (File Upload), DO NOT set Content-Type.
    // The browser will automatically set it to 'multipart/form-data; boundary=...'
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    // --- FIX END ---
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 2. Initial Request
  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
    credentials: 'include', 
  });

  // 3. Handle 401 (Access Token Expired)
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        
        // Handle different response structures
        const newAccessToken = data.accessToken || data.data?.accessToken;
        
        if (newAccessToken) {
           localStorage.setItem('accessToken', newAccessToken);
           isRefreshing = false;

           // RETRY Original Request
           res = await fetch(`${BASE_URL}${endpoint}`, {
             ...options,
             headers: getHeaders(), // This will re-run logic and keep FormData correct
             credentials: 'include',
           });
        }
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      isRefreshing = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
  }

  // 4. Final Error Handling
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); // Prevent crash if no json
    throw new Error(errorData.message || `API Error: ${res.statusText}`);
  }

  return res.json();
}