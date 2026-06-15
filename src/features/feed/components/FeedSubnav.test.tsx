import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedSubnav } from './FeedSubnav';
import { useFeedStats } from '../hooks/useFeedStats';
import { useFeedFilters } from '../store/feedFilters.store';

vi.mock('../hooks/useFeedStats', () => ({
  useFeedStats: vi.fn(),
}));

const mockedStats = vi.mocked(useFeedStats);

describe('FeedSubnav', () => {
  beforeEach(() => {
    useFeedFilters.setState({ scope: null });
    mockedStats.mockReturnValue({
      data: { todayCount: 3, weekCount: 12 },
    } as unknown as ReturnType<typeof useFeedStats>);
  });

  it('renders the period and scope chips', () => {
    render(<FeedSubnav />);
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('Siguiendo')).toBeInTheDocument();
  });

  it('does not render the removed "Por provincia" chip', () => {
    render(<FeedSubnav />);
    expect(screen.queryByText('Por provincia')).not.toBeInTheDocument();
  });

  it('selecting "Esta semana" sets the week scope', () => {
    render(<FeedSubnav />);
    fireEvent.click(screen.getByText('Esta semana'));
    expect(useFeedFilters.getState().scope).toBe('week');
  });

  it('selecting "Siguiendo" sets the following scope', () => {
    render(<FeedSubnav />);
    fireEvent.click(screen.getByText('Siguiendo'));
    expect(useFeedFilters.getState().scope).toBe('following');
  });

  it('clicking the active chip clears the scope to "todas"', () => {
    render(<FeedSubnav />);
    fireEvent.click(screen.getByText('Hoy')); // null -> today
    fireEvent.click(screen.getByText('Hoy')); // today -> null
    expect(useFeedFilters.getState().scope).toBeNull();
  });

  it('shows the stat counters from the feed stats', () => {
    render(<FeedSubnav />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('falls back to a dash while stats are loading', () => {
    mockedStats.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useFeedStats>);
    render(<FeedSubnav />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
