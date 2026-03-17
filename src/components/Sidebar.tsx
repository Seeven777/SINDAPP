import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Gift, 
  MessageSquare, 
  Share2, 
  Settings, 
  LogOut, 
  BellRing, 
  ShieldCheck,
  UserCircle,
  Users,
  Megaphone,
  Newspaper,
  CreditCard
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'benefits', label: 'Benefícios', icon: Gift, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'news', label: 'Comunicação', icon: Newspaper, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'social-hub', label: 'Social Hub', icon: Share2, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'community', label: 'Comunidade', icon: Users, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'calculators', label: 'Calculadoras', icon: LayoutDashboard, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'membership', label: 'Carteirinha', icon: CreditCard, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'diretoria', label: 'Agenda Diretoria', icon: Calendar, roles: ['diretoria', 'admin', 'gestao'] },
    { id: 'denuncia', label: 'Denúncia', icon: ShieldCheck, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
    { id: 'admin', label: 'Administração', icon: ShieldCheck, roles: ['admin', 'gestao'] },
    { id: 'profile', label: 'Meu Perfil', icon: Settings, roles: ['associado', 'admin', 'gestao', 'diretoria'] },
  ];

  const isBootstrapAdmin = profile?.email === 'gustavo13470@gmail.com';

  const filteredItems = menuItems.filter(item => 
    profile && (item.roles.includes(profile.role) || (isBootstrapAdmin && item.id === 'admin'))
  );

  return (
    <aside className="w-80 bg-[var(--bg-main)] border-r border-white/5 flex flex-col h-full hidden lg:flex relative z-20">
      <div className="p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.png" alt="Sindpetshop Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tighter leading-none">
            SIND<span className="text-primary">APP</span>
          </h1>
        </div>
        <p className="text-[10px] text-[var(--text-main)] opacity-30 font-black uppercase tracking-[0.3em] mt-1 ml-[52px]">Sindicato SP</p>
      </div>

      <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto pt-4">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-black transition-all duration-500 group/nav",
              activeTab === item.id 
                ? "bg-primary text-white shadow-xl shadow-primary/20" 
                : "text-[var(--text-main)] opacity-30 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-6 h-6 transition-all duration-500", activeTab === item.id ? "text-[var(--text-main)]" : "text-[var(--text-main)] opacity-20 group-hover/nav:text-primary group-hover/nav:scale-110")} />
            <span className="tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
