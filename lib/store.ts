import { create } from 'zustand';

export interface InventoryProduct {
    id: string;
    name: string;
    category?: string;
    supplier?: string;
    unitCost: number;
    stockLevel?: string | number;
    abcClass?: string;
    [key: string]: any;
}

export interface DemandForecast {
    id: string;
    name: string;
    currentMonth: number;
    nextMonth: number;
    next3Months: number;
    trend: string;
    confidence: number;
    keyFactors: string[];
}

interface StoreState {
    inventory: InventoryProduct[];
    setInventory: (products: InventoryProduct[]) => void;
    demandForecast: DemandForecast[];
    setDemandForecast: (forecast: DemandForecast[]) => void;
}

export const useGlobalStore = create<StoreState>((set) => ({
    inventory: [],
    setInventory: (products) => set({ inventory: products }),
    demandForecast: [],
    setDemandForecast: (forecast) => set({ demandForecast: forecast }),
})); 