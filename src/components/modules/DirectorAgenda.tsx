import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { DirectorEvent } from '../../types';
import { Calendar, MapPin, Clock, Plus, X, ChevronRight, FileText, Trash2, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

const DirectorAgenda: React.FC = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<DirectorEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
    attachments: [] as string[],
  });
  const [selectedEvent, setSelectedEvent] = useState<DirectorEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'director_events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectorEvent)));
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("O arquivo deve ter no máximo 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `agenda/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setNewEvent(prev => ({
        ...prev,
        attachments: [...prev.attachments, url]
      }));
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Falha ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'director_events'), {
        ...newEvent,
        createdAt: new Date().toISOString(),
      });
      setShowAddModal(false);
      setNewEvent({ 
        title: '', 
        date: '', 
        time: '', 
        location: '', 
        description: '',
        status: 'upcoming',
        attachments: []
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao criar evento.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'director_events', id));
      setEventToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir evento.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Agenda da Diretoria</h1>
          <p className="text-[var(--text-main)] opacity-40 mt-2 font-medium">Gestão estratégica e eventos institucionais do <span className="text-primary">Sindpetshop</span>.</p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'gestao' || profile?.role === 'diretoria') && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 premium-gradient text-[var(--text-main)] font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Adicionar Evento
          </motion.button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {events.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {events.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card p-8 flex flex-col md:flex-row md:items-center gap-8 group hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] p-6 min-w-[120px] shadow-inner ring-1 ring-white/10 group-hover:ring-primary/20 transition-all">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                  <span className="text-4xl font-black text-[var(--text-main)]">
                    {new Date(event.date + 'T00:00:00').getDate()}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight group-hover:text-primary transition-colors">{event.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2.5 text-[var(--text-main)] opacity-40 font-bold uppercase tracking-widest text-[10px]">
                      <Clock className="w-4 h-4 text-primary" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2.5 text-[var(--text-main)] opacity-40 font-bold uppercase tracking-widest text-[10px]">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.location}
                    </div>
                  </div>
                  <p className="text-[var(--text-main)] opacity-40 text-sm leading-relaxed font-medium max-w-2xl">{event.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {(profile?.role === 'admin' || profile?.role === 'gestao') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToDelete(event.id);
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-2xl text-red-500/40 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedEvent(event)}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/20 group-hover:bg-primary group-hover:text-white transition-all shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-32 text-center glass-card border-dashed border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-[var(--text-main)] opacity-10" />
            </div>
            <p className="text-[var(--text-main)] opacity-20 font-black uppercase tracking-[0.3em] text-xs">Nenhum evento estratégico agendado</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 space-y-8">
                <header className="flex justify-between items-start">
                  <div className="space-y-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedEvent.status === 'ongoing' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      selectedEvent.status === 'completed' ? 'bg-white/10 text-[var(--text-main)] opacity-40 border-white/10' : 
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {selectedEvent.status === 'ongoing' ? '● Acontecendo Agora' : 
                       selectedEvent.status === 'completed' ? 'Finalizado' : 'Próximo Evento'}
                    </span>
                    <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter leading-tight">{selectedEvent.title}</h2>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                    <X className="w-8 h-8 text-[var(--text-main)] opacity-20" />
                  </button>
                </header>

                <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-widest">Data</p>
                      <p className="text-[var(--text-main)] font-bold">{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-widest">Horário</p>
                      <p className="text-[var(--text-main)] font-bold">{selectedEvent.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--text-main)] opacity-40">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{selectedEvent.location}</span>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                    <p className="text-[var(--text-main)] opacity-60 leading-relaxed text-lg">{selectedEvent.description}</p>
                  </div>
                </div>

                {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-widest">Anexos e Documentos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEvent.attachments.map((file, i) => (
                        <a key={i} href={file} target="_blank" className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                          <FileText className="w-6 h-6 text-primary/60 group-hover:text-primary" />
                          <span className="text-sm text-[var(--text-main)] opacity-40 font-bold truncate">Anexo_{i+1}.pdf</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-xl overflow-hidden border-white/20 shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter">Novo Evento Estratégico</h2>
                  <p className="text-[var(--text-main)] opacity-30 text-xs font-bold uppercase tracking-widest mt-1">Agenda Privada da Diretoria</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-[var(--text-main)] opacity-40" />
                </button>
              </div>
              <form onSubmit={handleAddEvent} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Título do Evento</label>
                  <input 
                    required
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Ex: Reunião de Planejamento 2024"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-white/10 font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Data</label>
                    <input 
                      required
                      type="date"
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Horário</label>
                    <input 
                      required
                      type="time"
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Localização / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-main)] opacity-20" />
                    <input 
                      required
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Ex: Sede do Sindicato ou Zoom"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-white/10 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Status do Evento</label>
                    <select 
                      value={newEvent.status}
                      onChange={e => setNewEvent({...newEvent, status: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                    >
                      <option value="upcoming">Próximo (Agendado)</option>
                      <option value="ongoing">Acontecendo Agora</option>
                      <option value="completed">Finalizado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Anexos e Documentos</label>
                  
                  {/* Upload de Arquivo Local */}
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <button 
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-white/5 border border-white/10 text-white/60 font-bold py-3 px-6 rounded-2xl hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Fazer Upload de Arquivo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Adicionar Link Textual */}
                  <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Ou Adicionar Link (Google Drive, etc)</label>
                  <div className="flex gap-2">
                    <input 
                      id="attachment-input"
                      placeholder="https://exemplo.com/documento.pdf"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-white/5 text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('attachment-input') as HTMLInputElement;
                        if (input && input.value) {
                          setNewEvent({...newEvent, attachments: [...newEvent.attachments, input.value]});
                          input.value = '';
                        }
                      }}
                      className="bg-white/5 border border-white/10 text-[var(--text-main)] opacity-40 px-6 rounded-2xl hover:text-primary transition-all font-black text-xs uppercase"
                    >
                      Adicionar
                    </button>
                  </div>

                  {newEvent.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {newEvent.attachments.map((link, i) => (
                        <div key={i} className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2">
                          <span className="truncate max-w-[150px]">{link}</span>
                          <button 
                            type="button"
                            onClick={() => setNewEvent({...newEvent, attachments: newEvent.attachments.filter((_, idx) => idx !== i)})}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-widest ml-1">Pauta / Descrição</label>
                  <textarea 
                    required
                    rows={4}
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Descreva os tópicos principais..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[var(--text-main)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all placeholder:text-white/10 font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full premium-gradient text-[var(--text-main)] font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-[0.2em] text-sm mt-4"
                >
                  Confirmar e Salvar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Excluir Evento?</h3>
              <p className="text-[var(--text-main)] opacity-40 text-sm mb-8">Esta ação é irreversível e removerá permanentemente o evento da agenda.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setEventToDelete(null)}
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 rounded-2xl text-[var(--text-main)] opacity-60 font-black transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDeleteEvent(eventToDelete)}
                  disabled={isDeleting}
                  className="flex-1 py-4 px-6 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-black transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectorAgenda;
