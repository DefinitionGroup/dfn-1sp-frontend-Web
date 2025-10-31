import React from "react";
import { defineType, defineField } from "sanity";

// Render Cloudinary media (image/video) in Studio preview
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
  return <img src={src} alt={alt || ""} style={style} />;
};

export default defineType({
  name: "member",
  title: "Team Member",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "media",
      title: "Image/Video",
      type: "cloudinary.asset",
    }),
    defineField({
      name: "altText",
      title: "Alt Text",
      type: "string",
      description: "Alternative text for accessibility",
    }),
  ],
  preview: {
    select: {
      name: "name",
      mediaUrl: "media.secure_url",
      resourceType: "media.resource_type",
    },
    prepare({ name, mediaUrl, resourceType }) {
      const subtitle =
        resourceType === "video" ? "Video" : mediaUrl ? "Image" : "No media";
      return {
        title: name || "Unnamed Member",
        subtitle,
        media: mediaUrl ? (
          <PreviewMedia src={mediaUrl} alt={name} resourceType={resourceType} />
        ) : undefined,
      };
    },
  },
});
