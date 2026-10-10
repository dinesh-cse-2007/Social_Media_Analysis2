import type { Platform } from '@/types';
import { platformConfig } from '@/lib/platforms';

export function PlatformBadge({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) {
  const config = platformConfig[platform];
  const sizes = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (platform === 'TikTok') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${config.text} ${sizes}`}>
        {platform}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${config.text} ${sizes}`}>
      {platform}
    </span>
  );
}

export function PlatformDot({ platform }: { platform: Platform }) {
  const config = platformConfig[platform];
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />;
}
