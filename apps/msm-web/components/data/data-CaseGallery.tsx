"use client";

import React, { startTransition, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@1sp/utils/hooks/use-outside-click";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import Button2 from "@msm/components/ui/Button2";
import Image from "next/image";
import {SelectionSequence} from "@msm/components/ui/SelectionFrame";
import styles from "./CaseGalleryCard.module.css";
import CaseGalleryCard from "./CaseGalleryCard";
import DeferredVideo from "@msm/components/ui/DeferredVideo";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
  msmUnits?: Array<{
    _id: string;
    name: string;
    slug?: { current?: string };
  }>;
}

interface CaseGalleryComponentProps {
  caseStudies: CaseStudy[];
  activeFilter?: string;
  locale?: string;
  variant?: "light";
  filterAllText?: string;
  /** Rows shown per page; the column count follows the grid's breakpoints. */
  rowsPerPage?: number;
  /** Set false when the parent already slices the list. */
  paginate?: boolean;
}

const MIN_PAGE_SIZE = 6;

/** Mirrors the .grid breakpoints in CaseGalleryCard.module.css. */
function useGridColumns() {
  const [columns, setColumns] = useState(4);
  useEffect(() => {
    const queries = [window.matchMedia("(min-width: 1280px)"), window.matchMedia("(min-width: 1024px)"), window.matchMedia("(min-width: 768px)")];
    const update = () => setColumns(queries[0].matches ? 4 : queries[1].matches ? 3 : queries[2].matches ? 2 : 1);
    update();
    queries.forEach((query) => query.addEventListener("change", update));
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, []);
  return columns;
}

export default function CaseGalleryComponent({
  caseStudies = [],
  activeFilter = "All",
  locale = "en",
  variant,
  filterAllText = "All",
  rowsPerPage = 3,
  paginate = true,
}: CaseGalleryComponentProps) {
  const router = useOptimizedTransitionRouter();
  const [active, setActive] = useState<CaseStudy | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const openCase = (item: CaseStudy) => {
    startTransition(() => {
      setActive(item);
    });
  };
  const closeCase = () => {
    startTransition(() => {
      setActive(null);
    });
  };

  const filteredItems =
    activeFilter === filterAllText
      ? caseStudies
      : caseStudies.filter((item) =>
        item.services?.some((service) => service.name === activeFilter)
      );

  const columns = useGridColumns();
  const pageSize = paginate ? Math.max(rowsPerPage * columns, MIN_PAGE_SIZE) : Math.max(filteredItems.length, 1);
  const pages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const [page, setPage] = useState(0);
  const currentPage = Math.min(page, pages - 1);
  const pageItems = filteredItems.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const gridRef = useRef<HTMLDivElement>(null);
  const de = locale === "de";

  // A new filter starts again from the first page.
  useEffect(() => {
    setPage(0);
  }, [activeFilter]);

  const goTo = (next: number) => {
    const target = Math.min(Math.max(next, 0), pages - 1);
    if (target === currentPage) return;
    startTransition(() => {
      setPage(target);
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gridRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCase();
    }

    document.body.style.overflow = active ? "hidden" : "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [active]);

  useOutsideClick(ref, closeCase);

  const handleViewCaseStudy = (slug: string) => {
    document.body.style.overflow = "auto";
    closeCase();
    setTimeout(() => {
      router.push(`${locale === "en" ? "" : `/${locale}`}/cases/${slug}`);
    }, 50);
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.7,
              transition: { type: "spring", stiffness: 110, duration: 0.2 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  top-0 cl-overlay backdrop-blur-2xl bg-black w-full z-100"
          />
        )}
      </AnimatePresence>

      <>
        {active ? (
          <div className="fixed inset-0  grid place-items-center  w-full  z-[100]">


            <motion.div
              layoutId={`card-${active.title}-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0.2 }}
              ref={ref}
              className="w-[95vw] md:w-full max-w-[960px] min-h-[70vh] max-h-[100vh]  grid bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              <motion.div
                className="[grid-area:1/1] w-full  opacity-80  min-h-[70vh] max-h-[100vh] mediabackground"
                layoutId={`image-${active.title}-${id}`}
              >
                {active.mainVideoUrl ? (
                  <DeferredVideo
                    src={active.mainVideoUrl}
                    maxWidth={900}
                    className="w-full h-full  opacity-50 object-cover object-top"
                    mountDelay={100}
                    posterFrame="0"
                  />
                ) : (
                  <Image
                    width={1000}
                    height={1000}
                    src={active.mainImageUrl || "/placeholder.png"}
                    alt={active.title}
                    className="w-full h-full min-h-full    opacity-50 object-cover object-top"
                  />
                )}

              </motion.div>

              <div className="[grid-area:1/1] flex flex-col  justify-end w-full relative items-start p-8 z-10 popoupcontent">

                <motion.button
                  key={`button-${active.title}-${id}`}
                  layout
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1, transition: { duration: 0.05 } }}
                  className="flex absolute top-4  md:top-10  right-4 lg items-center hover:cursor-pointer overflow-hidden justify-around  h-6 w-6 z-100"
                  onClick={closeCase}
                  aria-label="Close"
                >
                  <CloseIcon />
                </motion.button>
                <div className="flex justify-end  top-0 flex-col items-start gap-4 landscape:gap-2  z-10 left-0">
                  {active.client?.logoUrl && (
                    <motion.img
                      layoutId={`logo-${active.title}-${id}`}
                      src={active.client.logoUrl}
                      alt={active.title}
                      className={`w-32 h-20 landscape:h-10 object-contain invert ${variant === "light" ? "invert" : ""}`}
                    />
                  )}

                  <div>

                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-white  text-3xl md:text-4xl md:max-w-3/4 dark:text-neutral-200 landscape-small:text-2xl"
                    >
                      {active.title}
                    </motion.h3>
                  </div>

                  <motion.div
                    transition={{ duration: 0.3, delay: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-sm landscape-small:max-w-3/4 landscape-small:text-xs  md:text-sm lg:text-base  md:max-w-1/2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400  [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.description}
                  </motion.div>

                  <motion.div
                    transition={{ duration: 0.1, delay: 0.1 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-[150px]"
                    onClick={() => handleViewCaseStudy(active.slug.current)}
                  >
                    <Button2 variant="violetsmall" text="View Case Study" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </>

      <div ref={gridRef} className={styles.gridAnchor} />
      <SelectionSequence key={`${activeFilter}-${pageItems.map(item => item._id).join('-')}`} className={styles.grid}>
        {pageItems.map((item, index) => (
          <CaseGalleryCard
            key={item._id}
            item={item}
            id={id}
            variant={variant}
            sequenceIndex={index + 1}
            locale={locale}
            onClick={() => openCase(item)}
          />
        ))}
      </SelectionSequence>
      {pages > 1 && (
        <nav className={styles.pager} aria-label={de ? "Seiten der Cases" : "Case pages"}>
          <p className={styles.pagerCount} aria-live="polite">
            {String(currentPage + 1).padStart(2, "0")} / {String(pages).padStart(2, "0")}
          </p>
          <div className={styles.pagerControls}>
            <button type="button" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 0}
              aria-label={de ? "Vorherige Cases" : "Previous cases"}>
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(currentPage + 1)} disabled={currentPage >= pages - 1}
              aria-label={de ? "Nächste Cases" : "Next cases"}>
              <ArrowRight size={24} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

export const CloseIcon = () => (
  <motion.svg
    whileHover={{ rotate: 90 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-white z-100"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
