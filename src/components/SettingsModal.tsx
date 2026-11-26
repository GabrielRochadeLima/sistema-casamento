import React, { useState } from 'react';
import { Settings, Save, Download, Upload, Key, Heart, Shield, RefreshCw } from 'lucide-react';
import { CoupleSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CoupleSettings;
  onSaveSettings: (settings: CoupleSettings) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [formData, setFormData] = useState<CoupleSettings>({ ...settings });
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleProcessImport = () => {
    if (!importText.trim()) return;
    try {
      onImportData(importText);
      setShowImportBox(false);
      setImportText('');
      alert('Dados importados com sucesso!');
      onClose();
    } catch {
      alert('Formato JSON inválido. Verifique o arquivo copiado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Configurações & Orçamento
              </h3>
              <p className="text-xs text-slate-500">Personalize os dados do casal e chaves</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nome do Casal
            </label>
            <input
              type="text"
              required
              value={formData.coupleName}
              onChange={(e) => setFormData({ ...formData, coupleName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              placeholder="Ex: Gabriel & Eliza"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Data Prevista do Casamento
            </label>
            <input
              type="date"
              required
              value={formData.weddingDate}
              onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Teto Orçado Casamento (R$)
              </label>
              <input
                type="number"
                step="500"
                value={formData.weddingBudget}
                onChange={(e) => setFormData({ ...formData, weddingBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Teto Orçado Casa Nova (R$)
              </label>
              <input
                type="number"
                step="500"
                value={formData.homeBudget}
                onChange={(e) => setFormData({ ...formData, homeBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Código / Senha de Acesso do Casal
            </label>
            <input
              type="text"
              value={formData.couplePasscode}
              onChange={(e) => setFormData({ ...formData, couplePasscode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-500/20"
              placeholder="Ex: 1234 ou nossa-data"
            />
          </div>

          {/* Gemini API Key Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-indigo-950">
                Chave da API Google Gemini (Opcional)
              </label>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              O sistema já conta com um avaliador inteligente integrado. Se quiser conectar sua própria chave do Gemini (gratuita no Google AI Studio) para análises avançadas, cole aqui:
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={formData.geminiApiKey || ''}
              onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono"
            />
          </div>

          {/* Backup / Export / Import */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Backup e Sincronização de Dados
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dados (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar / Importar</span>
              </button>
            </div>

            {showImportBox && (
              <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Cole aqui o conteúdo JSON do backup..."
                  className="w-full p-2 text-xs font-mono border rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                >
                  Confirmar Importação
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onResetData}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões de Exemplo</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
