import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorBoundary } from './ErrorBoundary';

expect.extend(toHaveNoViolations);

/**
 * The fallback is the one screen nobody sees until something is already
 * wrong, which makes it the easiest place for an accessibility problem to
 * sit unnoticed. It is also the screen where getting in touch matters most,
 * so its links have to work by keyboard and read correctly.
 */

const Boom = () => {
  throw new Error('something in the page threw');
};

const meta = {
  title: 'Pages/ErrorFallback',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
  // The children come from `render`, which mounts a component that throws.
  // The declared arg is what satisfies the required prop.
  args: { children: null },
  render: () => (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  ),
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Established first: a scan of a page that rendered normally proves
    // nothing about the fallback.
    expect(within(canvasElement).getByRole('heading', { level: 1 })).toBeInTheDocument();

    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/** Every way of getting in touch has to be reachable without a mouse. */
export const ContactIsReachableByKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);

    for (const link of links) {
      link.focus();
      expect(link).toHaveFocus();

      // Focused and visible, rather than focused and painted out.
      const box = link.getBoundingClientRect();
      expect(box.width).toBeGreaterThan(0);
      expect(getComputedStyle(link).visibility).toBe('visible');
    }

    // And the retry, which is the only control on the screen.
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: /again/i })).toBeInTheDocument();
  },
};
