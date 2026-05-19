import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskColor(level: string) {
  const map: Record<string, string> = {
    SAFE: 'text-green-400',
    LOW_RISK: 'text-yellow-400',
    CAUTION: 'text-orange-400',
    LIKELY_SPAM: 'text-red-400',
    HIGH_RISK: 'text-red-600',
    UNKNOWN: 'text-gray-400',
  };
  return map[level] ?? 'text-gray-400';
}

export function riskBadgeColor(level: string) {
  const map: Record<string, string> = {
    SAFE: 'bg-green-500/20 text-green-400 border-green-500/30',
    LOW_RISK: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CAUTION: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    LIKELY_SPAM: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH_RISK: 'bg-red-700/20 text-red-500 border-red-700/30',
    UNKNOWN: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return map[level] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function statusBadgeColor(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    ACTIVE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    BANNED: 'bg-red-700/20 text-red-500 border-red-700/30',
  };
  return map[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
