import React from "react";
import dynamic from "next/dynamic";
import type {
  ShowtimeGallery as ShowtimeGalleryType,
  OneSPHeader as OneSPHeaderType,
} from "@/types/sanity.types";
import type { Page } from "@/types/sanity.types";
import { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";
import ErrorBoundary from "./ErrorBoundary";

// Dynamically import heavy components to reduce initial bundle size
const ShowtimeGallery = dynamic(
  () => import("./pagebuilder/pg-ShowtimeGallery"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const HeroShowtime = dynamic(() => import("./pagebuilder/pg-HeroShowtime"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const SublineComponent = dynamic(
  () => import("./pagebuilder/pg-SublineComponent"),
  {
    loading: () => null,
    ssr: true,
  }
);

const OneSPHeaderStep = dynamic(() => import("./pagebuilder/pg-Header"), {
  loading: () => (
    <div className="w-full h-32 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const ContentSection = dynamic(
  () => import("./pagebuilder/pg-ContentSection"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

type PageBuilderProps = { content: NonNullable<Page["content1sp"]> };

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <>
      {content.map((block: any, i: number) => {
        if (!block?._type) return null;

        const key = block._key ?? `${block._type}-${i}`;

        switch (block._type) {
          case "showtimeGallery":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ShowtimeGallery
                  key={key}
                  data={block as ShowtimeGalleryType}
                />
              </ErrorBoundary>
            );
          case "heroShowTime":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <HeroShowtime key={key} data={block as HeroShowtimeType} />
              </ErrorBoundary>
            );
          case "sublineComponent":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <SublineComponent key={key} data={block} />
              </ErrorBoundary>
            );
          case "oneSPHeader":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <OneSPHeaderStep key={key} step={block as OneSPHeaderType} />
              </ErrorBoundary>
            );
          case "contentSection":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ContentSection key={key} data={block} />
              </ErrorBoundary>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
