import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import { Download, Mail } from 'lucide-react';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// State-driven stories
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    // A11y assertion
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving changes',
    variant: 'primary',
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const DisabledWithIcon: Story = {
  args: {
    children: (
      <>
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        Download CV
      </>
    ),
    variant: 'outline',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const LongTextOverflow: Story = {
  args: {
    children: 'This is a very long button text that might break the layout if not handled properly',
    variant: 'secondary',
    className: 'max-w-[200px] truncate',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const IconOnly: Story = {
  args: {
    children: <Mail className="h-5 w-5" aria-hidden="true" />,
    variant: 'ghost',
    size: 'icon',
    'aria-label': 'Send email',
  },
  play: async ({ canvasElement }) => {
    // Verifying our strict A11y rule for icon-only buttons
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /send email/i });
    expect(button).toBeInTheDocument();
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
