import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CustomerInbox } from '@/components/domain/CustomerInbox';
import { Dashboard } from '@/components/domain/Dashboard';
import { ActiveLeads } from '@/components/domain/ActiveLeads';
import { AIReviewQueue } from '@/components/domain/AIReviewQueue';
import { Settings } from '@/components/domain/Settings';
import { mockCustomers } from '@/data/mockCustomers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbox':
        return <CustomerInbox customers={mockCustomers} />;
      case 'leads':
        return <ActiveLeads />;
      case 'ai-review':
        return <AIReviewQueue />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background">
            <h2 className="text-xl font-semibold text-foreground mb-2">Module Under Construction</h2>
            <p>The {activeTab} view is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="quickmove-theme">
      <div className="flex h-screen w-full bg-background overflow-hidden text-foreground antialiased selection:bg-primary/20">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
      </div>
      <Toaster position="top-right" closeButton richColors theme="system" />
    </ThemeProvider>
  );
}
