import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AppConfig } from './types';
import { defaultConfig } from './types';

interface ConfigContextValue {
  config: AppConfig;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: defaultConfig,
  loading: true,
  error: null,
});

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status}`);
        }
        const data: AppConfig = await response.json();
        setConfig(data);
        setError(null);
      } catch (err) {
        console.warn('Using default config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep using defaultConfig on error
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

/** Hook to access the app configuration */
export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}

/** Helper to check if a specific game is enabled */
export function useGameEnabled(
  gameKey: keyof AppConfig['features']['kidsMode']['games']
): boolean {
  const { config } = useConfig();
  return (
    config.features.kidsMode.enabled && config.features.kidsMode.games[gameKey]
  );
}

/** Helper to check if a specific adult section is enabled */
export function useSectionEnabled(
  sectionKey: keyof AppConfig['features']['adultsMode']['sections']
): boolean {
  const { config } = useConfig();
  return (
    config.features.adultsMode.enabled &&
    config.features.adultsMode.sections[sectionKey]
  );
}
