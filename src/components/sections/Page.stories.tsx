import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Portfolio } from '../../App';

expect.extend(toHaveNoViolations);

/**
 * The thirteen sections that make up the page had no accessibility coverage
 * of any kind. Forty-seven axe assertions existed, every one of them against
 * a primitive in ui/ or the 404 page, so the page a visitor actually reads
 * was the one part nobody checked.
 *
 * It was failing. Six elements were below the AA contrast threshold: the
 * period dates on every job and project at 3.98:1, and one line in the
 * contact section at 4.23:1. Nothing reported them because nothing looked.
 *
 * Scanning section by section would not have found them either. Contrast is
 * a property of text against whatever ends up behind it, and what ends up
 * behind it is decided by the page.
 */

const meta = {
  title: 'Pages/Portfolio',
  component: Portfolio,
  parameters: {
    layout: 'fullscreen',
    // The page carries its own background, and the default padded dark
    // wrapper would change what axe measures contrast against.
    backgrounds: { disable: true },
  },
} satisfies Meta<typeof Portfolio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sections animate in on scroll. axe skips anything still transparent, so a
 * scan that runs before they arrive reports a clean page by not looking at
 * most of it: jumping straight to the bottom leaves the sections passed over
 * at zero opacity, and the first run of this check found one violation
 * instead of six for exactly that reason.
 */
async function revealEverything(root: HTMLElement) {
  const scroller = document.scrollingElement ?? document.documentElement;
  const step = Math.max(200, Math.floor(window.innerHeight * 0.6));

  for (let y = 0; y < scroller.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 220));
  }

  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 400));

  // Established rather than assumed: nothing carrying text may still be
  // faded, or the scan below is quietly incomplete.
  const faded = [...root.querySelectorAll<HTMLElement>('section *')].filter(
    (el) =>
      Number(getComputedStyle(el).opacity) < 0.9 &&
      (el.textContent ?? '').trim().length > 0,
  );

  await waitFor(() => expect(faded).toHaveLength(0));
}

export const EveryVisibleSection: Story = {
  play: async ({ canvasElement }) => {
    await revealEverything(canvasElement);

    // Proves the page is really here: a scan of an empty tree passes.
    expect(canvasElement.querySelectorAll('section[id]').length).toBeGreaterThan(10);

    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/**
 * The print CV is display:none on screen, so the scan above never sees it.
 * It is rendered on white, where the greys that read well on a dark page do
 * not: the certification ID numbers sat at 2.63:1, which is the one thing on
 * a printed CV somebody might need to copy out and check.
 *
 * Only contrast is checked here. axe also reports missing landmarks in this
 * view, and landmarks do nothing on paper.
 */
export const ThePrintedCV: Story = {
  parameters: { backgrounds: { disable: true } },
  play: async ({ canvasElement }) => {
    const cv = canvasElement.querySelector<HTMLElement>('.print\\:block');
    expect(cv).not.toBeNull();

    // Shown for the scan, since axe ignores what is not displayed.
    cv!.classList.remove('hidden');
    cv!.style.display = 'block';

    expect(cv!.textContent).toContain('Remigiusz Bednarczyk');

    expect(
      await axe(cv!, { runOnly: ['color-contrast'] }),
    ).toHaveNoViolations();
  },
};
