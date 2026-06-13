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

    const heading = await screen.findByText(/Potiahni ingrediencie do misky/i);
    expect(heading).toBeInTheDocument();
  });

  it('should render all ingredients', async () => {
    renderWithProviders(<BowlGame />);

    expect(await screen.findByText('Kukurica')).toBeInTheDocument();
    expect(screen.getByText('Sója')).toBeInTheDocument();
    expect(screen.getByText('Cukor')).toBeInTheDocument();
    expect(screen.getByText('Vitamíny')).toBeInTheDocument();
  });

  it('should render progress counter', async () => {
    renderWithProviders(<BowlGame />);

    const progress = await screen.findByText('0 / 4 ingrediencií');
    expect(progress).toBeInTheDocument();
  });

  it('should render bowl placeholder', async () => {
    renderWithProviders(<BowlGame />);

    // Bowl placeholder emoji
    const placeholder = await screen.findByText('🥣');
    expect(placeholder).toBeInTheDocument();
  });

  it('should render ingredient emojis', async () => {
    renderWithProviders(<BowlGame />);

    expect(await screen.findByText('🌽')).toBeInTheDocument();
    expect(screen.getByText('🫘')).toBeInTheDocument();
    expect(screen.getByText('🍬')).toBeInTheDocument();
    expect(screen.getByText('💊')).toBeInTheDocument();
  });
});
