import type { PageBuilderBlock } from "@1sp/sanity-types";

export const RENAISSANCE_HOME_TITLE =
  "Renaissance | Great communications for the games industry";

export const RENAISSANCE_HOME_DESCRIPTION =
  "Award-winning PR and communications for indie titles, AAA blockbusters and everything in between.";

const media = (secureUrl: string) => ({ secure_url: secureUrl });

const portableText = (
  key: string,
  text: string,
  style: "normal" | "h2" | "h3" = "normal",
) => ({
  _key: key,
  _type: "block",
  style,
  markDefs: [],
  children: [
    {
      _key: `${key}-span`,
      _type: "span",
      marks: [],
      text,
    },
  ],
});

/**
 * Production-quality content fallback for the Renaissance homepage.
 *
 * Sanity remains authoritative: the route uses this composition only while
 * the renaissanceWeb/en homepage has no published content. Every `_type`
 * below already exists in RenaissancePageBuilder; this file introduces no
 * new page-builder component or content contract.
 */
export const RENAISSANCE_HOMEPAGE_FALLBACK: PageBuilderBlock[] = [
  {
    _key: "renaissance-home-hero",
    _type: "heroShowTime",
    heading: "GAME CHANGERS.\nHEADLINE *MAKERS.*\nREPUTATIONS MADE HERE.",
    headingTag: "h1",
    subheading: "Where games find their audience.",
    paragraphs: [RENAISSANCE_HOME_DESCRIPTION],
    useVideo: true,
    backgroundVideo: media(
      "https://res.cloudinary.com/dsu07dnes/video/upload/v1787312298/1SP_RENAISSANCE_EDIT_0826_02_da4squ.mp4",
    ),
    backgroundImage: media("/units/RENAISSANCE/renaissance_cover-image.jpg"),
    fullWidth: true,
    navPointName: "Home",
    additionalContent: [
      {
        _key: "hero-contact",
        _type: "cta",
        text: "Start a conversation",
        variant: "violet",
        link: {
          linkType: "external",
          externalUrl: "/contact",
        },
      },
      {
        _key: "hero-stories",
        _type: "cta",
        text: "See our stories",
        variant: "glass",
        link: {
          linkType: "external",
          externalUrl: "#stories",
        },
      },
    ],
  },
  {
    _key: "renaissance-stories-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "stories",
    badgeLabel: "STORIES",
  },
  {
    _key: "renaissance-stories-intro",
    _type: "introBlockTypoSophisticated",
    navPointName: "Stories",
    header: {
      mainHeadline: "Great games deserve more than noise.",
    },
    description:
      "Renaissance builds smart, creative campaigns that connect a title with the media, creators and players who matter most.",
  },
  {
    _key: "renaissance-stories",
    _type: "carousel",
    navPointName: "Stories",
    items: [
      {
        _key: "romeo-is-a-dead-man",
        id: "romeo-is-a-dead-man",
        title: "Romeo Is A Dead Man.",
        subtitle: "Global launch campaign · 2025",
        description:
          "Editorial coverage, creator partnerships and high-impact media moments for Grasshopper Manufacture's newest IP.",
        image: media("/renaissance/romeo-is-a-dead-man.jpg"),
      },
      {
        _key: "yooka-re-playlee",
        id: "yooka-re-playlee",
        title: "Yooka-Re-Playlee.",
        subtitle: "Launch campaign",
        description:
          "Media impact, creator activity and overall reach brought together in one coordinated release programme.",
        image: media("/renaissance/yooka-re-playlee.png"),
      },
    ],
  },
  {
    _key: "renaissance-services-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "services",
    badgeLabel: "SERVICES",
  },
  {
    _key: "renaissance-services-intro",
    _type: "introBlockTypoSophisticated",
    navPointName: "Services",
    header: {
      mainHeadline: "Six services. One mission.",
    },
    description:
      "Every brief is scoped from one integrated communication plan, shaped around the game, its audience and the moment it needs to own.",
  },
  {
    _key: "renaissance-services",
    _type: "cardContainerComponent",
    columns: 3,
    cards: [
      {
        _key: "traditional-pr",
        headline: "Traditional PR",
        text: "Launches, reviews, previews, demos and editorial planning across gaming and consumer media.",
      },
      {
        _key: "content-creators",
        headline: "Content Creators",
        text: "Organic, curated outreach across YouTube, Twitch and TikTok, with ambassador programmes built for retention.",
      },
      {
        _key: "corporate-comms",
        headline: "Corporate Comms",
        text: "Founder profiling, business press, awards, investor narratives and issues management.",
      },
      {
        _key: "events-trade-shows",
        headline: "Events & Trade Shows",
        text: "Planning, press tours and on-the-ground delivery at the industry's defining global moments.",
      },
      {
        _key: "paid-amplification",
        headline: "Paid Amplification",
        text: "Targeted paid layers that extend earned wins without replacing organic reach.",
      },
      {
        _key: "measurement-ai",
        headline: "Measurement & AI",
        text: "Real-time dashboards, weekly snapshots and AI-assisted analysis of sentiment and reach, always signed off by people.",
      },
    ],
  },
  {
    _key: "renaissance-client-logos",
    _type: "clientLogoCarousel",
    headline: "You’re in great company.",
    selectionMode: "manual",
    speed: "slow",
    grayscale: true,
    hideFromNav: true,
    selectedClients: [
      { _id: "ubisoft", name: "Ubisoft", logo: media("/logos/Ubisoft_logo.svg") },
      { _id: "xbox", name: "Xbox", logo: media("/logos/Xbox_2020_horz_Black.svg") },
      { _id: "epic-games", name: "Epic Games", logo: media("/logos/Epic_Games_logo.svg") },
      { _id: "warner-bros", name: "Warner Bros.", logo: media("/logos/Logo_Warner_Bros.svg") },
      { _id: "riot-games", name: "Riot Games", logo: media("/logos/Riot_Games_logo.svg") },
    ],
  },
  {
    _key: "renaissance-people-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "people",
    badgeLabel: "PEOPLE POWERED",
  },
  {
    _key: "renaissance-people-intro",
    _type: "introBlockTypoSophisticated",
    navPointName: "People",
    header: {
      mainHeadline: "We work with people, not brands.",
    },
    description:
      "Every plan starts with the human story inside the game: the developer's ambition, the audience's expectation and the cultural moment we can plug into.",
  },
  {
    _key: "renaissance-origins-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "origins",
    badgeLabel: "ORIGINS",
  },
  {
    _key: "renaissance-origin",
    _type: "twoColContentSection",
    navPointName: "Origins",
    title: "21 years in the making",
    showTitle: true,
    titleColor: "neutral-700",
    contentSize: "lg",
    paddingY: "24",
    backgroundColor: "neutral-100",
    image: media("/renaissance/stefano-petrullo.jpg"),
    mediaAlt: "Stefano Petrullo, Founder and CEO of Renaissance",
    content: [portableText(
      "origin-body",
      "Since our inception in 2015 we’ve been fortunate to work with a wide array of different clients, from Indie to AAA we can service your needs.",
    )],
  },
  {
    _key: "renaissance-reach-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "reach",
    badgeLabel: "REACH",
  },
  {
    _key: "renaissance-global-reach",
    _type: "globeComponent",
    navPointName: "Global reach",
    sectionTitle: "Global reach. Local intelligence.",
    sectionSubtitle:
      "Campaigns across three continents, connecting the United Kingdom, Los Angeles and China through one senior team.",
    locations: [
      {
        _key: "warwick",
        name: "United Kingdom",
        coordinateLat: 52.2823,
        coordinateLon: -1.5849,
      },
      {
        _key: "los-angeles",
        name: "Los Angeles",
        coordinateLat: 34.0522,
        coordinateLon: -118.2437,
      },
      {
        _key: "china",
        name: "China",
        coordinateLat: 35.8617,
        coordinateLon: 104.1954,
      },
    ],
  },
  {
    _key: "renaissance-join-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "joinUs",
    badgeLabel: "JOIN US",
  },
  {
    _key: "renaissance-join-intro",
    _type: "introBlockTypoSophisticated",
    hideFromNav: true,
    header: { mainHeadline: "Register with us" },
  },
  {
    _key: "renaissance-join-subline",
    _type: "sublineComponent",
    description:
      "If you are a content creator/journalist or influencer register with us now to get all the latest news from our clients!",
    additionalContent: [
      {
        _key: "join-content-creators",
        _type: "cta",
        text: "Content creators",
        variant: "black",
        link: { linkType: "external", externalUrl: "/contact" },
      },
      {
        _key: "join-media",
        _type: "cta",
        text: "Media",
        variant: "black",
        link: { linkType: "external", externalUrl: "/contact" },
      },
    ],
  },
  {
    _key: "renaissance-sections-end",
    _type: "renaissanceSectionBand",
    mode: "reset",
  },
];
