import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import type {
  ShowtimeGallery as ShowtimeGalleryType,
  OneSPHeader as OneSPHeaderType,
  GalleryHeroStep as GalleryHeroStepType,
  GalleryCardsStep as GalleryCardsStepType,
  GalleryListStep as GalleryListStepType,
  GalleryPeopleStep as GalleryPeopleStepType,
  GalleryScrollHighlightStep as GalleryScrollHighlightStepType,
  GalleryRevealStep as GalleryRevealStepType,
  GalleryOverview as GalleryOverviewType,
  Carousel as CarouselType,
} from "@/types/sanity.types";
import type { Page } from "@/types/sanity.types";
import { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";
import ErrorBoundary from "./ErrorBoundary";
import HeadlineChallenge from "./pagebuilder/cases/pg-HeadlineChallenge";

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

// Gallery step components - now available as standalone components
const GalleryHeroStep = dynamic(
  () => import("./pagebuilder/pg-GalleryHeroStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryCardsStep = dynamic(
  () => import("./pagebuilder/pg-GalleryCardsStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryListStep = dynamic(
  () => import("./pagebuilder/pg-GalleryListStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryPeopleStep = dynamic(
  () => import("./pagebuilder/pg-GalleryPeopleStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryHighlightStep = dynamic(
  () => import("./pagebuilder/pg-GalleryHighlightStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryRevealStep = dynamic(
  () => import("./pagebuilder/pg-GalleryRevealStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const GalleryOverviewStep = dynamic(
  () => import("./pagebuilder/pg-GalleryOverviewStep"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

// Carousel and smart components
const InteractiveCarousel = dynamic(
  () => import("./pagebuilder/pg-InteractiveCarousel"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const SmartCarousel = dynamic(() => import("./pagebuilder/pg-SmartCarousel"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const SmartPeople = dynamic(() => import("./data/data-SmartPeople"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const SmartUnitsGallery = dynamic(
  () => import("./data/data-UnitsExpandableCards"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const SmartUnitsGlobe = dynamic(() => import("./data/data-SmartUnitsGlobe"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const CasesIntro = dynamic(() => import("./pagebuilder/pg-CasesIntro"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

const CasesGalleryFiltered = dynamic(
  () => import("./pagebuilder/pg-CasesGalleryFiltered"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const CasesGalleryFilteredWithPagination = dynamic(
  () => import("./pagebuilder/pg-CasesGalleryFilteredWithPagination"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const ServicesGalleryFiltered = dynamic(
  () => import("./pagebuilder/pg-ServicesGalleryFiltered"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const ServicesHeroWithBadge = dynamic(
  () => import("./pagebuilder/pg-ServicesHeroWithBadge"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const IntertitleCTA = dynamic(() => import("./pagebuilder/pg-IntertitleCTA"), {
  loading: () => (
    <div className="w-full h-32 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: true,
});

type PageBuilderProps = {
  content: NonNullable<Page["content1sp"]>;
  language?: string;
};

export function PageBuilder({ content, language = "de" }: PageBuilderProps) {
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

          // Individual gallery steps - now available as standalone components
          case "galleryHeroStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryHeroStep
                  key={key}
                  data={block as GalleryHeroStepType}
                />
              </ErrorBoundary>
            );
          case "galleryCardsStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryCardsStep
                  key={key}
                  data={block as GalleryCardsStepType}
                />
              </ErrorBoundary>
            );
          case "galleryListStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryListStep
                  key={key}
                  data={block as GalleryListStepType}
                />
              </ErrorBoundary>
            );
          case "galleryPeopleStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryPeopleStep
                  key={key}
                  data={block as GalleryPeopleStepType}
                />
              </ErrorBoundary>
            );
          case "galleryScrollHighlightStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryHighlightStep
                  key={key}
                  data={block as GalleryScrollHighlightStepType}
                />
              </ErrorBoundary>
            );
          case "galleryRevealStep":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryRevealStep
                  key={key}
                  data={block as GalleryRevealStepType}
                />
              </ErrorBoundary>
            );
          case "galleryOverview":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GalleryOverviewStep
                  key={key}
                  data={block as GalleryOverviewType}
                />
              </ErrorBoundary>
            );

          // Carousel and smart components
          case "carousel":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <InteractiveCarousel key={key} data={block as CarouselType} />
              </ErrorBoundary>
            );
          case "smartCarousel":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <SmartCarousel key={key} data={block as any} />
              </ErrorBoundary>
            );
          case "smartPeople":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <SmartPeople key={key} {...(block as any)} />
              </ErrorBoundary>
            );
          case "smartUnitsGallery":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <SmartUnitsGallery key={key} {...(block as any)} />
              </ErrorBoundary>
            );
          case "smartUnitsGlobe":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <Suspense
                  fallback={
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-gray-400">Loading...</div>
                    </div>
                  }
                >
                  <SmartUnitsGlobe
                    key={key}
                    language={language}
                    {...(block as any)}
                  />
                </Suspense>
              </ErrorBoundary>
            );
          case "casesIntro":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <CasesIntro key={key} {...block} />
              </ErrorBoundary>
            );
          case "casesGalleryFiltered":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <CasesGalleryFiltered key={key} {...block} />
              </ErrorBoundary>
            );
          case "casesGalleryFilteredWithPagination":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <CasesGalleryFilteredWithPagination key={key} {...block} />
              </ErrorBoundary>
            );
          case "servicesGalleryFiltered":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ServicesGalleryFiltered key={key} {...block} />
              </ErrorBoundary>
            );
          case "servicesHeroWithBadge":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ServicesHeroWithBadge key={key} {...block} />
              </ErrorBoundary>
            );
          case "intertitleCTA":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <IntertitleCTA key={key} {...block} />
              </ErrorBoundary>
            );
          case "headlineChallenge":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <HeadlineChallenge key={key} {...block} />
              </ErrorBoundary>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
