// Chat notification utilities for sound and page title alerts

class ChatNotifications {
  private originalTitle: string = document.title;
  private titleInterval: NodeJS.Timeout | null = null;
  private audio: HTMLAudioElement | null = null;

  constructor() {
    // Create notification sound using Web Audio API
    this.createNotificationSound();
  }

  private createNotificationSound() {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Create a short beep sound
      const duration = 0.15;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      // Store for later use
      this.audio = new Audio();

      // Fallback: use data URL for simple beep
      const sampleRate = 44100;
      const frequency = 800;
      const duration2 = 0.15;
      const samples = Math.floor(sampleRate * duration2);
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);

      // WAV file header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);

      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const value = Math.sin(2 * Math.PI * frequency * t) * 0.3 * (1 - t / duration2);
        const sample = Math.max(-1, Math.min(1, value));
        view.setInt16(44 + i * 2, sample * 0x7FFF, true);
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      this.audio.src = URL.createObjectURL(blob);
    } catch (error) {
      console.warn('Could not create notification sound:', error);
    }
  }

  /**
   * Play notification sound
   */
  playSound() {
    try {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(err => {
          console.warn('Could not play notification sound:', err);
        });
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  /**
   * Start flashing the page title with a message
   */
  startTitleNotification(message: string = 'New message') {
    // Stop any existing title notification
    this.stopTitleNotification();

    let showOriginal = false;
    this.titleInterval = setInterval(() => {
      document.title = showOriginal ? this.originalTitle : `💬 ${message}`;
      showOriginal = !showOriginal;
    }, 1000);
  }

  /**
   * Stop flashing the page title
   */
  stopTitleNotification() {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }
    document.title = this.originalTitle;
  }

  /**
   * Update the original title (call this when navigating to new pages)
   */
  updateOriginalTitle(newTitle: string) {
    this.originalTitle = newTitle;
    if (!this.titleInterval) {
      document.title = newTitle;
    }
  }

  /**
   * Notify user of new message (sound + title)
   */
  notifyNewMessage(senderName: string = 'Someone') {
    this.playSound();
    this.startTitleNotification(`${senderName} sent a message`);
  }

  /**
   * Clean up when component unmounts
   */
  cleanup() {
    this.stopTitleNotification();
  }
}

// Create singleton instance
export const chatNotifications = new ChatNotifications();

// Hook to use in components
export function useChatNotifications() {
  return chatNotifications;
}

// Utility to check if page is visible
export function isPageVisible(): boolean {
  return document.visibilityState === 'visible' && document.hasFocus();
}
