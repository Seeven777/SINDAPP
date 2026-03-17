import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Globe, Clock, ChevronRight, ExternalLink, Search, Filter } from 'lucide-react';

interface SiteAlert {
  id: string;
  title: string;
  date: string;
  category: string;
  url: string;
  isNew?: boolean;
}

const SiteUpdates: React.FC = () => {
  const [alerts, setAlerts] = useState<SiteAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulating fetching from site (in production this would be a real API/Scrapper)
  const defaultAlerts: SiteAlert[] = [
    {
      id: '1',
      title: 'Atualização da CCT 2024/2025 - Novas cláusulas de benefícios',
      date: '2024-03-15',
      category: 'Convenção',
      url: 'https://www.sindpetshop.org.br/Home/CCT',
      isNew: true
    },
    {
      id: '2',
      title: 'Piso Salarial do Setor Pet em São Paulo - Tabela de valores',
      date: '2024-03-10',
      category: 'Salários',
      url: 'https://www.sindpetshop.org.br/Home/Artigo/piso-salarial-e-jornada-setor-pet-sp'
    },
    {
      id: '3',
      title: 'Comunicado: Reajuste nos convênios de saúde para associados',
      date: '2024-03-05',
      category: 'Benefícios',
      url: 'https://www.sindpetshop.org.br/Home/Artigo/assistencia-medica-familiar'
    },
    {
      id: '4',
      title: 'Nova parceria com Magic City: Descontos exclusivos no portal',
      date: '2024-03-01',
      category: 'Parcerias',
      url: 'https://www.sindpetshop.org.br/Home/Artigo/magic-city-parceria'
    }
  ];

  useEffect(() => {
    // Simulating loading
    const timer = setTimeout(() => {
      setAlerts(defaultAlerts);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter flex items-center gap-4">
            Alertas de Atualizações
            <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
              {alerts.length} Notificações
            </span>
          </h1>
          <p className="text-[var(--text-main)] opacity-40 mt-1 font-medium">Fique por dentro das últimas mudanças no portal oficial do Sindicato.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-main)] opacity-20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar alertas..."
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-main)] opacity-40 hover:text-primary transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-8 animate-pulse flex items-center gap-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-white/5 rounded-lg w-3/4"></div>
                <div className="h-3 bg-white/5 rounded-lg w-1/4"></div>
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence>
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => window.open(alert.url, '_blank')}
                className="group relative cursor-pointer"
              >
                <div className="glass-card p-6 flex items-center justify-between hover:border-primary/50 transition-all duration-500 hover:translate-x-2">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${alert.isNew ? 'bg-primary/20 text-primary shadow-primary/10 ring-2 ring-primary/20' : 'bg-white/5 text-white/30'}`}>
                      <BellRing className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{alert.category}</span>
                        {alert.isNew && (
                          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-primary transition-colors line-clamp-1">{alert.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-main)] opacity-30 font-bold uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-main)] opacity-30 font-bold uppercase tracking-widest">
                          <Globe className="w-3 h-3" />
                          sindpetshop.org.br
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Acessar link</span>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="glass-card p-10 bg-gradient-to-br from-primary/5 to-transparent border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Globe className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] mb-2 tracking-tight">Portal de Transparência</h2>
            <p className="text-[var(--text-main)] opacity-40 text-sm max-w-lg mb-0 leading-relaxed italic">
              "Nosso compromisso é manter o trabalhador informado com veracidade e rapidez."
            </p>
          </div>
          <button 
            onClick={() => window.open('https://www.sindpetshop.org.br/', '_blank')}
            className="ml-auto flex items-center gap-3 text-[var(--text-main)] opacity-60 font-bold text-sm hover:text-primary transition-all group"
          >
            Acessar Site Completo <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteUpdates;
