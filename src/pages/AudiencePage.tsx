import { useMemo, useState, useEffect } from 'react';
import { Users, MapPin, Globe, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/Sidebar';
import { HBarChart, BarChart, DonutChart } from '@/components/Charts';
import { AccountAvatar } from '@/components/AccountAvatar';
import { useAccounts, useDemographics, useLocations } from '@/hooks/useData';
import { formatNumber, formatPercent } from '@/lib/format';
import type { SocialAccount } from '@/types';

const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
const genderColors: Record<string, string> = { male: '#0ea5e9', female: '#ec4899', other: '#8b5cf6' };

export function AudiencePage() {
  const { accounts } = useAccounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && accounts.length > 0) setSelectedId(accounts[0].id);
  }, [accounts, selectedId]);

  const selectedAccount = accounts.find(a => a.id === selectedId) as SocialAccount | undefined;
  const { demographics } = useDemographics(selectedId);
  const { locations } = useLocations(selectedId);

  const ageData = useMemo(() => {
    const byAge = new Map<string, number>();
    demographics.forEach(d => {
      byAge.set(d.age_range, (byAge.get(d.age_range) || 0) + d.percentage);
    });
    return ageOrder
      .filter(age => byAge.has(age))
      .map(age => ({ label: age, value: byAge.get(age) || 0, color: '#0ea5e9' }));
  }, [demographics]);

  const genderData = useMemo(() => {
    const byGender = new Map<string, number>();
    demographics.forEach(d => {
      byGender.set(d.gender, (byGender.get(d.gender) || 0) + d.percentage);
    });
    return Array.from(byGender.entries()).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      color: genderColors[label] || '#94a3b8',
    }));
  }, [demographics]);



  const locationData = useMemo(() => {
    return locations.slice(0, 8).map(l => ({
      label: l.city ? `${l.city}` : l.country,
      value: l.percentage,
      color: '#10b981',
    }));
  }, [locations]);

  const countryData = useMemo(() => {
    const byCountry = new Map<string, number>();
    locations.forEach(l => {
      byCountry.set(l.country, (byCountry.get(l.country) || 0) + l.percentage);
    });
    return Array.from(byCountry.entries())
      .map(([label, value]) => ({ label, value, color: '#8b5cf6' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [locations]);

  const topAgeGroup = ageData.length > 0 ? [...ageData].sort((a, b) => b.value - a.value)[0] : null;
  const topLocation = locations[0];
  const topCountry = countryData[0];

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audience Insights" subtitle="Who is following you and where they come from">
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.platform} - {a.display_name}</option>
          ))}
        </select>
      </PageHeader>

      {/* Account banner */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <AccountAvatar account={selectedAccount} size={56} />
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{selectedAccount.display_name}</h3>
            <p className="text-sm text-gray-500">{selectedAccount.handle} - {selectedAccount.platform}</p>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedAccount.followers)}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatPercent(selectedAccount.engagement_rate, 2)}</p>
              <p className="text-xs text-gray-400">Engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500">Largest Age Group</p>
          <p className="text-xl font-bold text-gray-900">{topAgeGroup?.label || 'N/A'}</p>
          <p className="text-xs text-sky-600 font-medium">{topAgeGroup ? formatPercent(topAgeGroup.value) : ''} of audience</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500">Top City</p>
          <p className="text-xl font-bold text-gray-900">{topLocation?.city || 'N/A'}</p>
          <p className="text-xs text-emerald-600 font-medium">{topLocation ? formatPercent(topLocation.percentage) : ''} of audience</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500">Top Country</p>
          <p className="text-xl font-bold text-gray-900">{topCountry?.label || 'N/A'}</p>
          <p className="text-xs text-violet-600 font-medium">{topCountry ? formatPercent(topCountry.value) : ''} of audience</p>
        </div>
      </div>

      {/* Demographics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Gender Split</h3>
          <p className="text-xs text-gray-400 mb-4">Audience by gender</p>
          <DonutChart data={genderData} size={140} thickness={20} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Age Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Percentage of audience by age range</p>
          {ageData.length > 0 ? (
            <BarChart data={ageData} height={200} />
          ) : (
            <p className="text-sm text-gray-400">No demographic data available</p>
          )}
        </div>
      </div>

      {/* Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Top Cities</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Where your audience is located</p>
          {locationData.length > 0 ? (
            <HBarChart data={locationData} />
          ) : (
            <p className="text-sm text-gray-400">No location data available</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-gray-900">Top Countries</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Geographic distribution by country</p>
          {countryData.length > 0 ? (
            <HBarChart data={countryData} />
          ) : (
            <p className="text-sm text-gray-400">No country data available</p>
          )}
        </div>
      </div>

      {/* Full location table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Complete Location Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs">Country</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs">City</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs">Percentage</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs w-1/3">Share</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 text-gray-700">{loc.country}</td>
                  <td className="py-3 px-3 text-gray-500">{loc.city || '—'}</td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-900">{formatPercent(loc.percentage)}</td>
                  <td className="py-3 px-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: `${loc.percentage * 3}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
