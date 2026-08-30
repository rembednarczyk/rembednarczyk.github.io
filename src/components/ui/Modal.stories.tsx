import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { Modal, ModalProps } from './Modal';

expect.extend(toHaveNoViolations);

/**
 * The shell both dialogs share.
 *
 * The two dialogs have their own stories, and those cover the shell through
 * a caller. What only this can cover is the shell's own contract without a
 * caller's markup around it: that the label points at a heading that exists,
 * that the page behind is declared inert, and that the close button is
 * named. A dialog gets all three wrong silently — it still opens and still
 * looks right.
 */

const Wrapper = (args: ModalProps) => {
  const [isOpen, setIsOpen] = useState(true);
  return <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Waits for the dialog to finish arriving, then hands back its node. */
async function openDialog() {
  const dialog = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!el) throw new Error('dialog not mounted');
    return el;
  });
  // Scanning a half-faded surface fails the contrast check for reasons that
  // have nothing to do with the markup.
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'));
  return dialog;
}

export const TheFormWidth: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Send a Message',
    closeLabel: 'Close modal',
    children: <p className="text-slate-300">A form goes here.</p>,
  },
  render: (args) => <Wrapper {...args} />,
  play: async () => {
    const dialog = await openDialog();
    expect(await axe(dialog)).toHaveNoViolations();
  },
};

/** Running text needs a wider column than a form does. */
export const TheProseWidth: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Privacy Policy',
    icon: <Shield className="w-6 h-6 text-cyan-400" aria-hidden="true" />,
    width: 'prose',
    closeLabel: 'Close privacy policy',
    bodyClassName: 'text-slate-300 space-y-6',
    children: <p>A policy goes here.</p>,
  },
  render: (args) => <Wrapper {...args} />,
  play: async () => {
    const dialog = await openDialog();
    expect(await axe(dialog)).toHaveNoViolations();
  },
};

/**
 * The three things a hand-written dialog drops without anything noticing.
 * These were two magic strings kept matching by hand before the shell
 * generated the id.
 */
export const DeclaresWhatAssistiveTechnologyNeeds: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Send a Message',
    closeLabel: 'Close modal',
    children: <p className="text-slate-300">Body.</p>,
  },
  render: (args) => <Wrapper {...args} />,
  play: async () => {
    const dialog = await openDialog();

    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId, 'the dialog has to name what labels it').toBeTruthy();
    const label = document.getElementById(labelId!);
    expect(label, 'aria-labelledby has to resolve to an element').not.toBeNull();
    expect(label!.textContent).toContain('Send a Message');

    const close = dialog.querySelector('button');
    expect(close?.getAttribute('aria-label')).toBe('Close modal');
  },
};
