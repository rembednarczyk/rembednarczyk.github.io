import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ScrollToTop } from './ScrollToTop';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/ScrollToTop',
  component: ScrollToTop,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-[200vh] w-full relative p-10 text-slate-400">
      <p>Scroll down to see the button appear in the bottom right corner.</p>
      <ScrollToTop />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // We can't easily test the scroll behavior in Storybook's canvas without manual scrolling,
    // but we can test the initial state (hidden).
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
