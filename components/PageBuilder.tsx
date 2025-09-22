// components/PageBuilder.tsx
import React from "react";
import type { ShowtimeGallery as ShowtimeGalleryType } from "@/types/sanity.types";
import type { Page } from "@/types/sanity.types";
import ShowtimeGallery from "./pagebuilderComponents/showtimeGallery";
import HeroShowtime from "./pagebuilderComponents/HeroShowtime";
import { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";
type PageBuilderProps = { content: NonNullable<Page["content1sp"]> };

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content) || content.length === 0) return null;
  //console.log("PageBuilder content:", content);
  return (
    <>
      {content.map((block: any, i: number) => {
        if (!block?._type) return null;

        switch (block._type) {
          case "showtimeGallery":
            return (
              <ShowtimeGallery
                key={block._key ?? `showtimeGallery-${i}`}
                data={block as ShowtimeGalleryType}
              />
            );
          case "heroShowTime":
            return (
              <HeroShowtime
                key={block._key ?? `heroShowtime-${i}`}
                data={block as HeroShowtimeType}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
