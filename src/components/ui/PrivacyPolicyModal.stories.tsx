import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
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
    // We test the document body because modals render in portals or fixed overlays
    expect(await axe(document.body)).toHaveNoViolations();
  },
};
