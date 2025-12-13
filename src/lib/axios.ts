import axios from "axios"

export const api = axios.create({
  baseURL: "/api/admin",
  withCredentials: true, // 🔑 IMPORTANT
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/admin/login"
    }
    return Promise.reject(err)
  }
)
