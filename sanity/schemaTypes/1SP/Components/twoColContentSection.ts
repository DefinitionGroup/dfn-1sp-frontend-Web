import { defineType, defineField } from "sanity";
import { FiColumns } from "react-icons/fi";

type MediaParent = { useVideo?: boolean };

export default defineType({
  name: "twoColContentSection",
  title: "2-Column Content Section",
  type: "object",
  icon: FiColumns,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "layout", title: "Layout & Style" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    // NAVIGATION
    defineField({
      name: "navPointName",
      title: "Navigation Point Name",
      type: "string",
      description:
        "Optional custom name to display in the vertical navigation minimap.",
      group: "navigation",
    }),

    // CONTENT
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Optional title for the section (used for section ID generation)",
      group: "content",
    }),
    defineField({
      name: "showTitle",
      title: "Show Title Above Content",
      type: "boolean",
      description: "Display the section title as a headline above the rich text content",
      initialValue: false,
      group: "content",
    }),
    defineField({
      name: "titleColor",
      title: "Title Color",
      type: "string",
      description: "Color for the displayed title",
      group: "content",
      options: {
        list: [
          { title: "Dark Gray (neutral-700)", value: "neutral-700" },
          { title: "Medium Gray (neutral-400)", value: "neutral-400" },
          { title: "White", value: "white" },
        ],
        layout: "radio",
      },
      initialValue: "neutral-700",
      hidden: ({ parent }: any) => !parent?.showTitle,
    }),
    defineField({
      name: "content",
      title: "Rich Text Content",
      type: "array",
      description: "Rich text content for the text column",
      group: "content",
      validation: (Rule) => Rule.required(),
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),

    // MEDIA
    defineField({
      name: "useVideo",
      title: "Use video instead of image",
      type: "boolean",
      initialValue: false,
      group: "media",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "cloudinary.asset",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo === true,
      validation: (r) =>
        r.custom((val, ctx) =>
          (ctx?.parent as MediaParent)?.useVideo
            ? true
            : !!val || "Image required when video is OFF"
        ),
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "cloudinary.asset",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo !== true,
      validation: (r) =>
        r.custom((val, ctx) =>
          (ctx?.parent as MediaParent)?.useVideo
            ? !!val || "Video required when video is ON"
            : true
        ),
    }),
    defineField({
      name: "mediaAlt",
      title: "Media Alt Text",
      type: "string",
      description: "Alternative text for the image/video (important for accessibility)",
      group: "media",
    }),

    // LAYOUT & STYLE
    defineField({
      name: "reverseColumns",
      title: "Reverse Column Order",
      type: "boolean",
      description: "When enabled, image/video appears on the left instead of right",
      initialValue: false,
      group: "layout",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Background color for the section",
      group: "layout",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Very Light Gray (neutral-100)", value: "neutral-100" },
          { title: "Light Gray (neutral-400)", value: "neutral-400" },
          { title: "Dark Gray (neutral-700)", value: "neutral-700" },
          { title: "Black", value: "black" },
        ],
        layout: "dropdown",
      },
      initialValue: "white",
    }),
    defineField({
      name: "showGridBackground",
      title: "Show Grid Background",
      type: "boolean",
      description: "Show the animated grid background behind the content",
      initialValue: true,
      group: "layout",
    }),
    defineField({
      name: "contentSize",
      title: "Content Size",
      type: "string",
      description: "Base size for the content text",
      group: "layout",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Base", value: "base" },
          { title: "Large", value: "lg" },
          { title: "Extra Large", value: "xl" },
        ],
        layout: "radio",
      },
      initialValue: "lg",
    }),
    defineField({
      name: "paddingY",
      title: "Vertical Padding",
      type: "string",
      description: "Amount of vertical padding for the section",
      group: "layout",
      options: {
        list: [
          { title: "Small (py-8)", value: "8" },
          { title: "Medium (py-16)", value: "16" },
          { title: "Large (py-24)", value: "24" },
          { title: "Extra Large (py-32)", value: "32" },
        ],
        layout: "radio",
      },
      initialValue: "16",
    }),
  ],
  preview: {
    select: {
      title: "title",
      backgroundColor: "backgroundColor",
      reverseColumns: "reverseColumns",
    },
    prepare({ title, backgroundColor, reverseColumns }) {
      return {
        title: title || "2-Column Content Section",
        subtitle: `${backgroundColor || "white"} bg | ${reverseColumns ? "Image Left" : "Image Right"}`,
      };
    },
  },
});
