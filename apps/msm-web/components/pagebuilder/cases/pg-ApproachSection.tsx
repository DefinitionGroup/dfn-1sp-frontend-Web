"use client";

import CaseSection from "./CaseSection";
import styles from "./CaseDetail.module.css";
import HeaderImageVideoComp2 from "@msm/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { assetUrl } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

interface CloudinaryAsset {
  public_id?: string;
  resource_type?: string;
  format?: string;
  secure_url?: string;
}

interface ApproachSectionProps {
  mainHeadline: string;
  badgeText?: string;
  badgeSubtitle?: string;
  subHeadline?: string;
  description?: string;
  approachDetails?: string[];
  mediaType?: "image" | "video";
  backgroundImage?: CloudinaryAsset;
  backgroundVideo?: CloudinaryAsset;
  enableParallax?: boolean;
  paddingY?: string;
  navPointName?: string;
}

export default function ApproachSection({
  mainHeadline,
  badgeText,
  badgeSubtitle,
  subHeadline,
  description,
  approachDetails,
  mediaType = "image",
  backgroundImage,
  backgroundVideo,
  enableParallax = false,
  navPointName,
}: ApproachSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.approach;

  // Get the media URL
  const imageUrl = backgroundImage ? assetUrl(backgroundImage) : "";
  const videoUrl = backgroundVideo ? assetUrl(backgroundVideo) : "";

  return (
    <section id={sectionId} data-navpoint-name={navPointName || sectionId} className={styles.darkSection}>
      {mediaType === "video" && videoUrl ? (
        <HeaderImageVideoComp2 useVideo videoSrc={videoUrl} enableParallax={enableParallax} />
      ) : imageUrl ? (
        <HeaderImageVideoComp2 useVideo={false} imageSrc={imageUrl} enableParallax={enableParallax} />
      ) : null}
      <div className={styles.container}>
        <CaseSection title={mainHeadline} badgeText={badgeText} badgeSubtitle={badgeSubtitle}>
          {hasVisibleText(subHeadline) && <h3 className={styles.subheading}>{subHeadline}</h3>}
          {hasVisibleText(description) && <p className={styles.copy}>{description}</p>}
          {approachDetails && approachDetails.length > 0 && <ul className={styles.detailList}>
            {approachDetails.map((detail, index) => <li key={index}>{detail}</li>)}
          </ul>}
        </CaseSection>
      </div>
    </section>
  );
}
