import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('admin_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function adminLogin(phoneNumber: string, otp: string) {
  const { data } = await api.post('/auth/verify-otp', { phoneNumber, otp });
  return data;
}

export async function getDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function getNumbers(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/numbers', { params });
  return data;
}

export async function updateNumber(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/admin/numbers/${id}`, payload);
  return data;
}

export async function getReports(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/reports', { params });
  return data;
}

export async function reviewReport(id: string, action: 'approve' | 'reject', notes?: string) {
  const { data } = await api.post(`/admin/reports/${id}/${action}`, notes ? { notes } : {});
  return data;
}

export async function getBusinessClaims(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/business/pending', { params });
  return data;
}

export async function reviewBusinessClaim(id: string, action: 'approve' | 'reject') {
  const { data } = await api.post(`/admin/business/${id}/${action}`);
  return data;
}

export async function getDisputes(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/disputes', { params });
  return data;
}

export async function reviewDispute(id: string, action: 'approve' | 'reject', notes?: string) {
  const { data } = await api.post(`/admin/disputes/${id}/${action}`, notes ? { notes } : {});
  return data;
}

export async function getUsers(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/users', { params });
  return data;
}

export async function updateUser(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data;
}

export async function getAuditLogs(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/audit-logs', { params });
  return data;
}

export async function getAnalytics() {
  const { data } = await api.get('/admin/analytics');
  return data;
}

export async function getWaitlist(params?: Record<string, string | number>) {
  const { data } = await api.get('/admin/waitlist', { params });
  return data;
}
