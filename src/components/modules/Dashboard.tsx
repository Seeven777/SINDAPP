import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Announcement, NewsItem } from '../../types';
import { ArrowRight, Bell, Calculator, ChevronRight, FileText, Gift, Info, Phone, Scale, Shield, UserPlus, GraduationCap } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { motion } from 'framer-motion';
import { requestNotificationPermission } from '../../services/notificationService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  const isActiveMember = profile?.status === 'active';

  const defaultNews = [
    {
      id: 'news-1',
      title: 'Piso Salarial e Jornada de Trabalho - 2024/2025',
      description: 'Confira as tabelas salariais atualizadas para clínicas, pet shops, comércio e hospitais veterinários.',
      category: 'Artigo',
      images: ['https://www.sindpetshop.org.br/Assets/img/logo-sindpetshop.png'],
      publishedAt: new Date('2024-01-10').toISOString(),
      externalLink: 'https://sindpetshop.org.br/Home/Artigo/piso-salarial-e-jornada-setor-pet-sp'
    },
    {
      id: 'news-2',
      title: 'Homologação e Rescisão Contratual - Orientações',
      description: 'Como funciona o processo de rescisão e quais os direitos garantidos pela CCT da categoria.',
      category: 'Aviso',
      images: ['https://www.sindpetshop.org.br/Assets/img/logo-sindpetshop.png'],
      publishedAt: new Date('2024-02-15').toISOString(),
      externalLink: 'https://sindpetshop.org.br/noticia'
    }
  ];

  useEffect(() => {
    const qAnn = query(collection(db, 'announcements'), orderBy('publishedAt', 'desc'), limit(3));
    const unsubscribeAnn = onSnapshot(qAnn, (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });

    const qNews = query(collection(db, 'news'), orderBy('publishedAt', 'desc'), limit(3));
    const unsubscribeNews = onSnapshot(qNews, (snap) => {
      const nList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setNews(nList.length > 0 ? nList : defaultNews);
    });

    return () => {
      unsubscribeAnn();
      unsubscribeNews();
    };
  }, []);

  const handleNotificationRequest = async () => {
    const token = await requestNotificationPermission(profile?.uid);
    if (token) {
      // In a real app, this would be updated in Firestore automatically
      console.log('Notificações ativadas com sucesso!');
    }
  };

  const quickActions = [
    { label: 'JURÍDICO', icon: Shield, url: 'https://www.sindpetshop.org.br/Home/Contato' },
    { icon: FileText, label: 'Convenção', color: 'bg-blue-500', url: 'https://www.sindpetshop.org.br/CCT' },
    { icon: GraduationCap, label: 'Artigos', color: 'bg-green-500', url: 'https://sindpetshop.org.br/artigo' },
    { label: 'CONTATO', icon: Phone, url: 'https://www.sindpetshop.org.br/Home/Contato' },
  ];

  const handleActionClick = (url: string, label: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="glass-card p-10 md:p-16 relative overflow-hidden group border-white/10">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl font-black text-[var(--text-main)] mb-6 tracking-tighter leading-[0.9]">
              Olá, <span className="text-primary">{profile?.name?.split(' ')[0] || 'Associado'}</span>!
            </h1>
            <p className="text-[var(--text-main)] opacity-60 text-xl max-w-lg leading-relaxed font-medium">
              Bem-vindo ao <span className="text-[var(--text-main)] font-bold tracking-tight">Sindapp</span>. Sua central digital de benefícios e direitos trabalhistas.
            </p>
            
            {Notification.permission !== 'granted' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNotificationRequest}
                className="mt-6 flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-xs font-black text-[var(--text-main)] opacity-60 hover:text-primary hover:border-primary/50 transition-all uppercase tracking-widest"
              >
                <Bell className="w-4 h-4" />
                Ativar Notificações
              </motion.button>
            )}
          </motion.div>

          <div className="grid grid-cols-4 gap-6 mt-16 max-w-xl">
            {quickActions.map((action, idx) => (
              <motion.button 
                key={action.label} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                onClick={() => handleActionClick(action.url, action.label)}
                className="flex flex-col items-center gap-4 group/btn"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:border-primary group-hover/btn:shadow-[0_0_20px_rgba(242,125,38,0.4)] transition-all duration-500">
                  <action.icon className="w-8 h-8 text-[var(--text-main)] opacity-80 group-hover/btn:text-white group-hover/btn:scale-110 transition-all" />
                </div>
                <span className="text-[10px] font-black text-[var(--text-main)] opacity-30 tracking-[0.2em] uppercase group-hover/btn:text-primary transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Decorative background glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-700"
        ></motion.div>
      </section>

      {/* Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {!isActiveMember && (
          <button 
            onClick={() => window.open('https://www.sindpetshop.org.br/Funcionario', '_blank')}
            className="glass-card p-10 flex items-center gap-8 text-left hover:scale-[1.02] transition-all duration-500 group border-white/10"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-all duration-500">
              <UserPlus className="w-10 h-10 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-1 tracking-tight">Associe-se</h3>
              <p className="text-[10px] text-[var(--text-main)] opacity-40 font-black uppercase tracking-[0.2em]">FORTALEÇA SUA CATEGORIA</p>
            </div>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('calculators')}
          className={cn(
            "glass-card p-10 flex items-center gap-8 text-left hover:scale-[1.02] transition-all duration-500 group border-white/10",
            isActiveMember ? "md:col-span-2" : ""
          )}
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:bg-emerald-500 transition-all duration-500">
            <Calculator className="w-10 h-10 text-emerald-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[var(--text-main)] mb-1 tracking-tight">Simulador de Benefícios</h3>
            <p className="text-[10px] text-[var(--text-main)] opacity-40 font-black uppercase tracking-[0.2em]">CÁLCULO DE FÉRIAS, 13º E RESCISÃO</p>
          </div>
        </button>
      </div>

      {/* News Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Últimas Notícias</h2>
          <button 
            onClick={() => setActiveTab('news')}
            className="flex items-center gap-1 text-primary font-bold text-sm hover:underline"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.length > 0 ? news.map(item => (
            <div 
              key={item.id} 
              onClick={() => item.externalLink ? window.open(item.externalLink, '_blank') : setActiveTab('news')}
              className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all flex flex-col"
            >
              {item.images?.[0] && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-[var(--text-main)] line-clamp-2 mb-3 group-hover:text-primary transition-colors flex-1">{item.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-[var(--text-main)] opacity-30 font-bold uppercase tracking-widest">
                    {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 glass-card p-12 text-center text-[var(--text-main)] opacity-20 font-medium">
              Nenhuma notícia disponível no momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
