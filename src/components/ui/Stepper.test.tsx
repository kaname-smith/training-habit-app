import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('increments by the step amount', async () => {
    const onChange = vi.fn();
    render(<Stepper value={10} onChange={onChange} step={5} aria-label="test" />);
    await userEvent.click(screen.getByLabelText('増やす'));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('decrements by the step amount', async () => {
    const onChange = vi.fn();
    render(<Stepper value={10} onChange={onChange} step={5} aria-label="test" />);
    await userEvent.click(screen.getByLabelText('減らす'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('does not go below the minimum', () => {
    const onChange = vi.fn();
    render(<Stepper value={0} onChange={onChange} min={0} step={5} aria-label="test" />);
    expect(screen.getByLabelText('減らす')).toBeDisabled();
  });

  it('does not exceed the maximum', () => {
    const onChange = vi.fn();
    render(<Stepper value={100} onChange={onChange} max={100} step={5} aria-label="test" />);
    expect(screen.getByLabelText('増やす')).toBeDisabled();
  });

  it('renders the current value with an optional unit', () => {
    render(<Stepper value={40} onChange={() => {}} unit="g" aria-label="test" />);
    expect(screen.getByText('40g')).toBeInTheDocument();
  });
});
