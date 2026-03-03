"use client";

import React from "react";
import { useParams } from "next/navigation";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
import Button2 from "@/components/ui/Button2";
import { client } from "@/sanity/lib/client";
import { UNIT_LOGO_FLOAT_QUERY } from "@/sanity/lib/queries";
import { assetUrl } from "@/utils/utils";
import type { CloudinaryAsset } from "@/types/sanity.types";

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

const tagToneClasses: Record<TagTone, string> = {
  department: "border-cyan-300 bg-cyan-50 text-cyan-800",
  location: "border-emerald-300 bg-emerald-50 text-emerald-800",
  employment: "border-amber-300 bg-amber-50 text-amber-800",
  contract: "border-orange-300 bg-orange-50 text-orange-800",
  seniority: "border-rose-300 bg-rose-50 text-rose-800",
  schedule: "border-slate-300 bg-slate-100 text-slate-700",
  remote: "border-lime-300 bg-lime-100 text-lime-900",
};

function Tag({ tone, children }: { tone: TagTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-medium uppercase tracking-wide rounded-none ${tagToneClasses[tone]}`}
    >
      {children}
    </span>
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

  const matchedUnitByJobId = React.useMemo(() => {
    return jobs.reduce<Record<string, MatchableUnit | null>>((acc, job) => {
      acc[job.id] = matchUnitForJob(job);
      return acc;
    }, {});
  }, [jobs, matchUnitForJob]);

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className="relative py-10 md:py-14"
      data-component="pg-pagebuilder-personio-jobs"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-7 max-w-3xl text-center md:mb-9">
          <h2 className="text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
            {headline}
          </h2>
          {subheadline ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-500 md:text-base">
              {subheadline}
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="border border-neutral-200 bg-white/80 px-5 py-8  text-center text-neutral-500 rounded-none">
            Loading open positions...
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 px-5 py-8 text-center text-red-700 rounded-none">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-neutral-200 bg-white/80 px-5 py-8 text-center text-neutral-500 rounded-none">
            {emptyStateText}
          </div>
        ) : (
          <ul className="mx-auto grid max-w-6xl gap-2 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const updatedAtLabel = formatDate(job.updatedAt);
              const descriptionSnippet = createSnippet(job.description);
              const matchedUnit = matchedUnitByJobId[job.id];
              const showContractChip =
                showContractType &&
                job.contractType &&
                job.contractType !== job.employmentType;

              return (
                <li
                  key={job.id}
                  className=" bg-neutral-50/75 p-8 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0 items-start gap-3">
                      {matchedUnit ? (
                        <img
                          src={matchedUnit.logoUrl}
                          alt={matchedUnit.name}
                          className="  w-auto max-w-[96px] object-contain object-left"
                        />
                      ) : null}
                      <h3 className="text-2xl font-regular leading-tight text-neutral-700 md:text-2xl">
                        {job.title}
                      </h3>
                    </div>

                  </div>

                  {showDescription && descriptionSnippet ? (
                    <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                      {descriptionSnippet}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {/* {showDepartment && job.department ? (
                      <Tag tone="department">{job.department}</Tag>
                    ) : null} */}
                    {showLocation && job.location ? (
                      <Tag tone="location">{job.location}</Tag>
                    ) : null}
                    {showEmploymentType && job.employmentType ? (
                      <Tag tone="employment">{job.employmentType}</Tag>
                    ) : null}
                    {showContractChip ? (
                      <Tag tone="contract">{job.contractType}</Tag>
                    ) : null}
                    {showSeniority && job.seniority ? (
                      <Tag tone="seniority">{job.seniority}</Tag>
                    ) : null}
                    {showSchedule && job.schedule ? (
                      <Tag tone="schedule">{job.schedule}</Tag>
                    ) : null}
                    {job.remote ? <Tag tone="remote">Remote</Tag> : null}
                  </div>

                  {showUpdatedAt && updatedAtLabel ? (
                    <p className="mt-3 text-[10px] uppercase tracking-wide text-neutral-600">
                      Updated: {updatedAtLabel}
                    </p>
                  ) : null}

                  {job.url ? (
                    <div className="w-[120px] mt-8 min-w-[120px] shrink-0">
                      <Button2
                        text={applyLabel}
                        href={job.url}
                        variant="ghost"
                        magnetic={false}
                        className="rounded-none"
                      />
                    </div>
                  ) : null}
                </li>

              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default withDebugBadge(
  PageBuilderPersonioJobs,
  "pg-PageBuilderPersonioJobs"
);
