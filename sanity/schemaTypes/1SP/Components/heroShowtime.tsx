import React from "react";
import { defineType, defineField, defineArrayMember } from "sanity";
import Image from "next/image";
type MediaParent = { useVideo?: boolean };

// Preview component to render Cloudinary image/video in Studio
const PreviewMedia: React.FC<{
  src?: string;
  alt?: string;
  resourceType?: string;
}> = ({ src, alt, resourceType }) => {
  if (!src) return null;
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  if (resourceType === "video") {
    return <video src={src} muted playsInline style={style} />;
  }
  return (
    <Image width={400} height={400} src={src} alt={alt || ""} style={style} />
  );
};

export default defineType({
  name: "heroShowTime",
  title: "Hero – Show Time",
  type: "object",
  groups: [
    { name: "media", title: "Media" },
    { name: "content", title: "Content" },
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
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      description: "If enabled, this section will not appear in the vertical navigation minimap.",
      initialValue: false,
      group: "navigation",
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
      name: "enableParallax",
      title: "Enable parallax",
      type: "boolean",
      initialValue: true,
      group: "media",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
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
      name: "backgroundVideo",
      title: "Background Video",
      type: "cloudinary.asset",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo === false,
      validation: (r) =>
        r.custom((val, ctx) =>
          (ctx?.parent as MediaParent)?.useVideo
            ? !!val || "Video required when video is ON"
            : true
        ),
    }),
    defineField({
      name: "posterImage",
      title: "Poster (optional)",
      type: "cloudinary.asset",
      description: "Shown as a placeholder when video is enabled.",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo === false,
    }),

    // CONTENT
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Show\u00A0Time",
      validation: (r) => r.required().min(2),
      group: "content",
    }),
    defineField({
      name: "headingTag",
      title: "Heading Tag",
      type: "string",
      description: "Choose whether the main heading renders as an h1 or h2.",
      initialValue: "h2",
      group: "content",
      options: {
        list: [
          { title: "H1", value: "h1" },
          { title: "H2", value: "h2" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "text",
      rows: 2,
      initialValue: "Turn & Burn around Ideas, Deadlines, Campaigns.",
      group: "content",
    }),
    defineField({
      name: "paragraphs",
      title: "Right column paragraphs",
      description: "Each item renders as a <p>.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "content",
    }),

    // COMPOSABLE ADD-ONS
    defineField({
      name: "additionalContent",
      title: "Additional Content",
      description: "Composable items that render after the paragraphs.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "cta" })],
    }),
  ],
  preview: {
    select: {
      title: "heading",
      useVideo: "useVideo",
      // Cloudinary fields commonly available on sanity-plugin-cloudinary assets
      imageUrl: "backgroundImage.secure_url",
      videoUrl: "backgroundVideo.secure_url",
      posterUrl: "posterImage.secure_url",
      videoType: "backgroundVideo.resource_type",
    },
    prepare({ title, useVideo, imageUrl, videoUrl, posterUrl, videoType }) {
      const isVid = useVideo && !!videoUrl;
      const src = isVid ? videoUrl || posterUrl : imageUrl || posterUrl;
      const resourceType = isVid ? videoType || "video" : "image";

      return {
        title: title || "Hero – Show Time",
        subtitle: useVideo ? "Video background" : "Image background",
        media: src ? (
          <PreviewMedia src={src} alt={title} resourceType={resourceType} />
        ) : undefined,
      };
    },
  },
});
