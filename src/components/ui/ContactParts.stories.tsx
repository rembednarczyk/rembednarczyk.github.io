import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactParts } from "./ContactParts";
import { cvData } from "../../data/portfolioFacts";

/**
 * Both details, side by side, because the component's whole behaviour is
 * that it treats them differently — and the difference is invisible unless
 * you see them together.
 *
 * The accessibility addon scans every story as an axe run, which is the
 * reason a component in this directory has one at all.
 */
const meta = {
  title: "UI/ContactParts",
  component: ContactParts,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ContactParts>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No part of an address is a space, so it is rendered in fragments: no text
 * node carries the whole of it and the announced name is unchanged.
 */
export const Address: Story = {
  args: { detail: cvData.header.email },
  render: (args) => (
    <a className="text-slate-200 underline" href="#example">
      <ContactParts {...args} />
    </a>
  ),
};

/**
 * A phone number's parts include spaces, and an accessible name trims each
 * element before concatenating — so fragmenting this one would announce it
 * as a single run of digits. It is rendered whole instead.
 */
export const PhoneNumber: Story = {
  args: { detail: cvData.header.phone },
  render: (args) => (
    <a className="text-slate-200 underline" href="#example">
      <ContactParts {...args} />
    </a>
  ),
};
