import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NotFound } from './NotFound';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'Pages/NotFound',
  component: NotFound,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * How visible an element actually is.
 *
 * Reading `opacity` off the element itself is not enough: opacity is not
 * inherited, so a link inside a wrapper animating from 0 reports 1 while
 * being completely invisible. Getting that wrong is how an earlier version
 * of these stories passed against the very delay they were written to
 * catch.
 */
const effectiveOpacity = (element: Element | null): number => {
  let opacity = 1;
  for (let node = element; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity);
  }
  return opacity;
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/**
 * The reason this story exists. In jsdom the recovery link is present
 * whatever its opacity, so nothing there can tell a visible control from an
 * invisible one. It used to fade in on a 6.5s delay, and this fails against
 * that: the only way off an error page should not be six seconds of
 * decoration away.
 */
export const RecoveryIsAvailableAtOnce: Story = {
  play: async ({ canvasElement }) => {
    const home = within(canvasElement).getByRole('link', { name: /homepage/i });

    await waitFor(
      () => expect(effectiveOpacity(home)).toBeGreaterThan(0.9),
      { timeout: 1500 },
    );
  },
};

/**
 * A control at zero opacity still takes focus, and its focus ring is
 * transparent along with it. For the whole delay a keyboard visitor could
 * tab onto the link and see nothing move.
 */
export const TheWayOutIsReachableByKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const home = within(canvasElement).getByRole('link', { name: /homepage/i });

    await waitFor(() => expect(effectiveOpacity(home)).toBeGreaterThan(0.9), {
      timeout: 1500,
    });

    home.focus();
    expect(home).toHaveFocus();

    // Focused and actually on screen, rather than focused and transparent.
    const box = home.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    expect(getComputedStyle(home).visibility).toBe('visible');
    expect(effectiveOpacity(home)).toBeGreaterThan(0.9);
  },
};

/** The terminal is decoration; the summary beside it is what gets read. */
export const TheTerminalIsHiddenFromScreenReaders: Story = {
  play: async ({ canvasElement }) => {
    const live = canvasElement.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live?.textContent).toMatch(/Resource not found/);

    // Typed one character at a time, which is unreadable when announced.
    const decorative = canvasElement.querySelector('[aria-hidden="true"]');
    expect(decorative).not.toBeNull();

    // Nothing inside the decorative terminal should reach the tab order.
    const focusable = decorative!.querySelectorAll(
      'a[href], button, input, [tabindex]:not([tabindex="-1"])',
    );
    expect(focusable).toHaveLength(0);
  },
};

/** Tab reaches the link without passing through the animation. */
export const TabReachesTheLink: Story = {
  play: async ({ canvasElement }) => {
    const home = within(canvasElement).getByRole('link', { name: /homepage/i });
    await waitFor(() => expect(effectiveOpacity(home)).toBeGreaterThan(0.9), {
      timeout: 1500,
    });

    home.blur();
    await userEvent.tab();

    expect(home).toHaveFocus();
  },
};
