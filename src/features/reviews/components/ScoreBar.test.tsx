import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreBar } from './ScoreBar';

function setup(value = 5, variant?: 'hero' | 'axis') {
  const onChange = vi.fn();
  render(
    <ScoreBar
      label="Dulzor"
      value={value}
      onChange={onChange}
      variant={variant}
    />,
  );
  return { onChange, slider: screen.getByRole('slider', { name: 'Dulzor' }) };
}

describe('ScoreBar', () => {
  it('exposes the score through the slider role', () => {
    const { slider } = setup(7.5);
    expect(slider).toHaveAttribute('aria-valuenow', '7.5');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });

  it('increases by 0.5 on ArrowRight', () => {
    const { onChange, slider } = setup(5);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(5.5);
  });

  it('decreases by 0.5 on ArrowLeft', () => {
    const { onChange, slider } = setup(5);
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(4.5);
  });

  it('jumps to the ends with Home and End', () => {
    const { onChange, slider } = setup(5);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith(0);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('does not go past the ends', () => {
    const { onChange, slider } = setup(10);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('shows the axis value rounded to one decimal', () => {
    setup(7.5);
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });

  it('steps half a point with the hero buttons', () => {
    const onChange = vi.fn();
    render(
      <ScoreBar
        variant="hero"
        label="Puntaje general"
        value={8}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /subir medio punto/i }));
    expect(onChange).toHaveBeenCalledWith(8.5);

    fireEvent.click(screen.getByRole('button', { name: /bajar medio punto/i }));
    expect(onChange).toHaveBeenCalledWith(7.5);
  });
});
