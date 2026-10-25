import { BREAKER_AUDIO_B64, BREAKER_AUDIO_URL } from './breakerAudioData';
import {
  CONTACTOR_ON_B64,
  CONTACTOR_OFF_B64,
  CONTACTOR_ON_URL,
  CONTACTOR_OFF_URL,
} from './contactorAudioData';
import {
  MOTOR_ON_B64,
  MOTOR_OFF_B64,
  MOTOR_ON_URL,
  MOTOR_OFF_URL,
} from './motorAudioData';

// Web Audio API Sound Synthesizer for Electrical Components
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.motorOsc = null;
    this.motorGain = null;
    this.motorFilter = null;
    this.shortArcActive = false;
    this.shortArcMasterGain = null;
    this.shortArcOsc1 = null;
    this.shortArcOsc2 = null;
    this.shortArcNoiseSource = null;
    this.shortArcFilter = null;
    this.shortArcInterval = null;
    this.initialized = false;
    this._noiseBuffer = null;
    this.breakerBuffer = null;
    this.breakerAudioLoading = false;
    this.contactorOnBuffer = null;
    this.contactorOffBuffer = null;
    this.contactorAudioLoading = false;
    this.motorOnBuffer = null;
    this.motorOffBuffer = null;
    this.motorAudioLoading = false;
    this.motorRunningSource = null;
    this.motorRunningGain = null;
    this.motorAudioOn = null;
    this.motorWasRunning = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this._loadBreakerSample();
      this._loadContactorSamples();
      this._loadMotorSamples();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.initialized = true;
        this._loadBreakerSample();
        this._loadContactorSamples();
        this._loadMotorSamples();
      }
    } catch {
      // Audio not supported or blocked
    }
  }

  _loadBreakerSample() {
    if (this.breakerBuffer || this.breakerAudioLoading || !this.ctx) return;
    this.breakerAudioLoading = true;
    try {
      if (BREAKER_AUDIO_B64 && typeof atob === 'function') {
        const binaryStr = atob(BREAKER_AUDIO_B64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        this.ctx.decodeAudioData(
          bytes.buffer.slice(0),
          (decoded) => {
            this.breakerBuffer = decoded;
            this.breakerAudioLoading = false;
          },
          () => {
            this._loadBreakerFromUrl();
          }
        );
      } else {
        this._loadBreakerFromUrl();
      }
    } catch {
      this._loadBreakerFromUrl();
    }
  }

  _loadBreakerFromUrl() {
    if (!this.ctx || typeof fetch !== 'function') {
      this.breakerAudioLoading = false;
      return;
    }
    fetch(BREAKER_AUDIO_URL)
      .then((res) => res.arrayBuffer())
      .then((ab) => this.ctx.decodeAudioData(ab))
      .then((buf) => {
        this.breakerBuffer = buf;
        this.breakerAudioLoading = false;
      })
      .catch(() => {
        this.breakerAudioLoading = false;
      });
  }

  _loadContactorSamples() {
    if ((this.contactorOnBuffer && this.contactorOffBuffer) || this.contactorAudioLoading || !this.ctx) return;
    this.contactorAudioLoading = true;

    const decodeBase64Audio = (b64, fallbackUrl, callback) => {
      if (b64 && typeof atob === 'function') {
        try {
          const binaryStr = atob(b64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          this.ctx.decodeAudioData(
            bytes.buffer.slice(0),
            (decoded) => callback(decoded),
            () => fetchAudio(fallbackUrl, callback)
          );
          return;
        } catch {
          fetchAudio(fallbackUrl, callback);
          return;
        }
      }
      fetchAudio(fallbackUrl, callback);
    };

    const fetchAudio = (url, callback) => {
      if (!this.ctx || typeof fetch !== 'function' || !url) return;
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then((ab) => this.ctx.decodeAudioData(ab))
        .then((decoded) => callback(decoded))
        .catch(() => {});
    };

    decodeBase64Audio(CONTACTOR_ON_B64, CONTACTOR_ON_URL, (buf) => {
      this.contactorOnBuffer = buf;
    });

    decodeBase64Audio(CONTACTOR_OFF_B64, CONTACTOR_OFF_URL, (buf) => {
      this.contactorOffBuffer = buf;
      this.contactorAudioLoading = false;
    });
  }

  _loadMotorSamples() {
    if ((this.motorOnBuffer && this.motorOffBuffer) || this.motorAudioLoading || !this.ctx) return;
    this.motorAudioLoading = true;

    const decodeBase64Audio = (b64, fallbackUrl, callback) => {
      if (b64 && typeof atob === 'function') {
        try {
          const binaryStr = atob(b64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          this.ctx.decodeAudioData(
            bytes.buffer.slice(0),
            (decoded) => callback(decoded),
            () => fetchAudio(fallbackUrl, callback)
          );
          return;
        } catch {
          fetchAudio(fallbackUrl, callback);
          return;
        }
      }
      fetchAudio(fallbackUrl, callback);
    };

    const fetchAudio = (url, callback) => {
      if (!this.ctx || typeof fetch !== 'function' || !url) return;
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then((ab) => this.ctx.decodeAudioData(ab))
        .then((decoded) => callback(decoded))
        .catch(() => {});
    };

    decodeBase64Audio(MOTOR_ON_B64, MOTOR_ON_URL, (buf) => {
      this.motorOnBuffer = buf;
    });

    decodeBase64Audio(MOTOR_OFF_B64, MOTOR_OFF_URL, (buf) => {
      this.motorOffBuffer = buf;
      this.motorAudioLoading = false;
    });
  }

  _getNoiseBuffer() {
    if (!this.ctx) return null;
    if (this._noiseBuffer) return this._noiseBuffer;
    try {
      const sampleRate = this.ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this._noiseBuffer = buffer;
      return buffer;
    } catch {
      return null;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) {
      if (this.motorRunningSource && this.ctx) {
        try {
          this.motorRunningSource.stop(this.ctx.currentTime);
        } catch {}
        this.motorRunningSource = null;
      }
      if (this.motorAudioOn) {
        try {
          this.motorAudioOn.pause();
          this.motorAudioOn = null;
        } catch {}
      }
      if (this.motorGain && this.ctx) {
        this.motorGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      }
      this.motorWasRunning = false;
      this.stopShortCircuitArc();
    }
  }

  // Authentic contactor sound (separate real recorded clips for LIGAR and DESLIGAR)
  playContactorClick(energized = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // 1. Play real recorded sample with 0ms Web Audio latency
    const targetBuffer = energized ? this.contactorOnBuffer : this.contactorOffBuffer;
    if (targetBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = targetBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(energized ? 1.05 : 0.98, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(this.ctx.currentTime);
        return;
      } catch {
        // Fallback to HTML5 audio or synthesizer
      }
    }

    // 2. Fallback to HTML5 Audio if buffer is still decoding
    try {
      const audioUrl = energized ? CONTACTOR_ON_URL : CONTACTOR_OFF_URL;
      const audio = new Audio(audioUrl);
      audio.volume = energized ? 1.0 : 0.95;
      audio.play().catch(() => {});
      return;
    } catch {}

    // 3. Fallback synthesizer if audio is unavailable
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

  // Rotary selector switch crisp detent snap
  playRotarySwitchClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Solid plastic/metallic detent snap impulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // 2. High-frequency latch transient click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.02);

      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.03);
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
  playSwitch(closed = true) {
    this.playBreakerToggle(closed);
  }

  // Realistic DIN Rail Circuit Breaker sound (Armar / Desarmar)
  playBreakerToggle(closed = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // 1. Play real recorded sample with acoustic nuance for ON vs OFF
    if (this.breakerBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.breakerBuffer;
        source.playbackRate.setValueAtTime(closed ? 0.95 : 1.05, this.ctx.currentTime);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(closed ? 1.0 : 0.92, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(this.ctx.currentTime);
        return;
      } catch {
        // Fallback below
      }
    }

    // 2. If Web Audio buffer is not yet decoded (e.g. first click), play real MP3 directly!
    try {
      const audioUrl = BREAKER_AUDIO_URL || `data:audio/mp3;base64,${BREAKER_AUDIO_B64}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = closed ? 0.95 : 1.05;
      audio.volume = closed ? 1.0 : 0.92;
      audio.play().catch(() => {});
      return;
    } catch {}

    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this._getNoiseBuffer();

      if (closed) {
        // ==========================================
        // LIGAR / ARMAR DISJUNTOR (ON / CLOSED)
        // Ação física: Resistência de mola pesada, engate firme da catraca
        // e batida forte dos contatos móveis contra os fixos ("THRA-KLANK")
        // ==========================================

        // 1. Pré-clique de tensão mecânica da mola (8ms antes do impacto)
        if (noiseBuffer) {
          const preNoise = this.ctx.createBufferSource();
          preNoise.buffer = noiseBuffer;
          const preFilter = this.ctx.createBiquadFilter();
          preFilter.type = 'bandpass';
          preFilter.frequency.setValueAtTime(1800, now);
          preFilter.Q.setValueAtTime(2.5, now);
          const preGain = this.ctx.createGain();
          preGain.gain.setValueAtTime(0.18, now);
          preGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

          preNoise.connect(preFilter);
          preFilter.connect(preGain);
          preGain.connect(this.ctx.destination);
          preNoise.start(now);
          preNoise.stop(now + 0.015);
        }

        const tImpact = now + 0.01;

        // 2. Transiente mecânico afiado (estalo da manopla e baquelite dura)
        if (noiseBuffer) {
          const snapNoise = this.ctx.createBufferSource();
          snapNoise.buffer = noiseBuffer;
          const snapFilter = this.ctx.createBiquadFilter();
          snapFilter.type = 'bandpass';
          snapFilter.frequency.setValueAtTime(3400, tImpact);
          snapFilter.frequency.exponentialRampToValueAtTime(1100, tImpact + 0.038);
          snapFilter.Q.setValueAtTime(2.2, tImpact);

          const snapGain = this.ctx.createGain();
          snapGain.gain.setValueAtTime(0.55, tImpact);
          snapGain.gain.exponentialRampToValueAtTime(0.001, tImpact + 0.045);

          snapNoise.connect(snapFilter);
          snapFilter.connect(snapGain);
          snapGain.connect(this.ctx.destination);
          snapNoise.start(tImpact);
          snapNoise.stop(tImpact + 0.05);
        }

        // 3. Impacto metálico da catraca de aço e contatos de cobre (corpo médio)
        const metalOsc = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metalOsc.type = 'triangle';
        metalOsc.frequency.setValueAtTime(480, tImpact);
        metalOsc.frequency.exponentialRampToValueAtTime(170, tImpact + 0.045);

        metalGain.gain.setValueAtTime(0.45, tImpact);
        metalGain.gain.exponentialRampToValueAtTime(0.001, tImpact + 0.05);

        metalOsc.connect(metalGain);
        metalGain.connect(this.ctx.destination);
        metalOsc.start(tImpact);
        metalOsc.stop(tImpact + 0.055);

        // 4. Batente da carcaça do disjuntor (Thud de baixa frequência - sensação de peso industrial)
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(145, tImpact);
        thudOsc.frequency.exponentialRampToValueAtTime(42, tImpact + 0.075);

        thudGain.gain.setValueAtTime(0.68, tImpact);
        thudGain.gain.exponentialRampToValueAtTime(0.001, tImpact + 0.085);

        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thudOsc.start(tImpact);
        thudOsc.stop(tImpact + 0.09);

      } else {
        // ==========================================
        // DESLIGAR DISJUNTOR (OFF / OPEN)
        // Ação física: Desengate violento da catraca disparado pela mola,
        // a alavanca salta para baixo batendo seca no batente inferior ("KLAK!")
        // Som mais seco, mais rápido, oco e afiado.
        // ==========================================

        // 1. Estalo de desengate imediato (Latch snap ultra rápido e seco)
        if (noiseBuffer) {
          const snapNoise = this.ctx.createBufferSource();
          snapNoise.buffer = noiseBuffer;
          const snapFilter = this.ctx.createBiquadFilter();
          snapFilter.type = 'bandpass';
          snapFilter.frequency.setValueAtTime(4100, now);
          snapFilter.frequency.exponentialRampToValueAtTime(1300, now + 0.03);
          snapFilter.Q.setValueAtTime(2.8, now);

          const snapGain = this.ctx.createGain();
          snapGain.gain.setValueAtTime(0.58, now);
          snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          snapNoise.connect(snapFilter);
          snapFilter.connect(snapGain);
          snapGain.connect(this.ctx.destination);
          snapNoise.start(now);
          snapNoise.stop(now + 0.038);
        }

        // 2. Impacto da alavanca batendo no batente inferior (plástico oco rígido)
        const toggleStopOsc = this.ctx.createOscillator();
        const toggleStopGain = this.ctx.createGain();
        toggleStopOsc.type = 'triangle';
        toggleStopOsc.frequency.setValueAtTime(640, now);
        toggleStopOsc.frequency.exponentialRampToValueAtTime(210, now + 0.038);

        toggleStopGain.gain.setValueAtTime(0.42, now);
        toggleStopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

        toggleStopOsc.connect(toggleStopGain);
        toggleStopGain.connect(this.ctx.destination);
        toggleStopOsc.start(now);
        toggleStopOsc.stop(now + 0.048);

        // 3. Batente acústico do chassi oco (mais agudo e rápido que o ON)
        const hollowOsc = this.ctx.createOscillator();
        const hollowGain = this.ctx.createGain();
        hollowOsc.type = 'sine';
        hollowOsc.frequency.setValueAtTime(195, now);
        hollowOsc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

        hollowGain.gain.setValueAtTime(0.5, now);
        hollowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        hollowOsc.connect(hollowGain);
        hollowGain.connect(this.ctx.destination);
        hollowOsc.start(now);
        hollowOsc.stop(now + 0.06);

        // 4. Vibração metálica residual da lâmina da mola (spring recoil)
        const springOsc = this.ctx.createOscillator();
        const springGain = this.ctx.createGain();
        springOsc.type = 'triangle';
        springOsc.frequency.setValueAtTime(860, now + 0.01);
        springOsc.frequency.exponentialRampToValueAtTime(380, now + 0.04);

        springGain.gain.setValueAtTime(0.001, now);
        springGain.gain.setValueAtTime(0.18, now + 0.01);
        springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        springOsc.connect(springGain);
        springGain.connect(this.ctx.destination);
        springOsc.start(now + 0.01);
        springOsc.stop(now + 0.05);
      }
    } catch {
      // Ignore audio error
    }
  }

  // Automatic trip of circuit breaker (Curto-circuito ou sobrecarga violenta)
  playBreakerTrip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.breakerBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.breakerBuffer;
        source.playbackRate.setValueAtTime(1.02, this.ctx.currentTime);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.15, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(this.ctx.currentTime);
        return;
      } catch {}
    }

    try {
      const audioUrl = BREAKER_AUDIO_URL || `data:audio/mp3;base64,${BREAKER_AUDIO_B64}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = 1.02;
      audio.volume = 1.0;
      audio.play().catch(() => {});
      return;
    } catch {}

    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this._getNoiseBuffer();

      // Sudden release of internal latch under high mechanical tension
      if (noiseBuffer) {
        const tripNoise = this.ctx.createBufferSource();
        tripNoise.buffer = noiseBuffer;
        const tripFilter = this.ctx.createBiquadFilter();
        tripFilter.type = 'bandpass';
        tripFilter.frequency.setValueAtTime(4500, now);
        tripFilter.frequency.exponentialRampToValueAtTime(750, now + 0.065);
        tripFilter.Q.setValueAtTime(2.4, now);

        const tripGain = this.ctx.createGain();
        tripGain.gain.setValueAtTime(0.72, now);
        tripGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        tripNoise.connect(tripFilter);
        tripFilter.connect(tripGain);
        tripGain.connect(this.ctx.destination);
        tripNoise.start(now);
        tripNoise.stop(now + 0.075);
      }

      // Heavy metallic snap and body thump
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(650, now);
      osc1.frequency.exponentialRampToValueAtTime(130, now + 0.055);
      gain1.gain.setValueAtTime(0.55, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(45, now + 0.085);
      gain2.gain.setValueAtTime(0.75, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.065);
      osc2.stop(now + 0.1);
    } catch {
      // Ignore audio error
    }
  }

  // Thermal relay mechanical trip (internal rocker arm release)
  playTrip() {
    this.playBreakerTrip();
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

  // Continuous realistic electrical arc / short-circuit sound (buzzing, frying, crackling plasma arc)
  startShortCircuitArc() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.shortArcActive) return; // already active

    try {
      this.shortArcActive = true;
      const now = this.ctx.currentTime;

      // Master gain for the short-circuit sound
      this.shortArcMasterGain = this.ctx.createGain();
      this.shortArcMasterGain.gain.setValueAtTime(0.01, now);
      this.shortArcMasterGain.gain.exponentialRampToValueAtTime(0.75, now + 0.05);
      this.shortArcMasterGain.connect(this.ctx.destination);

      // 1. Initial explosive crack
      this.playShortCircuit();

      // 2. Heavy 60Hz fundamental mains hum with rich harmonic saturation (120Hz, 180Hz, 240Hz, 360Hz)
      this.shortArcOsc1 = this.ctx.createOscillator();
      this.shortArcOsc1.type = 'sawtooth';
      this.shortArcOsc1.frequency.setValueAtTime(60, now);

      this.shortArcOsc2 = this.ctx.createOscillator();
      this.shortArcOsc2.type = 'triangle';
      this.shortArcOsc2.frequency.setValueAtTime(120, now);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.45, now);

      this.shortArcOsc1.connect(humGain);
      this.shortArcOsc2.connect(humGain);

      // 3. Distortion / Waveshaper for raw AC arc grit
      const waveshaper = this.ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = ((Math.PI + 4) * x) / (Math.PI + 4 * Math.abs(x));
      }
      waveshaper.curve = curve;
      humGain.connect(waveshaper);
      waveshaper.connect(this.shortArcMasterGain);

      this.shortArcOsc1.start(now);
      this.shortArcOsc2.start(now);

      // 4. Chaotic electrical plasma sizzling & crackling noise
      const sampleRate = this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, sampleRate * 2, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const r = Math.random() * 2 - 1;
        data[i] = r * (Math.random() > 0.82 ? 1.6 : 0.65);
      }

      this.shortArcNoiseSource = this.ctx.createBufferSource();
      this.shortArcNoiseSource.buffer = noiseBuffer;
      this.shortArcNoiseSource.loop = true;

      // Resonant bandpass filter sweeping slightly for arc movement
      this.shortArcFilter = this.ctx.createBiquadFilter();
      this.shortArcFilter.type = 'bandpass';
      this.shortArcFilter.frequency.setValueAtTime(1600, now);
      this.shortArcFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);

      this.shortArcNoiseSource.connect(this.shortArcFilter);
      this.shortArcFilter.connect(noiseGain);
      noiseGain.connect(this.shortArcMasterGain);
      this.shortArcNoiseSource.start(now);

      // 5. Periodic chaotic jitter in frequency and filter to sound like an active arc
      this.shortArcInterval = setInterval(() => {
        if (!this.shortArcActive || !this.ctx || !this.shortArcFilter) return;
        try {
          const t = this.ctx.currentTime;
          const jitterFreq = 1200 + Math.random() * 1400;
          this.shortArcFilter.frequency.setValueAtTime(jitterFreq, t);
          if (this.shortArcOsc1) {
            this.shortArcOsc1.frequency.setValueAtTime(58 + Math.random() * 4, t);
          }
        } catch {}
      }, 60);
    } catch {
      // Ignore
    }
  }

  stopShortCircuitArc() {
    if (!this.shortArcActive) return;
    this.shortArcActive = false;

    if (this.shortArcInterval) {
      clearInterval(this.shortArcInterval);
      this.shortArcInterval = null;
    }

    try {
      if (this.ctx && this.shortArcMasterGain) {
        const now = this.ctx.currentTime;
        this.shortArcMasterGain.gain.setValueAtTime(this.shortArcMasterGain.gain.value, now);
        this.shortArcMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        setTimeout(() => {
          try {
            this.shortArcOsc1?.stop();
            this.shortArcOsc2?.stop();
            this.shortArcNoiseSource?.stop();
            this.shortArcOsc1?.disconnect();
            this.shortArcOsc2?.disconnect();
            this.shortArcNoiseSource?.disconnect();
            this.shortArcMasterGain?.disconnect();
          } catch {}
          this.shortArcOsc1 = null;
          this.shortArcOsc2 = null;
          this.shortArcNoiseSource = null;
          this.shortArcMasterGain = null;
          this.shortArcFilter = null;
        }, 60);
      }
    } catch {}
  }

  // Authentic motor on sound (acceleration ramp + seamless running loop)
  playMotorStart() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Stop any existing running source
    if (this.motorRunningSource) {
      try {
        this.motorRunningSource.stop(now);
      } catch {}
      this.motorRunningSource = null;
    }

    if (this.motorOnBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.motorOnBuffer;
        source.loop = true;
        source.loopStart = 1.198; // seamless running induction loop
        source.loopEnd = 3.598;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.38, now + 0.12);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(now);
        this.motorRunningSource = source;
        this.motorRunningGain = gainNode;
        return;
      } catch {}
    }

    // Fallback to HTML5 audio if buffer is still decoding
    try {
      if (this.motorAudioOn) {
        this.motorAudioOn.pause();
        this.motorAudioOn.currentTime = 0;
      }
      this.motorAudioOn = new Audio(MOTOR_ON_URL);
      this.motorAudioOn.loop = true;
      this.motorAudioOn.volume = 0.38;
      this.motorAudioOn.play().catch(() => {});
    } catch {}
  }

  // Authentic motor off sound (power cut-off click + mechanical coasting deceleration to 0)
  playMotorStop() {
    if (this.muted) return;
    this.init();

    // 1. Stop running loop
    if (this.ctx && this.motorRunningSource) {
      try {
        const now = this.ctx.currentTime;
        if (this.motorRunningGain) {
          this.motorRunningGain.gain.setValueAtTime(this.motorRunningGain.gain.value, now);
          this.motorRunningGain.gain.linearRampToValueAtTime(0, now + 0.05);
        }
        this.motorRunningSource.stop(now + 0.05);
      } catch {}
      this.motorRunningSource = null;
      this.motorRunningGain = null;
    }

    if (this.motorAudioOn) {
      try {
        this.motorAudioOn.pause();
        this.motorAudioOn.currentTime = 0;
        this.motorAudioOn = null;
      } catch {}
    }

    // 2. Play motor stop sound (cut-off click and inertia spin-down)
    if (this.ctx && this.motorOffBuffer) {
      try {
        const now = this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = this.motorOffBuffer;
        source.loop = false;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.42, now);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(now);
        return;
      } catch {}
    }

    // Fallback to HTML5 Audio
    try {
      const offAudio = new Audio(MOTOR_OFF_URL);
      offAudio.volume = 0.42;
      offAudio.play().catch(() => {});
    } catch {}
  }

  // Update motor sound based on RPM (0 to 1800), running state, and stall state
  updateMotorHum(rpm, isRunning, isStalled = false) {
    if (this.muted) {
      if (this.motorWasRunning) {
        this.playMotorStop();
        this.motorWasRunning = false;
      }
      return;
    }

    // State transition detection (ligando / desligando)
    if (isRunning && !this.motorWasRunning) {
      this.motorWasRunning = true;
      this.playMotorStart();
    } else if (!isRunning && this.motorWasRunning) {
      this.motorWasRunning = false;
      this.playMotorStop();
    }

    // Adjust volume with speed if running with real sample
    if (isRunning && this.motorRunningGain && this.ctx) {
      try {
        const targetVol = Math.max(0.12, Math.min(0.42, (rpm / 1800) * 0.42));
        this.motorRunningGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
      } catch {}
    }

    // If motor is stalled (rotor blocked / 2-phase error without rotation)
    if (isStalled) {
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
          this.motorFilter.frequency.setValueAtTime(260, now);

          this.motorOsc.connect(this.motorFilter);
          this.motorFilter.connect(this.motorGain);
          this.motorGain.connect(this.ctx.destination);

          this.motorGain.gain.setValueAtTime(0, now);
          this.motorOsc.start(now);
        }
        this.motorOsc.frequency.setTargetAtTime(120, now, 0.05);
        this.motorFilter.frequency.setTargetAtTime(260, now, 0.05);
        this.motorGain.gain.setTargetAtTime(0.22, now, 0.05);
      } catch {}
    } else if (this.motorGain && this.ctx) {
      this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }
}

export const sounds = new SoundSystem();

// Preload and warm up audio buffers early so they are ready on the very first interaction
if (typeof window !== 'undefined') {
  const warmUp = () => {
    try {
      sounds.init();
    } catch {}
  };
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    warmUp();
  } else {
    window.addEventListener('DOMContentLoaded', warmUp, { once: true });
  }
  window.addEventListener('pointerdown', warmUp, { once: true, passive: true });
  window.addEventListener('keydown', warmUp, { once: true, passive: true });
}
