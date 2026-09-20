"use client";

import EditorialReveal from "@msm/components/ui/EditorialReveal";
import styles from "@msm/components/ui/EditorialBlocks.module.css";
import HamburgerGradientMenu from "@msm/components/ui/HamburgerGradientMenu";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { hasVisibleText } from "@1sp/utils/text-content";


interface CasesIntroProps {
  title: string;
  titleTag?: "h1" | "h2";
  subtitle?: string;
  showHamburgerMenu?: boolean;
  paddingY?: string;
  navPointName?: string;
}

function CasesIntro({
  title,
  titleTag = "h2",
  subtitle,
  showHamburgerMenu = true,
  navPointName,
}: CasesIntroProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.intro;
  const TitleTag = titleTag === "h1" ? "h1" : "h2";

  return (
    <section id={sectionId} data-navpoint-name={navPointName} className={styles.section}>
      {showHamburgerMenu && <HamburgerGradientMenu />}
      <div className={styles.inner}>
        <EditorialReveal className={styles.introRow}>
          {hasVisibleText(title) && <TitleTag className={styles.heading}>{title}</TitleTag>}
          {hasVisibleText(subtitle) && <h2 className={styles.support}>{subtitle}</h2>}
        </EditorialReveal>
      </div>
    </section>
  );
}

export default CasesIntro;
