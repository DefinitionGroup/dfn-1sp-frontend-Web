import { preload } from "react-dom";
import Hero from "@studioco2/components/Hero";
import Specimen from "@studioco2/components/Specimen";
import WorkSection from "@studioco2/components/WorkSection";
import { homepageFallback } from "@studioco2/data/homepageFallback";

export default function HomePage() {
  const { hero, intro, work } = homepageFallback;
  preload(hero.video.poster, { as: "image", fetchPriority: "high" });

  return (
    <>
      <a href="#work" className="skip-link">Skip to work</a>
      <main className="w-full max-w-full overflow-x-clip">
        <Hero content={hero} />
        <Specimen content={intro} />
        <WorkSection content={work} />
      </main>
    </>
  );
}
