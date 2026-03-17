import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Benefit } from '../../types';
import { handleFirestoreError, OperationType } from '../../services/errorService';
import { Gift, ExternalLink, Search, Plus, X, Edit2, Trash2, Info } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Benefits: React.FC = () => {
  const { profile } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    category: '',
    externalLink: '',
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'gestao';

  const defaultBenefits: Benefit[] = [
    {
      id: 'b1',
      title: 'Educação - Univ. Nove de Julho (Uninove)',
      description: 'Descontos especiais nas mensalidades para graduação, pós-graduação e cursos técnicos.',
      category: 'Educação',
      icon: 'GraduationCap',
      url: 'https://www.uninove.br/'
    },
    {
      id: 'b2',
      title: 'Lazer - Aquário de São Paulo',
      description: 'O maior aquário da América Latina com tarifas especiais para você e família.',
      category: 'Lazer',
      icon: 'Waves',
      url: 'https://aquariodesp.com.br/site/'
    },
    {
      id: 'b3',
      title: 'Diversão - Hopi Hari',
      description: 'Passaportes com descontos exclusivos para associados curtirem o país mais divertido do mundo.',
      category: 'Lazer',
      icon: 'Gamepad2',
      url: 'https://www.hopihari.com.br/'
    },
    {
      id: 'b4',
      title: 'Turismo - Club de Férias',
      description: 'Lazer em todo o Brasil com colônias, pousadas e hotéis com preços imbatíveis.',
      category: 'Turismo',
      icon: 'Palmtree',
      url: 'https://clubdeferias.com.br/'
    },
    {
      id: 'b5',
      title: 'Educação - Faculdade ESEG',
      description: 'Cursos superiores de Engenharia e Gestão com benefícios exclusivos na mensalidade.',
      category: 'Educação',
      icon: 'GraduationCap',
      url: 'https://eseg.edu.br/'
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'benefits'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const bList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Benefit));
      setBenefits(bList.length > 0 ? bList : defaultBenefits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'benefits');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBenefit) {
        await updateDoc(doc(db, 'benefits', editingBenefit.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'benefits'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      setEditingBenefit(null);
      setFormData({ title: '', description: '', requirements: '', category: '', externalLink: '' });
    } catch (err) {
      handleFirestoreError(err, editingBenefit ? OperationType.UPDATE : OperationType.CREATE, 'benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este benefício?")) return;
    try {
      await deleteDoc(doc(db, 'benefits', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `benefits/${id}`);
    }
  };

  const openEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      title: benefit.title,
      description: benefit.description,
      requirements: benefit.requirements,
      category: benefit.category,
      externalLink: benefit.externalLink || '',
    });
    setShowModal(true);
  };

  const filteredBenefits = benefits.filter(b => 
    b.title.toLowerCase().includes(filter.toLowerCase()) ||
    b.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Benefícios</h1>
          <p className="text-[var(--text-main)] opacity-60 mt-1">Aproveite as vantagens de ser um associado Sindpetshop.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-main)] opacity-40" />
            <input 
              type="text" 
              placeholder="Filtrar benefícios..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setEditingBenefit(null);
                setFormData({ title: '', description: '', requirements: '', category: '', externalLink: '' });
                setShowModal(true);
              }}
              className="bg-primary text-white p-3 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBenefits.length > 0 ? filteredBenefits.map(benefit => (
          <motion.div 
            layout
            key={benefit.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="glass-card overflow-hidden flex flex-col hover:border-primary/50 transition-all group border-white/10"
          >
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl ring-1 ring-white/10 group-hover:ring-primary/40 transition-all overflow-hidden">
                  {benefit.logoUrl ? (
                    <img src={benefit.logoUrl} alt={benefit.title} className="w-full h-full object-contain" />
                  ) : (
                    <Gift className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(benefit)} className="p-2.5 bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-white/5 hover:border-primary/20">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(benefit.id)} className="p-2.5 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="inline-block px-4 py-1 bg-white/5 text-[var(--text-main)] opacity-40 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5 mb-4 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                {benefit.category}
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-3 tracking-tight leading-tight">{benefit.title}</h3>
              <p className="text-[var(--text-main)] opacity-50 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">{benefit.description}</p>
              
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em]">
                  <Info className="w-3.5 h-3.5" />
                  Regras de Acesso
                </div>
                <p className="text-sm text-[var(--text-main)] opacity-40 font-medium line-clamp-2 italic">"{benefit.requirements}"</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              {benefit.externalLink ? (
                <a 
                  href={benefit.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl hover:bg-primary hover:border-primary transition-all text-[11px] uppercase tracking-widest shadow-lg active:scale-[0.98]"
                >
                  Utilizar Agora <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button 
                  onClick={() => window.open(benefit.url || 'https://sindpetshop.org.br/Home/Beneficios', '_blank')}
                  className="w-full premium-gradient text-[var(--text-main)] font-black py-4 rounded-2xl hover:opacity-90 transition-all text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98]"
                >
                  Mais Informações
                </button>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-[var(--text-main)] opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Nenhum benefício encontrado</h3>
            <p className="text-[var(--text-main)] opacity-40">Tente buscar por outro termo ou categoria.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg overflow-hidden border-white/20"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--text-main)]">{editingBenefit ? 'Editar Benefício' : 'Novo Benefício'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
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
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Categoria</label>
                  <input 
                    required
                    placeholder="Ex: Saúde, Lazer, Educação"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Descrição</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] opacity-70 mb-1">Requisitos</label>
                  <input 
                    required
                    placeholder="Ex: Ser associado há mais de 3 meses"
                    value={formData.requirements}
                    onChange={e => setFormData({...formData, requirements: e.target.value})}
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
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (editingBenefit ? 'Salvar Alterações' : 'Criar Benefício')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Benefits;
