import { useQuery } from "@tanstack/react-query"
import { userService } from "@/lib/api/user" // Import the service
import { IUser } from "@/types/api"

export function useAuth() {
  return useQuery<IUser>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      // 1. Call the service (which fetches /users/me)
      const res = await userService.getProfile();
      
      // 2. Return ONLY the user object (res.data)
      return res as unknown as IUser;
    },
    retry: false, // Don't retry if 401 (just let them be logged out)
  })
}