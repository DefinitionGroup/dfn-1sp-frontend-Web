import Image from "next/image";

const networkLogos = [
  ["/renaissance/figma/network-xr.svg", "1SP XR Studio"],
  ["/renaissance/figma/network-studioco2.svg", "Studio CO2"],
  ["/renaissance/figma/network-promopers.svg", "PromoPers"],
  ["/renaissance/figma/network-msm.svg", "MSM.digital"],
  ["/renaissance/figma/network-fijak.svg", "Fijak"],
  ["/renaissance/figma/network-flzr.svg", "FLZR"],
  ["/renaissance/figma/network-newfluence.svg", "New Fluence"],
  ["/renaissance/figma/network-insight.svg", "Insight"],
  ["/renaissance/figma/network-renaissance.svg", "Renaissance"],
  ["/renaissance/figma/network-meettomatch.svg", "MeetToMatch"],
] as const;

export default function RenaissanceNetwork() {
  return (
    <section
      className="relative isolate mx-auto w-full max-w-[1680px] min-h-[42rem] overflow-hidden rounded-t-statement bg-black px-5 py-14 font-renaissance text-white sm:px-8 md:min-h-[40.5rem] md:px-12 md:py-16"
      aria-labelledby="renaissance-network-title"
    >
      <Image
        src="/renaissance/figma/network-background.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center scale-[1.08] md:scale-[1.2]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />

      <div className="mx-auto max-w-[1680px]">
        <ul className="grid grid-cols-5 items-center gap-x-4 gap-y-5 md:grid-cols-10 md:gap-x-8">
          {networkLogos.map(([src, alt]) => (
            <li key={src} className="relative h-12 opacity-90 md:h-[4.4rem]">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="150px"
                className="object-contain"
              />
            </li>
          ))}
        </ul>

        <div className="mt-20 max-w-[52rem] md:mt-24">
          <p className="text-[clamp(1rem,1.35vw,1.25rem)] font-medium uppercase leading-tight">
            Proud to be a
          </p>
          <div className="mt-3 h-px w-full max-w-[32rem] bg-white/65" />
          <h2
            id="renaissance-network-title"
            className="mt-4 text-[clamp(3.25rem,6.2vw,5rem)] font-medium leading-[0.9] tracking-[-0.04em] text-white"
          >
            1SP.AGENCY
          </h2>
          <p className="mt-8 max-w-[50rem] text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.5] text-white/90">
            1SP is a powerhouse of specialist agencies ready to accelerate growth at every stage of your customer journey. Our One Shared Passion? Gaming, Technology and Consumer Electronics.
          </p>
          <p className="mt-5 max-w-[50rem] text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.5] text-white/90">
            We know what makes gamers, gadget lovers, and tech obsessives tick because we&apos;re built the same way. We understand the hype, the culture, the mindset.
          </p>
        </div>
      </div>
    </section>
  );
}
