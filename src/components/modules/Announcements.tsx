import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Announcement } from '../../types';
import { handleFirestoreError, OperationType } from '../../services/errorService';
import { Megaphone, Plus, X, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Announcements: React.FC = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Geral',
    externalLink: '',
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'gestao';

  const defaultAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Piso Salarial e Jornada: Setor Pet SP',
      content: 'Confira as atualizações sobre o piso salarial para banhistas e tosadores conforme a nova CCT.',
      publishedAt: new Date().toISOString(),
      category: 'CCT',
      attachments: [],
      externalLink: 'https://www.sindpetshop.org.br/Home/Artigo/piso-salarial-e-jornada-setor-pet-sp'
    },
    {
      id: 'ann-2',
      title: 'Vínculo Empregatício Declarado',
      content: 'TRT-RS reconhece vínculo de banhista com pet shop. Vitória importante para a categoria!',
      publishedAt: new Date().toISOString(),
      category: 'CCT',
      attachments: [],
      externalLink: 'https://www.sindpetshop.org.br/Home/Artigo/vinculo-empregaticio-declarado'
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const aList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(aList.length > 0 ? aList : defaultAnnouncements);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        publishedAt: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({ title: '', content: '', category: 'Geral', externalLink: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir este comunicado?")) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Comunicados</h1>
          <p className="text-[var(--text-main)] opacity-60 mt-1">Informações oficiais e atualizações do sindicato.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Novo Comunicado
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {announcements.length > 0 ? announcements.map(ann => (
          <motion.div 
            layout
            key={ann.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            onClick={() => ann.externalLink && window.open(ann.externalLink, '_blank')}
            className={`glass-card p-10 md:p-12 hover:border-primary/50 transition-all relative group border-white/10 ${ann.externalLink ? 'cursor-pointer' : ''}`}
          >
            {isAdmin && (
              <button 
                onClick={() => handleDelete(ann.id)}
                className="absolute top-8 right-8 p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20 shadow-xl"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner ring-1 ring-primary/20">
                <Megaphone className="w-8 h-8 text-primary" />
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                    <Tag className="w-3 h-3" />
                    {ann.category}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-main)] opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ann.publishedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter leading-tight group-hover:text-primary transition-colors">{ann.title}</h2>
                <p className="text-[var(--text-main)] opacity-50 text-lg leading-relaxed whitespace-pre-wrap font-medium">{ann.content}</p>
                
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="pt-8 border-t border-white/10">
                    <h4 className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-4">Arquivos Anexados</h4>
                    <div className="flex flex-wrap gap-3">
                      {ann.attachments.map((file, idx) => (
                        <a key={idx} href={file} target="_blank" className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-[1rem] text-xs font-bold text-[var(--text-main)] opacity-70 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] shadow-md">
                          <FileText className="w-4 h-4 text-primary/60" />
                          Documento_{idx + 1}.pdf
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center glass-card border-dashed">
            <Megaphone className="w-12 h-12 text-[var(--text-main)] opacity-10 mx-auto mb-4" />
            <p className="text-[var(--text-main)] opacity-40">Nenhum comunicado publicado.</p>
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
                <h2 className="text-xl font-bold text-[var(--text-main)]">Novo Comunicado</h2>
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
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Geral">Geral</option>
                    <option value="CCT">CCT / Jurídico</option>
                    <option value="Benefícios">Benefícios</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Conteúdo</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : 'Publicar Comunicado'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;
