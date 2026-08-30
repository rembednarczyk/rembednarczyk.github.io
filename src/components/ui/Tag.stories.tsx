import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Tag } from './Tag';

/**
 * The word that broke it.
 *
 * A tag is a string the data supplies, and a long one with nothing to break
 * on used to push the page sideways on a phone. That was found on the
 * project card and fixed there; the hero and the job entries carried their
 * own copies of the pill and kept the defect. This holds the one pill they
 * all use now.
 */

const UNBREAKABLE = 'VeryLongSingleWordTagWithNoSpacesToBreakOn';

const meta = {
  title: 'UI/Tag',
  component: Tag,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing may reach past the container the tags are laid out in. */
async function expectNoSpill(canvasElement: HTMLElement) {
  const row = canvasElement.querySelector('[data-row]');
  if (!row) throw new Error('the row did not render');

  const limit = Math.ceil(row.getBoundingClientRect().right) + 1;
  const spilling = [...row.querySelectorAll<HTMLElement>('span')]
    .filter((el) => el.getBoundingClientRect().right > limit)
    .map((el) => el.textContent ?? '');

  expect(spilling, `these reach past the row:\n  ${spilling.join('\n  ')}`).toHaveLength(0);
}

export const AsUsed: Story = {
  args: { children: 'Quality Engineering' },
  render: (args) => (
    <div data-row style={{ width: 288 }} className="flex flex-wrap gap-2">
      <Tag {...args} />
      <Tag>ISTQB</Tag>
      <Tag>GxP</Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Established first: the check below proves nothing if ordinary tags
    // already fail it.
    await expectNoSpill(canvasElement);
  },
};

/**
 * 288px is the row a 320px phone leaves after the page's own padding, which
 * is where the overflow was measured.
 */
export const AWordWithNothingToBreakOn: Story = {
  args: { children: UNBREAKABLE },
  render: (args) => (
    <div data-row style={{ width: 288 }} className="flex flex-wrap gap-2">
      <Tag>ISTQB</Tag>
      <Tag {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectNoSpill(canvasElement);
  },
};

/** The hero's larger pill has to survive it too. */
export const TheLargerSizeAtTheSameWidth: Story = {
  args: { children: UNBREAKABLE, size: 'sm' },
  render: (args) => (
    <div data-row style={{ width: 288 }} className="flex flex-wrap gap-2">
      <Tag {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectNoSpill(canvasElement);
  },
};
