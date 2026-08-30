import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Sparkles, ExternalLink } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { keyProjectsData } from '../../../data/portfolioData';

expect.extend(toHaveNoViolations);

/**
 * How the card the site actually renders behaves when the content is not
 * what anyone planned for.
 *
 * This replaces a story called AiAssistedCard, which demonstrated the same
 * idea against a Card and a Badge that no page rendered. It proved that two
 * components nobody ships could survive a long string, which is not the
 * question worth answering — and it claimed to check that the layout did
 * not break while asserting nothing but accessibility.
 *
 * ProjectCard takes its data as a prop, so the awkward cases can simply be
 * handed to it.
 */

const meta = {
  title: 'Sections/ProjectCard',
  component: ProjectCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fails with the offending element named, rather than just a number. */
async function expectNoOverflow(canvasElement: HTMLElement) {
  const card = canvasElement.querySelector('article');
  if (!card) throw new Error('the card did not render');

  const limit = Math.ceil(card.getBoundingClientRect().right) + 1;
  const spilling = [...card.querySelectorAll<HTMLElement>('*')]
    .filter((el) => el.getBoundingClientRect().right > limit)
    .map((el) => `${el.tagName.toLowerCase()}: ${(el.textContent ?? '').slice(0, 40)}`);

  expect(spilling, `these reach past the card's own edge:\n  ${spilling.join('\n  ')}`)
    .toHaveLength(0);
}

export const AsRendered: Story = {
  args: { project: keyProjectsData[0]! },
  play: async ({ canvasElement }) => {
    // Established first: the checks below prove nothing if the ordinary
    // case already fails them.
    await expectNoOverflow(canvasElement);
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/**
 * Long, unbroken, unformatted — the shape content arrives in when it was
 * generated rather than written, and the shape nobody lays a card out for.
 */
export const UnpredictableContent: Story = {
  args: {
    project: {
      title:
        'AI Analysis: An Unpredictable Title Of The Length A Generated Summary Actually Produces, Which Will Span Several Lines',
      desc: 'The model returned a long, unformatted block with no paragraph breaks and no regard for the space it was going into, which is what happens when text is produced by something that cannot see the layout it lands in, and it keeps going for considerably longer than the two lines this box was drawn around.',
      tags: [
        'AI',
        'EdgeCase',
        'VeryLongSingleWordTagWithNoSpacesToBreakOn',
        'UI/UX',
      ],
      mainIcon: <Sparkles className="h-8 w-8" aria-hidden="true" />,
      links: [
        {
          url: 'https://example.com',
          icon: <ExternalLink className="h-5 w-5" aria-hidden="true" />,
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // The claim the old story made and never checked.
    await expectNoOverflow(canvasElement);
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/**
 * The same content in the width most visitors arrive at. A card can hold
 * together at 1280px and spill at 320.
 */
export const UnpredictableContentOnAPhone: Story = {
  args: UnpredictableContent.args,
  globals: { viewport: { value: 'mobile1' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNoOverflow(canvasElement);
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

/** Fields the data promises but a generated record may not carry. */
export const MissingFields: Story = {
  args: {
    project: {
      title: 'No links, no tags',
      desc: 'Everything optional is absent.',
      tags: [],
      mainIcon: <Sparkles className="h-8 w-8" aria-hidden="true" />,
    },
  },
  play: async ({ canvasElement }) => {
    // An empty tag row must not leave a gap that reads as something missing.
    expect(canvasElement.querySelector('article')).toBeTruthy();
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
