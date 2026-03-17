import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { NewsItem } from '../../types';
import { handleFirestoreError, OperationType } from '../../services/errorService';
import { Newspaper, Plus, X, Trash2, Calendar, Link as LinkIcon, Upload, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';

const News: React.FC = () => {
  const { profile, user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    externalLink: '',
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'gestao';

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFile) {
        const imageRef = ref(storage, `news/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'news'), {
        ...formData,
        images: imageUrls,
        publishedAt: new Date().toISOString(),
      });
      
      setShowModal(false);
      setFormData({ title: '', content: '', externalLink: '' });
      setImageFile(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'news');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir esta notícia?")) return;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Comunicação</h1>
          <p className="text-[var(--text-main)] opacity-60 mt-1">Notícias, comunicados oficiais e TV Sindpetshop.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" /> Novo
            </button>
          )}
        </div>
      </header>

      {/* Quick Links Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => window.open('https://sindpetshop.org.br/noticia', '_blank')}
          className="glass-card p-4 hover:border-primary/50 transition-all text-left group"
        >
          <p className="text-[var(--text-main)] opacity-40 text-[10px] uppercase font-black tracking-widest mb-1">Portal</p>
          <p className="text-[var(--text-main)] font-bold text-sm group-hover:text-primary transition-colors">Ver Notícias</p>
        </button>
        <button 
          onClick={() => window.open('https://sindpetshop.org.br/artigo', '_blank')}
          className="glass-card p-4 hover:border-primary/50 transition-all text-left group"
        >
          <p className="text-[var(--text-main)] opacity-40 text-[10px] uppercase font-black tracking-widest mb-1">Oficial</p>
          <p className="text-[var(--text-main)] font-bold text-sm group-hover:text-primary transition-colors">Comunicados</p>
        </button>
        <button 
          onClick={() => window.open('https://www.youtube.com/@Sindpetshopsp/videos', '_blank')}
          className="glass-card p-4 hover:border-primary/50 transition-all text-left group"
        >
          <p className="text-[var(--text-main)] opacity-40 text-[10px] uppercase font-black tracking-widest mb-1">Vídeos</p>
          <p className="text-[var(--text-main)] font-bold text-sm group-hover:text-primary transition-colors">TV Sindicato</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.length > 0 ? news.map(item => (
          <motion.div 
            layout
            key={item.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
            className="glass-card overflow-hidden flex flex-col hover:border-primary/50 transition-all group relative border-white/10"
          >
            {isAdmin && (
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 z-10 p-3 bg-black/60 backdrop-blur-xl text-[var(--text-main)] opacity-40 hover:text-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="h-56 overflow-hidden relative">
              {item.images?.[0] ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center text-white/5">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-6">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[var(--text-main)] opacity-90 text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Calendar className="w-3 h-3 text-primary" />
                  {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-4 line-clamp-2 leading-[1.1] tracking-tight group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-[var(--text-main)] opacity-50 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
                {item.content}
              </p>
              
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                {item.externalLink ? (
                  <a 
                    href={item.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Ler mais <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button className="text-[var(--text-main)] opacity-30 text-[11px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                    Detalhes
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center glass-card border-dashed">
            <Newspaper className="w-12 h-12 text-[var(--text-main)] opacity-10 mx-auto mb-4" />
            <p className="text-[var(--text-main)] opacity-40">Nenhuma notícia publicada.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-xl overflow-hidden border-white/20"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-xl font-bold text-[var(--text-main)]">Nova Notícia</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-[var(--text-main)] opacity-40" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Título</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Conteúdo</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Link Externo (Opcional)</label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={formData.externalLink}
                    onChange={e => setFormData({...formData, externalLink: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Imagem de Capa</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="news-image-upload"
                    />
                    <label 
                      htmlFor="news-image-upload"
                      className="flex items-center justify-center gap-2 w-full bg-white/5 border-2 border-dashed border-white/10 rounded-xl py-4 cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <Upload className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                      <span className="text-sm text-[var(--text-main)] opacity-60">{imageFile ? imageFile.name : 'Selecionar imagem'}</span>
                    </label>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : 'Publicar Notícia'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default News;
