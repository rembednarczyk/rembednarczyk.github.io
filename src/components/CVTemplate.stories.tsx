import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CVTemplate } from './CVTemplate';

expect.extend(toHaveNoViolations);

/**
 * The printed CV, rendered on its own.
 *
 * The first version of this check dug the CV out of the live page with
 * `querySelector('.print\\:block')` and scanned that. It passed locally and
 * failed in CI on a tag from the hero section, measured mid-animation at
 * 1.01:1 against the page background, which is nowhere near the CV. Pulling
 * one subtree out of a running page and trusting that only that subtree is
 * examined turned out to be exactly as reliable as it sounds.
 *
 * Rendering the template by itself removes the question. There is no page
 * around it, nothing animating, and nothing else that could be measured.
 */

const meta = {
  title: 'Pages/PrintedCV',
  component: CVTemplate,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
  decorators: [
    // Paper. The greys that read well on a dark page do not read on white,
    // which is the whole reason this check exists.
    (Story) => (
      <div style={{ background: '#ffffff', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CVTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Only contrast. axe also reports a missing main landmark and content
 * outside landmarks here, and landmarks do nothing on paper.
 */
export const ReadableOnPaper: Story = {
  play: async ({ canvasElement }) => {
    // Established first: a scan of the wrong element, or of nothing, passes.
    expect(canvasElement.textContent).toContain('Professional Experience');
    expect(canvasElement.querySelectorAll('section').length).toBeGreaterThan(4);

    expect(
      await axe(canvasElement, { runOnly: ['color-contrast'] }),
    ).toHaveNoViolations();
  },
};
