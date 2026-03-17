import React, { useState } from 'react';
import { Calculator, Umbrella, Gift, FileText, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Calculators: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<'ferias' | '13o' | 'rescisao' | 'vt' | null>(null);
  const [salary, setSalary] = useState('');
  const [months, setMonths] = useState('12');
  const [daysWorked, setDaysWorked] = useState('30');
  const [avisoPrevio, setAvisoPrevio] = useState<'trabalhado' | 'indenizado'>('indenizado');
  const [result, setResult] = useState<any>(null);

  const calculateFerias = () => {
    const s = parseFloat(salary);
    if (!s) return;
    const base = s;
    const adicional = base / 3;
    const total = base + adicional;
    setResult({ base, adicional, total });
  };

  const calculate13o = () => {
    const s = parseFloat(salary);
    const m = parseInt(months);
    if (!s || !m) return;
    const total = (s / 12) * m;
    setResult({ base: s, meses: m, total });
  };

  const calculateRescisao = () => {
    const s = parseFloat(salary);
    const m = parseInt(months);
    const d = parseInt(daysWorked);
    if (!s || isNaN(m) || isNaN(d)) return;

    const saldoSalario = (s / 30) * d;
    const decimoTerceiroProp = (s / 12) * m;
    const feriasProp = (s / 12) * m;
    const feriasTerco = feriasProp / 3;
    
    let avisoPrevioValor = 0;
    if (avisoPrevio === 'indenizado') {
      avisoPrevioValor = s; // Simplificado
    }

    const total = saldoSalario + decimoTerceiroProp + feriasProp + feriasTerco + avisoPrevioValor;
    
    setResult({ 
      base: s, 
      saldoSalario, 
      decimoTerceiroProp, 
      feriasProp, 
      feriasTerco, 
      avisoPrevioValor,
      total 
    });
  };

  const calculateVT = () => {
    const s = parseFloat(salary);
    if (!s) return;
    const desconto = s * 0.06;
    setResult({ base: s, desconto, total: desconto });
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Calculadora do Trabalhador</h1>
        <p className="text-[var(--text-main)] opacity-40 mt-2 font-medium">Simule seus benefícios de acordo com a Convenção Coletiva.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'ferias', label: 'Férias + 1/3', icon: Umbrella, color: 'text-blue-500' },
          { id: '13o', label: 'Décimo Terceiro', icon: Gift, color: 'text-emerald-500' },
          { id: 'rescisao', label: 'Rescisão', icon: FileText, color: 'text-amber-500' },
          { id: 'vt', label: 'Vale Transporte', icon: Calculator, color: 'text-purple-500' },
        ].map((calc) => (
          <button
            key={calc.id}
            onClick={() => {
              setActiveCalc(calc.id as any);
              setResult(null);
            }}
            className={`glass-card p-8 flex flex-col items-center gap-4 border-2 transition-all ${
              activeCalc === calc.id ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'
            }`}
          >
            <calc.icon className={`w-10 h-10 ${calc.color}`} />
            <span className="font-black text-[var(--text-main)] uppercase tracking-widest text-xs">{calc.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeCalc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-10 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-8 border-b border-white/5 pb-4 uppercase tracking-tighter">
              Simulador de {activeCalc === 'ferias' ? 'Férias' : activeCalc === '13o' ? '13º Salário' : activeCalc === 'rescisao' ? 'Rescisão' : 'Vale Transporte'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] mb-3">Salário Bruto (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[var(--text-main)] font-bold text-xl outline-none focus:border-primary transition-colors"
                />
              </div>

              {(activeCalc === '13o' || activeCalc === 'rescisao') && (
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] mb-3">Meses Trabalhados (Proporcional)</label>
                  <input
                    type="number"
                    max="12"
                    min="0"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[var(--text-main)] font-bold text-xl outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {activeCalc === 'rescisao' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] mb-3">Dias Trabalhados no Último Mês</label>
                    <input
                      type="number"
                      max="31"
                      min="1"
                      value={daysWorked}
                      onChange={(e) => setDaysWorked(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[var(--text-main)] font-bold text-xl outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.2em] mb-3">Aviso Prévio</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setAvisoPrevio('indenizado')}
                        className={`py-4 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${avisoPrevio === 'indenizado' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        Indenizado
                      </button>
                      <button 
                        onClick={() => setAvisoPrevio('trabalhado')}
                        className={`py-4 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${avisoPrevio === 'trabalhado' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        Trabalhado
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  if (activeCalc === 'ferias') calculateFerias();
                  else if (activeCalc === '13o') calculate13o();
                  else if (activeCalc === 'rescisao') calculateRescisao();
                  else if (activeCalc === 'vt') calculateVT();
                }}
                className="w-full premium-gradient text-[var(--text-main)] font-black py-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
              >
                Calcular Agora
              </button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden"
                >
                  <div className="relative z-10 space-y-4">
                    <p className="text-[10px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.3em]">
                      {activeCalc === 'vt' ? 'Cálculo de Desconto (6%)' : 'Resultado Estimado'}
                    </p>
                    <div className="text-5xl font-black text-primary tracking-tighter">
                      R$ {result.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 text-[10px] text-[var(--text-main)] opacity-40 font-bold uppercase leading-relaxed">
                      <div>
                        {result.saldoSalario && <p>Saldo Salário: R$ {result.saldoSalario.toLocaleString('pt-BR')}</p>}
                        {result.decimoTerceiroProp && <p>13º Prop: R$ {result.decimoTerceiroProp.toLocaleString('pt-BR')}</p>}
                        {result.feriasProp && <p>Férias Prop: R$ {result.feriasProp.toLocaleString('pt-BR')}</p>}
                      </div>
                      <div>
                        {result.feriasTerco && <p>1/3 Ferias: R$ {result.feriasTerco.toLocaleString('pt-BR')}</p>}
                        {result.avisoPrevioValor && result.avisoPrevioValor > 0 && <p>Aviso Prévio: R$ {result.avisoPrevioValor.toLocaleString('pt-BR')}</p>}
                        {activeCalc === 'vt' && <p>Desconto Máximo Permitido</p>}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Calculator className="w-24 h-24" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-10 flex gap-4 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10">
              <Info className="w-6 h-6 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500/60 leading-relaxed font-medium">
                * Este é um cálculo simulado baseado em regras gerais. Valores reais podem variar dependendo de faltas, impostos (INSS/IRRF) e cláusulas específicas da sua CCT de região.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="glass-card p-10 mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Tabela Salarial 2024/2025</h2>
            <p className="text-[10px] text-[var(--text-main)] opacity-40 font-black uppercase tracking-widest mt-1">Pisos Salariais da Categoria</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-main)] opacity-60">
            <thead className="text-[10px] font-black uppercase tracking-widest border-b border-white/5 text-[var(--text-main)] opacity-30">
              <tr>
                <th className="pb-4 pr-6">Função / Categoria</th>
                <th className="pb-4 px-6">Piso Capital</th>
                <th className="pb-4 px-6">Piso Interior</th>
                <th className="pb-4 pl-6">CCT Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { func: 'Auxiliar de Pet Shop', capital: 'R$ 1.642,52', interior: 'R$ 1.589,40', cct: '2024/2025' },
                { func: 'Banhista', capital: 'R$ 1.785,30', interior: 'R$ 1.710,20', cct: '2024/2025' },
                { func: 'Tosador / Especialista', capital: 'R$ 2.150,00+', interior: 'R$ 2.040,00+', cct: '2024/2025' },
                { func: 'Recepcionista / Atendimento', capital: 'R$ 1.680,00', interior: 'R$ 1.620,00', cct: '2024/2025' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 pr-6 font-bold text-[var(--text-main)] group-hover:text-primary">{row.func}</td>
                  <td className="py-4 px-6 font-mono text-xs">{row.capital}</td>
                  <td className="py-4 px-6 font-mono text-xs">{row.interior}</td>
                  <td className="py-4 pl-6 text-[10px] font-black uppercase">{row.cct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[var(--text-main)] opacity-30 italic">Dados baseados na última convenção coletiva disponível no site oficial.</p>
          <button 
            onClick={() => window.open('https://www.sindpetshop.org.br/Home/CCT', '_blank')}
            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
          >
            Solicitar CCT em PDF <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Calculators;
