import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CookieConsent } from './CookieConsent';

expect.extend(toHaveNoViolations);

const onAccept = fn();
const onDecline = fn();
const onOpenPolicy = fn();

const meta = {
  title: 'UI/CookieConsent',
  component: CookieConsent,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isVisible: true,
    onAccept,
    onDecline,
    onOpenPolicy,
  },
  // Stories share one browser page in the test runner, so call counts
  // leak between them unless each story starts from a clean slate.
  beforeEach: () => {
    onAccept.mockClear();
    onDecline.mockClear();
    onOpenPolicy.mockClear();
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shown to a first-time visitor who has made no choice yet. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/** Hidden once a choice has been stored. Renders nothing at all. */
export const Dismissed: Story = {
  args: { isVisible: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/** Accepting reports the choice exactly once. */
export const Accepting: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }));
    expect(args.onAccept).toHaveBeenCalledTimes(1);
    expect(args.onDecline).not.toHaveBeenCalled();
  },
};

/** Declining reports the choice without granting analytics storage. */
export const Declining: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Decline' }));
    expect(args.onDecline).toHaveBeenCalledTimes(1);
    expect(args.onAccept).not.toHaveBeenCalled();
  },
};

/** Every control must be reachable and operable by keyboard alone. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Read the privacy policy' }).focus();

    await userEvent.keyboard('{Enter}');
    expect(args.onOpenPolicy).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Decline' })).toHaveFocus();

    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Accept' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(args.onAccept).toHaveBeenCalledTimes(1);
  },
};
