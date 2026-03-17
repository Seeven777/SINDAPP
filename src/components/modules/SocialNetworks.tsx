import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Send, ExternalLink } from 'lucide-react';

const SocialNetworks: React.FC = () => {
  const socialMedias = [
    {
      name: 'Instagram',
      handle: '@sindpetshop',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
      url: 'https://www.instagram.com/sindpetshop/',
      description: 'Acompanhe nosso dia a dia e eventos em tempo real.'
    },
    {
      name: 'Facebook',
      handle: 'Sindpetshop SP',
      icon: Facebook,
      color: 'bg-[#1877F2]',
      url: 'https://www.facebook.com/sindpetshop',
      description: 'Notícias, fotos e interação com a categoria.'
    },
    {
      name: 'YouTube',
      handle: 'TV SindPetshop',
      icon: Youtube,
      color: 'bg-[#FF0000]',
      url: 'https://www.youtube.com/@TV_Sindpetshop',
      description: 'Vídeos informativos, entrevistas e coberturas.'
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      <header>
        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter">Nossas Redes Sociais</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-1 font-medium">Conecte-se com o Sindicato e fique por dentro de tudo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {socialMedias.map((social, idx) => (
          <motion.div
            key={social.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[2.5rem] blur-2xl -z-10"
                 style={{ backgroundColor: social.color.includes('#') ? social.color : '' }}></div>
            
            <a 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-8 flex flex-col h-full hover:border-primary/50 transition-all duration-500 overflow-hidden relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 ${social.color} rounded-2xl flex items-center justify-center text-[var(--text-main)] shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                  <social.icon className="w-8 h-8" />
                </div>
                <ExternalLink className="w-5 h-5 text-[var(--text-main)] opacity-20 group-hover:text-primary transition-colors" />
              </div>
              
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-1">{social.name}</h3>
              <p className="text-primary text-sm font-bold mb-4">{social.handle}</p>
              <p className="text-[var(--text-main)] opacity-40 text-sm leading-relaxed mb-8 flex-1">
                {social.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                Seguir agora <Send className="w-3 h-3" />
              </div>
            </a>
          </motion.div>
        ))}
      </div>

      <section className="glass-card p-10 border-primary/20 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700">
            <Youtube className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Assista à TV SindPetshop</h2>
            <p className="text-[var(--text-main)] opacity-40 text-sm max-w-lg mb-6 leading-relaxed">
              Conteúdo exclusivo para os trabalhadores do setor pet, clínicas veterinárias e casas agropecuárias.
            </p>
            <button 
              onClick={() => window.open('https://www.youtube.com/@TV_Sindpetshop', '_blank')}
              className="premium-gradient px-8 py-3 rounded-xl text-[var(--text-main)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 mx-auto md:mx-0"
            >
              Abrir Canal <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
      </section>
    </div>
  );
};

export default SocialNetworks;
