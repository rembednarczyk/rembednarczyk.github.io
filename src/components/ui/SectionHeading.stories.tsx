import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SectionHeading } from './SectionHeading';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/SectionHeading',
  component: SectionHeading,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    number: { control: 'text' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    number: '01',
    title: 'About Me',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
