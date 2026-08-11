import { create } from 'zustand';
import { getUser, updateUser, createUserFromOnboarding } from '../db/repositories/userRepo';
import type { UserProfile, OnboardingData } from '../types';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  loadUser: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,

  loadUser: async () => {
    const user = await getUser();
    set({ user, loading: false });
  },

  completeOnboarding: async (data: OnboardingData) => {
    const user = await createUserFromOnboarding(data);
    set({ user });
  },

  updateProfile: async (updates) => {
    const current = useUserStore.getState().user;
    if (!current) return;
    await updateUser(updates);
    set({ user: { ...current, ...updates } });
  },
}));