import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  getSettings, 
  saveSettings, 
  getContracts, 
  saveContracts, 
  getProducts, 
  saveProducts, 
  getDisputes, 
  saveDisputes,
  DEFAULT_SETTINGS,
  INITIAL_CONTRACTS,
  INITIAL_PRODUCTS,
  INITIAL_DISPUTES
} from './services/storage';
import { 
  CoupleSettings, 
  WeddingContract, 
  HomeProduct, 
  ItemDispute, 
  ProductStatus 
} from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { WeddingModule } from './components/WeddingModule';
import { HomeModule } from './components/HomeModule';
import { DisputeModule } from './components/DisputeModule';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wedding' | 'home' | 'disputes'>('dashboard');
  const [settings, setSettings] = useState<CoupleSettings>(getSettings);
  const [contracts, setContracts] = useState<WeddingContract[]>(getContracts);
  const [products, setProducts] = useState<HomeProduct[]>(getProducts);
  const [disputes, setDisputes] = useState<ItemDispute[]>(getDisputes);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [disputeInitialProduct, setDisputeInitialProduct] = useState<HomeProduct | null>(null);

  // Auto-save to localStorage whenever state updates
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveContracts(contracts);
  }, [contracts]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveDisputes(disputes);
  }, [disputes]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#cfa661', '#10b981', '#6366f1']
    });
  };

  // Contracts Actions
  const handleSaveContract = (contract: WeddingContract) => {
    setContracts(prev => {
      const idx = prev.findIndex(c => c.id === contract.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = contract;
        return updated;
      }
      return [contract, ...prev];
    });
  };

  const handleDeleteContract = (contractId: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setContracts(prev => prev.filter(c => c.id !== contractId));
    }
  };

  const handlePayInstallment = (contractId: string, installmentId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      const updatedInstallments = c.installments.map(i => {
        if (i.id !== installmentId) return i;
        return {
          ...i,
          status: 'paid' as const,
          paidAt: new Date().toISOString().split('T')[0]
        };
      });
      return { ...c, installments: updatedInstallments };
    }));

    triggerCelebration();
  };

  // Products Actions
  const handleSaveProduct = (product: HomeProduct) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Excluir este item da casa?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleUpdateProductStatus = (productId: string, status: ProductStatus, paidPrice?: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const isNowPurchased = status === 'purchased' || status === 'delivered';
      return {
        ...p,
        status,
        paidPrice: paidPrice !== undefined ? paidPrice : (isNowPurchased ? (p.paidPrice || p.estimatedPrice) : p.paidPrice),
        purchasedAt: isNowPurchased && !p.purchasedAt ? new Date().toISOString().split('T')[0] : p.purchasedAt
      };
    }));

    if (status === 'purchased' || status === 'delivered') {
      triggerCelebration();
    }
  };

  const handleStartDisputeFromProduct = (product: HomeProduct) => {
    setDisputeInitialProduct(product);
    setActiveTab('disputes');
  };

  // Disputes Actions
  const handleSaveDispute = (dispute: ItemDispute) => {
    setDisputes(prev => {
      const idx = prev.findIndex(d => d.id === dispute.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = dispute;
        return updated;
      }
      return [dispute, ...prev];
    });
  };

  const handleDeleteDispute = (disputeId: string) => {
    if (confirm('Excluir esta disputa?')) {
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
    }
  };

  const handleChooseWinner = (dispute: ItemDispute, winner: 'A' | 'B') => {
    const winningOption = winner === 'A' ? dispute.optionA : dispute.optionB;
    
    // Update dispute status
    const updatedDispute: ItemDispute = {
      ...dispute,
      decisionStatus: winner === 'A' ? 'chosen_A' : 'chosen_B'
    };
    handleSaveDispute(updatedDispute);

    // Auto add / update in Home Products list
    const existingIndex = products.findIndex(p => 
      p.name.toLowerCase() === winningOption.name.toLowerCase() ||
      dispute.title.toLowerCase().includes(p.name.toLowerCase())
    );

    if (existingIndex >= 0) {
      const existing = products[existingIndex];
      handleSaveProduct({
        ...existing,
        name: winningOption.name,
        estimatedPrice: winningOption.price,
        brandOrModel: winningOption.brand || existing.brandOrModel,
        specs: winningOption.specs || existing.specs,
        storeLink: winningOption.link || existing.storeLink,
        status: 'researched'
      });
    } else {
      handleSaveProduct({
        id: `prod-winner-${Date.now()}`,
        room: dispute.room,
        name: winningOption.name,
        estimatedPrice: winningOption.price,
        status: 'researched',
        priority: 'Alta',
        brandOrModel: winningOption.brand,
        specs: winningOption.specs,
        storeLink: winningOption.link,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    triggerCelebration();
  };

  // Export & Import
  const handleExportData = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      contracts,
      products,
      disputes
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-casamento-${settings.coupleName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (rawJson: string) => {
    const data = JSON.parse(rawJson);
    if (data.settings) setSettings(data.settings);
    if (Array.isArray(data.contracts)) setContracts(data.contracts);
    if (Array.isArray(data.products)) setProducts(data.products);
    if (Array.isArray(data.disputes)) setDisputes(data.disputes);
  };

  const handleResetData = () => {
    if (confirm('Deseja restaurar todos os dados para os exemplos padrão?')) {
      setSettings(DEFAULT_SETTINGS);
      setContracts(INITIAL_CONTRACTS);
      setProducts(INITIAL_PRODUCTS);
      setDisputes(INITIAL_DISPUTES);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-slate-800">
      
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            settings={settings}
            contracts={contracts}
            products={products}
            disputes={disputes}
            onNavigate={setActiveTab}
            onPayInstallment={handlePayInstallment}
          />
        )}

        {activeTab === 'wedding' && (
          <WeddingModule
            contracts={contracts}
            onSaveContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
            onPayInstallment={handlePayInstallment}
          />
        )}

        {activeTab === 'home' && (
          <HomeModule
            products={products}
            geminiApiKey={settings.geminiApiKey}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStatus={handleUpdateProductStatus}
            onStartDisputeFromProduct={handleStartDisputeFromProduct}
          />
        )}

        {activeTab === 'disputes' && (
          <DisputeModule
            disputes={disputes}
            geminiApiKey={settings.geminiApiKey}
            onSaveDispute={handleSaveDispute}
            onDeleteDispute={handleDeleteDispute}
            onChooseWinner={handleChooseWinner}
            initialFromProduct={disputeInitialProduct}
            onClearInitialProduct={() => setDisputeInitialProduct(null)}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 hidden md:block">
        <p>
          Feito com carinho para o planejamento de <strong>{settings.coupleName || 'Casamento & Lar'}</strong> 💍🏡
        </p>
      </footer>

    </div>
  );
};
