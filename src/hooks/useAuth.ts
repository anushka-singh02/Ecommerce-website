import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { AuthUser } from "@/lib/types"

export function useAuth() {
  return useQuery<AuthUser>({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await api.get("/auth/me")
      return res.data
    },
    retry: false,
  })
}
