import { useMemo, useState } from 'react';
import { Plus, BadgeCheck, TrendingUp, Heart, Edit3, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/Sidebar';
import { AccountAvatar } from '@/components/AccountAvatar';
import { PlatformBadge } from '@/components/PlatformBadge';
import { BarChart } from '@/components/Charts';
import { useAccounts, useTimeline } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { formatNumber, formatPercent, formatDate } from '@/lib/format';
import { platformConfig } from '@/lib/platforms';
import type { Platform, SocialAccount } from '@/types';

const platformList: Platform[] = ['Instagram', 'Twitter', 'TikTok', 'YouTube', 'LinkedIn'];

export function AccountsPage() {
  const { accounts, loading } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ platform: 'Instagram' as Platform, handle: '', display_name: '', followers: '', engagement_rate: '' });
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = accounts.find(a => a.id === selectedId);
  const { timeline } = useTimeline(selectedId);

  const followerTrend = useMemo(() => {
    return timeline.map(t => ({ label: formatDate(t.date), value: t.followers }));
  }, [timeline]);

  const engagementTrend = useMemo(() => {
    return timeline.map(t => ({ label: formatDate(t.date), value: t.engagement_rate }));
  }, [timeline]);

  const handleAdd = async () => {
    setError('');
    if (!form.handle || !form.display_name) {
      setError('Handle and display name are required');
      return;
    }
    const { data, error: insertError } = await supabase.from('social_accounts').insert({
      platform: form.platform,
      handle: form.handle,
      display_name: form.display_name,
      followers: parseInt(form.followers) || 0,
      engagement_rate: parseFloat(form.engagement_rate) || 0,
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) {
      setShowAdd(false);
      setForm({ platform: 'Instagram', handle: '', display_name: '', followers: '', engagement_rate: '' });
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('social_accounts').delete().eq('id', id);
    if (selectedId === id) setSelectedId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Connected Accounts" subtitle="Manage your social media profiles">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </PageHeader>

      {/* Account cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => {
          const config = platformConfig[account.platform];
          return (
            <div
              key={account.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedId(account.id === selectedId ? null : account.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AccountAvatar account={account} size={48} />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900 text-sm">{account.display_name}</span>
                      {account.verified && <BadgeCheck className="w-4 h-4 text-sky-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{account.handle}</p>
                  </div>
                </div>
                <PlatformBadge platform={account.platform} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-gray-50 rounded-xl py-2">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(account.followers)}</p>
                  <p className="text-[10px] text-gray-400">Followers</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl py-2">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(account.posts_count)}</p>
                  <p className="text-[10px] text-gray-400">Posts</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl py-2">
                  <p className="text-sm font-bold" style={{ color: config.color }}>{formatPercent(account.engagement_rate, 2)}</p>
                  <p className="text-[10px] text-gray-400">Engagement</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <AccountAvatar account={selected} size={56} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">{selected.display_name}</h3>
                {selected.verified && <BadgeCheck className="w-5 h-5 text-sky-500" />}
                <PlatformBadge platform={selected.platform} size="sm" />
              </div>
              <p className="text-sm text-gray-500">{selected.handle}</p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Follower Growth (30 days)</h4>
              <BarChart data={followerTrend} height={180} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Engagement Rate Trend</h4>
              <BarChart data={engagementTrend.map(d => ({ ...d, color: '#10b981' }))} height={180} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-500">Total Followers</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(selected.followers)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Following</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(selected.following)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Posts</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(selected.posts_count)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Engagement Rate</p>
              <p className="text-lg font-bold text-gray-900">{formatPercent(selected.engagement_rate, 2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add account modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Add New Account</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platformList.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, platform: p }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.platform === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Handle</label>
                <input
                  value={form.handle}
                  onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
                  placeholder="@username"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Display Name</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Brand Name"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Followers</label>
                  <input
                    value={form.followers}
                    onChange={e => setForm(f => ({ ...f, followers: e.target.value }))}
                    placeholder="0"
                    type="number"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Engagement %</label>
                  <input
                    value={form.engagement_rate}
                    onChange={e => setForm(f => ({ ...f, engagement_rate: e.target.value }))}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-medium text-sm hover:bg-sky-700 transition-colors"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
