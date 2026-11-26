import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  Tv, 
  Utensils, 
  Bed, 
  Bath, 
  Shirt, 
  Lamp, 
  ExternalLink,
  Trash2,
  Scale,
  Sparkles,
  Tag,
  Link,
  Wand2,
  Loader2
} from 'lucide-react';
import { HomeProduct, RoomType, ProductStatus, ProductPriority } from '../types';
import { extractProductFromUrl } from '../services/scraper';

interface HomeModuleProps {
  products: HomeProduct[];
  geminiApiKey?: string;
  onSaveProduct: (product: HomeProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStatus: (productId: string, status: ProductStatus, paidPrice?: number) => void;
  onStartDisputeFromProduct: (product: HomeProduct) => void;
}

const ROOMS: { type: RoomType; icon: React.ReactNode }[] = [
  { type: 'Sala de Estar', icon: <Tv className="w-4 h-4" /> },
  { type: 'Cozinha', icon: <Utensils className="w-4 h-4" /> },
  { type: 'Quarto do Casal', icon: <Bed className="w-4 h-4" /> },
  { type: 'Banheiro', icon: <Bath className="w-4 h-4" /> },
  { type: 'Área de Serviço', icon: <Shirt className="w-4 h-4" /> },
  { type: 'Escritório / Varanda', icon: <Lamp className="w-4 h-4" /> },
  { type: 'Geral / Outros', icon: <Home className="w-4 h-4" /> },
];

export const HomeModule: React.FC<HomeModuleProps> = ({
  products,
  geminiApiKey,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStatus,
  onStartDisputeFromProduct,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    room: RoomType;
    name: string;
    estimatedPrice: string;
    priority: ProductPriority;
    status: ProductStatus;
    brandOrModel: string;
    specs: string;
    storeLink: string;
  }>({
    room: 'Sala de Estar',
    name: '',
    estimatedPrice: '',
    priority: 'Alta',
    status: 'wishlist',
    brandOrModel: '',
    specs: '',
    storeLink: ''
  });

  const handleExtractFromUrl = async (customUrl?: string) => {
    const targetUrl = customUrl || formData.storeLink;
    if (!targetUrl || !targetUrl.trim()) {
      setExtractError('Por favor, cole um link válido da loja primeiro.');
      return;
    }
    setIsExtracting(true);
    setExtractError(null);
    try {
      const extracted = await extractProductFromUrl(targetUrl.trim(), geminiApiKey);
      setFormData(prev => ({
        ...prev,
        storeLink: targetUrl.trim(),
        name: extracted.name || prev.name,
        brandOrModel: extracted.brand || prev.brandOrModel,
        estimatedPrice: extracted.estimatedPrice ? String(extracted.estimatedPrice) : prev.estimatedPrice,
        room: extracted.room || prev.room,
        priority: extracted.priority || prev.priority,
        specs: extracted.specs || prev.specs
      }));
    } catch (err: any) {
      setExtractError(err?.message || 'Não foi possível extrair os dados automaticamente deste link.');
    } finally {
      setIsExtracting(false);
    }
  };

  const totalEstimated = products.reduce((acc, p) => acc + (p.paidPrice || p.estimatedPrice), 0);
  const totalPurchased = products
    .filter(p => p.status === 'purchased' || p.status === 'delivered')
    .reduce((acc, p) => acc + (p.paidPrice || p.estimatedPrice), 0);
  const totalPending = totalEstimated - totalPurchased;

  const filteredProducts = products.filter(p => {
    const matchesRoom = selectedRoom === 'all' || p.room === selectedRoom;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brandOrModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specs?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      room: (selectedRoom !== 'all' ? selectedRoom : 'Sala de Estar') as RoomType,
      name: '',
      estimatedPrice: '',
      priority: 'Alta',
      status: 'wishlist',
      brandOrModel: '',
      specs: '',
      storeLink: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const est = parseFloat(formData.estimatedPrice.replace(',', '.')) || 0;
    if (!formData.name.trim() || est <= 0) return;

    const newProd: HomeProduct = {
      id: formData.id || `prod-${Date.now()}`,
      room: formData.room,
      name: formData.name.trim(),
      estimatedPrice: est,
      priority: formData.priority,
      status: formData.status,
      brandOrModel: formData.brandOrModel.trim() || undefined,
      specs: formData.specs.trim() || undefined,
      storeLink: formData.storeLink.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveProduct(newProd);
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getPriorityBadge = (p: ProductPriority) => {
    switch (p) {
      case 'Essencial':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Alta':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Média':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (s: ProductStatus) => {
    switch (s) {
      case 'delivered':
        return { label: 'Entregue', style: 'bg-emerald-100 text-emerald-800' };
      case 'purchased':
        return { label: 'Comprado', style: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
      case 'researched':
        return { label: 'Em Pesquisa', style: 'bg-indigo-50 text-indigo-700 border border-indigo-200' };
      default:
        return { label: 'Lista de Desejos', style: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Home className="w-7 h-7 text-emerald-600 fill-emerald-100" />
            <span>Montagem da Casa Nova & Cômodos</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Planeje os móveis, eletrodomésticos e eletrônicos para cada ambiente do novo lar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Item para a Casa</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Orçamento Estimado Total</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
            {formatCurrency(totalEstimated)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">{products.length} itens cadastrados</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-xs text-emerald-700 font-medium block">Já Comprado / Investido</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 block">
            {formatCurrency(totalPurchased)}
          </span>
          <span className="text-xs text-emerald-600/80 mt-1 block">
            {totalEstimated > 0 ? `${((totalPurchased / totalEstimated) * 100).toFixed(0)}% concluído` : '0%'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Previsão Restante</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-700 mt-1 block">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Ainda a comprar</span>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setSelectedRoom('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            selectedRoom === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Todos os Cômodos ({products.length})</span>
        </button>

        {ROOMS.map(r => {
          const count = products.filter(p => p.room === r.type).length;
          return (
            <button
              key={r.type}
              onClick={() => setSelectedRoom(r.type)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedRoom === r.type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {r.icon}
              <span>{r.type}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedRoom === r.type ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar produto por nome, marca ou características..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum item cadastrado neste cômodo</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Adicione itens como Sofá, TV, Cama, Geladeira para começar o controle da casa.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isPurchased = product.status === 'purchased' || product.status === 'delivered';
            const statusInfo = getStatusBadge(product.status);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {product.room}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(product.priority)}`}>
                        {product.priority}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.style}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Brand */}
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h4>
                  {product.brandOrModel && (
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {product.brandOrModel}
                    </p>
                  )}

                  {/* Specs & Notes */}
                  {product.specs && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {product.specs}
                    </p>
                  )}

                  {/* Store Link */}
                  {product.storeLink && (
                    <a
                      href={product.storeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver link da loja</span>
                    </a>
                  )}
                </div>

                {/* Bottom Financial & Action Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {isPurchased ? 'Valor Pago' : 'Previsão'}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(product.paidPrice || product.estimatedPrice)}
                      </span>
                    </div>

                    {/* Quick Dispute / AI Button */}
                    <button
                      onClick={() => onStartDisputeFromProduct(product)}
                      title="Comparar com outro item usando IA"
                      className="text-xs px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1 transition-colors border border-indigo-200/60"
                    >
                      <Scale className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Disputar (IA)</span>
                    </button>
                  </div>

                  {/* Status Toggle Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/60">
                    <select
                      value={product.status}
                      onChange={(e) => onUpdateStatus(product.id, e.target.value as ProductStatus)}
                      className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="wishlist">Na Lista de Desejos</option>
                      <option value="researched">Em Pesquisa / Orçamento</option>
                      <option value="purchased">Já Comprado</option>
                      <option value="delivered">Entregue em Casa</option>
                    </select>

                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold font-display text-slate-900">
                Adicionar Item para a Casa
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Magic Link Auto-fill Box */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50/50 rounded-2xl border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Puxar Informações por Link da Loja</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 font-bold px-2 py-0.5 rounded-full">
                    Preenchimento Automático
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Cole o link do Mercado Livre, Amazon, Magalu..."
                      value={formData.storeLink}
                      onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExtractFromUrl();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isExtracting || !formData.storeLink.trim()}
                    onClick={() => handleExtractFromUrl()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Puxando...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Puxar Dados</span>
                      </>
                    )}
                  </button>
                </div>
                {extractError ? (
                  <p className="text-[11px] text-rose-600 font-medium">{extractError}</p>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    Dica: Ao clicar em <strong>Puxar Dados</strong>, o nome, marca, cômodo sugerido e especificações serão preenchidos automaticamente.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cômodo
                  </label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value as RoomType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {ROOMS.map(r => (
                      <option key={r.type} value={r.type}>{r.type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProductPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Essencial">Essencial (Sem isso não muda)</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa (Pode esperar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nome do Item / Móvel / Eletro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Smart TV 55', Sofá Retrátil, Geladeira Frost Free..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Preço Estimado ou Pago (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 2800"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="wishlist">Lista de Desejos</option>
                    <option value="researched">Em Pesquisa / Cotação</option>
                    <option value="purchased">Já Comprado</option>
                    <option value="delivered">Entregue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Marca / Modelo em Mente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Samsung QLED 55' ou LG QNED, Brastemp Inverse..."
                  value={formData.brandOrModel}
                  onChange={(e) => setFormData({ ...formData, brandOrModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Especificações / Medidas Importantes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Medida máxima 2.20m, 120Hz para videogames, voltagem 110V..."
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Link da Loja / Produto
                </label>
                <input
                  type="url"
                  placeholder="https://www.magazineluiza.com.br/..."
                  value={formData.storeLink}
                  onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-200 transition-colors"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
