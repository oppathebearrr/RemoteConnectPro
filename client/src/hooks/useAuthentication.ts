import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
}

export const useAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  
  // Get current user query
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    retry: false
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      setIsAuthenticated(false);
    }
  });
  
  // Update authentication status when user data changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);
  
  const login = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password });
  };
  
  const logout = async () => {
    return logoutMutation.mutateAsync();
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loginError: loginMutation.error
  };
};
