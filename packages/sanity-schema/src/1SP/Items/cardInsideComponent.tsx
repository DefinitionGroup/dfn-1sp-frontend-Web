import React from "react";
import Image from "next/image";
import { defineField, defineType } from "sanity";

function PreviewMedia({
  src,
  title,
  resourceType,
}: {
  src?: string;
  title?: string;
  resourceType?: string;
}) {
  if (!src) return null;

  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return resourceType === "video" ? (
    <video src={src} muted playsInline style={style} />
  ) : (
    <Image src={src} alt={title || ""} width={120} height={90} style={style} />
  );
}

export default defineType({
  name: "cardInsideComponent",
  title: "Media Card",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Image or video",
      type: "cloudinary.asset",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "altText",
      title: "Alternative text",
      type: "string",
      description: "Describe the image for accessibility. Leave empty only for decorative media.",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "text",
      title: "Paragraph",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "headline",
      subtitle: "text",
      mediaUrl: "media.secure_url",
      resourceType: "media.resource_type",
    },
    prepare({ title, subtitle, mediaUrl, resourceType }) {
      return {
        title: title || "Untitled media card",
        subtitle: subtitle || "No paragraph",
        media: mediaUrl ? (
          <PreviewMedia src={mediaUrl} title={title} resourceType={resourceType} />
        ) : undefined,
      };
    },
  },
});
