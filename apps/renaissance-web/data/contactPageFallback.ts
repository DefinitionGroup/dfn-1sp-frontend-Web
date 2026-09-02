import type { PageBuilderBlock } from "@1sp/sanity-types";

export const RENAISSANCE_CONTACT_TITLE = "Contact Renaissance";
export const RENAISSANCE_CONTACT_DESCRIPTION =
  "Tell Renaissance about your game, campaign or partnership opportunity.";

export const RENAISSANCE_CONTACT_CONTENT: PageBuilderBlock[] = [
  {
    _key: "renaissance-contact-section",
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole: "contact",
    badgeLabel: "CONTACT",
  },
  {
    _key: "renaissance-contact-intro",
    _type: "introBlockTypoSophisticated",
    hideFromNav: true,
    header: {
      mainHeadline: "Let’s make your game impossible to ignore.",
    },
    description:
      "Tell us what you’re building, where you want it to go and what success looks like. We’ll come back with the right people and a clear next step.",
  },
];

export const RENAISSANCE_CONTACT_FALLBACK = {
  _id: "fallback-renaissance-contact-en",
  _type: "page",
  title: RENAISSANCE_CONTACT_TITLE,
  slug: { _type: "slug", current: "contact" },
  language: "en",
  channel: "renaissanceWeb",
  navbarVariant: "light" as const,
  content: RENAISSANCE_CONTACT_CONTENT,
  metadata: {
    title: `${RENAISSANCE_CONTACT_TITLE} | Games PR and communications`,
    description: RENAISSANCE_CONTACT_DESCRIPTION,
  },
  contactForm: {
    headline: "Start a conversation",
    subheadline: "A few details are enough to get us moving.",
    submitLabel: "Send enquiry",
    successMessage:
      "Thank you. The Renaissance team has received your message and will be in touch.",
  },
};
