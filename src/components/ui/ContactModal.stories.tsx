import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ContactModal, ContactModalProps } from './ContactModal';
import { useState } from 'react';

expect.extend(toHaveNoViolations);

const ModalWrapper = (args: ContactModalProps) => {
  const [isOpen, setIsOpen] = useState(true);
  return <ContactModal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

const meta = {
  title: 'UI/ContactModal',
  component: ContactModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContactModal>;

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
