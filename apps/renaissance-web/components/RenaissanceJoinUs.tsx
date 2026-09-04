import Button2 from "./ui/Button2";

export default function RenaissanceJoinUs({
  title = "Register with us",
  description =
    "If you are a content creator/journalist or influencer register with us now to get all the latest news from our clients!",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-[1680px] px-5 pb-10 pt-12 sm:px-8 md:pb-12 md:pt-[4.25rem] lg:px-12">
      <h2 className="renaissance-display text-[clamp(2.7rem,3.5vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.025em] text-renaissance-ink">
        {title}
      </h2>
      <div className="mt-5 flex flex-col items-start">
        <p className="max-w-[44rem] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] text-renaissance-ink/75">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["Content creators", "/contact"],
            ["Media", "/contact"],
          ].map(([label, href]) => (
            <Button2
              key={label}
              href={href}
              text={label}
              variant="violet"
              className="min-w-[12.5rem]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
