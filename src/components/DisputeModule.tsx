import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  ArrowRight, 
  Trophy,
  HelpCircle,
  Lightbulb,
  Loader2,
  Link,
  Wand2
} from 'lucide-react';
import { ItemDispute, RoomType, ProductOption, HomeProduct } from '../types';
import { evaluateDisputeWithAI } from '../services/gemini';
import { extractProductFromUrl } from '../services/scraper';

interface DisputeModuleProps {
  disputes: ItemDispute[];
  geminiApiKey?: string;
  onSaveDispute: (dispute: ItemDispute) => void;
  onDeleteDispute: (disputeId: string) => void;
  onChooseWinner: (dispute: ItemDispute, winner: 'A' | 'B') => void;
  initialFromProduct?: HomeProduct | null;
  onClearInitialProduct?: () => void;
}

const ROOMS: RoomType[] = [
  'Sala de Estar',
  'Cozinha',
  'Quarto do Casal',
  'Banheiro',
  'Área de Serviço',
  'Escritório / Varanda',
  'Geral / Outros',
];

export const DisputeModule: React.FC<DisputeModuleProps> = ({
  disputes,
  geminiApiKey,
  onSaveDispute,
  onDeleteDispute,
  onChooseWinner,
  initialFromProduct,
  onClearInitialProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzingDisputeId, setAnalyzingDisputeId] = useState<string | null>(null);
  const [isExtractingA, setIsExtractingA] = useState(false);
  const [isExtractingB, setIsExtractingB] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    room: RoomType;
    optionA: ProductOption;
    optionB: ProductOption;
  }>({
    title: '',
    room: 'Sala de Estar',
    optionA: { name: '', price: 0, specs: '', brand: '', link: '' },
    optionB: { name: '', price: 0, specs: '', brand: '', link: '' }
  });

  const handleExtractOption = async (optionKey: 'A' | 'B') => {
    const option = optionKey === 'A' ? formData.optionA : formData.optionB;
    const url = option.link;
    if (!url || !url.trim()) {
      alert(`Cole o link da Opção ${optionKey} primeiro!`);
      return;
    }

    if (optionKey === 'A') setIsExtractingA(true);
    else setIsExtractingB(true);

    try {
      const data = await extractProductFromUrl(url.trim(), geminiApiKey);
      setFormData(prev => {
        const target = optionKey === 'A' ? prev.optionA : prev.optionB;
        const updatedOption = {
          ...target,
          name: data.name || target.name,
          brand: data.brand || target.brand,
          price: data.estimatedPrice || target.price,
          specs: data.specs || target.specs,
          link: url.trim()
        };

        // If title is empty, generate an intuitive one
        let newTitle = prev.title;
        if (!newTitle.trim() && data.name) {
          newTitle = `Disputa: ${data.name}`;
        }

        return {
          ...prev,
          title: newTitle,
          room: data.room || prev.room,
          [optionKey === 'A' ? 'optionA' : 'optionB']: updatedOption
        };
      });
    } catch (e: any) {
      alert(e?.message || `Não foi possível extrair os dados da Opção ${optionKey}`);
    } finally {
      if (optionKey === 'A') setIsExtractingA(false);
      else setIsExtractingB(false);
    }
  };

  // If redirected from HomeModule with a preselected product
  React.useEffect(() => {
    if (initialFromProduct) {
      setFormData({
        title: `Disputa: Qual ${initialFromProduct.name} comprar?`,
        room: initialFromProduct.room,
        optionA: {
          name: initialFromProduct.name,
          price: initialFromProduct.estimatedPrice,
          specs: initialFromProduct.specs || '',
          brand: initialFromProduct.brandOrModel || '',
          link: initialFromProduct.storeLink || ''
        },
        optionB: {
          name: '',
          price: 0,
          specs: '',
          brand: '',
          link: ''
        }
      });
      setIsModalOpen(true);
      if (onClearInitialProduct) onClearInitialProduct();
    }
  }, [initialFromProduct]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      room: 'Sala de Estar',
      optionA: { name: '', price: 0, specs: '', brand: '', link: '' },
      optionB: { name: '', price: 0, specs: '', brand: '', link: '' }
    });
    setIsModalOpen(true);
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.optionA.name.trim() || !formData.optionB.name.trim()) return;

    const newDispute: ItemDispute = {
      id: formData.id || `dispute-${Date.now()}`,
      title: formData.title.trim(),
      room: formData.room,
      optionA: formData.optionA,
      optionB: formData.optionB,
      decisionStatus: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setIsModalOpen(false);
    onSaveDispute(newDispute);

    // Automatically trigger AI evaluation
    handleRunAI(newDispute);
  };

  const handleRunAI = async (dispute: ItemDispute) => {
    setAnalyzingDisputeId(dispute.id);
    try {
      const verdict = await evaluateDisputeWithAI(
        dispute.title,
        dispute.room,
        dispute.optionA,
        dispute.optionB,
        geminiApiKey
      );

      const updated: ItemDispute = {
        ...dispute,
        aiVerdict: verdict
      };
      onSaveDispute(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingDisputeId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultor Inteligente de Custo-Benefício</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            <span>Disputa de Itens: O Que Compensa?</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Coloque dois produtos frente a frente (preço vs recursos) e deixe nossa IA fundamentar qual é o investimento mais inteligente para o casal.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Nova Disputa</span>
        </button>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma disputa criada ainda</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Em dúvida entre duas TVs, dois modelos de geladeira ou sofás? Crie um comparativo agora!
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Disputa</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {disputes.map((dispute) => {
            const isAnalyzing = analyzingDisputeId === dispute.id;
            const verdict = dispute.aiVerdict;
            const hasDecision = dispute.decisionStatus !== 'open';

            return (
              <div 
                key={dispute.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-200 transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                        {dispute.room}
                      </span>
                      {hasDecision && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Decisão Tomada: {dispute.decisionStatus === 'chosen_A' ? 'Opção A' : 'Opção B'}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-1.5">
                      {dispute.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleRunAI(dispute)}
                      disabled={isAnalyzing}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200/80 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          <span>IA Analisando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>{verdict ? 'Reavaliar com IA' : 'Pedir Veredito da IA'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteDispute(dispute.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir Disputa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Side by Side Comparison Cards */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  
                  {/* Center "VS" Badge */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs items-center justify-center shadow-lg border-2 border-white">
                    VS
                  </div>

                  {/* Option A Card */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    verdict?.recommendedOption === 'A'
                      ? 'border-indigo-300 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-500/20'
                      : dispute.decisionStatus === 'chosen_A'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        OPÇÃO A
                      </span>
                      {verdict?.recommendedOption === 'A' && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3 h-3" /> Recomendado pela IA
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{dispute.optionA.name}</h4>
                    {dispute.optionA.brand && (
                      <p className="text-xs text-slate-500">{dispute.optionA.brand}</p>
                    )}

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(dispute.optionA.price)}
                      </span>
                      {verdict && (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg">
                          <span>Nota:</span>
                          <span>{verdict.scoreA} / 10</span>
                        </div>
                      )}
                    </div>

                    {dispute.optionA.specs && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {dispute.optionA.specs}
                      </p>
                    )}

                    {dispute.optionA.link && (
                      <a
                        href={dispute.optionA.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Link da Opção A</span>
                      </a>
                    )}

                    {/* Pros and Cons for A if evaluated */}
                    {verdict && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" /> Pontos Fortes:
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {verdict.prosA.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1 pt-1">
                          <span className="font-semibold text-rose-700 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-rose-600" /> Pontos de Atenção:
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {verdict.consA.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onChooseWinner(dispute, 'A')}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          dispute.decisionStatus === 'chosen_A'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{dispute.decisionStatus === 'chosen_A' ? 'Opção Escolhida' : 'Bater o Martelo na Opção A'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Option B Card */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    verdict?.recommendedOption === 'B'
                      ? 'border-indigo-300 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-500/20'
                      : dispute.decisionStatus === 'chosen_B'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        OPÇÃO B
                      </span>
                      {verdict?.recommendedOption === 'B' && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3 h-3" /> Recomendado pela IA
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{dispute.optionB.name}</h4>
                    {dispute.optionB.brand && (
                      <p className="text-xs text-slate-500">{dispute.optionB.brand}</p>
                    )}

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(dispute.optionB.price)}
                      </span>
                      {verdict && (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg">
                          <span>Nota:</span>
                          <span>{verdict.scoreB} / 10</span>
                        </div>
                      )}
                    </div>

                    {dispute.optionB.specs && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {dispute.optionB.specs}
                      </p>
                    )}

                    {dispute.optionB.link && (
                      <a
                        href={dispute.optionB.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Link da Opção B</span>
                      </a>
                    )}

                    {/* Pros and Cons for B if evaluated */}
                    {verdict && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" /> Pontos Fortes:
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {verdict.prosB.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1 pt-1">
                          <span className="font-semibold text-rose-700 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-rose-600" /> Pontos de Atenção:
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {verdict.consB.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onChooseWinner(dispute, 'B')}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          dispute.decisionStatus === 'chosen_B'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{dispute.decisionStatus === 'chosen_B' ? 'Opção Escolhida' : 'Bater o Martelo na Opção B'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* AI Verdict Box */}
                {verdict && (
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-navy-950 text-white border-t border-indigo-950">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Veredito da Inteligência Artificial</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold font-display text-white mb-2">
                      {verdict.title}
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {verdict.summary}
                    </p>

                    <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white mb-0.5 font-semibold">Dica de Ouro para o Casal:</strong>
                        <span>{verdict.tipForCouple}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Dispute */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold font-display text-slate-900">
                Criar Nova Disputa de Produtos
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Título da Disputa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TV da Sala: Samsung vs LG OLED"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cômodo
                  </label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value as RoomType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {ROOMS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-side Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                
                {/* Option A Inputs */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-xs font-bold text-slate-700">
                      DADOS DA OPÇÃO A
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      Opção 1
                    </span>
                  </div>

                  {/* Option A Link Pull */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Link da Loja (Opcional)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Cole o link da Opção A..."
                        value={formData.optionA.link || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          optionA: { ...formData.optionA, link: e.target.value }
                        })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        disabled={isExtractingA || !formData.optionA.link?.trim()}
                        onClick={() => handleExtractOption('A')}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        {isExtractingA ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        <span>Puxar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Samsung QLED 55' Q65D"
                      value={formData.optionA.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionA: { ...formData.optionA, name: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 2799"
                      value={formData.optionA.price || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionA: { ...formData.optionA, price: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Marca / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: Samsung"
                      value={formData.optionA.brand || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionA: { ...formData.optionA, brand: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Especificações / Detalhes</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 60Hz, pontos quânticos, controle solar..."
                      value={formData.optionA.specs}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionA: { ...formData.optionA, specs: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    ></textarea>
                  </div>
                </div>

                {/* Option B Inputs */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-xs font-bold text-slate-700">
                      DADOS DA OPÇÃO B
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      Opção 2
                    </span>
                  </div>

                  {/* Option B Link Pull */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Link da Loja (Opcional)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Cole o link da Opção B..."
                        value={formData.optionB.link || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          optionB: { ...formData.optionB, link: e.target.value }
                        })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        disabled={isExtractingB || !formData.optionB.link?.trim()}
                        onClick={() => handleExtractOption('B')}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        {isExtractingB ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        <span>Puxar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: LG OLED 55' C3"
                      value={formData.optionB.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionB: { ...formData.optionB, name: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 4499"
                      value={formData.optionB.price || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionB: { ...formData.optionB, price: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Marca / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: LG"
                      value={formData.optionB.brand || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionB: { ...formData.optionB, brand: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Especificações / Detalhes</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 120Hz, HDMI 2.1, painel OLED evo..."
                      value={formData.optionB.specs}
                      onChange={(e) => setFormData({
                        ...formData,
                        optionB: { ...formData.optionB, specs: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    ></textarea>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar e Consultar IA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
