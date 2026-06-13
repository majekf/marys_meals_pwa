/** Feature flag configuration types for Mary's Meals PWA */

export interface GamesConfig {
  bowlGame: boolean;
  volunteerKitchen: boolean;
  worldMap: boolean;
  schoolBell: boolean;
}

export interface AdultSectionsConfig {
  elevenCents: boolean;
  donationCalculator: boolean;
  getInvolved: boolean;
  schoolFeeding: boolean;
  stories: boolean;
}

export interface KidsModeConfig {
  enabled: boolean;
  games: GamesConfig;
}

export interface AdultsModeConfig {
  enabled: boolean;
  sections: AdultSectionsConfig;
}

export interface AudioConfig {
  enabled: boolean;
  sfx: boolean;
  narration: boolean;
}

export interface FeaturesConfig {
  kidsMode: KidsModeConfig;
  adultsMode: AdultsModeConfig;
  audio: AudioConfig;
  adminPanel: boolean;
  analytics: boolean;
}

export interface SettingsConfig {
  idleTimeoutMs: number;
  adultLockHoldMs: number;
  defaultLocale: string;
}

export interface AppConfig {
  version: string;
  appName: string;
  features: FeaturesConfig;
  settings: SettingsConfig;
}

/** Default configuration - used as fallback */
export const defaultConfig: AppConfig = {
  version: '0.1.0',
  appName: "Mary's Meals Slovakia",
  features: {
    kidsMode: {
      enabled: true,
      games: {
        bowlGame: true,
        volunteerKitchen: true,
        worldMap: false,
        schoolBell: false,
      },
    },
    adultsMode: {
      enabled: true,
      sections: {
        elevenCents: true,
        donationCalculator: true,
        getInvolved: true,
        schoolFeeding: false,
        stories: false,
      },
    },
    audio: {
      enabled: true,
      sfx: true,
      narration: false,
    },
    adminPanel: false,
    analytics: false,
  },
  settings: {
    idleTimeoutMs: 180000,
    adultLockHoldMs: 2000,
    defaultLocale: 'sk',
  },
};
