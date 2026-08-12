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
