import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mic } from 'lucide-react';
import { IconListItem } from './IconListItem';

/**
 * One achievement, or one community entry — the same item either way.
 *
 * It renders an `<li>`, so a story that drops it on its own would put a list
 * item outside a list, which axe reports and which is not how the page uses
 * it. Every story here supplies the `<ul>`.
 */

const meta = {
  title: 'UI/IconListItem',
  component: IconListItem,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const inAList = (children: React.ReactNode) => (
  <ul className="grid gap-4">{children}</ul>
);

export const AsTheAchievementsUseIt: Story = {
  args: {
    icon: CheckCircle,
    children: 'Built and led a test organisation across three regulated products.',
  },
  render: (args) => inAList(<IconListItem {...args} />),
};

/** The community entries each bring their own icon rather than sharing one. */
export const WithTheEntrysOwnIcon: Story = {
  args: {
    icon: Mic,
    children: 'Conference speaker on risk-based testing in GxP environments.',
  },
  render: (args) => inAList(<IconListItem {...args} />),
};

/** Several together, which is the only way the page ever shows them. */
export const AsAList: Story = {
  args: { icon: CheckCircle, children: 'The first entry.' },
  render: (args) =>
    inAList(
      <>
        <IconListItem {...args} />
        <IconListItem icon={Mic}>The second entry, with its own icon.</IconListItem>
      </>,
    ),
};
