import { Gear } from "@phosphor-icons/react";
import { defineField, defineType } from "sanity";
import { websiteChannelOptions } from "../shared/channelOptions";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: Gear,
  fields: [
    defineField({name: "renaissanceEnquiryEmail", title: "Enquiry email", type: "string", description: "Temporary destination used by the email enquiry action. This opens the visitor’s email app; it does not send mail on the server.", hidden: ({document}) => document?.channel !== "renaissanceWeb", validation: r => r.email()}),
    defineField({
      name: "channel",
      title: "Channel",
      type: "string",
      readOnly: true,
      options: {
        list: websiteChannelOptions,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      readOnly: true,
      hidden: true,
      validation: (Rule) => Rule.required(),
    }),
    ...[
      ['renaissanceDefaultPortraits', 'Default People portraits', 'renaissanceSharedPortraits'],
      ['renaissanceDefaultAwards', 'Default People awards', 'renaissanceSharedAwards'],
    ].map(([name, title, type]) => defineField({
      name, title, type: 'reference', to: [{ type }],
      hidden: ({ document }) => document?.channel !== 'renaissanceWeb',
      description: 'Used by People sections without their own block of this type. Edit the shared document to update every instance.',
      options: { filter: ({ document }) => ({
        filter: 'channel == "renaissanceWeb" && language == $language',
        params: { language: document?.language || 'en' },
      }) },
    })),
    defineField({
      name: "studioco2Contact",
      title: "Contact",
      type: "object",
      description: "Footer contact details and the “Get in touch” invitation.",
      hidden: ({ document }) => document?.channel !== "studioco2Web",
      fields: [
        defineField({ name: "email", title: "Email", type: "string", validation: (Rule) => Rule.email() }),
        defineField({ name: "phone", title: "Phone", type: "string", description: "As displayed, e.g. +44 (0) 1483 414 415." }),
        defineField({ name: "address", title: "Address", type: "text", rows: 2, description: "One line per row." }),
        defineField({ name: "invitation", title: "Invitation", type: "string", description: "Line above the large contact link.", validation: (Rule) => Rule.max(80) }),
        defineField({ name: "ctaLabel", title: "Contact link label", type: "string", initialValue: "Get in touch", validation: (Rule) => Rule.max(24) }),
        defineField({ name: "familyLabel", title: "Group link label", type: "string", initialValue: "Part of the 1SP family" }),
        defineField({ name: "familyUrl", title: "Group link URL", type: "url", initialValue: "https://www.1sp.agency", validation: (Rule) => Rule.uri({ scheme: ["https"] }) }),
      ],
    }),
    defineField({
      name: "oneSpMembershipLabel",
      title: "1SP Membership Label",
      type: "string",
      description:
        "Small text shown inside the 1SP button in this website's navbar.",
      initialValue: "proud member of",
      validation: (Rule) => Rule.required().max(40),
    }),
  ],
  preview: {
    select: {
      channel: "channel",
      language: "language",
      label: "oneSpMembershipLabel",
    },
    prepare({ channel, language, label }) {
      return {
        title: "Site Settings",
        subtitle: `${channel || "Unknown channel"} · ${String(language || "").toUpperCase()} · ${label || "No membership label"}`,
      };
    },
  },
});
