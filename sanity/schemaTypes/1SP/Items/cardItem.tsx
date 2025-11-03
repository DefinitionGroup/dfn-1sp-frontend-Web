import React from "react";
import { defineField, defineType } from "sanity";
import Image from "next/image";
// Renders a Cloudinary thumbnail in Studio previews
const PreviewMedia: React.FC<{ src?: string; alt?: string }> = ({
  src,
  alt,
}) => {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt || ""}
      width={100}
      height={100}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

export default defineType({
  name: "cardItem",
  title: "Card Item",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Description", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "src", title: "Image", type: "cloudinary.asset" }),
    defineField({ name: "logo", title: "Logo", type: "cloudinary.asset" }),
    defineField({ name: "ctaButton", title: "Button", type: "cta" }),
    defineField({ name: "content", title: "Content", type: "text" }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      logoUrl: "logo.secure_url",
      imageUrl: "src.secure_url",
    },
    prepare({ title, subtitle, logoUrl, imageUrl }) {
      const mediaSrc: string | undefined = logoUrl || imageUrl;
      const truncated = subtitle
        ? subtitle.length > 80
          ? `${subtitle.slice(0, 77)}...`
          : subtitle
        : "";

      return {
        title: title || "Untitled card",
        subtitle: truncated,
        media: mediaSrc ? (
          <PreviewMedia src={mediaSrc} alt={title} />
        ) : undefined,
      };
    },
  },
});
