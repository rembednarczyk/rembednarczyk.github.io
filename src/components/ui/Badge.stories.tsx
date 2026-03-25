import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from './Badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'success', 'error'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'React',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const Outline: Story = {
  args: {
    children: 'TypeScript',
    variant: 'outline',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const SuccessWithIcon: Story = {
  args: {
    children: 'Passed',
    variant: 'success',
    icon: <CheckCircle className="h-3 w-3" aria-hidden="true" />,
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const ErrorState: Story = {
  args: {
    children: 'Failed',
    variant: 'error',
    icon: <AlertCircle className="h-3 w-3" aria-hidden="true" />,
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const LongTextOverflow: Story = {
  args: {
    children: 'This is a very long badge text that should be handled gracefully',
    variant: 'outline',
    className: 'max-w-[150px] truncate block',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
