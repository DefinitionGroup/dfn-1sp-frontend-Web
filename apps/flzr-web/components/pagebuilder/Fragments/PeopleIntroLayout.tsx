import { hasVisibleText } from "@1sp/utils/text-content";

export type SophisticatedIntroHeader = {
  superText?: string;
  mainHeadline?: string;
  creativityTitle?: string;
  uniquePeopleText?: string;
};

type PeopleIntroLayoutProps = {
  header?: SophisticatedIntroHeader;
  description?: string;
  presentation?: "split" | "gallery";
};

export default function PeopleIntroLayout({
  header = {},
  description,
  presentation = "split",
}: PeopleIntroLayoutProps) {
  if (presentation === "gallery") {
    return (
      <header className="mb-8 pt-4 sm:pt-6 md:mb-12">
        <div className="flex flex-col gap-4 sm:gap-6">
          {hasVisibleText(header.mainHeadline) && (
            <h2 className="text-section-title">{header.mainHeadline}</h2>
          )}

          {hasVisibleText(description) && (
            <p className="max-w-[72ch] text-section-body text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="mb-8 pt-4 sm:pt-6 md:mb-12">
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 sm:gap-6 md:grid-cols-10 iphone-landscape:grid-cols-4">
        <div className="col-span-4 sm:col-span-3 md:col-span-4 iphone-landscape:col-span-4">
          <div className="flex flex-col gap-2 sm:gap-4">
            {hasVisibleText(header.superText) && (
              <h2 className="text-xs font-semibold text-neutral-700 sm:text-sm">
                {header.superText}
              </h2>
            )}
            {hasVisibleText(header.mainHeadline) && (
              <h3 className="text-section-title">
                {header.mainHeadline}
              </h3>
            )}

            {(hasVisibleText(header.creativityTitle) ||
              hasVisibleText(header.uniquePeopleText)) && (
              <div className="mt-2 flex flex-col">
                {hasVisibleText(header.creativityTitle) && (
                  <span className="text-section-lead text-neutral-900">
                    {header.creativityTitle}
                  </span>
                )}
                {hasVisibleText(header.uniquePeopleText) && (
                  <span className="text-section-lead text-neutral-400">
                    {header.uniquePeopleText}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {hasVisibleText(description) && (
          <div className="col-span-4 mt-4 sm:col-span-3 sm:mt-0 md:col-span-5 md:col-start-6 iphone-landscape:col-span-4 iphone-landscape:col-start-1 iphone-landscape:mt-4">
            <div className="pt-4 sm:pt-6 md:pt-0">
              <p className="max-w-[72ch] text-section-body text-neutral-500">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
