import React from 'react';
import { LayoutDashboard, Gift, Share2, Newspaper, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'benefits', label: 'Clube', icon: Gift },
    { id: 'social-hub', label: 'Social', icon: Share2 },
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'membership', label: 'Cartão', icon: CreditCard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-panel h-20 flex items-center justify-around px-4 md:hidden z-50 border-t border-[var(--border-color)] transition-colors duration-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "nav-button",
            activeTab === tab.id ? "active" : ""
          )}
        >
          <tab.icon className="w-6 h-6" />
          <span className="text-[9px] tracking-tight">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="bubble"
              className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
