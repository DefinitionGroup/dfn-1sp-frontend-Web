import type { PortableTextBlock } from "@portabletext/types";

export type MsmUnitSummary = {
  _id: string;
  _updatedAt?: string;
  name: string;
  slug: { current: string };
  descriptor?: string;
  claim: string;
  body?: PortableTextBlock[];
  capabilities?: string[];
  sortOrder?: number;
  heroImageUrl?: string;
  heroAlt?: string;
  unitMarkUrl?: string;
  caseCount?: number;
  leadershipCount?: number;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

export type MsmUnitCase = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string; taglabel?: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: { _id: string; name: string; logoUrl?: string };
};

export type MsmUnitPerson = {
  isPrimary?: boolean;
  person?: {
    _id: string;
    name?: string;
    fullname?: string;
    altText?: string;
    position?: string;
    email?: string;
    profileUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
  };
};

export type MsmUnitDetail = MsmUnitSummary & {
  leadership?: MsmUnitPerson[];
  cases?: MsmUnitCase[];
};
