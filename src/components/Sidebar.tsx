import { type ReactNode } from 'react';
import { BarChart3, LayoutDashboard, MessageSquare, Users, UserCircle, Sparkles } from 'lucide-react';

export type Page = 'dashboard' | 'posts' | 'audience' | 'accounts';

interface SidebarProps {
  current: Page;
  onNavigate: (p: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'posts', label: 'Posts & Sentiment', icon: MessageSquare },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'accounts', label: 'Accounts', icon: UserCircle },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">Pulse</h1>
              <p className="text-[10px] text-gray-400">Social Analytics</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                  active ? 'bg-sky-50 text-sky-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-sky-600' : 'text-gray-400'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white">
          <BarChart3 className="w-5 h-5 mb-2 text-sky-300" />
          <p className="text-xs font-semibold leading-tight mb-1">Pro Insights</p>
          <p className="text-[10px] text-gray-300 leading-relaxed">Advanced sentiment analysis and predictive trends across all platforms.</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Pulse</span>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${active ? 'text-sky-600' : 'text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
