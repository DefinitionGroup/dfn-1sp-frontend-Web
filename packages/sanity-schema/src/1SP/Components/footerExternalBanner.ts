import { defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

export default defineType({
  name: "footerExternalBanner",
  title: "Footer External Banner",
  type: "object",
  description: "Full-width video, 1SP branding and links to all active units. Uses each unit's logo and CTA; manage these in Units.",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", initialValue: "Proud to be a" }),
    defineField({ name: "logo", title: "Logo", type: "cloudinary.asset", description: "Optional. Defaults to the white and lime 1SP Agency logo." }),
    defineField({ name: "logoAlt", title: "Logo alternative text", type: "string", initialValue: "1SP Agency" }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3, initialValue: "1SP is a powerhouse of specialist agencies ready to accelerate growth at every stage of your customer journey. Our One Shared Passion? Gaming, Technology and Consumer Electronics." }),
    defineField({ name: "video", title: "Background video", type: "cloudinary.asset", validation: (rule) => rule.custom((value) => !value || (value as { resource_type?: string }).resource_type === "video" ? true : "Choose a Cloudinary video.") }),
    defineField({ name: "poster", title: "Background poster", type: "cloudinary.asset", description: "Shown while loading, when motion is reduced, or if the video cannot play. Otherwise derived from the video." }),
    defineField({ name: "cta", title: "Button link", type: "cta", validation: (rule) => rule.custom((value) => validateOptionalCta(value)) }),
    defineField({ name: "copyright", title: "Copyright", type: "string", description: "Optional small line below the unit buttons." }),
  ],
  preview: {
    select: { subtitle: "eyebrow" },
    prepare: ({ subtitle }) => ({ title: "Footer External Banner", subtitle }),
  },
});
