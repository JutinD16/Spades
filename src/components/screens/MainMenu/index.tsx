import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../ui/Button'
import { useGameStore } from '../../../store/gameStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { Settings } from '../Settings'
import { HowToPlay } from '../HowToPlay'

type MenuView = 'main' | 'settings' | 'howtoplay' | 'custom'

export const MainMenu: React.FC = () => {
  const [view, setView] = useState<MenuView>('main')
  const { startMatch } = useGameStore()
  const { config } = useSettingsStore()

  if (view === 'settings') return <Settings onBack={() => setView('main')} />
  if (view === 'howtoplay') return <HowToPlay onBack={() => setView('main')} />
  if (view === 'custom') return <Settings onBack={() => setView('main')} />

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center felt-surface relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-12 text-8xl opacity-5 rotate-12 select-none font-display">♠</div>
        <div className="absolute top-20 right-16 text-7xl opacity-5 -rotate-6 select-none font-display" style={{ color: '#C41E3A' }}>♥</div>
        <div className="absolute bottom-16 left-20 text-6xl opacity-5 rotate-3 select-none font-display" style={{ color: '#C41E3A' }}>♦</div>
        <div className="absolute bottom-12 right-12 text-8xl opacity-5 -rotate-12 select-none font-display">♣</div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8 z-10"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
          <div className="text-7xl text-gold select-none" style={{ textShadow: '0 0 40px rgba(200,151,58,0.4)' }}>♠</div>
          <h1 className="font-display text-6xl font-bold text-gold tracking-wider"
            style={{ textShadow: '0 2px 20px rgba(200,151,58,0.3)' }}>
            SPADES
          </h1>
          <p className="text-text-muted font-sans text-sm tracking-widest uppercase">Classic Card Game</p>
        </motion.div>

        {/* Menu buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-56">
          <Button
            variant="primary"
            size="lg"
            onClick={() => startMatch(config)}
            className="font-display text-xl"
          >
            Quick Play
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setView('custom')}
            className="font-sans"
          >
            Custom Match
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setView('howtoplay')}
            className="font-sans"
          >
            How to Play
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setView('settings')}
            className="font-sans"
          >
            Settings
          </Button>
        </motion.div>

        {/* Current settings peek */}
        <motion.div variants={itemVariants} className="text-xs font-sans text-text-muted text-center space-y-0.5">
          <div>Target: {config.targetScore} pts · {config.difficulty} difficulty</div>
          <div>
            {[
              config.nilEnabled && 'Nil',
              config.blindNilEnabled && 'Blind Nil',
              config.sandbagPenaltyEnabled && 'Bags',
              config.breakingSpades && 'Break ♠',
            ].filter(Boolean).join(' · ')}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Custom match routes to Settings for configuration
export const CustomMatch: React.FC<{ onBack: () => void; onStart: () => void }> = ({ onBack, onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center felt-surface">
      <div className="bg-felt-dark border border-white/10 rounded-2xl p-8 w-96">
        <h2 className="font-display text-2xl text-gold mb-6 text-center">Custom Match</h2>
        <p className="text-text-muted font-sans text-sm text-center mb-6">
          Configure settings before starting.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack} className="flex-1">Back</Button>
          <Button variant="primary" onClick={onStart} className="flex-1">Start</Button>
        </div>
      </div>
    </div>
  )
}
