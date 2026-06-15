import { describe, it, expect, beforeEach } from 'vitest';
import { useFeedFilters } from './feedFilters.store';

describe('feedFilters.store', () => {
  beforeEach(() => {
    useFeedFilters.setState({ scope: null });
  });

  it('defaults to no scope ("todas")', () => {
    expect(useFeedFilters.getState().scope).toBeNull();
  });

  it('toggleScope selects a scope and switches between scopes', () => {
    useFeedFilters.getState().toggleScope('week');
    expect(useFeedFilters.getState().scope).toBe('week');

    useFeedFilters.getState().toggleScope('following');
    expect(useFeedFilters.getState().scope).toBe('following');
  });

  it('toggleScope on the active scope clears it back to "todas" (null)', () => {
    useFeedFilters.getState().toggleScope('today'); // -> 'today'
    useFeedFilters.getState().toggleScope('today'); // -> null
    expect(useFeedFilters.getState().scope).toBeNull();
  });
});
