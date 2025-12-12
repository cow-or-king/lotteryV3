/**
 * Haptic Feedback Utility
 * Gère les vibrations tactiles pour améliorer l'expérience de jeu
 */

export const HapticPatterns = {
  // Patterns basiques
  TAP: 10,
  CLICK: 20,
  BUTTON: 30,

  // Patterns de jeu - Roue
  SEGMENT_TICK: 15,
  WHEEL_STOP_WIN: [100, 50, 100, 50, 200],
  WHEEL_STOP_LOSE: 200,

  // Patterns de jeu - Grattage
  SCRATCH: 5,
  REVEAL: [50, 30, 50, 30, 100, 50, 200],

  // Patterns de jeu - Slots
  REEL_STOP: 40,
  JACKPOT: [100, 50, 100, 50, 100, 50, 300],

  // Patterns de jeu - Shake
  SHAKE: 20,

  // Patterns système
  SUCCESS: [30, 20, 30],
  ERROR: [100, 50, 100],
  WARNING: [50, 30, 50, 30, 50],
} as const;

export type HapticPattern = keyof typeof HapticPatterns;

class HapticFeedback {
  private isSupported: boolean;
  private isEnabled: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;
    // Charger la préférence depuis localStorage
    this.isEnabled = this.loadPreference();
  }

  /**
   * Charge la préférence de vibration depuis localStorage
   */
  private loadPreference(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    const stored = localStorage.getItem('game-vibration-enabled');
    return stored === null ? true : stored === 'true';
  }

  /**
   * Sauvegarde la préférence de vibration dans localStorage
   */
  private savePreference(enabled: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem('game-vibration-enabled', String(enabled));
  }

  /**
   * Vérifie si la vibration est supportée
   */
  isAvailable(): boolean {
    return this.isSupported;
  }

  /**
   * Vérifie si la vibration est activée
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Active/désactive les vibrations
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.savePreference(enabled);
  }

  /**
   * Déclenche une vibration avec un pattern prédéfini
   */
  trigger(pattern: HapticPattern): void {
    if (!this.isSupported || !this.isEnabled) {
      return;
    }

    const vibrationPattern = HapticPatterns[pattern];
    // navigator.vibrate doesn't work well with readonly arrays, so we cast to any
    // This is safe because we're just passing the value to the browser API
    navigator.vibrate(vibrationPattern as number | number[]);
  }

  /**
   * Déclenche une vibration personnalisée
   */
  custom(pattern: number | number[]): void {
    if (!this.isSupported || !this.isEnabled) {
      return;
    }

    // Convert readonly array to mutable array for vibrate API
    if (Array.isArray(pattern)) {
      const mutableArray = [...pattern] as number[];
      navigator.vibrate(mutableArray);
    } else {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Arrête toute vibration en cours
   */
  cancel(): void {
    if (!this.isSupported) {
      return;
    }

    navigator.vibrate(0);
  }

  /**
   * Vibration progressive (pour ralentissement roue)
   * @param intensity - Intensité de 0 à 1
   * @param maxDuration - Durée maximale en ms
   */
  progressive(intensity: number, maxDuration: number = 50): void {
    if (!this.isSupported || !this.isEnabled) {
      return;
    }

    const duration = Math.floor(Math.max(0, Math.min(1, intensity)) * maxDuration);
    if (duration > 0) {
      navigator.vibrate(duration);
    }
  }
}

// Instance singleton
export const haptic = new HapticFeedback();

/**
 * Hook React pour utilisation facile du haptic feedback
 */
export function useHaptic() {
  return {
    trigger: (pattern: HapticPattern) => haptic.trigger(pattern),
    custom: (pattern: number | number[]) => haptic.custom(pattern),
    cancel: () => haptic.cancel(),
    progressive: (intensity: number, max?: number) => haptic.progressive(intensity, max),
    isAvailable: haptic.isAvailable(),
    isEnabled: haptic.getEnabled(),
    setEnabled: (enabled: boolean) => haptic.setEnabled(enabled),
  };
}
