import { defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

type NewsParent = { source?: string; media?: unknown };
const isXPostMode = (parent: unknown) =>
  (parent as NewsParent | undefined)?.source === "latestXPost";

export default defineType({
  name: "newsCTABlock",
  title: "Renaissance News CTA",
  type: "object",
  description:
    "A news banner with bolt-masked image or video and one large arrow link, or the newest X post.",
  // Portable Text's insert menu treats hidden functions as truthy instead of
  // evaluating them. Keep this type visible; validation below enforces channel.
  fields: [
    defineField({
      name: "source",
      title: "Content",
      type: "string",
      options: {
        list: [
          { title: "Written here", value: "manual" },
          { title: "Newest X post", value: "latestXPost" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "manual",
      description:
        "Newest X post shows the latest visible post from Shared content › X posts and links to it on x.com.",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "With Newest X post, this is the small label above the post. Defaults to “Latest on X”.",
      validation: (Rule) =>
        Rule.max(140).custom((value, context) =>
          isXPostMode(context.parent) || value?.trim() ? true : "Required.",
        ),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      hidden: ({ parent }) => isXPostMode(parent),
      validation: (Rule) =>
        Rule.max(450).custom((value, context) =>
          isXPostMode(context.parent) || value?.trim() ? true : "Required.",
        ),
    }),
    defineField({
      name: "media",
      title: "Image or Video",
      type: "cloudinary.asset",
      description:
        "Choose an image or a short silent video. Videos loop with a pause control. With Newest X post, this is the fallback when the post has no image.",
      validation: (Rule) =>
        Rule.custom((value, context) =>
          isXPostMode(context.parent) || value ? true : "Required.",
        ),
    }),
    defineField({
      name: "mediaAlt",
      title: "Media Description",
      type: "string",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as NewsParent | undefined;
          return (isXPostMode(parent) && !parent?.media) || value?.trim()
            ? true
            : "Required.";
        }),
    }),
    defineField({
      name: "poster",
      title: "Video Poster (optional)",
      type: "cloudinary.asset",
      description:
        "Still image shown before playback and for reduced motion. Otherwise the first Cloudinary video frame is used.",
      options: { resourceType: "image" },
    }),
    defineField({
      name: "link",
      title: "News Destination",
      type: "link",
      description:
        "The whole banner links here; the headline provides the accessible link label.",
      hidden: ({ parent }) => isXPostMode(parent),
      validation: (Rule) =>
        Rule.custom((link, context) =>
          isXPostMode(context.parent)
            ? true
            : link
              ? validateOptionalCta({ text: "Read news", link })
              : "Required.",
        ),
    }),
    defineField({
      name: "archiveLabel",
      title: "Archive button label",
      type: "string",
      description: "Button to the /news archive. Defaults to “All news”.",
      hidden: ({ parent }) => !isXPostMode(parent),
      validation: (Rule) => Rule.max(40),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "renaissanceWeb"
        ? true
        : "News CTA blocks can only be used on renaissanceWeb pages.",
    ),
  preview: {
    select: { title: "headline", subtitle: "text", source: "source" },
    prepare({ title, subtitle, source }) {
      return source === "latestXPost"
        ? { title: title || "Latest on X", subtitle: "Newest X post" }
        : { title: title || "Renaissance News CTA", subtitle };
    },
  },
});
