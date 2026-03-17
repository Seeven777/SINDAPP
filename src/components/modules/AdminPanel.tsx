import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserProfile } from '../../types';
import { handleFirestoreError, OperationType } from '../../services/errorService';
import { Check, X, Eye, ShieldAlert, UserCheck, FileText, Phone, Building2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
  };

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesView = view === 'pending' ? user.status === 'pending' : true;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesView && matchesSearch;
  });

  const handleStatusChange = async (uid: string, status: 'active' | 'rejected') => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), { 
        status,
        updatedAt: new Date().toISOString()
      });
      setSelectedUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-[var(--text-main)]">Painel de Administração</h1>
        <p className="text-[var(--text-main)] opacity-60 mt-1">Validação de novos associados e gestão do sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Usuários', value: stats.total, color: 'from-blue-500/20 to-blue-500/5' },
          { label: 'Pendentes', value: stats.pending, color: 'from-amber-500/20 to-amber-500/5' },
          { label: 'Ativos', value: stats.active, color: 'from-emerald-500/20 to-emerald-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-8 bg-gradient-to-br ${stat.color} border-white/5`}>
            <p className="text-[10px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="glass-card overflow-hidden border-white/10 shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-black text-[var(--text-main)] flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Gestão de Usuários
            </h2>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setView('pending')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Pendentes
              </button>
              <button 
                onClick={() => setView('all')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'all' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Todos
              </button>
            </div>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar por nome, email ou petshop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] font-bold outline-none focus:border-primary transition-all pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-main)] opacity-20">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[var(--text-main)] opacity-30 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Usuário / Status</th>
                <th className="px-8 py-4">Petshop / CNPJ</th>
                <th className="px-8 py-4">Data Registro</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-inner ring-1 ring-primary/10 overflow-hidden">
                          {user.photoUrl ? (
                            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          user.status === 'active' ? 'bg-emerald-500' : 
                          user.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-base font-black text-[var(--text-main)] tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-[var(--text-main)] opacity-30 font-black uppercase tracking-widest">{user.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-[var(--text-main)] opacity-80">{user.workplace}</p>
                    <p className="text-[10px] text-[var(--text-main)] opacity-30 font-black tracking-widest uppercase mt-0.5">{user.cnpj}</p>
                  </td>
                  <td className="px-8 py-6 text-sm text-[var(--text-main)] opacity-40 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-3 bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all border border-white/5 hover:border-primary/20"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.uid, 'active')}
                        className="p-3 bg-primary/10 text-primary hover:bg-primary rounded-2xl hover:text-white transition-all border border-primary/20 shadow-lg shadow-primary/5"
                        title="Aprovar Rápido"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-[var(--text-main)] opacity-20 text-sm">
                    Nenhuma validação pendente no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border-white/20"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)]">{selectedUser.name}</h2>
                    <p className="text-sm text-[var(--text-main)] opacity-40">Solicitação de Associado</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-[var(--text-main)] opacity-40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[var(--text-main)] opacity-30 uppercase tracking-widest">Informações de Contato</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[var(--text-main)] opacity-70">
                        <UserCheck className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[var(--text-main)] opacity-70">
                        <Phone className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        <span className="text-sm">{selectedUser.phone || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[var(--text-main)] opacity-30 uppercase tracking-widest">Vínculo Profissional</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[var(--text-main)] opacity-70">
                        <Building2 className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        <span className="text-sm">{selectedUser.workplace}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[var(--text-main)] opacity-70">
                        <FileText className="w-4 h-4 text-[var(--text-main)] opacity-40" />
                        <span className="text-sm font-mono">CNPJ: {selectedUser.cnpj}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[var(--text-main)] opacity-30 uppercase tracking-widest">Documentação Enviada</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedUser.documentUrl ? (
                      <button 
                        onClick={() => window.open(selectedUser.documentUrl, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group w-full text-left"
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[var(--text-main)] opacity-40 group-hover:text-primary transition-colors shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[var(--text-main)]">Documento Identidade</p>
                          <p className="text-[10px] text-[var(--text-main)] opacity-40 uppercase tracking-widest font-black">Visualizar Arquivo</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium italic">Pendente: Documento ID</span>
                      </div>
                    )}

                    {selectedUser.proofUrl ? (
                      <button 
                        onClick={() => window.open(selectedUser.proofUrl, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group w-full text-left"
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[var(--text-main)] opacity-40 group-hover:text-primary transition-colors shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[var(--text-main)]">Comprovante de Vínculo</p>
                          <p className="text-[10px] text-[var(--text-main)] opacity-40 uppercase tracking-widest font-black">Visualizar Arquivo</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium italic">Pendente: Comprovante</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex items-center gap-4">
                <button 
                  disabled={loading}
                  onClick={() => handleStatusChange(selectedUser.uid, 'rejected')}
                  className="flex-1 bg-white/5 border border-white/10 text-white/60 font-bold py-4 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                >
                  Rejeitar Cadastro
                </button>
                <button 
                  disabled={loading}
                  onClick={() => handleStatusChange(selectedUser.uid, 'active')}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  Aprovar Associado
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
