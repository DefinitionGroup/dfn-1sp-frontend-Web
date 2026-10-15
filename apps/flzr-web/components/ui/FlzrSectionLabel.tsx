import Image from "next/image";

type FlzrSectionLabelProps = {
  number: string;
  label: string;
  tone?: "neutral" | "accent";
};

export default function FlzrSectionLabel({
  number,
  label,
  tone = "neutral",
}: FlzrSectionLabelProps) {
  return (
    <div
      className="flzr-section-label"
      aria-label={`${number} ${label}`}
      data-tone={tone}
    >
      <Image
        src={
          tone === "accent"
            ? "/units/FLZR/section-label-accent.svg"
            : "/units/FLZR/section-label-light.svg"
        }
        alt=""
        fill
        sizes="126px"
        aria-hidden="true"
        className="object-fill"
      />
      <span className="flzr-section-label__copy" aria-hidden="true">
        <span className="flzr-section-label__number">{number}</span>
        <strong>{label}</strong>
      </span>
    </div>
  );
}
