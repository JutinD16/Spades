import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameConfig } from '../core/types'
import { DEFAULT_CONFIG } from '../core/constants'

interface SettingsStore {
  config: GameConfig
  musicVolume: number
  sfxVolume: number
  isMuted: boolean
  highContrast: boolean
  colorblindMode: boolean
  reducedMotion: boolean

  updateConfig: (updates: Partial<GameConfig>) => void
  setMusicVolume: (vol: number) => void
  setSfxVolume: (vol: number) => void
  toggleMute: () => void
  setHighContrast: (v: boolean) => void
  setColorblindMode: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      musicVolume: 0.4,
      sfxVolume: 0.7,
      isMuted: false,
      highContrast: false,
      colorblindMode: false,
      reducedMotion: false,

      updateConfig: (updates) =>
        set(state => ({ config: { ...state.config, ...updates } })),

      setMusicVolume: (vol) => set({ musicVolume: vol }),
      setSfxVolume: (vol) => set({ sfxVolume: vol }),
      toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
      setHighContrast: (v) => set({ highContrast: v }),
      setColorblindMode: (v) => set({ colorblindMode: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      resetToDefaults: () => set({
        config: DEFAULT_CONFIG,
        musicVolume: 0.4,
        sfxVolume: 0.7,
        isMuted: false,
        highContrast: false,
        colorblindMode: false,
        reducedMotion: false,
      }),
    }),
    { name: 'spades-settings' },
  ),
)
