import { CoupleSettings, WeddingContract, HomeProduct, ItemDispute } from '../types';

const SETTINGS_KEY = 'casamento_settings_v1';
const CONTRACTS_KEY = 'casamento_contracts_v1';
const PRODUCTS_KEY = 'casamento_products_v1';
const DISPUTES_KEY = 'casamento_disputes_v1';

export const DEFAULT_SETTINGS: CoupleSettings = {
  coupleName: 'Gabriel & Eliza',
  weddingDate: '2026-11-20',
  weddingBudget: 45000,
  homeBudget: 30000,
  couplePasscode: '1234',
  geminiApiKey: ''
};

export const INITIAL_CONTRACTS: WeddingContract[] = [
  {
    id: 'c1',
    category: 'Local / Espaço',
    vendorName: 'Villa das Flores Eventos',
    totalAmount: 14000,
    downPayment: 2000,
    contactName: 'Luciana',
    contactPhone: '(11) 98765-4321',
    notes: 'Espaço com área externa, inclui mesas e cadeiras de ferro.',
    createdAt: '2025-01-10',
    installments: [
      { id: 'i1-0', number: 1, amount: 2000, dueDate: '2025-01-15', status: 'paid', paidAt: '2025-01-15', paymentMethod: 'PIX' },
      { id: 'i1-1', number: 2, amount: 2000, dueDate: '2025-03-15', status: 'paid', paidAt: '2025-03-14', paymentMethod: 'PIX' },
      { id: 'i1-2', number: 3, amount: 2000, dueDate: '2025-05-15', status: 'pending', paymentMethod: 'PIX' },
      { id: 'i1-3', number: 4, amount: 2000, dueDate: '2025-07-15', status: 'pending', paymentMethod: 'PIX' },
      { id: 'i1-4', number: 5, amount: 2000, dueDate: '2025-09-15', status: 'pending', paymentMethod: 'PIX' },
      { id: 'i1-5', number: 6, amount: 2000, dueDate: '2025-11-15', status: 'pending', paymentMethod: 'PIX' },
      { id: 'i1-6', number: 7, amount: 2000, dueDate: '2026-02-15', status: 'pending', paymentMethod: 'PIX' },
    ]
  },
  {
    id: 'c2',
    category: 'Foto & Filmagem',
    vendorName: 'Memórias Eternas Fotografia',
    totalAmount: 6500,
    downPayment: 1500,
    contactName: 'Carlos Fotógrafo',
    contactPhone: '(11) 99123-5566',
    notes: 'Ensaio pré-wedding + cobertura completa da cerimônia e festa + álbum 30x30.',
    createdAt: '2025-02-01',
    installments: [
      { id: 'i2-0', number: 1, amount: 1500, dueDate: '2025-02-05', status: 'paid', paidAt: '2025-02-05', paymentMethod: 'PIX' },
      { id: 'i2-1', number: 2, amount: 1250, dueDate: '2025-06-10', status: 'pending', paymentMethod: 'Transferência' },
      { id: 'i2-2', number: 3, amount: 1250, dueDate: '2025-09-10', status: 'pending', paymentMethod: 'Transferência' },
      { id: 'i2-3', number: 4, amount: 1250, dueDate: '2025-12-10', status: 'pending', paymentMethod: 'Transferência' },
      { id: 'i2-4', number: 5, amount: 1250, dueDate: '2026-03-10', status: 'pending', paymentMethod: 'Transferência' },
    ]
  }
];

export const INITIAL_PRODUCTS: HomeProduct[] = [
  {
    id: 'p1',
    room: 'Sala de Estar',
    name: 'Smart TV 55" 4K',
    estimatedPrice: 2800,
    status: 'researched',
    priority: 'Alta',
    brandOrModel: 'Samsung QLED Q60C ou LG QNED',
    specs: '55 polegadas, 120Hz, HDMI 2.1 para games e filmes',
    createdAt: '2025-02-15'
  },
  {
    id: 'p2',
    room: 'Sala de Estar',
    name: 'Sofá Retrátil e Reclinável 3 Lugares',
    estimatedPrice: 3200,
    status: 'wishlist',
    priority: 'Essencial',
    brandOrModel: 'Tecido linho ou suede molas ensacadas 2.30m',
    specs: 'Confortável para maratonar séries, molas ensacadas.',
    createdAt: '2025-02-18'
  },
  {
    id: 'p3',
    room: 'Cozinha',
    name: 'Geladeira Frost Free Inverse Inox',
    estimatedPrice: 4200,
    status: 'purchased',
    paidPrice: 3899,
    priority: 'Essencial',
    brandOrModel: 'Brastemp Inverse BRE57AK',
    specs: '443L, Tecnologia Inverter, freezer embaixo.',
    createdAt: '2025-01-20',
    purchasedAt: '2025-02-10'
  },
  {
    id: 'p4',
    room: 'Cozinha',
    name: 'Airfryer Grande 5L+',
    estimatedPrice: 450,
    status: 'purchased',
    paidPrice: 420,
    priority: 'Média',
    brandOrModel: 'Mondial ou Philips Walita',
    specs: 'Cesto antiaderente, painel digital',
    createdAt: '2025-01-25',
    purchasedAt: '2025-02-05'
  },
  {
    id: 'p5',
    room: 'Quarto do Casal',
    name: 'Cama Box Queen com Baú + Colchão Molas Ensacadas',
    estimatedPrice: 3500,
    status: 'researched',
    priority: 'Essencial',
    brandOrModel: 'Castor ou Emma',
    specs: 'Baú bipartido para guardar roupa de cama e malas.',
    createdAt: '2025-02-20'
  }
];

export const INITIAL_DISPUTES: ItemDispute[] = [
  {
    id: 'd1',
    title: 'Disputa da TV da Sala: Samsung Q65D vs LG OLED C3',
    room: 'Sala de Estar',
    decisionStatus: 'open',
    createdAt: '2025-02-22',
    optionA: {
      name: 'Samsung QLED 55" Q65D',
      price: 2799,
      brand: 'Samsung',
      specs: 'Tecnologia Pontos Quânticos, design slim, 60Hz, SolarCell remote, brilho alto para sala clara.'
    },
    optionB: {
      name: 'LG OLED 55" Evo C3',
      price: 4499,
      brand: 'LG',
      specs: 'Painel OLED com preto perfeito, 120Hz, Dolby Vision + Atmos, 4x HDMI 2.1, processador Alpha 9.'
    },
    aiVerdict: {
      recommendedOption: 'A',
      title: 'Samsung QLED oferece melhor custo-benefício para orçamento de montagem da casa',
      summary: 'Apesar da LG OLED ter qualidade de imagem superior para cinéfilos, a diferença de R$ 1.700 (+60%) é muito pesada durante a fase de reforma e casamento.',
      scoreA: 8.8,
      scoreB: 9.3,
      prosA: [
        'Excelente custo-benefício (R$ 1.700 mais barata)',
        'Brilho forte ideal para sala com luz natural',
        'Controle SolarCell não usa pilhas'
      ],
      consA: [
        'Painel 60Hz comum',
        'Preto não tão profundo quanto OLED'
      ],
      prosB: [
        'Contraste e qualidade de cinema imbatível',
        '120Hz e 4 portas HDMI 2.1 perfeitas para PS5/Xbox',
        'Ângulo de visão perfeito'
      ],
      consB: [
        'R$ 1.700 mais cara (consome 20% do orçamento da sala)',
        'Risco de burn-in se deixar canais de notícias parados'
      ],
      costBenefitVerdict: 'A Samsung QLED ganha com folga no custo-benefício. A economia de R$ 1.700 cobre praticamente o valor da mesa de jantar ou parte do sofá.',
      tipForCouple: 'Se a sala tiver janela grande com muita luz de dia, a Samsung vai até performar melhor em reflexos. Vale a pena economizar essa quantia agora!'
    }
  }
];

// Helper to get from storage or default
export function getSettings(): CoupleSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.coupleName === 'Gabriel & Amanda') {
      parsed.coupleName = 'Gabriel & Eliza';
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: CoupleSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getContracts(): WeddingContract[] {
  try {
    const raw = localStorage.getItem(CONTRACTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CONTRACTS;
  } catch {
    return INITIAL_CONTRACTS;
  }
}

export function saveContracts(contracts: WeddingContract[]): void {
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
}

export function getProducts(): HomeProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: HomeProduct[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getDisputes(): ItemDispute[] {
  try {
    const raw = localStorage.getItem(DISPUTES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DISPUTES;
  } catch {
    return INITIAL_DISPUTES;
  }
}

export function saveDisputes(disputes: ItemDispute[]): void {
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
}
