import React from 'react';
import { 
  Heart, 
  Home, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { CoupleSettings, WeddingContract, HomeProduct, ItemDispute } from '../types';

interface DashboardProps {
  settings: CoupleSettings;
  contracts: WeddingContract[];
  products: HomeProduct[];
  disputes: ItemDispute[];
  onNavigate: (tab: 'wedding' | 'home' | 'disputes') => void;
  onPayInstallment: (contractId: string, installmentId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  contracts,
  products,
  disputes,
  onNavigate,
  onPayInstallment,
}) => {
  // Wedding calculations
  const weddingTotal = contracts.reduce((acc, c) => acc + c.totalAmount, 0);
  const weddingPaid = contracts.reduce((acc, c) => {
    const paidFromInstallments = c.installments
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    return acc + paidFromInstallments;
  }, 0);
  const weddingPending = weddingTotal - weddingPaid;
  const weddingProgress = weddingTotal > 0 ? (weddingPaid / weddingTotal) * 100 : 0;

  // Home calculations
  const homeEstimated = products.reduce((acc, p) => acc + (p.paidPrice || p.estimatedPrice), 0);
  const homePaid = products
    .filter(p => p.status === 'purchased' || p.status === 'delivered')
    .reduce((acc, p) => acc + (p.paidPrice || p.estimatedPrice), 0);
  const homePending = homeEstimated - homePaid;
  const homeProgress = homeEstimated > 0 ? (homePaid / homeEstimated) * 100 : 0;

  // Consolidated
  const totalCommitted = weddingTotal + homeEstimated;
  const totalPaid = weddingPaid + homePaid;
  const totalRemaining = weddingPending + homePending;
  const totalBudget = (settings.weddingBudget || 0) + (settings.homeBudget || 0);

  // Upcoming Installments (next 45 days or pending)
  const upcomingInstallments = React.useMemo(() => {
    const list: {
      contractId: string;
      vendorName: string;
      category: string;
      installmentId: string;
      number: number;
      amount: number;
      dueDate: string;
      status: string;
    }[] = [];

    contracts.forEach(contract => {
      contract.installments.forEach(inst => {
        if (inst.status === 'pending' || inst.status === 'overdue') {
          list.push({
            contractId: contract.id,
            vendorName: contract.vendorName,
            category: contract.category,
            installmentId: inst.id,
            number: inst.number,
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: inst.status
          });
        }
      });
    });

    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [contracts]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-navy-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-champagne-400/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-rose-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>Painel de Controle Inteligente</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-3">
            Planejamento Consolidado do Casal
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Acompanhe o pagamento dos fornecedores do casamento e gerencie cada compra da casa com recomendações inteligentes de custo-benefício.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-white/10">
            <div>
              <span className="text-xs text-slate-400 block">Total Investido (Já Pago)</span>
              <span className="text-lg sm:text-2xl font-bold text-emerald-400">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Saldo Restante</span>
              <span className="text-lg sm:text-2xl font-bold text-rose-300">
                {formatCurrency(totalRemaining)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Total Previsto Geral</span>
              <span className="text-lg sm:text-2xl font-bold text-white">
                {formatCurrency(totalCommitted)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Orçamento Estipulado</span>
              <span className="text-lg sm:text-2xl font-bold text-champagne-300">
                {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Pillars Comparison: Casamento vs Casa Nova */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: O Casamento */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">O Casamento</h3>
                  <p className="text-xs text-slate-500">{contracts.length} contratos fechados</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('wedding')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span>Ver Detalhes</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Progresso de Quitação</span>
                <span className="text-rose-600 font-bold">{weddingProgress.toFixed(0)}% pago</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weddingProgress)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Fechado</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {formatCurrency(weddingTotal)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 font-medium block">Já Pago</span>
                <span className="text-sm sm:text-base font-bold text-emerald-600">
                  {formatCurrency(weddingPaid)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-rose-600 font-medium block">A Pagar</span>
                <span className="text-sm sm:text-base font-bold text-rose-600">
                  {formatCurrency(weddingPending)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Meta de Orçamento: {formatCurrency(settings.weddingBudget || 0)}</span>
            <span className={weddingTotal <= settings.weddingBudget ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {weddingTotal <= settings.weddingBudget ? 'Dentro da meta' : 'Excedendo meta'}
            </span>
          </div>
        </div>

        {/* Card: Montagem da Casa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">Montagem da Casa</h3>
                  <p className="text-xs text-slate-500">{products.length} itens cadastrados nos cômodos</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span>Ver Cômodos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Itens Comprados / Adquiridos</span>
                <span className="text-emerald-600 font-bold">{homeProgress.toFixed(0)}% concluído</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, homeProgress)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Previsão Casa</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {formatCurrency(homeEstimated)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 font-medium block">Já Comprado</span>
                <span className="text-sm sm:text-base font-bold text-emerald-600">
                  {formatCurrency(homePaid)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Falta Comprar</span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  {formatCurrency(homePending)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Meta da Casa: {formatCurrency(settings.homeBudget || 0)}</span>
            <span className={homeEstimated <= settings.homeBudget ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {homeEstimated <= settings.homeBudget ? 'Dentro da meta' : 'Excedendo meta'}
            </span>
          </div>
        </div>

      </div>

      {/* Feature Highlight: Disputas e IA "O Que Compensa" */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 rounded-3xl p-6 sm:p-8 border border-indigo-100/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1.5">
              Inteligência Artificial Integrada
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">
              Dúvida entre duas marcas ou modelos? Descubra o que compensa!
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Cadastre duas opções (como Samsung vs LG, sofá de loja física vs online) e nossa IA analisa o custo-benefício, indicando a melhor economia para o casal.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('disputes')}
          className="shrink-0 w-full md:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          <span>Abrir Disputas ({disputes.length})</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Upcoming Payments Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Próximos Vencimentos de Fornecedores
              </h3>
              <p className="text-xs text-slate-500">
                Parcelas pendentes ordenadas por data de vencimento
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {upcomingInstallments.length} parcelas pendentes
          </span>
        </div>

        {upcomingInstallments.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-slate-700">Tudo pago ou nenhum vencimento agendado!</p>
            <p className="text-xs text-slate-400 mt-1">Parabéns pela organização financeira.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {upcomingInstallments.slice(0, 5).map((inst) => {
              const due = new Date(inst.dueDate + 'T00:00:00');
              const isOverdue = due < new Date() && inst.status !== 'paid';

              return (
                <div key={inst.installmentId} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isOverdue 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{inst.number}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {inst.vendorName}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hidden sm:inline-block">
                          {inst.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Vencimento: {due.toLocaleDateString('pt-BR')}</span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded">
                            VENCIDO
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {formatCurrency(inst.amount)}
                    </span>
                    <button
                      onClick={() => onPayInstallment(inst.contractId, inst.installmentId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1 transition-colors border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dar Baixa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
