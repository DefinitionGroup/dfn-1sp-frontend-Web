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
} from "@1sp/sanity-types";
import type { Page } from "@1sp/sanity-types";
import { HeroShowtime as HeroShowtimeType } from "@1sp/sanity-types";
import ErrorBoundary from "./ErrorBoundary";
import HeadlineChallenge from "./pagebuilder/cases/pg-HeadlineChallenge";
import ComponentLoader from "./ui/ComponentLoader";
import DeferredSection from "./ui/DeferredSection";
import OneSpScope from "./onesp-group/OneSpScope";

// Dynamically import heavy components to reduce initial bundle size
const ShowtimeGallery = dynamic(
  () => import("./pagebuilder/pg-ShowtimeGallery"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);
const DeferredShowtimeGallery = dynamic(
  () => import("./pagebuilder/client/DeferredShowtimeGalleryShell"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const HeroShowtime = dynamic(() => import("./pagebuilder/pg-HeroShowtime"), {
  loading: () => <ComponentLoader />,
  ssr: true,
});

const SublineComponent = dynamic(
  () => import("./pagebuilder/pg-SublineComponent"),
  {
    loading: () => null,
    ssr: true,
  }
);

import OneSPHeaderStep from "./pagebuilder/pg-Header";

const ContentSection = dynamic(
  () => import("./pagebuilder/pg-ContentSection"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const TwoColContentSection = dynamic(
  () => import("./pagebuilder/pg-2ColContentSection"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const TabbedContentSection = dynamic(
  () => import("./pagebuilder/pg-TabbedContentSection"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

// Gallery step components - now available as standalone components
const GalleryHeroStep = dynamic(
  () => import("./pagebuilder/pg-GalleryHeroStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryCardsStep = dynamic(
  () => import("./pagebuilder/pg-GalleryCardsStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryListStep = dynamic(
  () => import("./pagebuilder/pg-GalleryListStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryPeopleStep = dynamic(
  () => import("./pagebuilder/pg-GalleryPeopleStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryHighlightStep = dynamic(
  () => import("./pagebuilder/pg-GalleryHighlightStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryRevealStep = dynamic(
  () => import("./pagebuilder/pg-GalleryRevealStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const GalleryOverviewStep = dynamic(
  () => import("./pagebuilder/pg-GalleryOverviewStep"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

// Carousel and smart components
const InteractiveCarousel = dynamic(
  () => import("./pagebuilder/pg-InteractiveCarousel"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const SmartCarousel = dynamic(
  () => import("./pagebuilder/server/SmartCarouselBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const SmartPeople = dynamic(() => import("./data/data-SmartPeople"), {
  loading: () => <ComponentLoader />,
  ssr: true,
});

const SmartUnitsGallery = dynamic(
  () => import("./data/data-UnitsExpandableCards"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const SmartUnitsGlobe = dynamic(() => import("./data/data-SmartUnitsGlobe"), {
  loading: () => <ComponentLoader />,
  ssr: true,
});

const GlobeComponent = dynamic(
  () => import("./pagebuilder/pg-GlobeComponent"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const CasesIntro = dynamic(() => import("./pagebuilder/pg-CasesIntro"), {
  loading: () => <ComponentLoader />,
  ssr: true,
});

const CasesGalleryFiltered = dynamic(
  () => import("./pagebuilder/server/CasesGalleryFilteredBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const CasesGalleryFilteredWithPagination = dynamic(
  () => import("./pagebuilder/server/CasesGalleryFilteredWithPaginationBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const ServicesGalleryFiltered = dynamic(
  () => import("./pagebuilder/server/ServicesGalleryFilteredBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const ServicesHeroWithBadge = dynamic(
  () => import("./pagebuilder/pg-ServicesHeroWithBadge"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

const IntertitleCTA = dynamic(() => import("./pagebuilder/pg-IntertitleCTA"), {
  loading: () => <ComponentLoader height="h-32" />,
  ssr: true,
});

const PageBuilderLogoFloat = dynamic(
  () => import("./pagebuilder/server/PageBuilderLogoFloatBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);
const UnitLogoGrid = dynamic(
  () => import("./pagebuilder/server/UnitLogoGridBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);
const PageBuilderPersonioJobs = dynamic(
  () => import("./pagebuilder/pg-PageBuilderPersonioJobs"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

type PageBuilderProps = {
  content: NonNullable<Page["content"]>;
  language?: string;
  /**
   * Active site channel. Threaded to every data-fetching block so re-fetches
   * (cases/services/people galleries, smart carousel) query the correct
   * channel instead of the "1spWeb" default. See docs/AUDIT-2026-07-*.
   */
  channel?: string;
  deferAfter?: number;
  renderMode?: "default" | "deferred";
  /** Runtime guard against malformed or legacy nested group references. */
  groupDepth?: number;
};

export function PageBuilder({
  content,
  language = "de",
  channel = "1spWeb",
  deferAfter = Number.POSITIVE_INFINITY,
  renderMode = "default",
  groupDepth = 0,
}: PageBuilderProps) {
  if (!Array.isArray(content) || content.length === 0) return null;

  const renderBlock = (block: any, i: number, isDeferred = false) => {
    if (!block?._type) return null;

    const key = block._key ?? `${block._type}-${i}`;

    switch (block._type) {
          case "showtimeGallery":
            return (
              <ErrorBoundary key={`error-${key}`}>
                {isDeferred ? (
                  <DeferredShowtimeGallery
                    key={key}
                    data={block as ShowtimeGalleryType}
                  />
                ) : (
                  <ShowtimeGallery
                    key={key}
                    data={block as ShowtimeGalleryType}
                  />
                )}
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
          case "twoColContentSection":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <TwoColContentSection key={key} data={block} />
              </ErrorBoundary>
            );
          case "tabbedContentSection":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <TabbedContentSection key={key} data={block} />
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
                <SmartCarousel key={key} {...(block as any)} language={language} channel={channel} />
              </ErrorBoundary>
            );
          case "smartPeople":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <SmartPeople key={key} {...(block as any)} channel={channel} />
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
                <Suspense fallback={<ComponentLoader />}>
                  <SmartUnitsGlobe
                    key={key}
                    language={language}
                    {...(block as any)}
                  />
                </Suspense>
              </ErrorBoundary>
            );
          case "globeComponent":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <GlobeComponent key={key} data={block as any} />
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
                <CasesGalleryFiltered key={key} {...block} language={language} channel={channel} />
              </ErrorBoundary>
            );
          case "casesGalleryFilteredWithPagination":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <CasesGalleryFilteredWithPagination key={key} {...block} language={language} channel={channel} />
              </ErrorBoundary>
            );
          case "servicesGalleryFiltered":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ServicesGalleryFiltered key={key} {...block} language={language} channel={channel} />
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
          case "oneSpComponentGroupReference": {
            const group = block.group;
            if (
              groupDepth > 0 ||
              !group ||
              !Array.isArray(group.content) ||
              group.content.length === 0
            ) {
              return null;
            }

            const dataChannel = block.dataScope === "1spWeb" ? "1spWeb" : channel;

            return (
              <ErrorBoundary key={`error-${key}`}>
                <OneSpScope groupId={group._id}>
                  <PageBuilder
                    content={group.content}
                    language={language}
                    channel={dataChannel}
                    renderMode={renderMode}
                    groupDepth={groupDepth + 1}
                  />
                </OneSpScope>
              </ErrorBoundary>
            );
          }
          case "unitLogoGrid":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <UnitLogoGrid key={key} {...(block as any)} language={language} />
              </ErrorBoundary>
            );
          case "pageBuilderLogoFloat":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <PageBuilderLogoFloat
                  key={key}
                  {...(block as any)}
                  language={language}
                />
              </ErrorBoundary>
            );
          case "pageBuilderPersonioJobs":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <PageBuilderPersonioJobs
                  key={key}
                  data={block as any}
                  language={language}
                />
              </ErrorBoundary>
            );

          default:
            return null;
    }
  };

  const eagerCount = renderMode === "deferred"
    ? content.length
    : Number.isFinite(deferAfter)
    ? Math.max(0, Math.min(content.length, deferAfter))
    : content.length;
  const eagerBlocks = content.slice(0, eagerCount);
  const deferredBlocks = content.slice(eagerCount);
  const deferredMinHeight = `${Math.max(deferredBlocks.length * 32, 140)}vh`;

  return (
    <>
      {eagerBlocks.map((block, index) =>
        renderBlock(block, index, renderMode === "deferred")
      )}
      {deferredBlocks.length > 0 && (
        <DeferredSection
          rootMargin="0px 0px 0px 0px"
          minHeight={deferredMinHeight}
        >
          <PageBuilder
            content={deferredBlocks}
            language={language}
            channel={channel}
            renderMode="deferred"
            groupDepth={groupDepth}
          />
        </DeferredSection>
      )}
    </>
  );
}
