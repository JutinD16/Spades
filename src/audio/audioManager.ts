// Audio manager using simple Web Audio API tones as fallback
// (no external audio files required — synthesized sounds)

type SoundEvent =
  | 'card_play'
  | 'card_deal'
  | 'trick_win'
  | 'trick_collect'
  | 'bid_select'
  | 'bid_confirm'
  | 'round_end'
  | 'match_win'
  | 'match_lose'
  | 'invalid_play'
  | 'button_hover'
  | 'button_click'

class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true
  private sfxVolume = 0.7

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.3,
  ) {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = type
      gain.gain.setValueAtTime(volume * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio not available — silent fail
    }
  }

  play(event: SoundEvent) {
    switch (event) {
      case 'card_play':
        this.playTone(440, 0.08, 'triangle', 0.2)
        break
      case 'card_deal':
        this.playTone(660, 0.05, 'triangle', 0.15)
        break
      case 'trick_win':
        this.playTone(523, 0.12, 'sine', 0.25)
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 80)
        break
      case 'trick_collect':
        this.playTone(330, 0.1, 'triangle', 0.15)
        break
      case 'bid_select':
        this.playTone(550, 0.06, 'sine', 0.1)
        break
      case 'bid_confirm':
        this.playTone(440, 0.1, 'sine', 0.2)
        setTimeout(() => this.playTone(550, 0.12, 'sine', 0.2), 70)
        break
      case 'round_end':
        this.playTone(392, 0.15, 'sine', 0.3)
        setTimeout(() => this.playTone(494, 0.15, 'sine', 0.3), 100)
        setTimeout(() => this.playTone(587, 0.2, 'sine', 0.3), 200)
        break
      case 'match_win':
        [0, 80, 160, 260].forEach((delay, i) => {
          const freqs = [523, 659, 784, 1047]
          setTimeout(() => this.playTone(freqs[i], 0.3, 'sine', 0.3), delay)
        })
        break
      case 'match_lose':
        this.playTone(330, 0.2, 'sawtooth', 0.2)
        setTimeout(() => this.playTone(262, 0.3, 'sawtooth', 0.2), 150)
        break
      case 'invalid_play':
        this.playTone(200, 0.15, 'sawtooth', 0.15)
        break
      case 'button_hover':
        this.playTone(880, 0.03, 'sine', 0.05)
        break
      case 'button_click':
        this.playTone(660, 0.05, 'triangle', 0.12)
        break
    }
  }

  setEnabled(v: boolean) { this.enabled = v }
  setSfxVolume(v: number) { this.sfxVolume = v }
}

export const audioManager = new AudioManager()
