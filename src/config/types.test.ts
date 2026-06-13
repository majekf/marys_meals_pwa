import { describe, it, expect } from 'vitest';
import { defaultConfig } from './types';

describe('Config Types', () => {
  it('should have valid default config', () => {
    expect(defaultConfig).toBeDefined();
    expect(defaultConfig.version).toBe('0.1.0');
    expect(defaultConfig.appName).toBe("Mary's Meals Slovakia");
  });

  it('should have kidsMode configuration', () => {
    expect(defaultConfig.features.kidsMode.enabled).toBe(true);
    expect(defaultConfig.features.kidsMode.games).toBeDefined();
    expect(defaultConfig.features.kidsMode.games.bowlGame).toBe(true);
    expect(defaultConfig.features.kidsMode.games.volunteerKitchen).toBe(true);
  });

  it('should have adultsMode configuration', () => {
    expect(defaultConfig.features.adultsMode.enabled).toBe(true);
    expect(defaultConfig.features.adultsMode.sections).toBeDefined();
    expect(defaultConfig.features.adultsMode.sections.elevenCents).toBe(true);
    expect(defaultConfig.features.adultsMode.sections.donationCalculator).toBe(true);
  });

  it('should have correct settings', () => {
    expect(defaultConfig.settings.idleTimeoutMs).toBe(180000);
    expect(defaultConfig.settings.adultLockHoldMs).toBe(2000);
    expect(defaultConfig.settings.defaultLocale).toBe('sk');
  });

  it('should have audio configuration', () => {
    expect(defaultConfig.features.audio.enabled).toBe(true);
    expect(defaultConfig.features.audio.sfx).toBe(true);
    expect(defaultConfig.features.audio.narration).toBe(false);
  });
});
