import React from "react";
import type {
  ShowtimeGallery as ShowtimeGalleryType,
  OneSPHeader as OneSPHeaderType,
} from "@/types/sanity.types";
import type { Page } from "@/types/sanity.types";
import ShowtimeGallery from "./pagebuilder/pg-ShowtimeGallery";
import HeroShowtime from "./pagebuilder/pg-HeroShowtime";
import { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";
import SublineComponent from "./pagebuilder/pg-SublineComponent";
import OneSPHeaderStep from "./pagebuilder/pg-Header";
import ContentSection from "./pagebuilder/pg-ContentSection";
type PageBuilderProps = { content: NonNullable<Page["content1sp"]> };

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content) || content.length === 0) return null;

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
          case "contentSection":
            return (
              <ContentSection
                key={block._key ?? `contentSection-${i}`}
                data={block}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
