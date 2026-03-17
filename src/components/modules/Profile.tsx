import React from 'react';
import { useAuth } from '../AuthProvider';
import { auth } from '../../firebase/config';
import { User, Mail, Building2, Phone, Calendar, LogOut, CheckCircle2, Clock, Camera, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [uploading, setUploading] = React.useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.uid) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${profile.uid}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'profiles', profile.uid), {
        photoUrl,
        updatedAt: new Date().toISOString()
      });
      
      alert('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const infoItems = [
    { label: 'E-mail', value: profile?.email, icon: Mail },
    { label: 'Telefone', value: profile?.phone || 'Não informado', icon: Phone },
    { label: 'Empresa / Local', value: profile?.workplace || 'Não informado', icon: Building2 },
    { label: 'Membro desde', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '...', icon: Calendar },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row items-center gap-8 glass-card p-10 border-white/10">
        <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white/5 shadow-2xl relative overflow-hidden group/photo">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-primary" />
          )}
          
          <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-6 h-6 text-[var(--text-main)] mb-1" />
            <span className="text-[8px] font-black text-[var(--text-main)] uppercase tracking-widest">Alterar</span>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </label>

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <div className="absolute -bottom-2 -right-2 bg-[var(--bg-main)] p-2 rounded-xl border border-white/10 z-10">
            {profile?.status === 'active' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Clock className="w-6 h-6 text-amber-500" />
            )}
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-2">{profile?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest">
              Role: {profile?.role}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              profile?.status === 'active' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
              Status: {profile?.status === 'active' ? 'Ativo' : 'Pendente'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-2xl transition-all group border border-red-500/20"
        >
          <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-primary/60" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <p className="text-lg font-bold text-[var(--text-main)] tracking-tight">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => window.open(`mailto:contato@sindpetshop.org.br`, '_blank')}
          className="glass-card p-8 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group flex items-center justify-between md:col-span-2"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-1">E-mail de Suporte</p>
              <p className="text-lg font-bold text-[var(--text-main)] tracking-tight">contato@sindpetshop</p>
            </div>
          </div>
          <ArrowUpRight className="w-6 h-6 text-blue-500/40 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </button>
      </div>

      <div className="glass-card p-8 border-dashed border-white/10 opacity-50">
        <p className="text-center text-xs font-medium text-[var(--text-main)] opacity-30 italic">
          Para alterar seus dados cadastrais, por favor entre em contato com a secretaria do Sindpetshop-SP.
        </p>
      </div>
    </div>
  );
};

export default Profile;
