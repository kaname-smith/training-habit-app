import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReminderBanner } from './ReminderBanner';

const MORNING_9AM = new Date(2026, 6, 8, 9, 0, 0);
const MORNING_8AM = new Date(2026, 6, 8, 8, 0, 0);
const EVENING_6PM = new Date(2026, 6, 8, 18, 0, 0);

describe('ReminderBanner', () => {
  it('renders nothing when notifications are disabled', () => {
    const { container } = render(
      <ReminderBanner
        notificationsEnabled={false}
        notificationTime="morning"
        hasTodayLog={false}
        now={MORNING_9AM}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when today's workout is already logged", () => {
    const { container } = render(
      <ReminderBanner
        notificationsEnabled
        notificationTime="morning"
        hasTodayLog
        now={MORNING_9AM}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing before the configured time slot is due', () => {
    const { container } = render(
      <ReminderBanner
        notificationsEnabled
        notificationTime="morning"
        hasTodayLog={false}
        now={MORNING_8AM}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the reminder once the configured time slot has passed', () => {
    render(
      <ReminderBanner
        notificationsEnabled
        notificationTime="morning"
        hasTodayLog={false}
        now={MORNING_9AM}
      />,
    );
    expect(screen.getByText('今日はまだ記録がありません')).toBeInTheDocument();
  });

  it('respects the evening slot threshold independently', () => {
    const { container } = render(
      <ReminderBanner
        notificationsEnabled
        notificationTime="evening"
        hasTodayLog={false}
        now={MORNING_9AM}
      />,
    );
    expect(container).toBeEmptyDOMElement();

    render(
      <ReminderBanner
        notificationsEnabled
        notificationTime="evening"
        hasTodayLog={false}
        now={EVENING_6PM}
      />,
    );
    expect(screen.getByText('今日はまだ記録がありません')).toBeInTheDocument();
  });
});
