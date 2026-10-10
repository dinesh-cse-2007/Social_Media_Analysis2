import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp, Smile, Meh, Frown } from 'lucide-react';
import { PageHeader } from '@/components/Sidebar';
import { BarChart, DonutChart } from '@/components/Charts';
import { AccountAvatar } from '@/components/AccountAvatar';
import { PlatformBadge } from '@/components/PlatformBadge';
import { useAccounts, useAllPosts } from '@/hooks/useData';
import { formatNumber, formatRelativeTime } from '@/lib/format';
import type { SocialPost } from '@/types';

const sentimentConfig = {
  positive: { label: 'Positive', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Smile },
  neutral: { label: 'Neutral', color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-500', icon: Meh },
  negative: { label: 'Negative', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-500', icon: Frown },
};

export function PostsPage() {
  const { accounts } = useAccounts();
  const { posts, loading } = useAllPosts();
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'engagement' | 'recent' | 'reach'>('engagement');

  const enrichedPosts = useMemo(() => {
    return posts.map(p => {
      const account = accounts.find(a => a.id === p.account_id);
      return { ...p, account };
    });
  }, [posts, accounts]);

  const filteredPosts = useMemo(() => {
    let result = enrichedPosts;
    if (filterSentiment !== 'all') result = result.filter(p => p.sentiment === filterSentiment);
    if (filterAccount !== 'all') result = result.filter(p => p.account_id === filterAccount);
    result = [...result].sort((a, b) => {
      if (sortBy === 'engagement') return (b.likes + b.shares + b.saves) - (a.likes + a.shares + a.saves);
      if (sortBy === 'reach') return b.reach - a.reach;
      return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
    });
    return result;
  }, [enrichedPosts, filterSentiment, filterAccount, sortBy]);

  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    enrichedPosts.forEach(p => counts[p.sentiment]++);
    return [
      { label: 'Positive', value: counts.positive, color: '#10b981' },
      { label: 'Neutral', value: counts.neutral, color: '#94a3b8' },
      { label: 'Negative', value: counts.negative, color: '#ef4444' },
    ];
  }, [enrichedPosts]);

  const hashtagAnalysis = useMemo(() => {
    const tagCounts = new Map<string, number>();
    enrichedPosts.forEach(p => {
      p.hashtags.forEach(tag => {
        const clean = tag.replace('#', '');
        tagCounts.set(clean, (tagCounts.get(clean) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .map(([label, value]) => ({ label, value, color: '#0ea5e9' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [enrichedPosts]);

  const avgSentimentScore = useMemo(() => {
    if (!enrichedPosts.length) return 0;
    return enrichedPosts.reduce((s, p) => s + p.sentiment_score, 0) / enrichedPosts.length;
  }, [enrichedPosts]);

  const topPost = useMemo(() => {
    if (!enrichedPosts.length) return null;
    return [...enrichedPosts].sort((a, b) => (b.likes + b.shares + b.saves) - (a.likes + a.shares + a.saves))[0];
  }, [enrichedPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Posts & Sentiment Analysis" subtitle="Deep dive into content performance and audience sentiment" />

      {/* Sentiment overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Sentiment Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Across all posts</p>
          <DonutChart data={sentimentData} size={130} thickness={20} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Avg. Sentiment Score</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Range: -1.0 to +1.0</p>
          <div className="flex flex-col gap-4">
            <div>
              <p className={`text-3xl font-bold ${avgSentimentScore > 0.3 ? 'text-emerald-600' : avgSentimentScore < -0.1 ? 'text-red-500' : 'text-slate-500'}`}>
                {avgSentimentScore > 0 ? '+' : ''}{avgSentimentScore.toFixed(2)}
              </p>
              <div className="mt-2 h-2 bg-gradient-to-r from-red-400 via-slate-300 to-emerald-400 rounded-full relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-700 rounded-full"
                  style={{ left: `${((avgSentimentScore + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {avgSentimentScore > 0.3 ? 'Overall positive audience reaction' : avgSentimentScore < -0.1 ? 'Audience reaction skews negative' : 'Mixed audience reaction'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Top Hashtags</h3>
          <p className="text-xs text-gray-400 mb-4">Most frequently used across all posts</p>
          {hashtagAnalysis.length > 0 ? (
            <BarChart data={hashtagAnalysis} height={180} />
          ) : (
            <p className="text-sm text-gray-400">No hashtags found</p>
          )}
        </div>
      </div>

      {/* Best performing post */}
      {topPost && topPost.account && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-gray-900">1</div>
            <h3 className="font-semibold">Best Performing Post</h3>
          </div>
          <div className="flex items-start gap-4">
            <AccountAvatar account={topPost.account} size={44} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{topPost.account.display_name}</span>
                <PlatformBadge platform={topPost.account.platform} size="sm" />
              </div>
              <p className="text-sm text-gray-200 mb-3">{topPost.caption}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {topPost.hashtags.map(tag => (
                  <span key={tag} className="text-xs text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-400" /> {formatNumber(topPost.likes)}</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-sky-400" /> {formatNumber(topPost.comments)}</span>
                <span className="flex items-center gap-1.5"><Share2 className="w-4 h-4 text-amber-400" /> {formatNumber(topPost.shares)}</span>
                <span className="flex items-center gap-1.5"><Bookmark className="w-4 h-4 text-emerald-400" /> {formatNumber(topPost.saves)}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-gray-400" /> {formatNumber(topPost.impressions)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Sentiment:</span>
          <div className="flex gap-1">
            {['all', 'positive', 'neutral', 'negative'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSentiment(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filterSentiment === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.display_name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="engagement">Sort: Engagement</option>
            <option value="recent">Sort: Most Recent</option>
            <option value="reach">Sort: Reach</option>
          </select>
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.map((post) => {
          const sc = sentimentConfig[post.sentiment];
          const SentIcon = sc.icon;
          if (!post.account) return null;
          return (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <AccountAvatar account={post.account} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">{post.account.display_name}</span>
                    <PlatformBadge platform={post.account.platform} size="sm" />
                  </div>
                  <span className="text-xs text-gray-400">{formatRelativeTime(post.posted_at)}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                  <SentIcon className="w-3 h-3" />
                  <span className="text-[10px] font-semibold capitalize">{post.sentiment}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.caption}</p>
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.slice(0, 5).map(tag => (
                    <span key={tag} className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-gray-50">
                {[
                  { icon: Heart, value: post.likes, color: 'text-red-500' },
                  { icon: MessageCircle, value: post.comments, color: 'text-sky-500' },
                  { icon: Share2, value: post.shares, color: 'text-amber-500' },
                  { icon: Bookmark, value: post.saves, color: 'text-emerald-500' },
                  { icon: Eye, value: post.impressions, color: 'text-gray-400' },
                ].map(({ icon: Icon, value, color }, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[11px] font-semibold text-gray-700">{formatNumber(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No posts match your filters</p>
        </div>
      )}
    </div>
  );
}
