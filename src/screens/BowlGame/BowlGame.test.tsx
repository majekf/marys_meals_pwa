import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BowlGame } from './BowlGame';
import { ConfigProvider } from '../../config';
import type { ReactNode } from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onDragEnd, onDragStart, ...props }: any) => (
      <div 
        {...props} 
        data-drag-end={onDragEnd ? 'true' : undefined}
        data-drag-start={onDragStart ? 'true' : undefined}
      >
        {children}
      </div>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
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

describe('BowlGame', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          version: '0.1.0',
          appName: "Mary's Meals Slovakia",
          features: {
            kidsMode: { enabled: true, games: { bowlGame: true } },
            adultsMode: { enabled: true, sections: {} },
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

  it('should render game instructions', async () => {
    renderWithProviders(<BowlGame />);

    const heading = await screen.findByText(/Priprav výživnú kašu/i);
    expect(heading).toBeInTheDocument();
  });

  it('should render correct ingredients section', async () => {
    renderWithProviders(<BowlGame />);

    expect(await screen.findByText('Zdravé suroviny')).toBeInTheDocument();
    expect(screen.getByText('Kukuričná kaša')).toBeInTheDocument();
    expect(screen.getByText('Sója')).toBeInTheDocument();
    expect(screen.getByText('Cukor')).toBeInTheDocument();
    expect(screen.getByText('Vitamíny')).toBeInTheDocument();
  });

  it('should render wrong ingredients section', async () => {
    renderWithProviders(<BowlGame />);

    expect(await screen.findByText('Pozor! Toto sem nepatrí')).toBeInTheDocument();
    expect(screen.getByText('Cola')).toBeInTheDocument();
    expect(screen.getByText('Čipsy')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Zmrzlina')).toBeInTheDocument();
  });

  it('should render bowl placeholder', async () => {
    renderWithProviders(<BowlGame />);

    // Bowl placeholder emoji
    const placeholder = await screen.findByText('🥣');
    expect(placeholder).toBeInTheDocument();
  });

  it('should render progress panel with visual indicators', async () => {
    renderWithProviders(<BowlGame />);

    // Should have progress icons for each correct ingredient
    // Each ingredient has icon in progress panel
    const progressIcons = await screen.findAllByText('🥄');
    // 7 spoons for corn + 2 for soy + 1 for sugar = 10 spoons total
    expect(progressIcons.length).toBe(10);
  });

  it('should render vitamin star indicator', async () => {
    renderWithProviders(<BowlGame />);

    // 1 vitamin star indicator
    const stars = await screen.findAllByText('⭐');
    // 1 in progress panel + 1 as ingredient icon
    expect(stars.length).toBeGreaterThanOrEqual(1);
  });
});
