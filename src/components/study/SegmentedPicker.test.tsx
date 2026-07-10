import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedPicker } from './SegmentedPicker';

const OPTIONS = [
  { value: 'low', label: '低い' },
  { value: 'medium', label: '中程度' },
  { value: 'confirmed', label: '確定' },
] as const;

describe('SegmentedPicker', () => {
  it('marks the current value as pressed and others as not', () => {
    render(<SegmentedPicker options={[...OPTIONS]} value="medium" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: '低い' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '中程度' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '確定' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the selected option value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedPicker options={[...OPTIONS]} value="low" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '確定' }));

    expect(onChange).toHaveBeenCalledWith('confirmed');
  });

  it('supports numeric option values (e.g. a 1-5 scale)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const numericOptions = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));
    render(<SegmentedPicker options={numericOptions} value={3} onChange={onChange} />);

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('marks no option as pressed when value is undefined (not-yet-rated state)', () => {
    render(<SegmentedPicker options={[...OPTIONS]} value={undefined} onChange={() => {}} />);

    for (const option of OPTIONS) {
      expect(screen.getByRole('button', { name: option.label })).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
