import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Reveal } from './Reveal';

/**
 * Content that rises into place as it comes into view.
 *
 * The reveal is measured where it can be measured: `npm run check:motion`
 * drives the built page in a real browser and counts the positions a section
 * passes through, with and without `prefers-reduced-motion`. Neither jsdom
 * nor this story can — motion reads the preference through matchMedia at
 * load, and a story cannot change what the browser reports.
 *
 * Both stories wait for the fade to finish before handing over. The
 * accessibility scan runs after the play function and reads the colour it
 * finds: mid-fade that is the text blended into the background, which it
 * correctly reports as unreadable and which nobody ever sees.
 */

const meta = {
  title: 'UI/Reveal',
  component: Reveal,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Waits for the arrival, so the scan reads the colour a visitor reads. */
async function arrived(canvasElement: HTMLElement) {
  const revealed = canvasElement.querySelector<HTMLElement>('p');
  if (!revealed) throw new Error('the reveal did not render');
  const moving = revealed.parentElement!;

  await waitFor(() => expect(getComputedStyle(moving).opacity).toBe('1'), {
    timeout: 3000,
  });
}

export const AsTheSectionsUseIt: Story = {
  args: {
    children: <p className="text-slate-300 p-6">A section arriving.</p>,
  },
  play: async ({ canvasElement }) => {
    await arrived(canvasElement);
  },
};

/** The pull quote asks for a longer, slower arrival on purpose. */
export const TheLongerSlowerOne: Story = {
  args: {
    distance: 30,
    duration: 0.8,
    ease: 'easeOut',
    children: <p className="text-slate-300 p-6">A quote arriving.</p>,
  },
  play: async ({ canvasElement }) => {
    await arrived(canvasElement);
  },
};
