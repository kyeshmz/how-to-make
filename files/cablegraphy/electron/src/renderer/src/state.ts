import { create } from 'zustand'

interface StoreType {
  data: {
    x: number
    y: number
  }[]
  setData: (
    data: {
      x: number
      y: number
    }[]
  ) => void
  preset: string | null
  setPreset: (preset: string | null) => void
}

export const useDataStore = create<StoreType>((set) => ({
  data: [],
  setData: (data): void => set({ data }),
  preset: null,
  setPreset: (preset): void => set({ preset })
}))
