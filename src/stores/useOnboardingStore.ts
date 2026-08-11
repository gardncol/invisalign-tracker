import { create } from 'zustand';
import type { OnboardingData } from '../types';
import { DEFAULT_GOAL_HOURS } from '../utils/constants';

interface OnboardingState {
  step: number;
  data: OnboardingData;
  setTotalTrays: (n: number) => void;
  setChangeFrequency: (n: number) => void;
  setCurrentTray: (n: number) => void;
  setDailyGoalHours: (n: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const DEFAULT_DATA: OnboardingData = {
  totalTrays: 0,
  changeFrequencyDays: 7,
  currentTray: 1,
  dailyGoalHours: DEFAULT_GOAL_HOURS,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  data: DEFAULT_DATA,

  setTotalTrays: (n) =>
    set((state) => ({ data: { ...state.data, totalTrays: n } })),

  setChangeFrequency: (n) =>
    set((state) => ({ data: { ...state.data, changeFrequencyDays: n } })),

  setCurrentTray: (n) =>
    set((state) => ({ data: { ...state.data, currentTray: n } })),

  setDailyGoalHours: (n) =>
    set((state) => ({ data: { ...state.data, dailyGoalHours: n } })),

  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  reset: () => set({ step: 0, data: DEFAULT_DATA }),
}));