import type { Meta, StoryObj } from '@storybook/react-vite';
import { Award } from 'lucide-react';
import { IconCard } from './IconCard';

/**
 * The shell the certifications and the expertise cards share.
 *
 * A story is this repository's accessibility gate: the addon runs axe on
 * every one and fails the build. This card carries small `text-slate-400`
 * on a translucent panel, which is exactly the pairing a contrast check
 * exists to catch, and it had no story of its own when it was extracted.
 */

const meta = {
  title: 'UI/IconCard',
  component: IconCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The expertise shape: a paragraph under the title. */
export const WithAParagraph: Story = {
  args: {
    icon: <Award className="text-cyan-400" aria-hidden="true" />,
    title: 'Test Strategy',
    children: (
      <p className="text-slate-400 text-sm leading-relaxed">
        Risk-based planning for regulated environments, from qualification
        through release.
      </p>
    ),
  },
};

/** The certifications shape: a bulleted list under the title. */
export const WithAList: Story = {
  args: {
    icon: <Award className="text-cyan-400" aria-hidden="true" />,
    title: 'Core certifications',
    children: (
      <ul className="space-y-2">
        {['ISTQB Advanced Test Manager', 'ISTQB Foundation'].map((line) => (
          <li key={line} className="text-slate-400 text-sm flex items-start gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 shrink-0 mt-1.5"
              aria-hidden="true"
            ></span>
            {line}
          </li>
        ))}
      </ul>
    ),
  },
};

/**
 * A title with nothing to break on, at the width a 320px phone leaves. The
 * card titles come from data, and a long one is how the tag pill broke.
 */
export const ATitleWithNothingToBreakOn: Story = {
  args: {
    icon: <Award className="text-cyan-400" aria-hidden="true" />,
    title: 'ComputerisedSystemValidationAndQualification',
    children: <p className="text-slate-400 text-sm leading-relaxed">Short body.</p>,
  },
  render: (args) => (
    <div style={{ width: 288 }}>
      <IconCard {...args} />
    </div>
  ),
};
