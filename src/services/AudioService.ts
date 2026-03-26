export class AudioService {
  private static audioCtx: AudioContext | null = null;

  static init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static playBeep(mode: 'Lock In' | 'Break') {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    // Different frequency based on the mode completing
    osc.type = 'sine';
    osc.frequency.value = mode === 'Lock In' ? 880 : 440; // A5 for Lock in finish, A4 for Break finish

    osc.start();
    
    // Quick fade out so it's a pleasant beep
    gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + 0.5);
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  static async showBrowserNotification(title: string, body: string) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }
}
