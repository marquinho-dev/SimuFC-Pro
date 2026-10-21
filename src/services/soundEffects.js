// Web Audio API Sound Synthesizer for Electrical Components
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.motorOsc = null;
    this.motorGain = null;
    this.motorFilter = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch {
      // Audio not supported or blocked
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted && this.motorGain) {
      this.motorGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  // Realistic contactor solenoid clank
  playContactorClick(energized = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-frequency mechanical impact
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(energized ? 180 : 120, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      // Low thump
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(energized ? 90 : 70, now);
      osc2.frequency.exponentialRampToValueAtTime(20, now + 0.12);

      gain2.gain.setValueAtTime(0.6, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.1);
      osc2.stop(now + 0.14);
    } catch {
      // Ignore audio error
    }
  }

  // Pushbutton snap click
  playButtonClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High frequency click impulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio error
    }
  }

  // Pushbutton mechanical spring release
  playButtonRelease() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.025);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore audio error
    }
  }

  // Emergency stop heavy mushroom latch clack
  playEmergencyLock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Heavy mechanical impact
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.1);

      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(140, now);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.14);

      gain2.gain.setValueAtTime(0.6, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.16);
    } catch {
      // Ignore audio error
    }
  }

  // Emergency stop rotate & spring release pop
  playEmergencyRelease() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore audio error
    }
  }

  // Switch / Breaker snap
  playSwitch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore audio error
    }
  }

  // Thermal relay trip sound
  playTrip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(700, now + 0.1);
      osc.frequency.setValueAtTime(950, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore audio error
    }
  }

  // Realistic electrical arc short-circuit explosion / crack sound
  playShortCircuit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.08));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Violent 120Hz/60Hz AC mains arc growl
      const arcOsc = this.ctx.createOscillator();
      const arcGain = this.ctx.createGain();
      arcOsc.type = 'sawtooth';
      arcOsc.frequency.setValueAtTime(180, now);
      arcOsc.frequency.exponentialRampToValueAtTime(60, now + 0.28);

      arcGain.gain.setValueAtTime(0.65, now);
      arcGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      arcOsc.connect(arcGain);
      arcGain.connect(this.ctx.destination);
      arcOsc.start(now);
      arcOsc.stop(now + 0.33);
    } catch {
      // Ignore audio error
    }
  }

  // Update motor sound based on RPM (0 to 1800) and stall state
  updateMotorHum(rpm, isRunning, isStalled = false) {
    if (this.muted || (!isRunning && !isStalled)) {
      if (this.motorGain && this.ctx) {
        this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return;
    }

    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (!this.motorOsc) {
        this.motorOsc = this.ctx.createOscillator();
        this.motorGain = this.ctx.createGain();
        this.motorFilter = this.ctx.createBiquadFilter();

        this.motorOsc.type = 'sawtooth';
        this.motorFilter.type = 'lowpass';
        this.motorFilter.frequency.setValueAtTime(350, now);

        this.motorOsc.connect(this.motorFilter);
        this.motorFilter.connect(this.motorGain);
        this.motorGain.connect(this.ctx.destination);

        this.motorGain.gain.setValueAtTime(0, now);
        this.motorOsc.start(now);
      }

      if (isStalled) {
        // Rotor blocked / biphasic stall: 120Hz vibrating AC hum
        this.motorOsc.type = 'sawtooth';
        this.motorOsc.frequency.setTargetAtTime(120, now, 0.05);
        this.motorFilter.frequency.setTargetAtTime(260, now, 0.05);
        this.motorGain.gain.setTargetAtTime(0.22, now, 0.05);
      } else {
        // Base 60Hz AC electrical hum + rotational harmonics
        this.motorOsc.type = 'sawtooth';
        const baseFreq = 60 + (rpm / 1800) * 120;
        this.motorOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);
        this.motorFilter.frequency.setTargetAtTime(350, now, 0.1);

        // Volume proportional to speed
        const targetVolume = Math.min(0.18, (rpm / 1800) * 0.15);
        this.motorGain.gain.setTargetAtTime(targetVolume, now, 0.1);
      }
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundSystem();
