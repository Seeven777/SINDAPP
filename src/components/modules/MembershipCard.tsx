import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { QrCode, ShieldCheck, CreditCard, ChevronRight, User, Hash, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const MembershipCard: React.FC = () => {
  const { profile } = useAuth();
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Carteirinha Digital</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-2 font-medium">Identificação oficial do associado Sindpetshop-SP.</p>
      </header>

      <div className="flex flex-col items-center justify-center pt-8">
        {/* ID Card Container */}
        <div 
          className="relative w-full max-w-[400px] aspect-[1.586/1] cursor-pointer perspective-1000 group"
          onClick={() => setFlipped(!flipped)}
        >
          <motion.div
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full premium-gradient rounded-[2rem] p-8 shadow-2xl shadow-primary/30 border border-white/20 flex flex-col justify-between overflow-hidden relative">
                {/* Decor elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 blur-2xl rounded-full -ml-10 -mb-10"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="" className="w-10 h-10 object-contain brightness-0 invert" />
                    <div className="flex flex-col">
                      <span className="text-[var(--text-main)] font-black text-lg tracking-tighter leading-none">SINDAPP</span>
                      <span className="text-[var(--text-main)] opacity-60 text-[8px] font-bold uppercase tracking-widest">Sindicato Pet SP</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest">ASSOCIADO</span>
                  </div>
                </div>

                <div className="relative z-10 flex gap-6 mt-8">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {profile?.photoUrl ? (
                      <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-[var(--text-main)] opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest mb-1">Nome Completo</p>
                    <p className="text-lg font-black text-[var(--text-main)] truncate tracking-tight">{profile?.name || '...'}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-[7px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest mb-0.5">CPF</p>
                        <p className="text-[11px] font-bold text-[var(--text-main)] tracking-widest">***.***.***-**</p>
                      </div>
                      <div>
                        <p className="text-[7px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest mb-0.5">Status</p>
                        <p className="text-[11px] font-black text-emerald-400">ATIVO</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-end mt-8 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--text-main)] opacity-60" />
                    <span className="text-[10px] font-bold text-[var(--text-main)] opacity-60 tracking-tight">Validado Digitalmente</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[7px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest">Matrícula</p>
                    <p className="text-xs font-black text-[var(--text-main)] tracking-widest">#{profile?.uid?.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0"
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
              }}
            >
              <div className="w-full h-full bg-[#1a1a1a] rounded-[2rem] p-8 shadow-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-12 bg-black/40"></div>
                
                <div className="bg-white p-4 rounded-3xl shadow-2xl relative z-10">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${profile?.uid || 'anonymous'}`} 
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded-3xl">
                    <p className="text-[8px] text-black font-black text-center px-4">ID: {profile?.uid?.substring(0, 8)}</p>
                  </div>
                </div>
                
                <p className="mt-6 text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] relative z-10 text-center px-8">
                  Aponte a câmera para validar a filiação profissional
                </p>

                <div className="absolute bottom-8 flex flex-col items-center opacity-20">
                  <img src="/logo.png" alt="" className="w-12 h-12 object-contain grayscale" />
                  <p className="text-[7px] font-black text-[var(--text-main)] tracking-widest mt-2 uppercase">Sindpetshop-SP</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-[var(--text-main)] opacity-20 text-[10px] font-black uppercase tracking-[0.2em] mt-8 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" /> Toque no cartão para girar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-12">
          <div className="glass-card p-6 border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-widest">Código de Barras Social</p>
              <p className="text-sm font-bold text-[var(--text-main)] uppercase mt-1">SPS-9823-X1</p>
            </div>
          </div>
          <div className="glass-card p-6 border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-widest">Expiração da Via</p>
              <p className="text-sm font-bold text-[var(--text-main)] uppercase mt-1">31/12/2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
