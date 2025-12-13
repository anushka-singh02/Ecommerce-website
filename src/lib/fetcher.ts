const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';


let isRefreshing = false;

export async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 1. Prepare Headers (Attach Access Token)
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 2. Initial Request
  // We use credentials: 'include' to ensure cookies are sent if needed
  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
    credentials: 'include', 
  });

  // 3. Handle 401 (Access Token Expired)
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;

    try {
      // REFRESH STEP: 
      // We don't send body. We rely on the Browser sending the Cookie.
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <--- CRITICAL: Sends the HttpOnly Cookie
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        
        // Backend should return the NEW Access Token directly or in data
        const newAccessToken = data.accessToken || data.data?.accessToken;
        
        if (newAccessToken) {
           localStorage.setItem('accessToken', newAccessToken);
           isRefreshing = false;

           // RETRY Original Request
           res = await fetch(`${BASE_URL}${endpoint}`, {
             ...options,
             headers: getHeaders(), // Pick up the new token
             credentials: 'include',
           });
        }
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      isRefreshing = false;
      // Logout if refresh fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
  }

  // 4. Final Error Handling
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `API Error: ${res.statusText}`);
  }

  return res.json();
}