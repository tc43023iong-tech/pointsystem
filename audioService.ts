
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Plays a short percussive tick for the shuffling animation.
   * Increased volume to 0.1.
   */
  public playShuffleTick(count: number, total: number) {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    const freq = 440 + (count / total) * 440;
    osc.frequency.setValueAtTime(freq, now);
    
    osc.type = 'square';
    gain.gain.setValueAtTime(0.1, now); // Increased from 0.03
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.05);
  }

  /**
   * Plays a distinct "impact" sound when a winner is chosen.
   * Increased volume to 0.3.
   */
  public playShuffleSuccess() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now); // Increased from 0.1
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.3);
  }

  /**
   * Plays a cheerful, rising 4-note melodic chime.
   * Increased volume to 0.3.
   */
  public playPointUp() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const noteDuration = 0.07;
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * noteDuration);
      
      gain.gain.setValueAtTime(0.3, now + i * noteDuration); // Increased from 0.1
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * noteDuration + noteDuration);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + i * noteDuration);
      osc.stop(now + i * noteDuration + noteDuration);
    });
  }

  /**
   * Plays a disappointing, low-frequency dissonant slide down.
   * Increased volume to 0.4.
   */
  public playPointDown() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(293.66, now);
    osc.frequency.exponentialRampToValueAtTime(73.42, now + 0.4);
    
    gain.gain.setValueAtTime(0.4, now); // Increased from 0.15
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.4);

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.linearRampToValueAtTime(55, now + 0.4);
    subGain.gain.setValueAtTime(0.3, now); // Increased from 0.1
    subGain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start();
    subOsc.stop(now + 0.4);
  }
}

export const audioService = new AudioService();
