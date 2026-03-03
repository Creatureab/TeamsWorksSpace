// ✓ FIXED: State management for optimistic updates (no more window.reload())
import { create } from 'zustand';
import { Page } from '@/types/page';

interface PageState {
    pages: Page[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setPages: (pages: Page[]) => void;
    addPage: (page: Partial<Page>) => void;
    updatePage: (id: string, updates: Partial<Page>) => void;
    removePage: (id: string) => void;
    replaceTemp: (tempId: string, realPage: Page) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const usePageStore = create<PageState>((set, get) => ({
    pages: [],
    isLoading: false,
    error: null,

    setPages: (pages) => set({ pages }),

    addPage: (page) => set((state) => ({
        pages: [...state.pages, {
            ...page,
            id: page.id || `temp-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            content: page.content || [],
            path: page.path || [],
            level: page.level || 0,
            order: page.order || 0,
            slug: page.slug || '',
            workspaceId: page.workspaceId || '',
            createdBy: page.createdBy || 'current-user',
        } as Page]
    })),

    updatePage: (id, updates) => set((state) => ({
        pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    removePage: (id) => set((state) => ({
        pages: state.pages.filter(p => p.id !== id)
    })),

    replaceTemp: (tempId, realPage) => set((state) => ({
        pages: state.pages.map(p => p.id === tempId ? realPage : p)
    })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));