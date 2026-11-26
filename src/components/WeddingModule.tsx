import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  FileText, 
  Trash2, 
  Edit3,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building
} from 'lucide-react';
import { WeddingContract, WeddingCategory, Installment } from '../types';

interface WeddingModuleProps {
  contracts: WeddingContract[];
  onSaveContract: (contract: WeddingContract) => void;
  onDeleteContract: (contractId: string) => void;
  onPayInstallment: (contractId: string, installmentId: string) => void;
}

const CATEGORIES: WeddingCategory[] = [
  'Local / Espaço',
  'Buffet & Bebidas',
  'Foto & Filmagem',
  'Decoração & Flores',
  'Música / DJ / Banda',
  'Assessoria / Cerimonial',
  'Vestido & Trajes',
  'Convites & Lembrancinhas',
  'Dia da Noiva / Noivo',
  'Outros Serviços'
];

export const WeddingModule: React.FC<WeddingModuleProps> = ({
  contracts,
  onSaveContract,
  onDeleteContract,
  onPayInstallment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    category: WeddingCategory;
    vendorName: string;
    totalAmount: string;
    downPayment: string;
    installmentsCount: string;
    firstDueDate: string;
    contactName: string;
    contactPhone: string;
    notes: string;
  }>({
    category: 'Local / Espaço',
    vendorName: '',
    totalAmount: '',
    downPayment: '0',
    installmentsCount: '1',
    firstDueDate: new Date().toISOString().split('T')[0],
    contactName: '',
    contactPhone: '',
    notes: ''
  });

  const totalContracted = contracts.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalPaid = contracts.reduce((acc, c) => {
    return acc + c.installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  }, 0);
  const totalRemaining = totalContracted - totalPaid;

  const filteredContracts = contracts.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      category: 'Local / Espaço',
      vendorName: '',
      totalAmount: '',
      downPayment: '0',
      installmentsCount: '1',
      firstDueDate: new Date().toISOString().split('T')[0],
      contactName: '',
      contactPhone: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(formData.totalAmount.replace(',', '.')) || 0;
    const down = parseFloat(formData.downPayment.replace(',', '.')) || 0;
    const count = parseInt(formData.installmentsCount) || 1;

    if (!formData.vendorName.trim() || total <= 0) return;

    // Generate installments
    const installments: Installment[] = [];
    const remainingToInstall = Math.max(0, total - down);
    const installmentValue = count > 0 ? remainingToInstall / count : 0;

    // Down payment as installment #1 if > 0
    if (down > 0) {
      installments.push({
        id: `inst-down-${Date.now()}`,
        number: 1,
        amount: down,
        dueDate: formData.firstDueDate,
        status: 'paid',
        paidAt: new Date().toISOString().split('T')[0],
        paymentMethod: 'PIX'
      });
    }

    // Remaining installments
    for (let i = 0; i < count; i++) {
      const dueDate = new Date(formData.firstDueDate + 'T00:00:00');
      // Increment month for each subsequent installment
      dueDate.setMonth(dueDate.getMonth() + (down > 0 ? i + 1 : i));
      
      installments.push({
        id: `inst-${i}-${Date.now()}`,
        number: down > 0 ? i + 2 : i + 1,
        amount: Number(installmentValue.toFixed(2)),
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        paymentMethod: 'PIX'
      });
    }

    const newContract: WeddingContract = {
      id: formData.id || `contract-${Date.now()}`,
      category: formData.category,
      vendorName: formData.vendorName.trim(),
      totalAmount: total,
      downPayment: down,
      contactName: formData.contactName.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      installments,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveContract(newContract);
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-100" />
            <span>Contratos & Fornecedores do Casamento</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle de cada serviço contratado, prazos de pagamento e saldo das parcelas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total em Contratos</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
            {formatCurrency(totalContracted)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">{contracts.length} fornecedores</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-xs text-emerald-700 font-medium block">Total Já Quitado</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 block">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-xs text-emerald-600/80 mt-1 block">
            {totalContracted > 0 ? `${((totalPaid / totalContracted) * 100).toFixed(0)}% pago` : '0%'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
          <span className="text-xs text-rose-700 font-medium block">Saldo Restante a Pagar</span>
          <span className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 block">
            {formatCurrency(totalRemaining)}
          </span>
          <span className="text-xs text-rose-600/80 mt-1 block">Dividido nas parcelas futuras</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar fornecedor, observação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Category Scroll / Select */}
        <div className="w-full md:w-auto overflow-x-auto flex gap-1.5 pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({contracts.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = contracts.filter(c => c.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum fornecedor encontrado</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Comece cadastrando os fornecedores do seu casamento como Espaço, Buffet, Foto, etc.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Fornecedor</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const isExpanded = expandedContractId === contract.id;
            const paid = contract.installments
              .filter(i => i.status === 'paid')
              .reduce((sum, i) => sum + i.amount, 0);
            const remaining = contract.totalAmount - paid;
            const progress = contract.totalAmount > 0 ? (paid / contract.totalAmount) * 100 : 0;
            const nextPending = contract.installments.find(i => i.status === 'pending');

            return (
              <div 
                key={contract.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-rose-200 transition-all overflow-hidden"
              >
                {/* Contract Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {contract.vendorName}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {contract.category}
                          </span>
                          {remaining === 0 && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 100% Quitado
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          {contract.contactName && (
                            <span>Contato: {contract.contactName}</span>
                          )}
                          {contract.contactPhone && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {contract.contactPhone}
                            </span>
                          )}
                          {contract.notes && (
                            <span className="text-slate-400 italic">“{contract.notes}”</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial summary numbers */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-400 block">Total do Contrato</span>
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {formatCurrency(contract.totalAmount)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-emerald-600 block">Quitado</span>
                        <span className="text-base sm:text-lg font-bold text-emerald-600">
                          {formatCurrency(paid)}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Ver parcelas"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 shrink-0">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Expanded Section: Installments Table */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Cronograma de Pagamento ({contract.installments.length} parcelas)
                      </h4>

                      <button
                        onClick={() => onDeleteContract(contract.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Fornecedor</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                      {contract.installments.map((inst) => {
                        const isPaid = inst.status === 'paid';
                        const isOverdue = !isPaid && new Date(inst.dueDate + 'T00:00:00') < new Date();

                        return (
                          <div 
                            key={inst.id}
                            className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 transition-colors ${
                              isPaid ? 'bg-emerald-50/20' : isOverdue ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isPaid 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : isOverdue 
                                  ? 'bg-rose-100 text-rose-700' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {inst.number}
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">
                                    {formatCurrency(inst.amount)}
                                  </span>
                                  {inst.paymentMethod && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                      {inst.paymentMethod}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>Vencimento: {new Date(inst.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                  {isPaid && inst.paidAt && (
                                    <span className="text-emerald-600 font-medium ml-2">
                                      (Pago em {new Date(inst.paidAt + 'T00:00:00').toLocaleDateString('pt-BR')})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Pago</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => onPayInstallment(contract.id, inst.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirmar Pagamento</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Contract */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold font-display text-slate-900">
                Cadastrar Fornecedor do Casamento
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Categoria do Serviço
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as WeddingCategory })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nome do Fornecedor / Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa das Flores Eventos, Buffet Real..."
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Valor Total Contratado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 8500"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Valor de Entrada Já Pago (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1500"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nº de Parcelas Restantes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.installmentsCount}
                    onChange={(e) => setFormData({ ...formData, installmentsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Data do 1º Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.firstDueDate}
                    onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ana Cerimonial"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Observações / O que está incluso no contrato
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Incluso iluminação cênica e gerador de energia..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                ></textarea>
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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-colors"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
