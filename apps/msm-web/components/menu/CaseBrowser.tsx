"use client";

import { useDeferredValue, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { cloudinaryPosterUrl } from "@1sp/utils/cloudinary";
import styles from "./Navigation.module.css";

export interface NavigationCase {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: { _id: string; name: string; logoUrl?: string };
  services?: { _id: string; name: string; taglabel?: string }[];
  msmUnits?: { _id: string; name: string }[];
}

export default function CaseBrowser({
  locale,
  channel,
  initialCases,
  onNavigate,
  reducedMotion,
  mobile = false,
}: {
  locale: string;
  channel: string;
  initialCases: NavigationCase[];
  onNavigate: () => void;
  reducedMotion: boolean;
  mobile?: boolean;
}) {
  const [cases, setCases] = useState(initialCases);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(initialCases.length ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const german = locale === "de";
  const casesHref = `${german ? "/de" : locale === "en" ? "" : `/${locale}`}/cases`;

  useEffect(() => {
    if (initialCases.length) return;
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      try {
        const response = await fetch(`/api/cases?channel=${encodeURIComponent(channel)}&language=${encodeURIComponent(locale)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Cases unavailable");
        const payload = await response.json();
        if (!controller.signal.aborted) {
          setCases((Array.isArray(payload.caseStudies) ? payload.caseStudies : []).filter((item: NavigationCase) => item.slug?.current));
          setStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [channel, locale, initialCases, attempt]);

  const units = Array.from(new Set(cases.flatMap((item) => item.msmUnits?.map((entry) => entry.name) ?? []))).sort();
  const needle = deferredQuery.trim().toLocaleLowerCase(locale);
  const filtered = cases.filter((item) => {
    if (unit && !item.msmUnits?.some((entry) => entry.name === unit)) return false;
    return !needle || [item.title, item.subtitle, item.client?.name, ...(item.services?.map((entry) => entry.name) ?? [])].join(" ").toLocaleLowerCase(locale).includes(needle);
  });
  const preview = filtered.find((item) => item._id === previewId) ?? filtered[0];
  const previewImage = preview?.mainImageUrl || (preview?.mainVideoUrl ? cloudinaryPosterUrl(preview.mainVideoUrl, { maxWidth: 640, frame: "0" }) : undefined);

  useEffect(() => { listRef.current?.scrollTo({ top: 0 }); }, [deferredQuery, unit]);

  return (
    <div className={`${styles.caseBrowser} ${mobile ? styles.mobileCases : ""}`}>
      <div className={styles.caseHeading}>
        <span>{german ? "Unsere Projekte" : "Explore our work"}</span>
        <Link className={styles.allCases} href={casesHref} onClick={onNavigate}>
          {german ? "Alle Cases" : "All cases"}<ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.caseTools}>
        <div className={styles.search}>
          <MagnifyingGlass size={18} aria-hidden="true" />
          <input type="search" aria-label={german ? "Cases suchen" : "Search cases"} placeholder={german ? "Projekt oder Kunde suchen" : "Search project or client"} value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={german ? "Suche löschen" : "Clear search"}><X size={16} /></button>}
        </div>
        {units.length > 1 && <div className={styles.unitFilter}>
          <select value={unit} onChange={(event) => setUnit(event.target.value)} aria-label={german ? "Nach Unit filtern" : "Filter by Unit"}>
            <option value="">{german ? "Alle Units" : "All Units"}</option>
            {units.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <CaretDown size={16} aria-hidden="true" />
        </div>}
      </div>
      <div className={styles.caseContent}>
        <div className={styles.caseResults}>
          <p className={styles.resultCount} role="status" aria-live="polite">{status === "loading" ? (german ? "Cases werden geladen…" : "Loading cases…") : status === "ready" ? `${filtered.length} ${german ? "Projekte" : "projects"}` : ""}</p>
          {status === "error" ? <div className={styles.caseMessage} role="alert">
            <p>{german ? "Die Cases konnten nicht geladen werden." : "Cases couldn’t load."}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>{german ? "Erneut versuchen" : "Try again"}</button>
          </div> : status === "ready" && !filtered.length ? <div className={styles.caseMessage}>
            <p>{cases.length ? (german ? "Keine passenden Projekte." : "No matching projects.") : (german ? "Zurzeit sind keine Cases verfügbar." : "No cases available right now.")}</p>
            {cases.length > 0 && <button type="button" onClick={() => { setQuery(""); setUnit(""); }}>{german ? "Filter zurücksetzen" : "Clear filters"}</button>}
          </div> : <ul ref={listRef} className={styles.caseList} id={`${id}-results`} aria-label={german ? "Case Studies" : "Case studies"} aria-busy={status === "loading" || query !== deferredQuery} onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
            const index = links.indexOf(document.activeElement as HTMLAnchorElement);
            if (index < 0) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : links.length - 1)) % links.length;
            links[next]?.focus();
          }}>
            {filtered.map((item) => <li key={item._id}>
              <Link href={`${casesHref}/${item.slug.current}`} prefetch={false} onClick={onNavigate} onPointerEnter={() => setPreviewId(item._id)} onFocus={() => setPreviewId(item._id)} className={styles.caseLink} data-preview={preview?._id === item._id}>
                <span><span className={styles.caseClient}>{item.client?.name || item.subtitle || (german ? "Case Study" : "Case study")}</span><span className={styles.caseTitle}>{item.title}</span></span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </li>)}
          </ul>}
        </div>
        {!mobile && preview && <div className={styles.casePreview} aria-hidden="true">
          <div className={styles.previewMedia}>
            <AnimatePresence initial={false}>
              {previewImage && <motion.img key={previewImage} src={previewImage} alt="" width={640} height={480} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} />}
            </AnimatePresence>
          </div>
          <p>{preview.title}</p>
          <span>{preview.msmUnits?.map((entry) => entry.name).join(" / ") || preview.subtitle || preview.client?.name}</span>
        </div>}
      </div>
    </div>
  );
}
