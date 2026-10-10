import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SocialAccount, SocialPost, AudienceDemographic, AudienceLocation, EngagementTimelinePoint } from '@/types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('social_accounts').select('*').order('followers', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAccounts(data as SocialAccount[]);
        setLoading(false);
      });
  }, []);

  return { accounts, loading };
}

export function useAccount(id: string | null) {
  const [account, setAccount] = useState<SocialAccount | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setAccount(null); return; }
    setLoading(true);
    supabase.from('social_accounts').select('*').eq('id', id).maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setAccount(data as SocialAccount);
        else setAccount(null);
        setLoading(false);
      });
  }, [id]);

  return { account, loading };
}

export function usePosts(accountId: string | null) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) { setPosts([]); return; }
    setLoading(true);
    supabase.from('social_posts').select('*').eq('account_id', accountId).order('posted_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPosts(data as SocialPost[]);
        else setPosts([]);
        setLoading(false);
      });
  }, [accountId]);

  return { posts, loading };
}

export function useAllPosts() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('social_posts').select('*, social_accounts!inner(platform, handle, display_name, avatar_url)').order('posted_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPosts(data as unknown as SocialPost[]);
        else setPosts([]);
        setLoading(false);
      });
  }, []);

  return { posts, loading };
}

export function useDemographics(accountId: string | null) {
  const [demographics, setDemographics] = useState<AudienceDemographic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) { setDemographics([]); return; }
    setLoading(true);
    supabase.from('audience_demographics').select('*').eq('account_id', accountId)
      .then(({ data, error }) => {
        if (!error && data) setDemographics(data as AudienceDemographic[]);
        else setDemographics([]);
        setLoading(false);
      });
  }, [accountId]);

  return { demographics, loading };
}

export function useLocations(accountId: string | null) {
  const [locations, setLocations] = useState<AudienceLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) { setLocations([]); return; }
    setLoading(true);
    supabase.from('audience_locations').select('*').eq('account_id', accountId).order('percentage', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setLocations(data as AudienceLocation[]);
        else setLocations([]);
        setLoading(false);
      });
  }, [accountId]);

  return { locations, loading };
}

export function useTimeline(accountId: string | null) {
  const [timeline, setTimeline] = useState<EngagementTimelinePoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) { setTimeline([]); return; }
    setLoading(true);
    supabase.from('engagement_timeline').select('*').eq('account_id', accountId).order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTimeline(data as EngagementTimelinePoint[]);
        else setTimeline([]);
        setLoading(false);
      });
  }, [accountId]);

  return { timeline, loading };
}

export function useAllTimeline() {
  const [timeline, setTimeline] = useState<EngagementTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    supabase.from('engagement_timeline').select('*, social_accounts!inner(platform)').order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTimeline(data as unknown as EngagementTimelinePoint[]);
        else setTimeline([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { timeline, loading, refetch };
}
