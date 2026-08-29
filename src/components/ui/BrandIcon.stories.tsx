import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { GithubIcon, LinkedinIcon } from './BrandIcon';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/BrandIcon',
  component: LinkedinIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LinkedinIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both marks at the sizes the site actually uses. */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-slate-200">
      <LinkedinIcon size={28} aria-label="LinkedIn" role="img" />
      <GithubIcon size={28} aria-label="GitHub" role="img" />
      <LinkedinIcon size={14} aria-label="LinkedIn, small" role="img" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

/**
 * Decorative usage. The site renders these next to a text label, so the icon
 * is hidden from assistive technology rather than announced twice.
 */
export const Decorative: Story = {
  render: () => (
    <a href="https://example.com" className="inline-flex items-center gap-2 text-slate-200">
      <GithubIcon size={28} aria-hidden="true" />
      GitHub
    </a>
  ),
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
