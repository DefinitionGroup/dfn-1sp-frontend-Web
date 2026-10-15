"use client";

import CaseSection from "./CaseSection";
import styles from "./CaseDetail.module.css";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { hasVisibleText } from "@1sp/utils/text-content";

interface HeadlineChallengeProps {
  title: string;
  headline?: string;
  description?: string;
  paddingY?: string;
  navPointName?: string;
}

export default function HeadlineChallenge({
  title,
  headline,
  description,
  navPointName,
}: HeadlineChallengeProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.intro;

  return (
    <section id={sectionId} data-navpoint-name={navPointName || sectionId} className={styles.darkSection}>
      <div className={styles.container}>
        <CaseSection title={title}>
          {hasVisibleText(headline) && <h3 className={styles.subheading}>{headline}</h3>}
          {hasVisibleText(description) && <p className={styles.copy}>{description}</p>}
        </CaseSection>
      </div>
    </section>
  );
}
