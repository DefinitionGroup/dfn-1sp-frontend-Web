import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PERSONIO_AUTH_URL = "https://api.personio.de/v2/auth/token";
const PERSONIO_JOBS_URL = "https://api.personio.de/v2/recruiting/jobs";
const DEFAULT_CACHE_SECONDS = 300;

type JsonRecord = Record<string, unknown>;

type NormalizedPersonioJob = {
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

type TokenCacheEntry = {
  token: string;
  expiresAt: number;
};

type JobsCacheEntry = {
  jobs: NormalizedPersonioJob[];
  fetchedAt: string;
  expiresAt: number;
  source: "v2" | "xml";
  language: string;
};

let tokenCache: TokenCacheEntry | null = null;
let jobsCache: JobsCacheEntry | null = null;

class PersonioApiError extends Error {
  public readonly status: number;
  public readonly details?: string;

  constructor(message: string, status = 500, details?: string) {
    super(message);
    this.name = "PersonioApiError";
    this.status = status;
    this.details = details;
  }
}

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clampInt = (
  value: string | null | undefined,
  fallback: number,
  min: number,
  max: number
) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const parseBoolean = (value: string | null, fallback: boolean) => {
  if (value === null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const normalizeLanguageCode = (value?: string) => {
  const normalized = (value || "en").trim().toLowerCase();
  return /^[a-z]{2}$/i.test(normalized) ? normalized : normalized.slice(0, 2) || "en";
};

const buildApplicationUrl = (jobId: string, language: string) => {
  const normalizedLanguage = normalizeLanguageCode(language);
  const template = process.env.PERSONIO_APPLICATION_URL_TEMPLATE?.trim();

  if (template) {
    return template
      .replace(/\{id\}/gi, encodeURIComponent(jobId))
      .replace(/\{language\}/gi, normalizedLanguage);
  }

  const baseUrl = process.env.PERSONIO_APPLICATION_BASE_URL?.trim();
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      if (!url.searchParams.get("language")) {
        url.searchParams.set("language", normalizedLanguage);
      }
      return url.toString();
    } catch {
      return baseUrl;
    }
  }

  const accountSlug = process.env.PERSONIO_ACCOUNT_SLUG?.trim();
  if (!accountSlug) return undefined;

  return `https://${accountSlug}.jobs.personio.de/job/${encodeURIComponent(jobId)}?language=${normalizedLanguage}`;
};

const getPathValue = (source: JsonRecord, path: string[]): unknown => {
  let current: unknown = source;

  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }

  return current;
};

const pickString = (source: JsonRecord, paths: string[][]): string | undefined => {
  for (const path of paths) {
    const value = getPathValue(source, path);

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
      continue;
    }

    if (typeof value === "number") return String(value);
  }

  return undefined;
};

const pickBoolean = (source: JsonRecord, paths: string[][]): boolean | undefined => {
  for (const path of paths) {
    const value = getPathValue(source, path);
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
    }
  }

  return undefined;
};

const extractJobRecords = (payload: unknown): JsonRecord[] => {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];

  const topLevelCandidates = [
    payload.data,
    payload.jobs,
    payload.items,
    payload.results,
    payload.records,
  ];

  for (const candidate of topLevelCandidates) {
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
  }

  if (isRecord(payload.data)) {
    const nestedCandidates = [
      payload.data.data,
      payload.data.jobs,
      payload.data.items,
      payload.data.results,
      payload.data.records,
    ];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) return candidate.filter(isRecord);
    }
  }

  return [];
};

const normalizeJob = (
  job: JsonRecord,
  language: string
): NormalizedPersonioJob | null => {
  const id = pickString(job, [
    ["id"],
    ["job_id"],
    ["jobId"],
    ["attributes", "id"],
    ["attributes", "job_id"],
    ["attributes", "jobId"],
  ]);

  const title = pickString(job, [
    ["title"],
    ["name"],
    ["position"],
    ["job_title"],
    ["attributes", "title"],
    ["attributes", "name"],
    ["attributes", "position"],
    ["attributes", "job_title"],
  ]);

  if (!id || !title) return null;

  return {
    id,
    title,
    department: pickString(job, [
      ["department", "name"],
      ["department"],
      ["team", "name"],
      ["team"],
      ["category", "name"],
      ["attributes", "department", "name"],
      ["attributes", "department"],
      ["attributes", "team", "name"],
      ["attributes", "team"],
      ["attributes", "category", "name"],
    ]),
    location: pickString(job, [
      ["location", "name"],
      ["location"],
      ["office", "name"],
      ["office"],
      ["city"],
      ["workplace", "name"],
      ["attributes", "location", "name"],
      ["attributes", "location"],
      ["attributes", "office", "name"],
      ["attributes", "office"],
      ["attributes", "city"],
      ["attributes", "workplace", "name"],
    ]),
    employmentType: pickString(job, [
      ["employment_type"],
      ["employmentType"],
      ["job_type"],
      ["type"],
      ["attributes", "employment_type"],
      ["attributes", "employmentType"],
      ["attributes", "job_type"],
      ["attributes", "type"],
    ]),
    contractType: pickString(job, [
      ["contract_type"],
      ["contractType"],
      ["occupation"],
      ["attributes", "contract_type"],
      ["attributes", "contractType"],
      ["attributes", "occupation"],
    ]),
    seniority: pickString(job, [
      ["seniority"],
      ["years_of_experience"],
      ["yearsOfExperience"],
      ["experience_level"],
      ["experienceLevel"],
      ["occupation_category"],
      ["occupationCategory"],
      ["attributes", "seniority"],
      ["attributes", "years_of_experience"],
      ["attributes", "yearsOfExperience"],
      ["attributes", "experience_level"],
      ["attributes", "experienceLevel"],
      ["attributes", "occupation_category"],
      ["attributes", "occupationCategory"],
    ]),
    description: pickString(job, [
      ["description"],
      ["summary"],
      ["short_description"],
      ["shortDescription"],
      ["job_description"],
      ["jobDescription"],
      ["attributes", "description"],
      ["attributes", "summary"],
      ["attributes", "short_description"],
      ["attributes", "shortDescription"],
      ["attributes", "job_description"],
      ["attributes", "jobDescription"],
    ]),
    schedule: pickString(job, [
      ["schedule"],
      ["working_hours"],
      ["attributes", "schedule"],
      ["attributes", "working_hours"],
    ]),
    status: pickString(job, [
      ["status"],
      ["state"],
      ["attributes", "status"],
      ["attributes", "state"],
    ]),
    url: pickString(job, [
      ["url"],
      ["career_page_url"],
      ["careerPageUrl"],
      ["application_url"],
      ["applicationUrl"],
      ["job_posting_url"],
      ["attributes", "url"],
      ["attributes", "career_page_url"],
      ["attributes", "careerPageUrl"],
      ["attributes", "application_url"],
      ["attributes", "applicationUrl"],
      ["attributes", "job_posting_url"],
    ]) || buildApplicationUrl(id, language),
    updatedAt: pickString(job, [
      ["updated_at"],
      ["updatedAt"],
      ["last_updated_at"],
      ["lastUpdatedAt"],
      ["attributes", "updated_at"],
      ["attributes", "updatedAt"],
      ["attributes", "last_updated_at"],
      ["attributes", "lastUpdatedAt"],
    ]),
    remote: pickBoolean(job, [
      ["remote"],
      ["is_remote"],
      ["isRemote"],
      ["attributes", "remote"],
      ["attributes", "is_remote"],
      ["attributes", "isRemote"],
    ]),
  };
};

const isLikelyPublished = (job: NormalizedPersonioJob) => {
  const status = job.status?.toLowerCase();
  if (!status) return true;

  const blockedMarkers = [
    "archived",
    "closed",
    "deleted",
    "draft",
    "inactive",
    "internal",
    "unpublished",
  ];

  return !blockedMarkers.some((marker) => status.includes(marker));
};

const safeResponseText = async (response: Response) => {
  try {
    const text = await response.text();
    return text ? text.slice(0, 500) : "No response body";
  } catch {
    return "Could not read response body";
  }
};

const isDevMode =
  process.env.NODE_ENV !== "production" || process.env.DEVMODE === "true";

const getDirectRecruitingToken = () =>
  process.env.PERSONIO_RECRUITING_TOKEN ||
  process.env.PERSONIO_TOKEN ||
  process.env.PERSONIO_ACCESS_TOKEN;

const stripCdata = (value: string) =>
  value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const normalizeText = (value?: string) => {
  if (!value) return undefined;
  const cleaned = stripHtml(decodeXmlEntities(stripCdata(value).trim()));
  return cleaned.length > 0 ? cleaned : undefined;
};

const extractXmlTagRaw = (block: string, tagName: string) => {
  const regex = new RegExp(
    `<${tagName}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );
  const match = block.match(regex);
  if (!match?.[1]) return undefined;
  const cleaned = decodeXmlEntities(stripCdata(match[1]).trim());
  return cleaned.length > 0 ? cleaned : undefined;
};

const extractXmlTag = (block: string, tagName: string) => {
  return normalizeText(extractXmlTagRaw(block, tagName));
};

const parseBooleanFromText = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on", "remote"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "onsite"].includes(normalized)) return false;
  return undefined;
};

type XmlDescriptionEntry = {
  label?: string;
  value?: string;
  language?: string;
};

const parseXmlDescriptionEntries = (positionBlock: string): XmlDescriptionEntry[] => {
  const descriptionsXml = extractXmlTagRaw(positionBlock, "jobDescriptions");
  if (!descriptionsXml) return [];

  const entries = descriptionsXml.match(/<jobDescription\b[^>]*>[\s\S]*?<\/jobDescription>/gi) || [];

  return entries
    .map((entry) => ({
      label: extractXmlTag(entry, "name"),
      value: extractXmlTag(entry, "value"),
      language:
        extractXmlTag(entry, "languageCode") ||
        extractXmlTag(entry, "language") ||
        extractXmlTag(entry, "lang"),
    }))
    .filter((entry) => Boolean(entry.value));
};

const pickDescriptionForLanguage = (
  entries: XmlDescriptionEntry[],
  language: string
) => {
  if (entries.length === 0) return undefined;

  const normalizedLanguage = normalizeLanguageCode(language);
  const withMatchingLanguage = entries.find(
    (entry) =>
      entry.value &&
      entry.language &&
      normalizeLanguageCode(entry.language) === normalizedLanguage
  );
  if (withMatchingLanguage?.value) return withMatchingLanguage.value;

  const descriptionLabelPattern =
    /(description|summary|about|intro|position|role|aufgabe|profil|angebot|benefit)/i;
  const byLabel = entries.find(
    (entry) => entry.value && entry.label && descriptionLabelPattern.test(entry.label)
  );
  if (byLabel?.value) return byLabel.value;

  return entries.find((entry) => entry.value)?.value;
};

const parsePersonioXmlJobs = (
  xml: string,
  language: string
): NormalizedPersonioJob[] => {
  const normalizedLanguage = normalizeLanguageCode(language);
  const positionBlocks = xml.match(/<position\b[^>]*>[\s\S]*?<\/position>/gi) || [];

  return positionBlocks
    .map((block) => {
      const id = extractXmlTag(block, "id");
      const title = extractXmlTag(block, "name");
      if (!id || !title) return null;

      const location =
        extractXmlTag(block, "office") || extractXmlTag(block, "subcompany");
      const description = pickDescriptionForLanguage(
        parseXmlDescriptionEntries(block),
        language
      );
      const contractType =
        extractXmlTag(block, "contractType") || extractXmlTag(block, "occupation");
      const seniority =
        extractXmlTag(block, "seniority") ||
        extractXmlTag(block, "yearsOfExperience") ||
        extractXmlTag(block, "occupationCategory");
      const remote =
        parseBooleanFromText(
          extractXmlTag(block, "remote") ||
            extractXmlTag(block, "isRemote") ||
            extractXmlTag(block, "homeOffice")
        ) ??
        (location?.toLowerCase().includes("remote") ? true : undefined);

      return {
        id,
        title,
        department: extractXmlTag(block, "department"),
        location,
        employmentType:
          extractXmlTag(block, "employmentType") ||
          extractXmlTag(block, "employment_type"),
        contractType,
        seniority,
        description,
        schedule:
          extractXmlTag(block, "schedule") ||
          extractXmlTag(block, "working_hours"),
        status: "published",
        url:
          extractXmlTag(block, "url") ||
          extractXmlTag(block, "jobUrl") ||
          buildApplicationUrl(id, normalizedLanguage),
        updatedAt:
          extractXmlTag(block, "updatedAt") ||
          extractXmlTag(block, "modifiedAt") ||
          extractXmlTag(block, "createdAt"),
        remote,
      } as NormalizedPersonioJob;
    })
    .filter((job): job is NormalizedPersonioJob => Boolean(job));
};

const getXmlFeedUrl = (language: string) => {
  const normalizedLanguage = normalizeLanguageCode(language);
  const explicitUrl = process.env.PERSONIO_XML_FEED_URL?.trim();
  if (explicitUrl) {
    try {
      const url = new URL(explicitUrl);
      if (!url.searchParams.get("language")) {
        url.searchParams.set("language", normalizedLanguage);
      }
      return url.toString();
    } catch {
      return explicitUrl;
    }
  }

  const accountSlug = process.env.PERSONIO_ACCOUNT_SLUG?.trim();
  if (!accountSlug) return undefined;

  return `https://${accountSlug}.jobs.personio.de/xml?language=${normalizedLanguage}`;
};

const fetchJobsFromXmlFeed = async (language: string) => {
  const xmlFeedUrl = getXmlFeedUrl(language);
  if (!xmlFeedUrl) {
    throw new PersonioApiError(
      "V2 jobs endpoint unavailable and XML feed is not configured.",
      502,
      "Set PERSONIO_XML_FEED_URL or PERSONIO_ACCOUNT_SLUG to enable XML fallback."
    );
  }

  const response = await fetch(xmlFeedUrl, {
    method: "GET",
    headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
    cache: "no-store",
  });

  if (!response.ok) {
    const responseText = await safeResponseText(response);
    throw new PersonioApiError(
      "XML jobs feed request failed.",
      502,
      `Status ${response.status}: ${responseText}`
    );
  }

  const xmlPayload = await response.text();
  const jobs = parsePersonioXmlJobs(xmlPayload, language);

  return jobs;
};

const requestAccessToken = async (body: URLSearchParams) =>
  fetch(PERSONIO_AUTH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

const requestAccessTokenJson = async (body: JsonRecord) =>
  fetch(PERSONIO_AUTH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

const getAccessToken = async (forceRefresh = false) => {
  const directToken = getDirectRecruitingToken();
  if (directToken) return directToken;

  const clientId = process.env.PERSONIO_CLIENT_ID;
  const clientSecret = process.env.PERSONIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new PersonioApiError(
      "Missing Personio credentials.",
      500,
      "Set PERSONIO_RECRUITING_TOKEN or PERSONIO_CLIENT_ID + PERSONIO_CLIENT_SECRET."
    );
  }

  if (!forceRefresh && tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  let response = await requestAccessToken(
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    })
  );

  // Fallback for providers that only accept client_id + client_secret.
  if (!response.ok) {
    response = await requestAccessToken(
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
      })
    );
  }

  // Additional fallback for providers that expect JSON payloads.
  if (!response.ok) {
    response = await requestAccessTokenJson({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
  }

  if (!response.ok) {
    response = await requestAccessTokenJson({
      client_id: clientId,
      client_secret: clientSecret,
    });
  }

  if (!response.ok) {
    const responseText = await safeResponseText(response);
    throw new PersonioApiError(
      "Token request to Personio failed.",
      502,
      `Status ${response.status}: ${responseText}`
    );
  }

  const payload = (await response.json()) as unknown;

  if (!isRecord(payload)) {
    throw new PersonioApiError(
      "Unexpected token response format from Personio.",
      502
    );
  }

  const token = pickString(payload, [
    ["access_token"],
    ["token"],
    ["data", "access_token"],
    ["data", "token"],
  ]);

  if (!token) {
    throw new PersonioApiError(
      "Token response did not include an access token.",
      502
    );
  }

  const expiresInRaw =
    getPathValue(payload, ["expires_in"]) ??
    getPathValue(payload, ["data", "expires_in"]);
  const expiresIn =
    typeof expiresInRaw === "number" && Number.isFinite(expiresInRaw)
      ? expiresInRaw
      : 3600;

  tokenCache = {
    token,
    expiresAt: Date.now() + Math.max(60, Math.floor(expiresIn) - 60) * 1000,
  };

  return token;
};

const fetchJobsPayload = async (forceTokenRefresh = false): Promise<unknown> => {
  const accessToken = await getAccessToken(forceTokenRefresh);

  const response = await fetch(PERSONIO_JOBS_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 && !forceTokenRefresh) {
    tokenCache = null;
    return fetchJobsPayload(true);
  }

  if (!response.ok) {
    const responseText = await safeResponseText(response);
    throw new PersonioApiError(
      "Jobs request to Personio failed.",
      502,
      `Status ${response.status}: ${responseText}`
    );
  }

  return response.json();
};

const getJobs = async (
  refresh: boolean,
  cacheSeconds: number,
  language: string
) => {
  const normalizedLanguage = normalizeLanguageCode(language);

  if (
    !refresh &&
    jobsCache &&
    Date.now() < jobsCache.expiresAt &&
    jobsCache.language === normalizedLanguage
  ) {
    return {
      jobs: jobsCache.jobs,
      fetchedAt: jobsCache.fetchedAt,
      cacheHit: true,
      source: jobsCache.source,
    };
  }

  let normalizedJobs: NormalizedPersonioJob[] = [];
  let source: "v2" | "xml" = "v2";

  try {
    const payload = await fetchJobsPayload(false);
    normalizedJobs = extractJobRecords(payload)
      .map((job) => normalizeJob(job, normalizedLanguage))
      .filter((job): job is NormalizedPersonioJob => Boolean(job))
      .sort((a, b) => {
        const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return bTime - aTime;
      });
  } catch (error) {
    const isNotFoundOnV2 =
      error instanceof PersonioApiError &&
      error.status === 502 &&
      error.details?.includes("/v2/recruiting/jobs");

    if (!isNotFoundOnV2) throw error;

    normalizedJobs = await fetchJobsFromXmlFeed(language);
    source = "xml";
  }

  const fetchedAt = new Date().toISOString();
  jobsCache = {
    jobs: normalizedJobs,
    fetchedAt,
    expiresAt: Date.now() + cacheSeconds * 1000,
    source,
    language: normalizedLanguage,
  };

  return { jobs: normalizedJobs, fetchedAt, cacheHit: false, source };
};

export async function GET(request: NextRequest) {
  const hasDirectToken = Boolean(getDirectRecruitingToken());
  const hasOAuthCredentials = Boolean(
    process.env.PERSONIO_CLIENT_ID && process.env.PERSONIO_CLIENT_SECRET
  );

  if (!hasDirectToken && !hasOAuthCredentials) {
    return NextResponse.json(
      {
        error:
          "Personio credentials are missing. Set PERSONIO_RECRUITING_TOKEN or PERSONIO_CLIENT_ID + PERSONIO_CLIENT_SECRET.",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const maxItems = clampInt(searchParams.get("maxItems"), 20, 1, 100);
  const onlyPublished = parseBoolean(searchParams.get("onlyPublished"), true);
  const refresh = parseBoolean(searchParams.get("refresh"), false);
  const language = normalizeLanguageCode(searchParams.get("language") || "en");

  const cacheSeconds = clampInt(
    process.env.PERSONIO_JOBS_CACHE_SECONDS,
    DEFAULT_CACHE_SECONDS,
    30,
    3600
  );

  try {
    const { jobs, fetchedAt, cacheHit, source } = await getJobs(
      refresh,
      cacheSeconds,
      language
    );
    const result = onlyPublished ? jobs.filter(isLikelyPublished) : jobs;
    const sliced = result.slice(0, maxItems);

    return NextResponse.json({
      jobs: sliced,
      total: sliced.length,
      sourceTotal: jobs.length,
      fetchedAt,
      cached: cacheHit,
      cacheSeconds,
      source,
    });
  } catch (error: unknown) {
    const isKnownError = error instanceof PersonioApiError;
    const details =
      isKnownError
        ? error.details
        : error instanceof Error
          ? error.message
          : "Unknown error";

    console.error("Personio jobs API error:", {
      message:
        isKnownError && error.message
          ? error.message
          : "Unexpected Personio jobs API failure.",
      details,
    });

    return NextResponse.json(
      {
        error:
          "Unable to load job openings from Personio. Check credentials and API scopes.",
        ...(isDevMode ? { details } : {}),
      },
      { status: isKnownError ? error.status : 502 }
    );
  }
}
