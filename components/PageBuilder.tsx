import React from "react";
import type {
  ShowtimeGallery as ShowtimeGalleryType,
  OneSPHeader as OneSPHeaderType,
} from "@/types/sanity.types";
import type { Page } from "@/types/sanity.types";
import ShowtimeGallery from "./pagebuilderComponents/showtimeGallery";
import HeroShowtime from "./pagebuilderComponents/HeroShowtime";
import { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";
import SublineComponent from "./pagebuilderComponents/SublineComponent";
import OneSPHeaderStep from "./pagebuilderComponents/Header";
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
          case "sublineComponent":
            return (
              <SublineComponent
                key={block._key ?? `subline-${i}`}
                data={block}
              />
            );
          case "oneSPHeader":
            return (
              <OneSPHeaderStep
                key={block._key ?? `oneSPHeader-${i}`}
                step={block as OneSPHeaderType}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
