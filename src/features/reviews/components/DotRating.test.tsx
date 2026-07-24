import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DotRating } from './DotRating';

describe('DotRating', () => {
  it('shows the label and current value', () => {
    render(<DotRating label="Dulzor" value={7} onChange={vi.fn()} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '7');
  });

  it('increases by 0.5 on ArrowRight and clamps at 10', () => {
    const onChange = vi.fn();
    render(<DotRating label="Dulzor" value={10} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('decreases by 0.5 on ArrowLeft', () => {
    const onChange = vi.fn();
    render(<DotRating label="Dulzor" value={7} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(6.5);
  });

  it('jumps to 0/10 on Home/End', () => {
    const onChange = vi.fn();
    render(<DotRating label="Dulzor" value={5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith(0);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('sets a value from a pointer position on the track', () => {
    const onChange = vi.fn();
    render(<DotRating label="Dulzor" value={0} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 100,
      width: 100,
      top: 0,
      bottom: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => '',
    });
    slider.setPointerCapture = vi.fn();
    fireEvent.pointerDown(slider, { clientX: 70, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith(7);
  });
});
