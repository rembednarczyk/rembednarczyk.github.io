import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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

/**
 * Tab must cycle inside the dialog. `aria-modal="true"` only tells assistive
 * technology the rest of the page is inert; it does not stop Tab from walking
 * out into the content behind the overlay.
 */
export const FocusIsTrapped: Story = {
  args: { isOpen: true, onClose: () => {} },
  render: (args) => <ModalWrapper {...args} />,
  play: async () => {
    const dialog = within(await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!el) throw new Error('dialog not mounted');
      return el;
    }));

    // Opening moves focus into the dialog, onto the first field.
    await waitFor(() => expect(dialog.getByLabelText('Name')).toHaveFocus());

    // Walk forward past the last control and confirm focus stays inside.
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      expect(document.querySelector('[role="dialog"]')).toContainElement(
        document.activeElement as HTMLElement,
      );
    }

    // And backwards past the first one.
    for (let i = 0; i < 8; i++) {
      await userEvent.tab({ shift: true });
      expect(document.querySelector('[role="dialog"]')).toContainElement(
        document.activeElement as HTMLElement,
      );
    }
  },
};

/** Escape closes the dialog and focus returns to whatever opened it. */
const TriggerAndModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" data-testid="trigger" onClick={() => setIsOpen(true)}>
        Open contact
      </button>
      <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const EscapeRestoresFocus: Story = {
  args: { isOpen: false, onClose: () => {} },
  render: () => <TriggerAndModal />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByTestId('trigger');

    // Open it the way a visitor would, so the trigger really is the
    // element focus has to come back to.
    await userEvent.click(trigger);

    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(within(document.querySelector<HTMLElement>('[role="dialog"]')!).getByLabelText('Name')).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * The two failure modes are different statements, so they are asserted
 * separately. A stub stands in for the form service here; what is under
 * test is how the component reads the response, not the service itself.
 */
const fillAndSubmit = async (dialog: ReturnType<typeof within>) => {
  await userEvent.type(dialog.getByLabelText('Name'), 'Ada');
  await userEvent.type(dialog.getByLabelText('Email'), 'ada@example.com');
  await userEvent.type(dialog.getByLabelText('Message'), 'Hello');
  await userEvent.click(dialog.getByRole('button', { name: /Send Message/ }));
};

const openDialog = async () =>
  within(
    await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!el) throw new Error('dialog not mounted');
      return el;
    }),
  );

/** The request never completes: the network is the problem, not the message. */
export const UnreachableService: Story = {
  args: { isOpen: true, onClose: () => {} },
  render: (args) => <ModalWrapper {...args} />,
  play: async () => {
    const original = window.fetch;
    window.fetch = () => Promise.reject(new TypeError('Failed to fetch'));

    try {
      const dialog = await openDialog();
      await fillAndSubmit(dialog);
      await waitFor(() =>
        expect(dialog.getByRole('alert')).toHaveTextContent(/Could not reach the form service/),
      );
    } finally {
      window.fetch = original;
    }
  },
};

/** The service answered and refused. Retrying the connection will not help. */
export const RejectedByService: Story = {
  args: { isOpen: true, onClose: () => {} },
  render: (args) => <ModalWrapper {...args} />,
  play: async () => {
    const original = window.fetch;
    window.fetch = () =>
      Promise.resolve(new Response('{}', { status: 422, headers: { 'Content-Type': 'application/json' } }));

    try {
      const dialog = await openDialog();
      await fillAndSubmit(dialog);
      await waitFor(() =>
        expect(dialog.getByRole('alert')).toHaveTextContent(/was not accepted/),
      );
    } finally {
      window.fetch = original;
    }
  },
};

/**
 * A 200 carrying an HTML error page. The old code parsed whatever came back
 * and reported a rejection the service never made.
 */
export const MalformedResponse: Story = {
  args: { isOpen: true, onClose: () => {} },
  render: (args) => <ModalWrapper {...args} />,
  play: async () => {
    const original = window.fetch;
    window.fetch = () =>
      Promise.resolve(new Response('<html>gateway</html>', { status: 200 }));

    try {
      const dialog = await openDialog();
      await fillAndSubmit(dialog);
      await waitFor(() =>
        expect(dialog.getByRole('alert')).toHaveTextContent(/was not accepted/),
      );
    } finally {
      window.fetch = original;
    }
  },
};
