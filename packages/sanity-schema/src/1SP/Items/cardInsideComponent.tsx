import React from "react";
import {serviceReferenceField} from "../../shared/serviceReference";
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
    serviceReferenceField(),
    defineField({
      name: "media",
      hidden: ({parent}) => !!parent?.service?._ref,
      title: "Image or video",
      type: "cloudinary.asset",
      validation: (Rule) =>
        Rule.custom((value, context) =>
          context.document?.channel === "renaissanceWeb" || value
            ? true
            : "Media is required",
        ),
      description:
        "Required on existing sites. Renaissance service tiles may intentionally use the brand surface without media.",
    }),
    defineField({
      name: "altText",
      hidden: ({parent}) => !!parent?.service?._ref,
      title: "Alternative text",
      type: "string",
      description: "Describe the image for accessibility. Leave empty only for decorative media.",
    }),
    defineField({
      name: "headline",
      hidden: ({parent}) => !!parent?.service?._ref,
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.custom((value, context) => (context.parent as any)?.service?._ref || value ? true : "Required without a global service"),
    }),
    defineField({
      name: "text",
      hidden: ({parent}) => !!parent?.service?._ref,
      title: "Paragraph",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.custom((value, context) => (context.parent as any)?.service?._ref || value ? true : "Required without a global service"),
    }),
  ],
  preview: {
    select: {
      serviceName: "service.name",
      title: "headline",
      subtitle: "text",
      mediaUrl: "media.secure_url",
      resourceType: "media.resource_type",
    },
    prepare({ title, subtitle, mediaUrl, resourceType, serviceName }) {
      return {
        title: serviceName || title || "Untitled media card",
        subtitle: subtitle || "No paragraph",
        media: mediaUrl ? (
          <PreviewMedia src={mediaUrl} title={title} resourceType={resourceType} />
        ) : undefined,
      };
    },
  },
});
