import { defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

export default defineType({
  name: "footerExternalBanner",
  title: "Footer External Banner",
  type: "object",
  description: "Full-width video, 1SP branding and links to all active units. Uses each unit's logo and CTA; manage these in Units.",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", hidden: true, description: "No longer displayed." }),
    defineField({ name: "logo", title: "Logo", type: "cloudinary.asset", description: "Optional. Defaults to the white and lime 1SP Agency logo." }),
    defineField({ name: "logoAlt", title: "Logo alternative text", type: "string", initialValue: "1SP Agency" }),
    defineField({ name: "headline", title: "Text block 1", type: "text", rows: 3, description: "First paragraph, right of the logo. Same size as text block 2.", initialValue: "Being part of the 1SP Agency family enables us to plug you into a powerhouse of like-minded specialist agencies." }),
    defineField({ name: "text", title: "Text block 2", type: "text", rows: 3, description: "Second paragraph, below text block 1.", initialValue: "Built to accelerate growth at every stage of your customer journey, the One Shared Passion that glues us together is Gaming, Technology and Consumer Electronics." }),
    defineField({ name: "video", title: "Background video", type: "cloudinary.asset", validation: (rule) => rule.custom((value) => !value || (value as { resource_type?: string }).resource_type === "video" ? true : "Choose a Cloudinary video.") }),
    defineField({ name: "poster", title: "Background poster", type: "cloudinary.asset", description: "Shown while loading, when motion is reduced, or if the video cannot play. Otherwise derived from the video." }),
    defineField({ name: "cta", title: "Button link", type: "cta", validation: (rule) => rule.custom((value) => validateOptionalCta(value)) }),
    defineField({ name: "copyright", title: "Copyright", type: "string", description: "Optional small line below the button." }),
  ],
  preview: {
    select: { subtitle: "headline" },
    prepare: ({ subtitle }) => ({ title: "Footer External Banner", subtitle }),
  },
});
