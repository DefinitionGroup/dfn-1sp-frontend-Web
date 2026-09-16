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
    defineField({
      name: "video",
      title: "Video",
      type: "cloudinary.asset",
      description: "Renaissance: takes priority over Image when both are set. Image is used as the video poster when supplied.",
    }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "cta",
      title: "Button (optional)",
      type: "cta",
      description: "Renaissance: shown beneath the slide's supporting text. Set button text and select an internal page under Link. Leave empty to hide the button.",
    }),
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
