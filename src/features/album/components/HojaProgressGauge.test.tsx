import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HojaProgressGauge } from './HojaProgressGauge';

describe('HojaProgressGauge', () => {
  it('shows the completion percentage', () => {
    render(<HojaProgressGauge pct={67} />);

    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('renders 0% and 100% without crashing', () => {
    const { rerender } = render(<HojaProgressGauge pct={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<HojaProgressGauge pct={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
