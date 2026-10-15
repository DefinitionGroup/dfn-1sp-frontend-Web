import type { PageBuilderBlock } from "@1sp/sanity-types";

export const RENAISSANCE_CONTACT_TITLE = "Contact Renaissance";
export const RENAISSANCE_CONTACT_DESCRIPTION = "Tell us about your game and timeline below, and a member of the team will get back to you within two business days.";
export const RENAISSANCE_CONTACT_CONTENT = [
  {
    "_key": "rpr-v4-contact-intro",
    "_type": "introBlockTypoSophisticated",
    "description": "Tell us about your game and timeline below, and a member of the team will get back to you within two business days.",
    "header": {
      "_type": "peopleStepHeader",
      "mainHeadline": "Let's talk about your launch"
    },
    "renaissanceHeadingTag": "h1",
    "renaissanceLayout": "compact"
  },
  {
    "_key": "rpr-v4-33",
    "_type": "contentSection",
    "columnSpan": "10",
    "content": [
      {
        "_key": "rpr-v4-33-text",
        "_type": "block",
        "children": [
          {
            "_key": "rpr-v4-33-text-span",
            "_type": "span",
            "marks": [],
            "text": "Email: hello@renaissancepr.biz (or contact Stefano Petrullo, Founder, directly at stefano@renaissancepr.biz)"
          }
        ],
        "markDefs": [],
        "style": "normal"
      }
    ],
    "paddingY": "16",
    "title": "Contact details"
  },
  {
    "_key": "rpr-v4-registration",
    "_type": "contentSection",
    "anchorId": "registration",
    "columnSpan": "10",
    "content": [
      {
        "_key": "rpr-v4-35",
        "_type": "block",
        "children": [
          {
            "_key": "rpr-v4-35-span",
            "_type": "span",
            "marks": [],
            "text": "If you're a content creator, register to get early access and review codes for our clients' upcoming titles."
          }
        ],
        "markDefs": [],
        "style": "normal"
      },
      {
        "_key": "rpr-v4-creator-link",
        "_type": "block",
        "children": [
          {
            "_key": "link",
            "_type": "span",
            "marks": [
              "form"
            ],
            "text": "Register as a content creator"
          }
        ],
        "markDefs": [
          {
            "_key": "form",
            "_type": "link",
            "blank": true,
            "href": "https://docs.google.com/forms/d/e/1FAIpQLSeTYxiTE9QcSjzJSIwRh4ogDn8_nizkJidg7nG2YX0muhWbXg/viewform"
          }
        ],
        "style": "normal"
      },
      {
        "_key": "rpr-v4-36",
        "_type": "block",
        "children": [
          {
            "_key": "rpr-v4-36-span",
            "_type": "span",
            "marks": [],
            "text": "If you're a journalist, editor, or freelance writer, register to get news and review copies from our clients as soon as they're available."
          }
        ],
        "markDefs": [],
        "style": "normal"
      },
      {
        "_key": "rpr-v4-media-link",
        "_type": "block",
        "children": [
          {
            "_key": "link",
            "_type": "span",
            "marks": [
              "form"
            ],
            "text": "Register as media"
          }
        ],
        "markDefs": [
          {
            "_key": "form",
            "_type": "link",
            "blank": true,
            "href": "https://docs.google.com/forms/d/e/1FAIpQLSfNc4X0LMWBvxsrE-8yP7EIjNWtFONsZ0PKwo1qdm0FN689mg/viewform"
          }
        ],
        "style": "normal"
      }
    ],
    "paddingY": "16",
    "title": "Get early access and review codes for our clients' games"
  }
] as unknown as PageBuilderBlock[];
export const RENAISSANCE_CONTACT_FALLBACK = {
_id: "fallback-renaissance-contact-en", _type: "page", title: RENAISSANCE_CONTACT_TITLE, slug: {current: "contact"}, language:"en", channel:"renaissanceWeb", navbarVariant:"light" as const, content: RENAISSANCE_CONTACT_CONTENT, metadata: {title:RENAISSANCE_CONTACT_TITLE,description:RENAISSANCE_CONTACT_DESCRIPTION}, contactForm: {"_type":"contactForm","description":"","headline":"Tell us about your game","subheadline":"","submitLabel":"Open email app","successMessage":"Thank you. The Renaissance team has received your message and will be in touch."}
};
