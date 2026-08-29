import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PrivacyPolicyModal, PrivacyPolicyModalProps } from './PrivacyPolicyModal';
import { useState } from 'react';

expect.extend(toHaveNoViolations);

const ModalWrapper = (args: PrivacyPolicyModalProps) => {
  const [isOpen, setIsOpen] = useState(true);
  return <PrivacyPolicyModal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

const meta = {
  title: 'UI/PrivacyPolicyModal',
  component: PrivacyPolicyModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrivacyPolicyModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
  render: (args) => <ModalWrapper {...args} />,
  play: async () => {
    // The modal renders through a portal, so scan the dialog node itself.
    // Scanning document.body also picks up the previous story's modal while
    // it is still animating out, and a half-faded surface fails the contrast
    // check -- an intermittent failure that has nothing to do with this story.
    const dialog = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!el) throw new Error('dialog not mounted');
      return el;
    });
    await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'));
    expect(await axe(dialog)).toHaveNoViolations();
  },
};
