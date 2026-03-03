import { create } from 'zustand'

interface AppState {
  sidebar: { isOpen: boolean }
  shortcuts: { isOpen: boolean }
  search: { query: string }
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  toggleShortcuts: () => void
  closeShortcuts: () => void
  setSearch: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebar: { isOpen: false },
  shortcuts: { isOpen: false },
  search: { query: '' },
  toggleSidebar: () => set((s) => ({ sidebar: { isOpen: !s.sidebar.isOpen } })),
  closeSidebar: () => set({ sidebar: { isOpen: false } }),
  openSidebar: () => set({ sidebar: { isOpen: true } }),
  toggleShortcuts: () => set((s) => ({ shortcuts: { isOpen: !s.shortcuts.isOpen } })),
  closeShortcuts: () => set({ shortcuts: { isOpen: false } }),
  setSearch: (query) => set({ search: { query } }),
}))
