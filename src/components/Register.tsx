import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db, storage } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import { UserPlus, Upload, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  workplace: z.string().min(3, "Local de trabalho inválido"),
});

type FormData = z.infer<typeof schema>;

const Register: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ doc?: File; proof?: File }>({});

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.displayName || '',
    }
  });

  const onSubmit = async (data: FormData, skipUploads = false) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    const isAdm = user.email?.toLowerCase() === 'gustavo13470@gmail.com';
    console.log("Iniciando submissão. Admin:", isAdm, "Skip Uploads:", skipUploads);

    try {
      let documentUrl = '';
      let proofUrl = '';

      if (files.doc && !skipUploads) {
        console.log("Fazendo upload do documento...");
        try {
          const docRef = ref(storage, `documents/${user.uid}/${files.doc.name}`);
          const uploadTask = uploadBytes(docRef, files.doc);
          
          // Timeout menor para admin para não travar
          const timeoutMs = isAdm ? 5000 : 30000;
          
          await Promise.race([
            uploadTask,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout no upload (${timeoutMs/1000}s)`)), timeoutMs))
          ]);
          
          documentUrl = await getDownloadURL(docRef);
        } catch (uploadErr) {
          console.error("Erro no upload do documento:", uploadErr);
          if (isAdm) {
            console.warn("Admin: ignorando erro de upload.");
          } else {
            throw new Error("Falha ao enviar documento. Tente um arquivo menor ou verifique sua conexão.");
          }
        }
      }

      if (files.proof && !skipUploads) {
        console.log("Fazendo upload do comprovante...");
        try {
          const proofRef = ref(storage, `proofs/${user.uid}/${files.proof.name}`);
          const uploadTask = uploadBytes(proofRef, files.proof);
          
          const timeoutMs = isAdm ? 5000 : 30000;
          
          await Promise.race([
            uploadTask,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout no upload (${timeoutMs/1000}s)`)), timeoutMs))
          ]);
          
          proofUrl = await getDownloadURL(proofRef);
        } catch (uploadErr) {
          console.error("Erro no upload do comprovante:", uploadErr);
          if (isAdm) {
            console.warn("Admin: ignorando erro de upload.");
          } else {
            throw new Error("Falha ao enviar comprovante de trabalho.");
          }
        }
      }

      const isBootstrapAdmin = user.email?.toLowerCase() === 'gustavo13470@gmail.com';
      console.log("Salvando perfil no Firestore. Admin:", isBootstrapAdmin);

      try {
        const saveTask = setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: data.name,
          email: user.email,
          phone: data.phone,
          cnpj: data.cnpj,
          workplace: data.workplace,
          documentUrl,
          proofUrl,
          role: isBootstrapAdmin ? 'gestao' : 'associado',
          status: isBootstrapAdmin ? 'active' : 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await Promise.race([
          saveTask,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao salvar no banco de dados (Firestore - 30s)")), 30000))
        ]);
      } catch (dbErr) {
        console.error("Erro ao salvar no Firestore:", dbErr);
        if (!isBootstrapAdmin) throw dbErr;
        console.warn("Admin detectado, prosseguindo apesar do erro de conexão...");
      }

      console.log("Cadastro finalizado com sucesso!");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setError(err.message || "Erro desconhecido ao enviar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Cadastro Enviado!</h2>
          <p className="text-[var(--text-main)] opacity-60 mt-4">
            Sua solicitação está em análise pela nossa equipe. Você receberá um e-mail assim que sua conta for validada.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors"
          >
            Entendido
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-20 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-orange-900/10 blur-[120px] rounded-full"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20 ring-4 ring-primary/10">
            <UserPlus className="w-10 h-10 text-[var(--text-main)]" />
          </div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-4">Complete sua Identidade</h1>
          <p className="text-[var(--text-main)] opacity-40 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Estamos quase lá! Valide seu vínculo para liberar acesso total aos benefícios do <span className="text-primary font-bold">Sindpetshop</span>.
          </p>
        </div>

          <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="glass-card p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[11px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] ml-1">Dados de Contato</label>
              <div className="space-y-4">
                <input 
                  {...register('name')}
                  placeholder="Nome Completo"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[var(--text-main)] placeholder:text-white/20 font-bold"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.name.message}</p>}
                
                <input 
                  {...register('phone')}
                  placeholder="Telefone: (00) 00000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[var(--text-main)] placeholder:text-white/20 font-bold"
                />
                {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] ml-1">Vínculo Profissional</label>
              <div className="space-y-4">
                <input 
                  {...register('workplace')}
                  placeholder="Nome do Petshop / Clínica"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[var(--text-main)] placeholder:text-white/20 font-bold"
                />
                {errors.workplace && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.workplace.message}</p>}

                <input 
                  {...register('cnpj')}
                  placeholder="CNPJ: 00.000.000/0000-00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[var(--text-main)] placeholder:text-white/20 font-bold"
                />
                {errors.cnpj && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.cnpj.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] ml-1">Documentação Digitalizada</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={(e) => setFiles(prev => ({ ...prev, doc: e.target.files?.[0] }))}
                  className="hidden" 
                  id="doc-upload"
                />
                <label 
                  htmlFor="doc-upload"
                  className="flex flex-col items-center justify-center gap-3 w-full bg-white/5 border-2 border-dashed border-white/10 rounded-[1.5rem] py-8 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group-hover:shadow-2xl group-hover:shadow-primary/5"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[var(--text-main)] opacity-20 group-hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[var(--text-main)] group-hover:text-primary transition-colors">RG ou CNH (Frente/Verso)</p>
                    <p className="text-[10px] text-[var(--text-main)] opacity-30 font-black uppercase tracking-widest mt-1">{files.doc ? files.doc.name : 'Clique para selecionar'}</p>
                  </div>
                </label>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  onChange={(e) => setFiles(prev => ({ ...prev, proof: e.target.files?.[0] }))}
                  className="hidden" 
                  id="proof-upload"
                />
                <label 
                  htmlFor="proof-upload"
                  className="flex flex-col items-center justify-center gap-3 w-full bg-white/5 border-2 border-dashed border-white/10 rounded-[1.5rem] py-8 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group-hover:shadow-2xl group-hover:shadow-primary/5"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[var(--text-main)] opacity-20 group-hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[var(--text-main)] group-hover:text-primary transition-colors">Comprovante de Vínculo</p>
                    <p className="text-[10px] text-[var(--text-main)] opacity-30 font-black uppercase tracking-widest mt-1">{files.proof ? files.proof.name : 'Clique para selecionar'}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-[var(--text-main)] font-black py-5 rounded-[1.5rem] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-[0.98] uppercase tracking-[0.2em] text-sm mt-8"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando Dados...
              </div>
            ) : 'Enviar para Validação'}
          </button>

          {user?.email?.toLowerCase() === 'gustavo13470@gmail.com' && (
            <div className="space-y-4 mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-sm text-primary font-medium text-center">
                Detectamos que você é o Administrador. Se o upload falhar ou demorar, use as opções abaixo:
              </p>
              <button
                type="button"
                onClick={() => onSubmit({ name: user.displayName || 'Admin', phone: '0000000000', cnpj: '00000000000000', workplace: 'Sindapp' }, true)}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 transition-all shadow-md"
              >
                Forçar Cadastro Rápido (Sem Fotos)
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full bg-white/5 text-primary font-semibold py-3 rounded-xl hover:bg-white/10 transition-all border border-primary/20"
              >
                Entrar via Perfil Virtual (Bypass Total)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
