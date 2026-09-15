/**
 * Procedural Lo-Fi Hip-Hop Synth & Drum Engine
 * Built with Web Audio API for zero-latency, authentic underground beats
 */

export class LoFiSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeTrackId: string = "track-1";
  private bpm: number = 72;

  // Master & effects nodes
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private vinylGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private subwayGain: GainNode | null = null;
  private tapeFlutterNode: DelayNode | null = null;
  private flutterLfo: OscillatorNode | null = null;
  private flutterLfoGain: GainNode | null = null;

  // Scheduled timers
  private schedulerInterval: number | null = null;
  private nextBeatTime: number = 0;
  private currentStep: number = 0; // 16-step pattern

  // Effect levels (0.0 to 1.0)
  private vinylLevel: number = 0.35;
  private rainLevel: number = 0.25;
  private subwayLevel: number = 0.3;
  private tapeFlutterAmount: number = 0.25;
  private filterCutoffFreq: number = 4200;

  // Track specific chords and scales
  // Track 1: D minor 9th (D3, F3, A3, C4, E4) -> G minor 7th (G3, Bb3, D4, F4)
  // Track 2: C minor 7th -> F7 -> Bb maj7 -> G7 (classic jazz hop 2-5-1-6)
  // Track 3: A minor 9 -> F maj7 -> D minor 9 -> E7#9 (nocturnal suspense)
  // Track 4: Eb9 -> Ab13 -> Db maj7 -> C7alt (punchy soulful funky pizza party)

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Lo-Fi Lowpass Filter (simulating 12-bit / cassette high roll-off)
    this.lowpassFilter = this.ctx.createBiquadFilter();
    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.setValueAtTime(this.filterCutoffFreq, this.ctx.currentTime);
    this.lowpassFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Tape wow/flutter delay modulation
    this.tapeFlutterNode = this.ctx.createDelay();
    this.tapeFlutterNode.delayTime.setValueAtTime(0.015, this.ctx.currentTime);

    this.flutterLfo = this.ctx.createOscillator();
    this.flutterLfo.frequency.setValueAtTime(0.65, this.ctx.currentTime); // 0.65 Hz wow
    this.flutterLfoGain = this.ctx.createGain();
    this.flutterLfoGain.gain.setValueAtTime(0.0015 * this.tapeFlutterAmount, this.ctx.currentTime);

    this.flutterLfo.connect(this.flutterLfoGain);
    this.flutterLfoGain.connect(this.tapeFlutterNode.delayTime);
    this.flutterLfo.start();

    // Wire up effects chain
    // Sources -> Tape Flutter -> Lowpass Filter -> Master Gain -> Analyser -> Destination
    this.tapeFlutterNode.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Setup background ambiance generators (Vinyl crackle, Rain, Subway rumble)
    this.setupAtmospheres();
  }

  private setupAtmospheres() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Vinyl Crackle Generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Periodic crackle pops mixed with pink floor
      const r = Math.random();
      if (r > 0.998) {
        output[i] = (Math.random() * 2 - 1) * 0.9;
      } else if (r > 0.99) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }

    const vinylSource = this.ctx.createBufferSource();
    vinylSource.buffer = noiseBuffer;
    vinylSource.loop = true;

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = "highpass";
    vinylFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(this.vinylLevel * 0.2, this.ctx.currentTime);

    vinylSource.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);
    vinylSource.start();

    // 2. Rain Ambience (filtered modulated white noise)
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const rainOutput = rainBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      rainOutput[i] = Math.random() * 2 - 1;
    }
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.rainLevel * 0.08, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();

    // 3. Subway Rumble (Sub-bass drone with gentle modulation)
    const subwayOsc = this.ctx.createOscillator();
    subwayOsc.type = "sine";
    subwayOsc.frequency.setValueAtTime(46, this.ctx.currentTime); // 46Hz sub rumble

    const subwayMod = this.ctx.createOscillator();
    subwayMod.type = "sine";
    subwayMod.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 0.18 Hz slow surge

    const subwayModGain = this.ctx.createGain();
    subwayModGain.gain.setValueAtTime(8, this.ctx.currentTime);
    subwayMod.connect(subwayModGain);
    subwayModGain.connect(subwayOsc.frequency);

    this.subwayGain = this.ctx.createGain();
    this.subwayGain.gain.setValueAtTime(this.subwayLevel * 0.22, this.ctx.currentTime);

    subwayOsc.connect(this.subwayGain);
    this.subwayGain.connect(this.masterGain);

    subwayOsc.start();
    subwayMod.start();
  }

  public setEffectLevels(opts: {
    vinyl?: number;
    rain?: number;
    subway?: number;
    flutter?: number;
    cutoff?: number;
  }) {
    if (opts.vinyl !== undefined) {
      this.vinylLevel = opts.vinyl;
      if (this.vinylGain && this.ctx) {
        this.vinylGain.gain.setTargetAtTime(this.vinylLevel * 0.2, this.ctx.currentTime, 0.05);
      }
    }
    if (opts.rain !== undefined) {
      this.rainLevel = opts.rain;
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.setTargetAtTime(this.rainLevel * 0.08, this.ctx.currentTime, 0.05);
      }
    }
    if (opts.subway !== undefined) {
      this.subwayLevel = opts.subway;
      if (this.subwayGain && this.ctx) {
        this.subwayGain.gain.setTargetAtTime(this.subwayLevel * 0.22, this.ctx.currentTime, 0.05);
      }
    }
    if (opts.flutter !== undefined) {
      this.tapeFlutterAmount = opts.flutter;
      if (this.flutterLfoGain && this.ctx) {
        this.flutterLfoGain.gain.setTargetAtTime(0.002 * this.tapeFlutterAmount, this.ctx.currentTime, 0.05);
      }
    }
    if (opts.cutoff !== undefined) {
      this.filterCutoffFreq = opts.cutoff;
      if (this.lowpassFilter && this.ctx) {
        this.lowpassFilter.frequency.setTargetAtTime(this.filterCutoffFreq, this.ctx.currentTime, 0.05);
      }
    }
  }

  public start(trackId: string, bpm: number) {
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.activeTrackId = trackId;
    this.bpm = bpm;
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    // Schedule 16th-note ticks
    this.schedulerInterval = window.setInterval(() => {
      this.scheduleLoop();
    }, 25);
  }

  public stop() {
    this.isPlaying = false;
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  public toggle(trackId: string, bpm: number): boolean {
    if (this.isPlaying && this.activeTrackId === trackId) {
      this.stop();
      return false;
    } else {
      this.start(trackId, bpm);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getActiveTrackId(): string {
    return this.activeTrackId;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private scheduleLoop() {
    if (!this.ctx || !this.isPlaying) return;

    const lookahead = 0.1; // 100ms lookahead
    const secondsPer16th = 60.0 / (this.bpm * 4);

    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      this.playStep(this.currentStep, this.nextBeatTime);

      // Add slight MPC swing to odd 16th notes
      const swingOffset = (this.currentStep % 2 === 1) ? secondsPer16th * 0.16 : 0;
      this.nextBeatTime += secondsPer16th + (this.currentStep % 2 === 0 ? swingOffset : -swingOffset);
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  private playStep(step: number, time: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    // Track 1: Ninja Meditation (72 BPM) - Soft dusty boom-bap, warm Rhodes, koto plucked accents
    if (this.activeTrackId === "track-1") {
      // Soft kick on 0 and 10
      if (step === 0 || step === 10) this.triggerKick(time, 0.45);
      // Soft snare / rim on 4 and 12
      if (step === 4 || step === 12) this.triggerSnare(time, 0.35, true);
      // Ghost hats every 2 steps
      if (step % 2 === 0) this.triggerHat(time, step % 4 === 0 ? 0.22 : 0.14);

      // Warm Rhodes chords on bar starts
      if (step === 0) {
        // D minor 9: D3, F3, A3, C4, E4
        this.triggerRhodesChord([146.83, 174.61, 220.0, 261.63, 329.63], time, 0.26, 2.2);
        this.triggerBass(73.42, time, 0.45, 1.8); // Low D
      } else if (step === 8) {
        // G minor 7: G3, Bb3, D4, F4
        this.triggerRhodesChord([196.0, 233.08, 293.66, 349.23], time, 0.24, 2.0);
        this.triggerBass(98.0, time, 0.4, 1.6); // G2
      }

      // Sparse plucked string accent (koto/shamisen flavor)
      if (step === 6 || step === 14) {
        const pluckedFreq = step === 6 ? 587.33 : 659.25; // D5 or E5
        this.triggerPluck(pluckedFreq, time + 0.04, 0.28);
      }
    }

    // Track 2: Concrete & Cassettes (85 BPM) - Everyday Sewer Beats, jazz chords, cozy tape saturation
    else if (this.activeTrackId === "track-2") {
      // Boom-bap pattern: Kick on 0, 7, 10
      if (step === 0 || step === 7 || step === 10) this.triggerKick(time, step === 0 ? 0.6 : 0.42);
      // Crisp boom-bap snare on 4 and 12
      if (step === 4 || step === 12) this.triggerSnare(time, 0.5);
      // Lo-Fi Shaker/Hat pattern
      if (step % 2 === 0 || step === 3 || step === 11) {
        this.triggerHat(time, step % 4 === 2 ? 0.3 : 0.18);
      }

      // Jazz Rhodes chords
      if (step === 0) {
        // C minor 7: C3, Eb3, G3, Bb3, D4
        this.triggerRhodesChord([130.81, 155.56, 196.0, 233.08, 293.66], time, 0.32, 1.8);
        this.triggerBass(65.41, time, 0.5, 1.6);
      } else if (step === 8) {
        // F9 / Bb maj7
        this.triggerRhodesChord([174.61, 220.0, 261.63, 311.13, 392.0], time, 0.3, 1.7);
        this.triggerBass(87.31, time, 0.48, 1.5);
      }

      // Environmental water drip / vinyl tap accent
      if (step === 13) {
        this.triggerDrip(1150, time, 0.2);
      }
    }

    // Track 3: 2:17 AM Rooftops (90 BPM) - Cinematic Night Patrol, driving drums, moody synth pad
    else if (this.activeTrackId === "track-3") {
      // Deeper, driving kick pattern on 0, 6, 10
      if (step === 0 || step === 6 || step === 10) this.triggerKick(time, 0.65, true);
      // Deep wooden snare on 4 and 12
      if (step === 4 || step === 12) this.triggerSnare(time, 0.55);
      // Tight closed hats
      if (step % 2 === 0) this.triggerHat(time, step % 4 === 0 ? 0.32 : 0.2);

      // Moody mysterious pad chords (A minor 9 / F maj7)
      if (step === 0) {
        this.triggerSynthPad([110.0, 164.81, 220.0, 261.63, 329.63, 493.88], time, 0.35, 2.4);
        this.triggerBass(55.0, time, 0.55, 1.9); // Low A1
      } else if (step === 8) {
        this.triggerSynthPad([87.31, 174.61, 220.0, 261.63, 329.63], time, 0.32, 2.2);
        this.triggerBass(43.65, time, 0.55, 1.8); // Low F1
      }

      // Nocturnal siren reflection / bell resonance
      if (step === 2 || step === 14) {
        this.triggerBell(step === 2 ? 880 : 784, time, 0.15);
      }
    }

    // Track 4: Last Slice (100 BPM) - Upbeat Pizza Party, funky bass, punchy drums, scratches
    else {
      // Punchy kick on 0, 3, 8, 10
      if (step === 0 || step === 3 || step === 8 || step === 10) {
        this.triggerKick(time, step === 0 ? 0.7 : 0.5, false, true);
      }
      // Chunky snare with ghost note
      if (step === 4 || step === 12) this.triggerSnare(time, 0.62);
      if (step === 15) this.triggerSnare(time, 0.22); // ghost snare

      // Bouncy hi-hat with open hat on off-beat
      if (step % 2 === 1) {
        this.triggerHat(time, 0.35, step === 6 || step === 14);
      }

      // Funky walking bass line
      const bassNotes = [77.78, 92.5, 103.83, 116.54, 77.78, 116.54, 103.83, 87.31];
      const noteIdx = Math.floor(step / 2) % bassNotes.length;
      if (step % 2 === 0) {
        this.triggerBass(bassNotes[noteIdx], time, 0.55, 0.24);
      }

      // Soulful Rhodes stab on syncopations
      if (step === 0 || step === 3 || step === 8 || step === 11) {
        // Eb9 / Ab13 funky stabs
        this.triggerRhodesChord([155.56, 196.0, 233.08, 293.66, 349.23], time, 0.32, 0.35);
      }

      // Playful scratch / vocal chop simulation
      if (step === 7 || step === 15) {
        this.triggerScratch(time, 0.28);
      }
    }
  }

  // Instrument sound generators

  private triggerKick(time: number, velocity: number, deep: boolean = false, punchy: boolean = false) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = punchy ? 150 : deep ? 110 : 125;
    const endFreq = deep ? 38 : 45;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);

    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (deep ? 0.35 : 0.25));

    osc.connect(gain);
    gain.connect(this.tapeFlutterNode);

    osc.start(time);
    osc.stop(time + (deep ? 0.36 : 0.26));
  }

  private triggerSnare(time: number, velocity: number, rim: boolean = false) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = rim ? "bandpass" : "highpass";
    noiseFilter.frequency.setValueAtTime(rim ? 1800 : 1200, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * (rim ? 0.5 : 0.8), time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (rim ? 0.1 : 0.18));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.tapeFlutterNode);

    // Tonal body
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(rim ? 320 : 190, time);
    osc.frequency.exponentialRampToValueAtTime(rim ? 210 : 110, time + 0.08);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(velocity * 0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.tapeFlutterNode);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.2);
    osc.stop(time + 0.15);
  }

  private triggerHat(time: number, velocity: number, open: boolean = false) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const dur = open ? 0.22 : 0.05;
    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFlutterNode);

    noise.start(time);
    noise.stop(time + dur + 0.01);
  }

  private triggerBass(freq: number, time: number, velocity: number, duration: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.8, time + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFlutterNode);

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + duration + 0.05);
    subOsc.stop(time + duration + 0.05);
  }

  private triggerRhodesChord(frequencies: number[], time: number, velocity: number, duration: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    frequencies.forEach((freq, idx) => {
      // Warm Rhodes tine: sine fundamental + triangle overtone with tremolo
      const osc1 = this.ctx!.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, time);

      const osc2 = this.ctx!.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, time);

      const chordGain = this.ctx!.createGain();
      const noteVel = (velocity / frequencies.length) * (idx === 0 ? 1.2 : 0.9);

      chordGain.gain.setValueAtTime(0.001, time);
      chordGain.gain.linearRampToValueAtTime(noteVel, time + 0.04);
      chordGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(chordGain);
      osc2.connect(chordGain);
      chordGain.connect(this.tapeFlutterNode!);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.05);
      osc2.stop(time + duration + 0.05);
    });
  }

  private triggerSynthPad(frequencies: number[], time: number, velocity: number, duration: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    frequencies.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.exponentialRampToValueAtTime(1100, time + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(350, time + duration);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(velocity / frequencies.length, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.tapeFlutterNode!);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }

  private triggerPluck(freq: number, time: number, velocity: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(gain);
    gain.connect(this.tapeFlutterNode);

    osc.start(time);
    osc.stop(time + 0.65);
  }

  private triggerDrip(freq: number, time: number, velocity: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, time + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.tapeFlutterNode);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private triggerBell(freq: number, time: number, velocity: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(gain);
    gain.connect(this.tapeFlutterNode);

    osc.start(time);
    osc.stop(time + 1.25);
  }

  private triggerScratch(time: number, velocity: number) {
    if (!this.ctx || !this.tapeFlutterNode) return;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.sin((i / bufferSize) * Math.PI * 40) * (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, time);
    filter.frequency.linearRampToValueAtTime(2200, time + 0.06);
    filter.frequency.linearRampToValueAtTime(800, time + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFlutterNode);

    noise.start(time);
    noise.stop(time + 0.13);
  }
}

// Export singleton instance
export const synthEngine = new LoFiSynthEngine();
