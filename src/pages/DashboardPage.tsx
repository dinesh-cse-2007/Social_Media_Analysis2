import { useMemo, useState } from 'react';
import { Users, Heart, Eye, TrendingUp, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { AreaChart, BarChart, DonutChart } from '@/components/Charts';
import { AccountAvatar } from '@/components/AccountAvatar';
import { PageHeader } from '@/components/Sidebar';
import { useAccounts, useAllPosts, useAllTimeline } from '@/hooks/useData';
import { formatNumber, formatPercent, formatDate } from '@/lib/format';
import { platformConfig } from '@/lib/platforms';
import type { Platform } from '@/types';

export function DashboardPage() {
  const { accounts } = useAccounts();
  const { posts } = useAllPosts();
  const { timeline } = useAllTimeline();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);
    const totalPosts = accounts.reduce((s, a) => s + a.posts_count, 0);
    const avgEngagement = accounts.length ? accounts.reduce((s, a) => s + a.engagement_rate, 0) / accounts.length : 0;
    const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
    const totalComments = posts.reduce((s, p) => s + p.comments, 0);
    const totalShares = posts.reduce((s, p) => s + p.shares, 0);
    const totalImpressions = posts.reduce((s, p) => s + p.impressions, 0);
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const totalSaves = posts.reduce((s, p) => s + p.saves, 0);
    return { totalFollowers, totalPosts, avgEngagement, totalLikes, totalComments, totalShares, totalImpressions, totalReach, totalSaves };
  }, [accounts, posts]);

  const followerTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    timeline.forEach(t => {
      const key = formatDate(t.date);
      byDate.set(key, (byDate.get(key) || 0) + t.followers);
    });
    return Array.from(byDate.entries()).map(([label, value]) => ({ label, value }));
  }, [timeline]);

  const impressionsTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    timeline.forEach(t => {
      const key = formatDate(t.date);
      byDate.set(key, (byDate.get(key) || 0) + t.impressions);
    });
    return Array.from(byDate.entries()).map(([label, value]) => ({ label, value }));
  }, [timeline]);

  const platformDistribution = useMemo(() => {
    return accounts.map(a => ({
      label: a.platform,
      value: a.followers,
      color: platformConfig[a.platform as Platform].color,
    }));
  }, [accounts]);

  const engagementByPlatform = useMemo(() => {
    return accounts.map(a => ({
      label: a.platform.slice(0, 4),
      value: a.engagement_rate,
      color: platformConfig[a.platform as Platform].color,
    }));
  }, [accounts]);

  const topPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.likes + b.shares + b.saves - (a.likes + a.shares + a.saves)).slice(0, 5);
  }, [posts]);

  const filteredAccount = accounts.find(a => a.id === selectedAccount) || accounts[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Overview" subtitle="Cross-platform performance at a glance" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Followers" value={formatNumber(stats.totalFollowers)} change={8.2} icon={<Users className="w-5 h-5" />} color="#0ea5e9" />
        <KPICard label="Avg. Engagement" value={formatPercent(stats.avgEngagement, 2)} change={2.4} icon={<TrendingUp className="w-5 h-5" />} color="#10b981" />
        <KPICard label="Total Posts" value={formatNumber(stats.totalPosts)} change={5.1} icon={<Heart className="w-5 h-5" />} color="#f59e0b" />
        <KPICard label="Total Impressions" value={formatNumber(stats.totalImpressions)} change={12.7} icon={<Eye className="w-5 h-5" />} color="#8b5cf6" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Follower Growth</h3>
              <p className="text-xs text-gray-400">Last 30 days across all platforms</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-sky-600">{formatNumber(stats.totalFollowers)}</p>
              <p className="text-xs text-emerald-600 font-medium">+8.2% vs last month</p>
            </div>
          </div>
          <AreaChart data={followerTrend} height={220} color="#0ea5e9" gradientId="follower-grad" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Followers by Platform</h3>
          <p className="text-xs text-gray-400 mb-6">Distribution across networks</p>
          <DonutChart data={platformDistribution} size={150} thickness={22} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Impressions Over Time</h3>
              <p className="text-xs text-gray-400">Daily impression volume</p>
            </div>
          </div>
          <AreaChart data={impressionsTrend} height={200} color="#8b5cf6" gradientId="impressions-grad" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Engagement Rate</h3>
          <p className="text-xs text-gray-400 mb-6">By platform</p>
          <BarChart data={engagementByPlatform} height={200} />
        </div>
      </div>

      {/* Engagement breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: '#ef4444' },
          { label: 'Total Comments', value: stats.totalComments, icon: MessageCircle, color: '#0ea5e9' },
          { label: 'Total Shares', value: stats.totalShares, icon: Share2, color: '#f59e0b' },
          { label: 'Total Saves', value: stats.totalSaves, icon: Bookmark, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color + '15', color }}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(value)}</p>
          </div>
        ))}
      </div>

      {/* Top performing posts + Account selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {topPosts.map((post, i) => {
              const account = accounts.find(a => a.id === post.account_id);
              if (!account) return null;
              const totalEng = post.likes + post.shares + post.saves;
              return (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-300 w-6 text-center flex-shrink-0">{i + 1}</span>
                  <AccountAvatar account={account} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(post.likes)}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {formatNumber(post.comments)}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {formatNumber(post.shares)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatNumber(totalEng)}</p>
                    <p className="text-[10px] text-gray-400">engagement</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Account Spotlight</h3>
          {filteredAccount && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AccountAvatar account={filteredAccount} size={48} />
                <div>
                  <p className="font-semibold text-gray-900">{filteredAccount.display_name}</p>
                  <p className="text-xs text-gray-500">{filteredAccount.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Followers</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(filteredAccount.followers)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Posts</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(filteredAccount.posts_count)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Engagement</p>
                  <p className="text-lg font-bold text-gray-900">{formatPercent(filteredAccount.engagement_rate, 2)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Following</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(filteredAccount.following)}</p>
                </div>
              </div>
              <select
                value={selectedAccount || ''}
                onChange={e => setSelectedAccount(e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.platform} - {a.display_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
