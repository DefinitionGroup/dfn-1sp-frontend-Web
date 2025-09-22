import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import HamburgerGradientMenu from "@/components/HamburgerGradientMenu";
import HeaderImageVideoComp from "@/components/HeaderImageVideoComp";
import FrontNavOverlay from "@/components/FrontNavOverlay2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import TypewriterChangeContentExample from "@/components/TyperwriterHeadline";

export default async function Home({ params }: { params: { locale: string } }) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = params.locale || "en";

  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { channel, language },
  });
  //console.log("Home page data:", page);
  return (
    <main className="pt-20 md:pt-24 lg:pt-28 min-h-screen">
      <section className="relative h-[85vh] overflow-hidden">
        <HamburgerGradientMenu />

        {/* Background Image with Overlay */}
        <HeaderImageVideoComp
          useVideo={true}
          videoSrc="/video/cases/1SP Agency - 1SP Homepage-07.mp4"
          enableParallax={true}
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}

        <div className="relative z-10 container  mt-[30vh]  mx-auto ">
          <StaggeredSlideUp className="space-y-6 max-w-full ">
            <h1 className="text-neutral-50 uppercase pb-2 text-xs border-b font-bold  max-w-1/2">
              Welcome at 1SP
            </h1>
            <TypewriterChangeContentExample />

            <p className="text-neutral-50 text-lg  max-w-1/3">
              We are group of several laser focused agencies. Each one with a
              distinctive competetive edge.
            </p>
            <p className="text-neutral-50 text-lg">
              Together we are{" "}
              <span className="bg-gradient-to-r font-bold from-lime-300 to-lime-500 bg-clip-text text-transparent">
                one Superagency.
              </span>
            </p>
          </StaggeredSlideUp>
        </div>
        {/* Vertical Lines */}
        {/* <div className="absolute top-0 left-[1321px] w-px h-full bg-neutral-50/50" />
              <div className="absolute top-0 left-[1033px] w-px h-full bg-neutral-50/50" /> */}
        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xs font-medium  -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>
      {Array.isArray(page?.content1sp) ? (
        <PageBuilder content={page.content1sp} />
      ) : (
        "No content available"
      )}
    </main>
  );
}
