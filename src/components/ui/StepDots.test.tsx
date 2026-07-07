import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepDots } from './StepDots';

describe('StepDots', () => {
  it('renders one dot per exercise', () => {
    const { container } = render(<StepDots total={5} currentIndex={0} />);
    expect(container.querySelectorAll('span[class*="rounded-full"]')).toHaveLength(5);
  });

  it('exposes the current step via an accessible label', () => {
    render(<StepDots total={5} currentIndex={2} />);
    expect(screen.getByRole('img', { name: '種目 3 / 5' })).toBeInTheDocument();
  });

  it('marks the current dot wider than upcoming dots', () => {
    const { container } = render(<StepDots total={3} currentIndex={1} />);
    const dots = container.querySelectorAll('span');
    expect(dots[1].className).toContain('w-4');
    expect(dots[0].className).toContain('w-2');
    expect(dots[2].className).toContain('w-2');
  });
});
