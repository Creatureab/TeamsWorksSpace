import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, Space } from '@/lib/types/page';

const SIDEBAR_STORAGE_KEY = 'sidebar-state';

interface SidebarState {
  pages: Page[];
  expandedPageIds: Set<string>;
  expandedSpaceIds: Set<string>;
  activePageId: string | null;
  spaces: Space[];

  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  deletePage: (id: string) => void;
  renamePage: (id: string, title: string) => void;
  movePage: (id: string, parentId: string | null, newOrder: number, newSpaceId?: string) => void;
  toggleExpand: (id: string) => void;
  setExpandedPageIds: (ids: Set<string>) => void;
  setActivePage: (id: string | null) => void;
  setSpaces: (spaces: Space[]) => void;
  toggleSpaceExpand: (spaceId: string) => void;
  setExpandedSpaceIds: (ids: Set<string>) => void;
  reset: () => void;
}

const defaultState = {
  pages: [] as Page[],
  expandedPageIds: new Set<string>(),
  expandedSpaceIds: new Set<string>(),
  activePageId: null as string | null,
  spaces: [] as Space[],
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setPages: (pages) => set({ pages }),

      addPage: (page) =>
        set((state) => ({
          pages: [...state.pages.filter((p) => p.id !== page.id), page],
          expandedPageIds: new Set([...state.expandedPageIds, page.parentId ?? ''].filter(Boolean)),
        })),

      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
          expandedPageIds: new Set(state.expandedPageIds),
          activePageId: state.activePageId === id ? null : state.activePageId,
        })),

      renamePage: (id, title) =>
        set((state) => ({
          pages: state.pages.map((p) => (p.id === id ? { ...p, title, updatedAt: new Date().toISOString() } : p)),
        })),

      movePage: (id, parentId, newOrder, newSpaceId) =>
        set((state) => {
          const pages = state.pages.map((p) => {
            if (p.id !== id) return p;
            return {
              ...p,
              parentId,
              order: newOrder,
              ...(newSpaceId && { spaceId: newSpaceId, spaceType: newSpaceId.startsWith('my-space') ? 'my-space' : newSpaceId.startsWith('team-space') ? 'team-space' : 'company-space' }),
              updatedAt: new Date().toISOString(),
            };
          });
          return { pages };
        }),

      toggleExpand: (id) =>
        set((state) => {
          const next = new Set(state.expandedPageIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { expandedPageIds: next };
        }),

      setExpandedPageIds: (ids) => set({ expandedPageIds: ids }),

      setActivePage: (id) => set({ activePageId: id }),

      setSpaces: (spaces) => set({ spaces }),

      toggleSpaceExpand: (spaceId) =>
        set((state) => {
          const next = new Set(state.expandedSpaceIds);
          if (next.has(spaceId)) next.delete(spaceId);
          else next.add(spaceId);
          return { expandedSpaceIds: next };
        }),

      setExpandedSpaceIds: (ids) => set({ expandedSpaceIds: ids }),

      reset: () => set(defaultState),
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      partialize: (state) => ({
        expandedPageIds: Array.from(state.expandedPageIds),
        expandedSpaceIds: Array.from(state.expandedSpaceIds),
      }),
      merge: (persisted, current) => {
        const p = persisted as { expandedPageIds?: string[]; expandedSpaceIds?: string[] };
        return {
          ...current,
          expandedPageIds: new Set(p?.expandedPageIds ?? []),
          expandedSpaceIds: new Set(p?.expandedSpaceIds ?? []),
        };
      },
    }
  )
);
