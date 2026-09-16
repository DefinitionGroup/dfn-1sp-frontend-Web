import { Gear } from "@phosphor-icons/react";
import { defineField, defineType } from "sanity";
import { websiteChannelOptions } from "../shared/channelOptions";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: Gear,
  fields: [
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
