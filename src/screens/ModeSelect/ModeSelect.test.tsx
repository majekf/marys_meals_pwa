import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModeSelect } from './ModeSelect';
import { ConfigProvider } from '../../config';
import type { ReactNode } from 'react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: { children: ReactNode }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const renderWithProviders = (ui: ReactNode) => {
  return render(
    <ConfigProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ConfigProvider>
  );
};

describe('ModeSelect', () => {
  beforeEach(() => {
    // Mock successful config fetch
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          version: '0.1.0',
          appName: "Mary's Meals Slovakia",
          features: {
            kidsMode: { enabled: true, games: {} },
            adultsMode: { enabled: true, sections: {} },
            audio: { enabled: true, sfx: true, narration: false },
            adminPanel: false,
            analytics: false,
          },
          settings: {
            idleTimeoutMs: 180000,
            adultLockHoldMs: 2000,
            defaultLocale: 'sk',
          },
        }),
    } as Response);
  });

  it('should render app title', async () => {
    renderWithProviders(<ModeSelect />);

    // Wait for config to load
    const title = await screen.findByText("Mary's Meals Slovakia");
    expect(title).toBeInTheDocument();
  });

  it('should render kids mode button when enabled', async () => {
    renderWithProviders(<ModeSelect />);

    const kidsButton = await screen.findByText('Pre deti');
    expect(kidsButton).toBeInTheDocument();
  });

  it('should render adults mode button when enabled', async () => {
    renderWithProviders(<ModeSelect />);

    const adultsButton = await screen.findByText('Pre zvedavých');
    expect(adultsButton).toBeInTheDocument();
  });

  it('should render version number', async () => {
    renderWithProviders(<ModeSelect />);

    const version = await screen.findByText('v0.1.0');
    expect(version).toBeInTheDocument();
  });

  it('should show hint for adults mode', async () => {
    renderWithProviders(<ModeSelect />);

    const hint = await screen.findByText(/podržte tlačidlo 2 sekundy/i);
    expect(hint).toBeInTheDocument();
  });
});
