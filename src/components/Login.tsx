import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Mail, Lock, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao fazer login com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso.");
      } else if (err.code === 'auth/weak-password') {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Erro na autenticação. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full glass-card p-8 md:p-12 relative z-10 border-white/10"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl">
            <img src="/logo.png" alt="Sindpetshop Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-1">
            SIND<span className="text-primary">APP</span>
          </h1>
          <p className="text-xs font-black text-[var(--text-main)] opacity-40 tracking-[0.3em] uppercase">Sindicato Setor Petshop</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-main)] opacity-30" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-main)] opacity-30" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-[var(--text-main)] font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-[0.98] uppercase tracking-wider text-sm"
          >
            {loading ? 'Processando...' : (isRegistering ? 'Criar Minha Conta' : 'Entrar na Plataforma')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-xs text-[var(--text-main)] opacity-30 uppercase font-bold tracking-widest">ou</span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-[var(--text-main)] font-semibold py-4 px-6 rounded-2xl hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Associe-se agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
