import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Sparkles, AlertTriangle } from 'lucide-react';

expect.extend(toHaveNoViolations);

const meta = {
  title: 'UI/Wow/AIAssistedCard',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates how the UI behaves when handling unpredictable, 
 * AI-generated dynamic data. It models edge cases like long text, 
 * unexpected formatting, and missing fields.
 */
export const DynamicAIGeneratedContent: Story = {
  args: {
    variant: 'glass',
    className: 'w-full max-w-md',
    children: (
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-100 leading-tight">
            AI Analysis: Unpredictable Title Length That Might Span Multiple Lines
          </h3>
          <Badge variant="success" icon={<Sparkles className="h-3 w-3" />}>
            98% Match
          </Badge>
        </div>
        
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            The AI returned a very long, unformatted block of text. We need to ensure 
            our Card component handles this gracefully without breaking the layout or 
            causing overflow issues on smaller screens.
          </p>
          <div className="bg-slate-950 p-3 rounded-md border border-slate-800 font-mono text-xs overflow-x-auto">
            {`{"confidence": 0.98, "tags": ["AI", "EdgeCase", "UI/UX", "VeryLongTagThatShouldNotBreakLayout"]}`}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">AI</Badge>
          <Badge variant="outline">EdgeCase</Badge>
          <Badge variant="outline">UI/UX</Badge>
          <Badge variant="outline" className="max-w-[120px] truncate block" title="VeryLongTagThatShouldNotBreakLayout">
            VeryLongTagThatShouldNotBreakLayout
          </Badge>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" size="sm">Reject</Button>
          <Button variant="primary" size="sm">Apply Changes</Button>
        </div>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    // Asserting that even with complex, unpredictable AI content, 
    // the component remains fully accessible.
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};

export const AIErrorState: Story = {
  args: {
    variant: 'outline',
    className: 'w-full max-w-md border-red-500/30',
    children: (
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Generation Failed</h3>
          <p className="text-sm text-slate-400 mt-1">
            The AI model timed out or returned an invalid response.
          </p>
        </div>
        <Button variant="outline" className="mt-2">Retry Generation</Button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    expect(await axe(canvasElement)).toHaveNoViolations();
  },
};
