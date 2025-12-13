import axios from "axios"

export const publicApi = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
})
