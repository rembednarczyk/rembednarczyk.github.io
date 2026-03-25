import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Card } from './Card';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['glass', 'solid', 'outline'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Glassmorphism: Story = {
  args: {
    children: (
      <div className="p-6 text-slate-200">
        <h3 className="text-lg font-bold mb-2">Glass Card</h3>
        <p className="text-sm text-slate-400">This card uses backdrop-blur and semi-transparent backgrounds to create a glass effect.</p>
      </div>
    ),
    variant: 'glass',
    className: 'w-[300px]',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const Solid: Story = {
  args: {
    children: (
      <div className="p-6 text-slate-200">
        <h3 className="text-lg font-bold mb-2">Solid Card</h3>
        <p className="text-sm text-slate-400">A standard solid card without blur effects.</p>
      </div>
    ),
    variant: 'solid',
    className: 'w-[300px]',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const EmptyState: Story = {
  args: {
    children: (
      <div className="p-10 flex flex-col items-center justify-center text-center text-slate-400">
        <p>No data available</p>
      </div>
    ),
    variant: 'outline',
    className: 'w-[300px] border-dashed',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const LoadingState: Story = {
  args: {
    children: (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded"></div>
          <div className="h-3 bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    ),
    variant: 'glass',
    className: 'w-[300px]',
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
