import { useState } from 'react';
import { Sidebar, type Page } from '@/components/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { PostsPage } from '@/pages/PostsPage';
import { AudiencePage } from '@/pages/AudiencePage';
import { AccountsPage } from '@/pages/AccountsPage';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'posts' && <PostsPage />}
          {page === 'audience' && <AudiencePage />}
          {page === 'accounts' && <AccountsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
