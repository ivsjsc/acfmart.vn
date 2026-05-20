'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import api from '@/lib/api';

interface LoginInput { email: string; password: string; }
interface RegisterInput { name: string; email: string; password: string; phone?: string; }

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const qc = useQueryClient();

  // Lấy thông tin user hiện tại
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post('/auth/login', input);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post('/auth/register', input);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => { await api.post('/auth/logout'); },
    onSuccess: () => {
      clearAuth();
      qc.clear();
    },
  });

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoading: loginMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
  };
}
