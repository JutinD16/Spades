import React from 'react'
import { motion } from 'framer-motion'
import { AnimationSpeed, Difficulty } from '../../../core/types'
import { Button } from '../../ui/Button'
import { useSettingsStore } from '../../../store/settingsStore'
import { cn } from '../../../utils/helpers'

interface SettingsProps {
  onBack: () => void
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { config, updateConfig, musicVolume, sfxVolume, isMuted, toggleMute, setMusicVolume, setSfxVolume, highContrast, colorblindMode, reducedMotion, setHighContrast, setColorblindMode, setReducedMotion, resetToDefaults } = useSettingsStore()

  return (
    <div className="min-h-screen flex items-center justify-center felt-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-felt-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-gold">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        </div>

        <div className="space-y-6">
          {/* Game Rules */}
          <Section title="Game Rules">
            <Setting label="Target Score">
              <div className="flex gap-2">
                {[100, 250, 500].map(n => (
                  <button
                    key={n}
                    onClick={() => updateConfig({ targetScore: n })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-sans font-medium border transition-all',
                      config.targetScore === n
                        ? 'bg-gold text-felt-shadow border-gold'
                        : 'bg-felt-light text-text-primary border-white/10 hover:text-gold',
                    )}
                  >{n}</button>
                ))}
              </div>
            </Setting>

            <Toggle label="Nil Bidding" sublabel="+100 for success, -100 for failure" value={config.nilEnabled} onChange={v => updateConfig({ nilEnabled: v })} />
            <Toggle label="Blind Nil" sublabel="+200 / -200 — bid before seeing hand" value={config.blindNilEnabled} onChange={v => updateConfig({ blindNilEnabled: v })} />
            <Toggle label="Sandbag Penalty" sublabel="-100 every 10 overtricks" value={config.sandbagPenaltyEnabled} onChange={v => updateConfig({ sandbagPenaltyEnabled: v })} />
            <Toggle label="Must Break Spades" sublabel="Can't lead spades until broken" value={config.breakingSpades} onChange={v => updateConfig({ breakingSpades: v })} />
            <Toggle label="Hints" sublabel="Show legal card highlights" value={config.hintsEnabled} onChange={v => updateConfig({ hintsEnabled: v })} />
          </Section>

          {/* AI Difficulty */}
          <Section title="AI Difficulty">
            <Setting label="Difficulty">
              <div className="flex gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => updateConfig({ difficulty: d })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-sans font-medium border transition-all capitalize',
                      config.difficulty === d
                        ? 'bg-gold text-felt-shadow border-gold'
                        : 'bg-felt-light text-text-primary border-white/10 hover:text-gold',
                    )}
                  >{d.toLowerCase()}</button>
                ))}
              </div>
            </Setting>
          </Section>

          {/* Animation */}
          <Section title="Animations">
            <Setting label="Speed">
              <div className="flex gap-2">
                {(['SLOW', 'NORMAL', 'FAST', 'OFF'] as AnimationSpeed[]).map(s => (
                  <button
                    key={s}
                    onClick={() => updateConfig({ animationSpeed: s })}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium border transition-all capitalize',
                      config.animationSpeed === s
                        ? 'bg-gold text-felt-shadow border-gold'
                        : 'bg-felt-light text-text-primary border-white/10 hover:text-gold',
                    )}
                  >{s.toLowerCase()}</button>
                ))}
              </div>
            </Setting>
          </Section>

          {/* Audio */}
          <Section title="Audio">
            <Toggle label="Mute All" value={isMuted} onChange={toggleMute as unknown as (v: boolean) => void} />
            <Setting label={`Music ${Math.round(musicVolume * 100)}%`}>
              <input type="range" min="0" max="1" step="0.05" value={musicVolume}
                onChange={e => setMusicVolume(Number(e.target.value))}
                className="w-full accent-gold h-1 rounded" />
            </Setting>
            <Setting label={`SFX ${Math.round(sfxVolume * 100)}%`}>
              <input type="range" min="0" max="1" step="0.05" value={sfxVolume}
                onChange={e => setSfxVolume(Number(e.target.value))}
                className="w-full accent-gold h-1 rounded" />
            </Setting>
          </Section>

          {/* Accessibility */}
          <Section title="Accessibility">
            <Toggle label="High Contrast" value={highContrast} onChange={setHighContrast} />
            <Toggle label="Colorblind Mode" sublabel="Adds shape indicators to suits" value={colorblindMode} onChange={setColorblindMode} />
            <Toggle label="Reduced Motion" value={reducedMotion} onChange={setReducedMotion} />
          </Section>

          <Button variant="danger" size="sm" onClick={resetToDefaults} className="w-full mt-2">
            Reset to Defaults
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-sans text-text-muted uppercase tracking-widest mb-3 border-b border-white/10 pb-1">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
)

const Setting: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm font-sans text-text-primary">{label}</span>
    {children}
  </div>
)

const Toggle: React.FC<{ label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, sublabel, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-sm font-sans text-text-primary">{label}</div>
      {sublabel && <div className="text-xs font-sans text-text-muted">{sublabel}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-all duration-200',
        value ? 'bg-gold' : 'bg-white/20',
      )}
      role="switch"
      aria-checked={value}
    >
      <span className={cn(
        'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
        value ? 'left-5' : 'left-1',
      )} />
    </button>
  </div>
)
