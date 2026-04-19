import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../ui/Button'

interface HowToPlayProps {
  onBack: () => void
}

const sections = [
  {
    title: 'The Basics',
    icon: '♠',
    content: [
      'Spades is a trick-taking card game for 4 players divided into 2 teams of 2.',
      'You (South) are partners with North against West and East.',
      'The full 52-card deck is dealt — 13 cards per player.',
      'Spades are always the trump suit and beat cards of any other suit.',
    ],
  },
  {
    title: 'Bidding',
    icon: '🎯',
    content: [
      'Before play begins, each player bids how many tricks they expect to win.',
      'Bids range from 1–13. Your bid + partner\'s bid = your team\'s contract.',
      'Nil (0): Bid that you\'ll win zero tricks. Success = +100, failure = -100.',
      'Blind Nil: Bid nil before seeing your hand. Higher risk and reward (+200/-200).',
      'You cannot bid 0 unless choosing Nil. Minimum regular bid is 1.',
    ],
  },
  {
    title: 'Playing Tricks',
    icon: '🃏',
    content: [
      'The player left of the dealer leads the first card of each trick.',
      'You must follow the lead suit if you have cards in that suit.',
      'If you can\'t follow suit, you may play any card including spades (trump).',
      'The winner of each trick leads the next trick.',
      'Spades cannot be led until they have been "broken" — played on a prior trick.',
    ],
  },
  {
    title: 'Winning Tricks',
    icon: '👑',
    content: [
      'The highest card of the lead suit wins the trick.',
      'If any spades were played, the highest spade wins instead.',
      'Off-suit non-spade cards never win a trick regardless of rank.',
    ],
  },
  {
    title: 'Scoring',
    icon: '📊',
    content: [
      'Made contract: Bid × 10 points (e.g. bid 5, win 5 = +50).',
      'Missed contract: -(Bid × 10) points (e.g. bid 5, win 3 = -50).',
      'Overtricks (bags): +1 each. But beware — 10 bags = -100 penalty!',
      'Nil success: +100 for the team. Failure: -100.',
      'Blind Nil success: +200. Failure: -200.',
      'The first team to reach 500 points wins the match.',
    ],
  },
  {
    title: 'Strategy Tips',
    icon: '💡',
    content: [
      'Count your likely winners before bidding — aces, high spades, and voids help.',
      'Protect your partner\'s nil: cover dangerous suits, dump your high cards early.',
      'Manage bags carefully — overtricks add up and penalties can swing the game.',
      'Lead trump strategically to draw out opponent\'s spades.',
      'When trailing badly, consider blind nil for a big swing.',
    ],
  },
]

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center felt-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-felt-dark border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-gold">How to Play</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium border transition-all ${
                activeSection === i
                  ? 'bg-gold text-felt-shadow border-gold'
                  : 'bg-felt-light text-text-muted border-white/10 hover:text-gold'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-display text-xl text-gold mb-4">
              {sections[activeSection].icon} {sections[activeSection].title}
            </h3>
            <ul className="space-y-3">
              {sections[activeSection].content.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-gold/60 font-sans font-bold mt-0.5">•</span>
                  <span className="text-text-primary font-sans text-sm leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            disabled={activeSection === 0}
            onClick={() => setActiveSection(s => Math.max(0, s - 1))}
          >
            ← Previous
          </Button>
          {activeSection < sections.length - 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveSection(s => s + 1)}
            >
              Next →
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onBack}>
              Got it!
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
