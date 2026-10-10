export type Platform = 'Instagram' | 'Twitter' | 'TikTok' | 'YouTube' | 'LinkedIn';

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  followers: number;
  following: number;
  posts_count: number;
  engagement_rate: number;
  verified: boolean;
  created_at: string;
}

export interface SocialPost {
  id: string;
  account_id: string;
  caption: string;
  media_type: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  impressions: number;
  reach: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  hashtags: string[];
  posted_at: string;
}

export interface AudienceDemographic {
  id: string;
  account_id: string;
  age_range: string;
  gender: string;
  percentage: number;
}

export interface AudienceLocation {
  id: string;
  account_id: string;
  country: string;
  city: string | null;
  percentage: number;
}

export interface EngagementTimelinePoint {
  id: string;
  account_id: string;
  date: string;
  followers: number;
  new_followers: number;
  engagement_rate: number;
  impressions: number;
  reach: number;
}

export interface PlatformMeta {
  name: Platform;
  color: string;
  bg: string;
  icon: string;
}
