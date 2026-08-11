"use client";

import React from "react";
import { useParams } from "next/navigation";
import Button2 from "@renaissance/components/ui/Button2";
import { client } from "@1sp/sanity-queries/client";
import { UNIT_LOGO_FLOAT_QUERY } from "@1sp/sanity-queries/groq";
import { assetUrl } from "@1sp/utils/cloudinary";
import type { CloudinaryAsset } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

type PersonioJob = {
  id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  contractType?: string;
  seniority?: string;
  description?: string;
  schedule?: string;
  status?: string;
  url?: string;
  updatedAt?: string;
  remote?: boolean;
};

type PersonioJobsResponse = {
  jobs?: PersonioJob[];
  error?: string;
};

type Unit = {
  _id: string;
  name?: string;
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
};

type MatchableUnit = {
  _id: string;
  name: string;
  normalizedName: string;
  logoUrl: string;
};

type TagTone =
  | "department"
  | "location"
  | "employment"
  | "contract"
  | "seniority"
  | "schedule"
  | "remote";

type JobTimeFilter = "all" | "parttime" | "fulltime";
type JobContractFilter = "all" | "freelance" | "permanent";
type JobTimeCategory = Exclude<JobTimeFilter, "all">;
type JobContractCategory = Exclude<JobContractFilter, "all">;

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type JobFilterMetadata = {
  matchedUnit: MatchableUnit | null;
  timeCategory: JobTimeCategory | null;
  contractCategory: JobContractCategory | null;
};

const DEFAULT_JOB_LOGO_URL = "/logos/renaissance-horz_logo.svg";

const tagToneClasses: Record<TagTone, string> = {
  location: " bg-violet-400 font-bold text-black",
  department: "text-violet-500 bg-black",
  employment: "text-neutral-500 bg-white",
  contract: "text-neutral-500 bg-white",
  seniority: "text-neutral-500 bg-white",
  schedule: "text-neutral-500 bg-white",
  remote: "text-neutral-500 bg-white",
};

const PART_TIME_PATTERNS = [/\bpart\s*time\b/, /\bteilzeit\b/];
const FULL_TIME_PATTERNS = [/\bfull\s*time\b/, /\bvollzeit\b/];
const FREELANCE_PATTERNS = [
  /\bfreelanc\w*\b/,
  /\bfreiberuf\w*\b/,
  /\bcontractor\b/,
];
const PERMANENT_PATTERNS = [
  /\bpermanent\b/,
  /\bfestanstellung\b/,
  /\bunbefristet\b/,
];

const JOB_TIME_OPTIONS: ReadonlyArray<SegmentedOption<JobTimeFilter>> = [
  { value: "all", label: "All" },
  { value: "parttime", label: "Part-time" },
  { value: "fulltime", label: "Full-time" },
];

const JOB_CONTRACT_OPTIONS: ReadonlyArray<SegmentedOption<JobContractFilter>> = [
  { value: "all", label: "All" },
  { value: "freelance", label: "Freelance" },
  { value: "permanent", label: "Permanent" },
];

const normalizeForFilter = (value?: string) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

const includesPattern = (value: string, patterns: ReadonlyArray<RegExp>) =>
  patterns.some((pattern) => pattern.test(value));

const getJobFilterContext = (job: PersonioJob) =>
  normalizeForFilter(
    [
      job.employmentType,
      job.contractType,
      job.schedule,
      job.department,
      job.title,
      job.description,
    ]
      .filter(Boolean)
      .join(" ")
  );

const resolveJobTimeCategory = (job: PersonioJob): JobTimeCategory | null => {
  const context = getJobFilterContext(job);
  if (!context) return null;

  const isPartTime = includesPattern(context, PART_TIME_PATTERNS);
  const isFullTime = includesPattern(context, FULL_TIME_PATTERNS);

  if (isPartTime === isFullTime) return null;
  return isPartTime ? "parttime" : "fulltime";
};

const resolveJobContractCategory = (
  job: PersonioJob
): JobContractCategory | null => {
  const context = getJobFilterContext(job);
  if (!context) return null;

  const isFreelance = includesPattern(context, FREELANCE_PATTERNS);
  const isPermanent = includesPattern(context, PERMANENT_PATTERNS);

  if (isFreelance === isPermanent) return null;
  return isFreelance ? "freelance" : "permanent";
};

function Tag({ tone, children }: { tone: TagTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[10px] font-medium uppercase ${tagToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function SegmentedSwitch<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (nextValue: T) => void;
  options: ReadonlyArray<SegmentedOption<T>>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[8px] font-medium uppercase text-neutral-500">
        {label}
      </p>
      <div className="inline-flex w-full overflow-hidden  border border-neutral-200 bg-white">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={`flex-1 px-3 py-2 text-[8px] font-medium cursor-pointer uppercase transition-colors ${isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PageBuilderPersonioJobsProps {
  data: {
    headline?: string;
    subheadline?: string;
    maxItems?: number;
    onlyPublished?: boolean;
    applyLabel?: string;
    emptyStateText?: string;
    showDepartment?: boolean;
    showLocation?: boolean;
    showEmploymentType?: boolean;
    showContractType?: boolean;
    showSeniority?: boolean;
    showDescription?: boolean;
    showSchedule?: boolean;
    showUpdatedAt?: boolean;
    navPointName?: string;
    hideFromNav?: boolean;
  };
  language?: string;
}

function PageBuilderPersonioJobs({
  data,
  language: propLanguage,
}: PageBuilderPersonioJobsProps) {
  const params = useParams();
  const language = propLanguage || (params?.locale as string) || "en";

  const {
    headline = "Open Positions",
    subheadline,
    maxItems = 20,
    onlyPublished = true,
    applyLabel = "Apply",
    emptyStateText = "No open positions at the moment.",
    showDepartment = true,
    showLocation = true,
    showEmploymentType = true,
    showContractType = true,
    showSeniority = true,
    showDescription = true,
    showSchedule = true,
    showUpdatedAt = true,
    navPointName,
    hideFromNav = false,
  } = data || {};

  const [jobs, setJobs] = React.useState<PersonioJob[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = React.useState<string>("all");
  const [timeFilter, setTimeFilter] = React.useState<JobTimeFilter>("all");
  const [contractFilter, setContractFilter] =
    React.useState<JobContractFilter>("all");

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadJobsAndUnits() {
      try {
        setIsLoading(true);
        setError(null);

        const query = new URLSearchParams({
          maxItems: String(Math.max(1, maxItems)),
          onlyPublished: String(onlyPublished),
          language,
        });

        const [jobsResponse, fetchedUnits] = await Promise.all([
          fetch(`/api/personio/jobs?${query.toString()}`, {
            method: "GET",
            signal: controller.signal,
          }),
          client.fetch<Unit[]>(
            UNIT_LOGO_FLOAT_QUERY,
            { language, maxItems: 200 },
            { next: { revalidate: 300 } }
          ),
        ]);

        const payload = (await jobsResponse.json()) as PersonioJobsResponse;

        if (!jobsResponse.ok) {
          throw new Error(payload?.error || "Could not load jobs.");
        }

        setJobs(Array.isArray(payload.jobs) ? payload.jobs : []);
        setUnits(Array.isArray(fetchedUnits) ? fetchedUnits : []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setJobs([]);
        setUnits([]);
        setError(
          err instanceof Error ? err.message : "Could not load open positions."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadJobsAndUnits();

    return () => controller.abort();
  }, [maxItems, onlyPublished, language]);

  const sectionId = (headline || "open-positions")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [language]
  );

  const formatDate = React.useCallback(
    (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return dateFormatter.format(date);
    },
    [dateFormatter]
  );

  const createSnippet = React.useCallback((value?: string) => {
    if (!value) return undefined;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= 180) return normalized;
    return `${normalized.slice(0, 177)}...`;
  }, []);

  const normalizeForMatch = React.useCallback((value?: string) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }, []);

  const unitsForMatching = React.useMemo<MatchableUnit[]>(() => {
    return units
      .map((unit) => {
        const name = unit.name?.trim() || "";
        const normalizedName = normalizeForMatch(name);
        const logoUrl = assetUrl(unit.logoColor) || assetUrl(unit.logo) || "";

        if (!normalizedName || !logoUrl) return null;

        return {
          _id: unit._id,
          name,
          normalizedName,
          logoUrl,
        };
      })
      .filter((unit): unit is MatchableUnit => Boolean(unit));
  }, [units, normalizeForMatch]);

  const matchUnitForJob = React.useCallback(
    (job: PersonioJob): MatchableUnit | null => {
      if (unitsForMatching.length === 0) return null;

      const department = normalizeForMatch(job.department);
      const searchContext = normalizeForMatch(
        [job.department, job.location, job.title].filter(Boolean).join(" ")
      );

      const candidates = unitsForMatching
        .map((unit) => {
          let score = 0;

          if (department) {
            if (department === unit.normalizedName) {
              score = 400 + unit.normalizedName.length;
            } else if (department.startsWith(unit.normalizedName)) {
              score = 320 + unit.normalizedName.length;
            } else if (
              unit.normalizedName.startsWith(department) &&
              department.length >= 4
            ) {
              score = 260 + department.length;
            } else if (department.includes(unit.normalizedName)) {
              score = 220 + unit.normalizedName.length;
            }
          }

          if (score === 0 && searchContext.includes(unit.normalizedName)) {
            score = 120 + unit.normalizedName.length;
          }

          return { unit, score };
        })
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score);

      if (candidates.length === 0) return null;
      if (candidates.length === 1) return candidates[0].unit;

      const first = candidates[0];
      const second = candidates[1];

      if (first.score === second.score) return null;

      return first.unit;
    },
    [unitsForMatching, normalizeForMatch]
  );

  const handleLogoError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const image = event.currentTarget;
      if (image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.src = DEFAULT_JOB_LOGO_URL;
      image.alt = "Renaissance Logo";
    },
    []
  );

  const jobFilterMetadataByJobId = React.useMemo(() => {
    return jobs.reduce<Record<string, JobFilterMetadata>>((acc, job) => {
      acc[job.id] = {
        matchedUnit: matchUnitForJob(job),
        timeCategory: resolveJobTimeCategory(job),
        contractCategory: resolveJobContractCategory(job),
      };
      return acc;
    }, {});
  }, [jobs, matchUnitForJob]);

  const availableUnitFilters = React.useMemo(() => {
    const uniqueUnits = new Map<string, MatchableUnit>();

    jobs.forEach((job) => {
      const matchedUnit = jobFilterMetadataByJobId[job.id]?.matchedUnit;
      if (matchedUnit) {
        uniqueUnits.set(matchedUnit._id, matchedUnit);
      }
    });

    return Array.from(uniqueUnits.values()).sort((a, b) =>
      a.name.localeCompare(b.name, language)
    );
  }, [jobs, jobFilterMetadataByJobId, language]);

  React.useEffect(() => {
    if (selectedUnitId === "all") return;
    if (availableUnitFilters.some((unit) => unit._id === selectedUnitId)) return;
    setSelectedUnitId("all");
  }, [availableUnitFilters, selectedUnitId]);

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const metadata = jobFilterMetadataByJobId[job.id];
      if (!metadata) return false;

      if (
        selectedUnitId !== "all" &&
        metadata.matchedUnit?._id !== selectedUnitId
      ) {
        return false;
      }

      if (timeFilter !== "all" && metadata.timeCategory !== timeFilter) {
        return false;
      }

      if (
        contractFilter !== "all" &&
        metadata.contractCategory !== contractFilter
      ) {
        return false;
      }

      return true;
    });
  }, [jobs, jobFilterMetadataByJobId, selectedUnitId, timeFilter, contractFilter]);

  const hasActiveFilters =
    selectedUnitId !== "all" || timeFilter !== "all" || contractFilter !== "all";

  const resetFilters = React.useCallback(() => {
    setSelectedUnitId("all");
    setTimeFilter("all");
    setContractFilter("all");
  }, []);

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className="relative "
      data-component="pg-pagebuilder-personio-jobs"
    >
      <div className="container mx-auto grid grid-cols-12 relative">
        <div className="col-span-12 col-start-1 row-start-1 relative z-10">
          <div className="mx-auto mb-7  text-left md:mb-9">
            {hasVisibleText(headline) ? (
              <h2 className="text-3xl font-normal text-neutral-800 md:text-4xl lg:text-5xl">
                {headline}
              </h2>
            ) : null}
            {subheadline ? (
              <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-500 md:text-base">
                {subheadline}
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className=" bg-white/80 px-5 py-8  text-center text-neutral-500 ">
              Loading open positions...
            </div>
          ) : error ? (
            <div className=" bg-red-50 px-5 py-8 text-center text-red-700 ">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className=" bg-white/80 px-5 py-8 text-center text-neutral-500 ">
              {emptyStateText}
            </div>
          ) : (
            <div className="space-y-3">
              <div className=" bg-white/80  p-1 md:w-2/3">
                {availableUnitFilters.length > 0 ? (
                  <div className="mb-4">
                    <p className="mb-2 text-[8px] font-medium uppercase text-neutral-500">
                      Units
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUnitId("all")}
                        aria-pressed={selectedUnitId === "all"}
                        className={`px-3 py-1.5 text-[8px] font-medium uppercase transition-colors ${selectedUnitId === "all"
                          ? "bg-violet-500 text-black"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                          }`}
                      >
                        All units
                      </button>
                      {availableUnitFilters.map((unit) => {
                        const isActive = selectedUnitId === unit._id;

                        return (
                          <button
                            key={unit._id}
                            type="button"
                            onClick={() => setSelectedUnitId(unit._id)}
                            aria-pressed={isActive}
                            className={`px-3 py-1.5 text-[8px] font-medium uppercase transition-colors ${isActive
                              ? "bg-violet-400 text-black"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                              }`}
                          >
                            {unit.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <SegmentedSwitch
                    label="Schedule"
                    value={timeFilter}
                    onChange={setTimeFilter}
                    options={JOB_TIME_OPTIONS}
                  />
                  <SegmentedSwitch
                    label="Contract"
                    value={contractFilter}
                    onChange={setContractFilter}
                    options={JOB_CONTRACT_OPTIONS}
                  />
                </div>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-[8px] border px-6 font-medium uppercase text-neutral-200 hover:text-neutral-200 hover:bg-neutral-900 transition-colors"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

              {filteredJobs.length === 0 ? (
                <div className=" bg-white/80 px-5 py-8 text-center text-neutral-500 ">
                  No open positions match the current filters.
                </div>
              ) : null}

              <ul className="mx-auto grid md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => {
                  const updatedAtLabel = formatDate(job.updatedAt);
                  const descriptionSnippet = createSnippet(job.description);
                  const matchedUnit = jobFilterMetadataByJobId[job.id]?.matchedUnit;
                  const logoUrl = matchedUnit?.logoUrl || DEFAULT_JOB_LOGO_URL;
                  const logoAlt = matchedUnit?.name || "Renaissance Logo";
                  const showContractChip =
                    showContractType &&
                    job.contractType &&
                    job.contractType !== job.employmentType;

                  return (
                    <li
                      key={job.id}
                      className="p-1 flex flex-col justify-between "
                    >
                      <div className=" bg-neutral-50/75 p-8   h-100 flex flex-col items-start justify-between gap-3">
                        <div className="flex  flex-col min-w-0  items-start">
                          <img
                            src={logoUrl}
                            alt={logoAlt}
                            onError={handleLogoError}
                            className="  w-auto max-w-[96px] relative -left-2 object-contain object-left"
                          />
                          {hasVisibleText(job.title) ? (
                            <h3 className="text-xl font-regular leading-tight text-neutral-700 md:text-xl">
                              {job.title}
                            </h3>
                          ) : null}
                        </div>


                        {showDescription && descriptionSnippet ? (
                          <p className="my-2 text-xs leading-relaxed text-neutral-600">
                            {descriptionSnippet}
                          </p>
                        ) : null}

                        <div className="mt-8 flex  flex-wrap gap-1.5">
                          {/* {showDepartment && job.department ? (
                        <Tag tone="department">{job.department}</Tag>
                      ) : null} */}
                          {showLocation && job.location ? (
                            <Tag tone="location">{job.location}</Tag>
                          ) : null}
                          {showEmploymentType && job.employmentType ? (
                            <Tag tone="employment">{job.employmentType}</Tag>
                          ) : null}
                          {/* {showContractChip ? (
                          <Tag tone="contract">{job.contractType}</Tag>
                        ) : null} */}
                          {showSeniority && job.seniority ? (
                            <Tag tone="seniority">{job.seniority}</Tag>
                          ) : null}
                          {showSchedule && job.schedule ? (
                            <Tag tone="schedule">{job.schedule}</Tag>
                          ) : null}
                          {job.remote ? <Tag tone="remote">Remote</Tag> : null}
                        </div>
                        {job.url ? (
                          <div className="w-[120px] flex flex-col   shrink-0">
                            <Button2
                              text={applyLabel}
                              href={job.url}
                              variant="violetsmallrounded"
                              magnetic={false}

                            />

                            {showUpdatedAt && updatedAtLabel ? (
                              <p className="text-[10px] text-neutral-400">
                                Updated: <span className="font-bold">{updatedAtLabel} </span>
                              </p>
                            ) : null}
                          </div>
                        ) : null}




                      </div>

                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageBuilderPersonioJobs;
