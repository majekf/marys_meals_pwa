import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    // CSS modules generate unique class names like _primary_xxxxx
    expect(screen.getByRole('button').className).toMatch(/primary/i);

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toMatch(/secondary/i);

    rerender(<Button variant="accent">Accent</Button>);
    expect(screen.getByRole('button').className).toMatch(/accent/i);
  });

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toMatch(/sm/i);

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toMatch(/lg/i);
  });

  it('should apply fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    expect(screen.getByRole('button').className).toMatch(/fullWidth/i);
  });

  it('should render icon on left by default', () => {
    render(<Button icon={<span data-testid="icon">🎮</span>}>With Icon</Button>);
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('icon');
    
    // Icon should appear before label in DOM
    expect(button.firstChild).toContainElement(icon);
  });

  it('should render icon on right when specified', () => {
    render(
      <Button icon={<span data-testid="icon">➡️</span>} iconPosition="right">
        Next
      </Button>
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('icon');
    
    // Icon should appear after label in DOM
    expect(button.lastChild).toContainElement(icon);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
