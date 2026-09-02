import Image from "next/image";

const portraits = [
  { src: "/renaissance/figma/team-01.jpg", alt: "Stefano Petrullo" },
  { src: "/renaissance/figma/team-02.jpg", alt: "Renaissance team member" },
  { src: "/renaissance/figma/team-03.jpg", alt: "Renaissance team member" },
  { src: "/renaissance/figma/team-04.jpg", alt: "Renaissance team member" },
];

const awards = [
  "/renaissance/figma/award-01.png",
  "/renaissance/figma/award-02.png",
  "/renaissance/figma/award-03.png",
  "/renaissance/figma/award-04.png",
  "/renaissance/figma/award-05.png",
  "/renaissance/figma/award-01.png",
  "/renaissance/figma/award-02.png",
  "/renaissance/figma/award-03.png",
];

export default function RenaissancePeopleProof() {
  return (
    <div className="relative overflow-hidden pb-20 pt-4 md:pb-28 md:pt-4">
      <Image
        src="/renaissance/figma/people-bolt.svg"
        alt=""
        width={1271}
        height={1049}
        aria-hidden="true"
        className="pointer-events-none absolute -right-[18%] top-[6%] h-auto w-[86%] max-w-none opacity-95"
      />

      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {[...portraits, ...portraits].map((portrait, index) => (
            <figure
              key={`${portrait.src}-${index}`}
              aria-hidden={index >= portraits.length || undefined}
              className={`relative aspect-[0.78] overflow-hidden bg-renaissance-accent ${
                index >= portraits.length ? "hidden md:block" : ""
              }`}
            >
              <Image
                src={portrait.src}
                alt={index >= portraits.length ? "" : portrait.alt}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
              />
            </figure>
          ))}
        </div>

        <h3 className="renaissance-display mx-auto mt-16 text-center text-[clamp(2.7rem,3.3vw,3.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.025em] text-renaissance-signal md:mt-24">
          Award-winning people. Leading by example.
        </h3>

        <div className="mt-12 grid grid-cols-3 items-center gap-3 border-t border-white/20 pt-10 sm:grid-cols-4 md:mt-16 md:grid-cols-8 md:gap-4">
          {awards.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-square overflow-hidden rounded-[3px] bg-white p-3 md:p-5"
            >
              <Image
                src={src}
                alt={index < 5 ? "Industry award" : ""}
                fill
                sizes="160px"
                className="object-contain p-3 md:p-5"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
