import React from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";

// Dynamically import case study page builder components
const HeadlineChallenge = dynamic(
  () => import("./pagebuilder/cases/pg-HeadlineChallenge"),
  {
    loading: () => null,
    ssr: true,
  }
);

const ChallengeAndSolution = dynamic(
  () => import("./pagebuilder/cases/pg-ChallengeAndSolution"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const ApproachSection = dynamic(
  () => import("./pagebuilder/cases/pg-ApproachSection"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

const ResultsMetrics = dynamic(
  () => import("./pagebuilder/cases/pg-ResultsMetrics"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

type CasePageBuilderProps = { content: Array<any> };

export function CasePageBuilder({ content }: CasePageBuilderProps) {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <>
      {content.map((block: any, i: number) => {
        if (!block?._type) return null;

        const key = block._key ?? `${block._type}-${i}`;

        switch (block._type) {
          case "headlineChallenge":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <HeadlineChallenge key={key} {...block} />
              </ErrorBoundary>
            );
          case "challengeAndSolution":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ChallengeAndSolution key={key} {...block} />
              </ErrorBoundary>
            );
          case "approachSection":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ApproachSection key={key} {...block} />
              </ErrorBoundary>
            );
          case "resultsMetrics":
            return (
              <ErrorBoundary key={`error-${key}`}>
                <ResultsMetrics key={key} {...block} />
              </ErrorBoundary>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
