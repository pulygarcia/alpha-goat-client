import { describe, it, expect, beforeEach } from 'vitest';
import { useFeedFilters } from './feedFilters.store';

describe('feedFilters.store', () => {
  beforeEach(() => {
    useFeedFilters.setState({ scope: 'today' });
  });

  it('defaults to the "today" scope', () => {
    expect(useFeedFilters.getState().scope).toBe('today');
  });

  it('toggleScope switches to a different scope', () => {
    useFeedFilters.getState().toggleScope('week');
    expect(useFeedFilters.getState().scope).toBe('week');

    useFeedFilters.getState().toggleScope('following');
    expect(useFeedFilters.getState().scope).toBe('following');
  });

  it('toggleScope on the active scope clears it back to "todas" (null)', () => {
    useFeedFilters.getState().toggleScope('today');
    expect(useFeedFilters.getState().scope).toBeNull();
  });

  it('selecting again after clearing re-applies the scope', () => {
    useFeedFilters.getState().toggleScope('today'); // -> null
    useFeedFilters.getState().toggleScope('today'); // -> 'today'
    expect(useFeedFilters.getState().scope).toBe('today');
  });
});
