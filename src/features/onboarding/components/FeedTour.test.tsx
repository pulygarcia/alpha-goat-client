import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FeedTour } from './FeedTour';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

vi.mock('@/shared/hooks/useMediaQuery');

const mockJoyrideProps = vi.fn();
vi.mock('react-joyride', () => ({
  Joyride: (props: { onEvent: (data: { status: string }) => void }) => {
    mockJoyrideProps(props);
    return <div data-testid="joyride-mock" />;
  },
}));

const TOUR_KEY = 'ag-feed-fab-tour-seen';

beforeEach(() => {
  window.localStorage.clear();
  mockJoyrideProps.mockClear();
  vi.mocked(useMediaQuery).mockReturnValue(true);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('FeedTour', () => {
  it('no renderiza en desktop', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
  });

  it('no renderiza si ya fue visto', () => {
    window.localStorage.setItem(TOUR_KEY, '1');
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
  });

  it('renderiza tras el delay en mobile sin visto previo', () => {
    render(<FeedTour forceClose={false} />);
    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(600));

    expect(screen.getByTestId('joyride-mock')).toBeInTheDocument();
  });

  it('marca visto y se oculta cuando forceClose pasa a true', () => {
    const { rerender } = render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByTestId('joyride-mock')).toBeInTheDocument();

    rerender(<FeedTour forceClose />);

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });

  it('marca visto cuando joyride reporta finished', () => {
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    const lastProps = mockJoyrideProps.mock.calls.at(-1)![0];
    act(() => lastProps.onEvent({ status: 'finished' }));

    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });

  it('marca visto cuando joyride reporta skipped', () => {
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    const lastProps = mockJoyrideProps.mock.calls.at(-1)![0];
    act(() => lastProps.onEvent({ status: 'skipped' }));

    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });
});
