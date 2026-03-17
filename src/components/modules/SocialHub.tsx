import React from 'react';
import { Youtube, Instagram, Facebook, ExternalLink, Play, Megaphone, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialHub: React.FC = () => {
  const feeds = [
    {
      title: 'TV SindPetshop',
      description: 'Acompanhe as últimas transmissões e comunicados em vídeo.',
      icon: Youtube,
      color: 'from-red-600 to-red-900',
      action: 'Ver no YouTube',
      url: 'https://www.youtube.com/@TV_SindPETSHOP',
      highlights: [
        { id: 1, title: 'Assembleia Geral 2024', duration: '12:45' },
        { id: 2, title: 'Dúvidas sobre o Vale Refeição', duration: '08:20' }
      ]
    },
    {
      title: 'Instagram oficial',
      description: 'Notícias rápidas, stories e bastidores do sindicato.',
      icon: Instagram,
      color: 'from-purple-600 to-pink-600',
      action: 'Seguir no Instagram',
      url: 'https://www.instagram.com/sindpetshop_sp/',
      highlights: []
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Social Hub</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-2 font-medium italic mb-8">Conectando você às redes oficiais do <span className="text-primary">Sindpetshop-SP</span>.</p>
      </header>

      {/* Featured Video Section */}
      <section className="relative aspect-video w-full glass-card overflow-hidden group border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop" 
          alt="TV SindPetshop" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest w-fit mb-6 shadow-xl shadow-red-600/20">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> AO VIVO / DESTAQUE
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] tracking-tighter mb-4 max-w-2xl leading-[0.9]">
            Acompanhe a TV SindPetshop
          </h2>
          <p className="text-[var(--text-main)] opacity-60 font-medium text-lg max-w-md mb-8">
            Fique por dentro das pautas principais da nossa categoria através de transmissões oficiais.
          </p>
          <button 
            onClick={() => window.open('https://www.youtube.com/@TV_SindPETSHOP', '_blank')}
            className="flex items-center gap-4 bg-white text-black font-black py-4 px-8 rounded-2xl w-fit hover:scale-105 transition-all shadow-2xl"
          >
            <Play className="fill-current w-5 h-5" /> ASSISTIR AGORA
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {feeds.map((feed, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-10 bg-gradient-to-br ${feed.color} border-white/5 relative overflow-hidden group`}
          >
            {/* Background elements */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <header className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl">
                  <feed.icon className="w-8 h-8 text-[var(--text-main)] shadow-2xl" />
                </div>
                <button 
                  onClick={() => window.open(feed.url, '_blank')}
                  className="p-3 bg-white/5 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <ExternalLink className="w-5 h-5 text-[var(--text-main)] opacity-40" />
                </button>
              </header>

              <h3 className="text-3xl font-black text-[var(--text-main)] mb-2 tracking-tighter">{feed.title}</h3>
              <p className="text-[var(--text-main)] opacity-60 font-medium mb-10 leading-relaxed italic">{feed.description}</p>

              {feed.highlights.length > 0 && (
                <div className="space-y-3 mb-10">
                  <p className="text-[10px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest mb-4">Vídeos Recentes</p>
                  {feed.highlights.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        <span className="text-sm text-[var(--text-main)] font-bold truncate max-w-[200px]">{h.title}</span>
                      </div>
                      <span className="text-[10px] font-black text-[var(--text-main)] opacity-20">{h.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => window.open(feed.url, '_blank')}
                className="mt-auto w-full bg-white/10 border border-white/10 text-[var(--text-main)] font-black py-4 rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs"
              >
                {feed.action}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SocialHub;
