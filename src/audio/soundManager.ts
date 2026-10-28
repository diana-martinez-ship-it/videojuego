/**
 * Procedural Web Audio API sound generator for authentic retro arcade fighting games
 * Includes retro chiptune mariachi BGM, impact sounds, and Mexican arcade voice announcer.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimeout: number | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playSelect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playPunch(heavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Noise burst for impact punch
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(heavy ? 600 : 1200, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.1);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(heavy ? 0.8 : 0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    // Tonal punch thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(heavy ? 160 : 220, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.12);
    osc.stop(t + 0.12);
  }

  public playKick(heavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(heavy ? 120 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.18);

    gain.gain.setValueAtTime(heavy ? 0.9 : 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playBlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playSpecial() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Rising sweep + sparkle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  public playSuper() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Dramatic time freeze bass drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(260, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.4);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);

    sub.start(t);
    sub.stop(t + 0.5);

    // Chime flare
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(freq, t + idx * 0.04);
      chimeGain.gain.setValueAtTime(0.2, t + idx * 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.4);

      chime.connect(chimeGain);
      chimeGain.connect(this.sfxGain);

      chime.start(t + idx * 0.04);
      chime.stop(t + idx * 0.04 + 0.4);
    });
  }

  public playKO() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Huge explosion crash
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(40, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.7);

    this.announce('¡K.O.!');
  }

  public playCarritoRattle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const clickTime = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, clickTime);
      gain.gain.setValueAtTime(0.3, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.01, clickTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.04);
    }
  }

  // --- Voice Announcer ---

  public announce(phrase: string) {
    if (this.isMuted) return;

    // Use speech synthesis for real voice announcement if available
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase.replace(/[¡!]/g, ''));
        utterance.rate = 1.15;
        utterance.pitch = 1.05;
        utterance.lang = 'es-MX';

        const voices = window.speechSynthesis.getVoices();
        const mxVoice = voices.find(v => v.lang.includes('es-MX') || v.lang.includes('es'));
        if (mxVoice) {
          utterance.voice = mxVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback tone if speech fails
        this.playGong();
      }
    } else {
      this.playGong();
    }
  }

  public playGong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, t); // E4
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  // --- Procedural 16-Bit Mexican Mariachi Arcade Music ---

  public startMariachiBGM() {
    if (this.bgmPlaying) return;
    this.initContext();
    this.bgmPlaying = true;
    this.playBGMSequence();
  }

  public stopMariachiBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimeout) {
      window.clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  private playBGMSequence() {
    if (!this.bgmPlaying || !this.ctx || !this.bgmGain) return;

    const tempo = 138;
    const beatSec = 60 / tempo;
    const startTime = this.ctx.currentTime + 0.05;

    // Mariachi / Mexican Arcade chord progression in D major (D - A - G - A)
    // Notes: D4=293.66, F#4=369.99, A4=440.00, B4=493.88, C#5=554.37, D5=587.33, E5=659.25
    const melodyPattern = [
      // Measure 1 (D)
      { note: 293.66, dur: 0.25, time: 0 },
      { note: 369.99, dur: 0.25, time: 0.25 },
      { note: 440.00, dur: 0.5, time: 0.5 },
      { note: 587.33, dur: 0.5, time: 1.0 },
      { note: 440.00, dur: 0.25, time: 1.5 },
      { note: 369.99, dur: 0.25, time: 1.75 },

      // Measure 2 (A)
      { note: 440.00, dur: 0.5, time: 2.0 },
      { note: 493.88, dur: 0.25, time: 2.5 },
      { note: 440.00, dur: 0.25, time: 2.75 },
      { note: 369.99, dur: 0.5, time: 3.0 },
      { note: 329.63, dur: 0.5, time: 3.5 },

      // Measure 3 (G)
      { note: 392.00, dur: 0.25, time: 4.0 },
      { note: 493.88, dur: 0.25, time: 4.25 },
      { note: 587.33, dur: 0.5, time: 4.5 },
      { note: 659.25, dur: 0.5, time: 5.0 },
      { note: 587.33, dur: 0.5, time: 5.5 },

      // Measure 4 (A7 / Turnaround)
      { note: 554.37, dur: 0.5, time: 6.0 },
      { note: 440.00, dur: 0.5, time: 6.5 },
      { note: 369.99, dur: 0.25, time: 7.0 },
      { note: 329.63, dur: 0.25, time: 7.25 },
      { note: 293.66, dur: 0.5, time: 7.5 },
    ];

    // Play melody with bright trumpet-like sawtooth + filter
    melodyPattern.forEach(m => {
      if (!this.ctx || !this.bgmGain) return;
      const t = startTime + m.time * beatSec;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(m.note, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + m.dur * beatSec * 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + m.dur * beatSec);
    });

    // Guitarrón bassline (D2 = 73.42, A1 = 55.0, G1 = 49.0)
    const bassPattern = [
      { note: 73.42, time: 0 },
      { note: 110.0, time: 1.0 },
      { note: 55.0, time: 2.0 },
      { note: 82.41, time: 3.0 },
      { note: 49.0, time: 4.0 },
      { note: 73.42, time: 5.0 },
      { note: 55.0, time: 6.0 },
      { note: 82.41, time: 7.0 },
    ];

    bassPattern.forEach(b => {
      if (!this.ctx || !this.bgmGain) return;
      const t = startTime + b.time * beatSec;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(b.note, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8 * beatSec);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.8 * beatSec);
    });

    const loopDurationMs = 8 * beatSec * 1000;
    this.bgmTimeout = window.setTimeout(() => {
      if (this.bgmPlaying) {
        this.playBGMSequence();
      }
    }, loopDurationMs - 50);
  }
}

export const soundManager = new SoundManager();
