import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DonationCalculator } from './DonationCalculator';
import { ConfigProvider } from '../../config';
import type { ReactNode } from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
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

describe('DonationCalculator', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          version: '0.1.0',
          appName: "Mary's Meals Slovakia",
          features: {
            kidsMode: { enabled: true, games: {} },
            adultsMode: { enabled: true, sections: { donationCalculator: true } },
            audio: { enabled: false, sfx: false, narration: false },
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

  it('should render amount input label', async () => {
    renderWithProviders(<DonationCalculator />);

    const label = await screen.findByText('Suma príspevku');
    expect(label).toBeInTheDocument();
  });

  it('should render preset amount buttons', async () => {
    renderWithProviders(<DonationCalculator />);

    expect(await screen.findByText('€5')).toBeInTheDocument();
    expect(screen.getByText('€10')).toBeInTheDocument();
    expect(screen.getByText('€20')).toBeInTheDocument();
    expect(screen.getByText('€50')).toBeInTheDocument();
  });

  it('should render results title', async () => {
    renderWithProviders(<DonationCalculator />);

    const resultsTitle = await screen.findByText('Váš príspevok zabezpečí:');
    expect(resultsTitle).toBeInTheDocument();
  });

  it('should render donate button', async () => {
    renderWithProviders(<DonationCalculator />);

    // Default amount is €10
    const donateButton = await screen.findByText(/Prispieť.*€10/);
    expect(donateButton).toBeInTheDocument();
  });
});
