import { create } from "zustand";

interface MarketplaceFiltersUiState {
  filtersSheetOpen: boolean;
  setFiltersSheetOpen: (open: boolean) => void;
}

export const useMarketplaceFiltersStore = create<MarketplaceFiltersUiState>((set) => ({
  filtersSheetOpen: false,
  setFiltersSheetOpen: (open) => set({ filtersSheetOpen: open }),
}));
