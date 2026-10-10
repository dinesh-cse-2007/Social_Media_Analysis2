import type { Platform } from '@/types';

export const platformConfig: Record<Platform, { color: string; bg: string; text: string; border: string }> = {
  Instagram: { color: '#E1306C', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  Twitter: { color: '#1DA1F2', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  TikTok: { color: '#000000', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' },
  YouTube: { color: '#FF0000', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  LinkedIn: { color: '#0077B5', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
};
