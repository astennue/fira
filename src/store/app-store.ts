import { create } from 'zustand';
import type { AppUser, ViewName } from '@/lib/types';

interface AppState {
  // Auth
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Navigation (client-side routing)
  currentView: ViewName;
  navigate: (view: ViewName) => void;
  previousView: ViewName | null;

  // Selected items
  selectedJobOrderId: string | null;
  selectedApplicationId: string | null;
  selectedApplicantId: string | null;
  selectedEndorsementId: string | null;
  setSelectedJobOrderId: (id: string | null) => void;
  setSelectedApplicationId: (id: string | null) => void;
  setSelectedApplicantId: (id: string | null) => void;
  setSelectedEndorsementId: (id: string | null) => void;

  // Modals
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      currentView: user ? getDefaultView(user.role) : 'landing',
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      currentView: 'landing',
      selectedJobOrderId: null,
      selectedApplicationId: null,
    }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Navigation
  currentView: 'landing',
  previousView: null,
  navigate: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
      sidebarOpen: false,
    })),

  // Selected items
  selectedJobOrderId: null,
  selectedApplicationId: null,
  selectedApplicantId: null,
  selectedEndorsementId: null,
  setSelectedJobOrderId: (id) => set({ selectedJobOrderId: id }),
  setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),
  setSelectedApplicantId: (id) => set({ selectedApplicantId: id }),
  setSelectedEndorsementId: (id) => set({ selectedEndorsementId: id }),

  // Modals
  authModalOpen: false,
  authModalMode: 'login',
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalMode: (mode) => set({ authModalMode: mode }),

  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

function getDefaultView(role: string): ViewName {
  switch (role) {
    case 'applicant':
      return 'applicant-dashboard';
    case 'agency_admin':
    case 'agency_member':
      return 'agency-dashboard';
    case 'fira':
      return 'fira-dashboard';
    case 'employer':
      return 'employer-dashboard';
    default:
      return 'landing';
  }
}