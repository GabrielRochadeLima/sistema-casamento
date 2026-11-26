export type WeddingCategory = 
  | 'Local / Espaço'
  | 'Buffet & Bebidas'
  | 'Foto & Filmagem'
  | 'Decoração & Flores'
  | 'Música / DJ / Banda'
  | 'Assessoria / Cerimonial'
  | 'Vestido & Trajes'
  | 'Convites & Lembrancinhas'
  | 'Dia da Noiva / Noivo'
  | 'Outros Serviços';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Installment {
  id: string;
  number: number;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  paidAt?: string;
  paymentMethod?: 'PIX' | 'Boleto' | 'Cartão' | 'Transferência' | 'Dinheiro';
}

export interface WeddingContract {
  id: string;
  category: WeddingCategory;
  vendorName: string;
  totalAmount: number;
  downPayment: number;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  installments: Installment[];
  createdAt: string;
}

export type RoomType = 
  | 'Sala de Estar'
  | 'Cozinha'
  | 'Quarto do Casal'
  | 'Banheiro'
  | 'Área de Serviço'
  | 'Escritório / Varanda'
  | 'Geral / Outros';

export type ProductStatus = 'wishlist' | 'researched' | 'purchased' | 'delivered';
export type ProductPriority = 'Alta' | 'Média' | 'Baixa' | 'Essencial';

export interface HomeProduct {
  id: string;
  room: RoomType;
  name: string;
  estimatedPrice: number;
  paidPrice?: number;
  status: ProductStatus;
  priority: ProductPriority;
  storeLink?: string;
  brandOrModel?: string;
  specs?: string;
  notes?: string;
  createdAt: string;
  purchasedAt?: string;
}

export interface ProductOption {
  name: string;
  price: number;
  link?: string;
  specs: string;
  brand?: string;
}

export interface AIVerdict {
  recommendedOption: 'A' | 'B' | 'empate';
  title: string;
  summary: string;
  scoreA: number; // 0 - 10
  scoreB: number; // 0 - 10
  prosA: string[];
  consA: string[];
  prosB: string[];
  consB: string[];
  costBenefitVerdict: string;
  tipForCouple: string;
}

export interface ItemDispute {
  id: string;
  title: string;
  room: RoomType;
  optionA: ProductOption;
  optionB: ProductOption;
  decisionStatus: 'open' | 'chosen_A' | 'chosen_B' | 'discarded';
  aiVerdict?: AIVerdict;
  createdAt: string;
}

export interface CoupleSettings {
  coupleName: string; // ex: "Gabriel & Amanda"
  weddingDate: string; // YYYY-MM-DD
  weddingBudget: number;
  homeBudget: number;
  couplePasscode: string;
  geminiApiKey?: string;
}
