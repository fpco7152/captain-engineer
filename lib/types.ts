export type ProductType = 'botox' | 'filler' | 'other';

export type BotoxVariant = 'Botox' | 'Dysport' | 'Jeuveau' | 'Xeomin';
export type FillerType = 'Hyaluronic Acid' | 'Radiesse' | 'Sculptra' | 'Bellafill' | 'Other';

export interface InventoryProduct {
  id: string;
  name: string;
  type: ProductType;
  botoxVariant?: BotoxVariant;
  fillerType?: FillerType;
  units: string; // e.g., "units", "syringes", "vials"
  quantity: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier: string;
  batchNumber?: string;
  expirationDate?: string;
  dateAdded: string;
  notes?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  action: 'added' | 'used' | 'removed' | 'adjusted';
  quantity: number;
  reason?: string;
  date: string;
  notes?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  recentUsage: number;
}
