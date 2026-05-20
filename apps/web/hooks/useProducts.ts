'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Hook lấy danh sách sản phẩm với bộ lọc
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const { data } = await api.get(`/products?${params}`);
      return data.data;
    },
    staleTime: 60_000,
  });
}

// Hook lấy chi tiết sản phẩm
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data.data; },
    enabled: !!id,
  });
}

// Hook duyệt sản phẩm (Admin)
export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/products/${id}/approve`); return data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// Hook từ chối sản phẩm (Admin)
export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/products/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
