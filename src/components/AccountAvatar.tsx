import type { SocialAccount } from '@/types';
import { platformConfig } from '@/lib/platforms';
import { formatNumber } from '@/lib/format';
import { BadgeCheck } from 'lucide-react';

export function AccountAvatar({ account, size = 40 }: { account: SocialAccount; size?: number }) {
  const config = platformConfig[account.platform];

  if (account.avatar_url) {
    return (
      <img
        src={account.avatar_url}
        alt={account.display_name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: config.color, fontSize: size * 0.35 }}
    >
      {account.display_name.charAt(0)}
    </div>
  );
}

export function AccountCard({ account, onClick, selected }: { account: SocialAccount; onClick?: () => void; selected?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left ${
        selected ? 'border-sky-400 bg-sky-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <AccountAvatar account={account} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-900 text-sm truncate">{account.display_name}</span>
          {account.verified && <BadgeCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />}
        </div>
        <span className="text-xs text-gray-500">{account.handle}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatNumber(account.followers)}</p>
        <p className="text-[10px] text-gray-400">followers</p>
      </div>
    </button>
  );
}
