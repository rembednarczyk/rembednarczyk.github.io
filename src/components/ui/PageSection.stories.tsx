import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { PageSection } from './PageSection';

/**
 * The anchor, the reveal and the numbered heading that ten sections share.
 *
 * The heading is what a screen reader navigates by, so the level matters:
 * the page has one `h1` in the hero and every section heading sits under it
 * as an `h2`. A story is where that is checked in isolation, and where the
 * accessibility addon scans the section on its own rather than buried in a
 * whole-page render.
 */

const meta = {
  title: 'UI/PageSection',
  component: PageSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsTheSectionsUseIt: Story = {
  args: {
    id: 'skills',
    number: '06',
    title: 'Technologies & Skills',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <p className="text-slate-400">The caller supplies its own grid.</p>
        <p className="text-slate-400">Six different ones are in use.</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    // The content starts at opacity 0 and rises in; the accessibility scan
    // runs after this and reads the colour it finds, which mid-fade is the
    // text blended into the background.
    const revealed = canvasElement.querySelector<HTMLElement>('section > div');
    if (!revealed) throw new Error('the section did not render');
    await waitFor(() => expect(getComputedStyle(revealed).opacity).toBe('1'), {
      timeout: 3000,
    });

    const heading = canvasElement.querySelector('h2');
    expect(heading, 'a section heading has to sit under the page h1').not.toBeNull();
    expect(heading!.textContent).toContain('Technologies & Skills');
  },
};

/** The anchor the navigation scrolls to and the scroll spy watches. */
export const CarriesTheAnchorTheNavigationUses: Story = {
  args: {
    id: 'certifications',
    number: '07',
    title: 'Certifications',
    children: <p className="text-slate-400">Content.</p>,
  },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector('section');
    expect(section?.id).toBe('certifications');
  },
};
