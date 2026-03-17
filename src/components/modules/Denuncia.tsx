import React from 'react';
import { ShieldAlert, Send, Lock, EyeOff, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Denuncia: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Denúncia Segura</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-2 font-medium">Sua voz é a nossa força. Protegemos seus direitos com sigilo absoluto.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 border-primary/20 bg-primary/5">
            <ShieldAlert className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-xl font-black text-[var(--text-main)] mb-4">Como funciona?</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-[var(--text-main)] opacity-60">
                <Lock className="w-5 h-5 text-primary shrink-0" />
                <span>**Sigilo Total:** Sua identidade nunca é revelada para a empresa.</span>
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-main)] opacity-60">
                <EyeOff className="w-5 h-5 text-primary shrink-0" />
                <span>**Opção Anônima:** Se desejar, você nem precisa se identificar.</span>
              </li>
              <li className="flex gap-3 text-sm text-[var(--text-main)] opacity-60">
                <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                <span>**Acompanhamento:** O jurídico do Sindpetshop analisa cada caso.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-[var(--text-main)] font-bold mb-2 text-sm uppercase tracking-widest opacity-40">Atendimento Direto</h3>
            <p className="text-[var(--text-main)] opacity-60 text-sm leading-relaxed">
              Preferir falar diretamente com um assessor? 
              <br />
              <span className="text-[var(--text-main)] font-bold">Ligue: (11) 3214-5310</span>
            </p>
          </div>
        </div>

        {/* Action Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-[var(--text-main)] mb-6">Pronto para denunciar?</h2>
              <p className="text-[var(--text-main)] opacity-60 mb-8 leading-relaxed">
                Utilizamos o canal oficial do **Sindpetshop-SP** para garantir a validade jurídica da sua solicitação. 
                Ao clicar abaixo, você será redirecionado para o nosso formulário seguro.
              </p>
              
              <a 
                href="https://www.sindpetshop.org.br/Denuncia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 premium-gradient text-[var(--text-main)] font-black py-5 px-10 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all group"
              >
                ACESSAR CANAL OFICIAL
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Background design element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 border-white/5">
              <h4 className="text-[var(--text-main)] font-bold mb-3">Irregularidades Comuns</h4>
              <ul className="text-xs text-[var(--text-main)] opacity-30 space-y-2 uppercase tracking-tighter">
                <li>• Desvio de função</li>
                <li>• Falta de registro em carteira</li>
                <li>• Não pagamento de horas extras</li>
                <li>• Assédio moral no ambiente</li>
              </ul>
            </div>
            <div className="glass-card p-8 border-white/5">
              <h4 className="text-[var(--text-main)] font-bold mb-3">O que informar?</h4>
              <p className="text-xs text-[var(--text-main)] opacity-40 leading-relaxed font-bold">
                Tente ter em mãos o nome da empresa, o endereço e, se possível, fotos ou documentos que comprovem a irregularidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Denuncia;
