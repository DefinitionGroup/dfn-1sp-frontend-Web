import React from "react";
import { defineType, defineField } from "sanity";
import Image from "next/image";
// Small helper to render Cloudinary thumbnails in the Studio preview
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
  name: "carouselItem",
  title: "Carousel Item",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({ name: "image", title: "Image", type: "cloudinary.asset" }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "logoSrc", title: "Logo", type: "cloudinary.asset" }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      category: "category",
      imageUrl: "image.secure_url",
      logoUrl: "logoSrc.secure_url",
    },
    prepare({ title, subtitle, category, imageUrl, logoUrl }) {
      const src: string | undefined = imageUrl || logoUrl;
      const sub = [category || "No category", subtitle || "No subtitle"]
        .filter(Boolean)
        .join(" • ");

      return {
        title: title || "Untitled Item",
        subtitle: sub,
        // Sanity allows a React node for `media`. We render a simple <Image />
        media: src ? <PreviewMedia src={src} alt={title} /> : undefined,
      };
    },
  },
});
