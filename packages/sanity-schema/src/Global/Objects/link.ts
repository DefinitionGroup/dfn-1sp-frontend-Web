import { defineType, defineField } from "sanity";

type LinkParent = { linkType?: "internal" | "external" } | undefined;

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      options: {
        list: [
          { title: "Internal page", value: "internal" },
          { title: "External URL", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
    }),
    defineField({
      name: "page",
      title: "Page",
      type: "reference",
      to: [{ type: "page" }],
      hidden: (ctx) => (ctx.parent as LinkParent)?.linkType !== "internal",
      options: {
        filter: (({ document }: { document?: { language?: string } }) => {
          const currentLanguage = document?.language || 'de';
          return {
            filter: '_type == "page" && language == $language',
            params: { language: currentLanguage }
          };
        }) as unknown as string,
      },
    }),
    defineField({
      name: "externalUrl",
      title: "External URL, email or section",
      type: "url",
      description:
        "Accepts https:// URLs, mailto: and tel: links, or a relative section anchor such as #stories.",
      hidden: (ctx) => (ctx.parent as LinkParent)?.linkType !== "external",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto", "tel"],
        }),
    }),
  ],
  preview: {
    select: { linkType: "linkType", pageTitle: "page.title", url: "externalUrl" },
    prepare({ linkType, pageTitle, url }) {
      return {
        title:
          linkType === "internal"
            ? `Internal: ${pageTitle ?? "Select a page"}`
            : `External: ${url ?? "Set URL"}`,
      };
    },
  },
});
