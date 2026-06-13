import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from './useConfig';
import { defaultConfig } from './types';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('useConfig', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide default config initially', () => {
    // Mock fetch to fail so we use default config
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useConfig(), { wrapper });

    expect(result.current.config).toEqual(defaultConfig);
    expect(result.current.loading).toBe(true);
  });

  it('should load config from fetch', async () => {
    const mockConfig = {
      ...defaultConfig,
      version: '0.2.0',
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    } as Response);

    const { result } = renderHook(() => useConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.version).toBe('0.2.0');
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error gracefully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should fall back to default config
    expect(result.current.config).toEqual(defaultConfig);
    expect(result.current.error).toContain('404');
  });
});
