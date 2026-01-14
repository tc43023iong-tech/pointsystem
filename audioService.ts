
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Plays a short percussive tick for the shuffling animation.
   * The pitch can rise to increase tension.
   */
  public playShuffleTick(count: number, total: number) {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Frequency rises from 440Hz (A4) to 880Hz (A5) as the shuffle progresses
    const freq = 440 + (count / total) * 440;
    osc.frequency.setValueAtTime(freq, now);
    
    osc.type = 'square';
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.05);
  }

  /**
   * Plays a distinct "impact" sound when a winner is chosen.
   */
  public playShuffleSuccess() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // Rise to E6
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.3);
  }

  /**
   * Plays a cheerful, rising 4-note melodic chime (C5-E5-G5-C6)
   * to signify a happy and successful point-up event.
   */
  public playPointUp() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const noteDuration = 0.07;
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * noteDuration);
      
      gain.gain.setValueAtTime(0.1, now + i * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * noteDuration + noteDuration);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + i * noteDuration);
      osc.stop(now + i * noteDuration + noteDuration);
    });
  }

  /**
   * Plays a disappointing, low-frequency dissonant slide down
   * to signify a negative point event.
   */
  public playPointDown() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(293.66, now); // D4
    osc.frequency.exponentialRampToValueAtTime(73.42, now + 0.4); // D2
    
    gain.gain.setValueAtTime(0.15, now);
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
    subGain.gain.setValueAtTime(0.1, now);
    subGain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start();
    subOsc.stop(now + 0.4);
  }
}

export const audioService = new AudioService();
