/**
 * Web Audio API Procedural Ambient Sound Synthesizer
 * High-quality warm ambient DSP with 1-second crossfades, warm lowpass filters, and organic binaural tones.
 */

export type SoundType = 'off' | 'drone' | 'brown' | 'ocean' | 'rain' | 'wind';

export class AmbientAudioSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private currentSound: SoundType = 'off';
  private volume = 0.25; // Default to gentle background volume

  // Active Web Audio Nodes for current soundscape
  private activeNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
  private currentSoundGain: GainNode | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSound(sound: SoundType): void {
    if (sound === this.currentSound) return;

    this.fadeAndStopCurrentSound();
    this.currentSound = sound;

    if (sound !== 'off') {
      // Short delay for smooth crossfade
      setTimeout(() => {
        if (this.currentSound === sound) {
          this.startSound(sound);
        }
      }, 300);
    }
  }

  public getCurrentSound(): SoundType {
    return this.currentSound;
  }

  private fadeAndStopCurrentSound(): void {
    if (this.currentSoundGain && this.ctx) {
      const g = this.currentSoundGain;
      const nodesToCleanup = [...this.activeNodes];
      this.activeNodes = [];
      this.currentSoundGain = null;

      try {
        g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          for (const node of nodesToCleanup) {
            try {
              if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
                (node as OscillatorNode).stop();
              }
              node.disconnect();
            } catch {
              // Audio node already stopped or disconnected
            }
          }
        }, 800);
      } catch {
        // Gain ramp failed
      }
    }
  }

  private createPinkNoiseBuffer(ctx: AudioContext, durationSeconds = 6): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private startSound(sound: SoundType): void {
    const ctx = this.getAudioContext();

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }

    const soundGain = ctx.createGain();
    soundGain.gain.setValueAtTime(0, ctx.currentTime);
    soundGain.gain.setTargetAtTime(1.0, ctx.currentTime, 0.4); // Smooth 1s fade-in
    soundGain.connect(this.masterGain);

    this.currentSoundGain = soundGain;
    const newNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];

    if (sound === 'drone') {
      // 1. DEEP WARM AMBIENT DRONE (Tibetan Bowl / Meditative Synth Pad)
      // Root (108 Hz) + Fifth (162 Hz) + Octave (216 Hz) with 0.3Hz binaural pulse
      const freqs = [108, 162, 216];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        // Subtle LFO warm chorus vibrato
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.05, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(soundGain);

        osc.start();
        lfo.start();

        newNodes.push(osc, lfo, filter, lfoGain, oscGain);
      });
    } else if (sound === 'brown') {
      // 2. VELVET DEEP BROWN NOISE (Warm Cozy Airplane Cabin / Fireplace Embers)
      // Double cascaded steep 24dB low-pass filter at 130Hz
      const noiseBuffer = this.createPinkNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(140, ctx.currentTime);

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(120, ctx.currentTime);

      source.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(soundGain);

      source.start();
      newNodes.push(source, filter1, filter2);
    } else if (sound === 'ocean') {
      // 3. REALISTIC SOFT OCEAN WAVES (Dual LFO modulated tide swells)
      const noiseBuffer = this.createPinkNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      // Slow 10-second rolling ocean wave swell
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(soundGain);

      source.start();
      lfo.start();

      newNodes.push(source, filter, lfo, lfoGain);
    } else if (sound === 'rain') {
      // 4. GENTLE ROOFTOP RAIN (Soft rainfall without static hiss)
      const noiseBuffer = this.createPinkNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      source.connect(filter);
      filter.connect(soundGain);

      source.start();
      newNodes.push(source, filter);
    } else if (sound === 'wind') {
      // 5. SOFT FOREST BREEZE (Whispering warm wind)
      const noiseBuffer = this.createPinkNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(110, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(soundGain);

      source.start();
      lfo.start();

      newNodes.push(source, filter, lfo, lfoGain);
    }

    this.activeNodes = newNodes;
  }

  public destroy(): void {
    this.fadeAndStopCurrentSound();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Audio context already closed
      }
      this.ctx = null;
    }
  }
}

export const ambientAudioSynth = new AmbientAudioSynth();
