import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ListingSummary } from "@/types/domain";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Comparison drawer state — snapshots of real listings the user selected
  // while browsing, not IDs looked up against a fake catalog.
  comparisonList: ListingSummary[];
  addToComparison: (listing: ListingSummary) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;

  // Preferences
  marketplaceView: "grid" | "list";
  setMarketplaceView: (view: "grid" | "list") => void;
  preferredCurrency: "USD" | "EUR" | "GBP" | "TJS";
  setPreferredCurrency: (currency: "USD" | "EUR" | "GBP" | "TJS") => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      comparisonList: [],
      addToComparison: (listing) =>
        set((state) => {
          if (state.comparisonList.some((item) => item.id === listing.id)) return state;
          if (state.comparisonList.length >= 4) return state;
          return { comparisonList: [...state.comparisonList, listing] };
        }),
      removeFromComparison: (id) =>
        set((state) => ({
          comparisonList: state.comparisonList.filter((item) => item.id !== id),
        })),
      clearComparison: () => set({ comparisonList: [] }),

      marketplaceView: "grid",
      setMarketplaceView: (view) => set({ marketplaceView: view }),
      preferredCurrency: "USD",
      setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),
    }),
    {
      name: "venturemarket-ui-preferences-v3",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        comparisonList: state.comparisonList,
        marketplaceView: state.marketplaceView,
        preferredCurrency: state.preferredCurrency,
      }),
    },
  ),
);
