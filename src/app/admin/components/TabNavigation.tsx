'use client';

import { useRouter, usePathname } from 'next/navigation';

export interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function TabNavigation({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  const getActiveTabFromPath = () => {
    if (pathname === '/admin') return 'smart-uniform';
    const pathParts = pathname.split('/');
    return pathParts[pathParts.length - 1] || 'smart-uniform';
  };

  const activeTab = controlledActiveTab ?? getActiveTabFromPath();

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId);

    // Navigate to the corresponding page
    if (tabId === 'smart-uniform') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tabId}`);
    }
  };

  return (
    <div className="bg-white shadow mb-6">
      <nav className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
