import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PeopleStep from "../apps/flzr-web/components/pagebuilder/ShowtimeGallerySteps/pg-PeopleStep";

Object.assign(globalThis, { React });

test("renders every person assigned to the FLZR gallery", () => {
  const teamMembers = Array.from({ length: 23 }, (_, index) => ({
    _id: `person-${index + 1}`,
    name: `Person ${index + 1}`,
    image: { secure_url: `/people/person-${index + 1}.jpg` },
    ...(index === 0
      ? {
          video: { secure_url: "/video/person-1.mp4", resource_type: "video" },
          email: "person@example.com",
          profileUrl: "https://www.linkedin.com/in/person",
          unit: {
            name: "FLZR",
            logoSignet: { secure_url: "/units/FLZR/flzr_logo.svg" },
          },
        }
      : {}),
    ...(index === 1 ? { email: "   ", profileUrl: "   " } : {}),
  }));

  const html = renderToStaticMarkup(
    <PeopleStep
      step={
        {
          _type: "galleryPeopleStep",
          _key: "people-gallery",
          teamMembers,
        } as never
      }
    />,
  );

  assert.equal(
    html.match(/data-member=/g)?.length,
    teamMembers.length,
    "all assigned people must be present before the one-time reveal begins",
  );
  assert.match(html, /person-1\.jpg/, "the Team gallery must render the person image");
  assert.doesNotMatch(html, /person-1\.mp4/, "the Team gallery must not render person videos");
  assert.doesNotMatch(html, /flzr_logo\.svg/, "the Team gallery must not render unit logos");
  assert.match(html, /mailto:person@example\.com/, "a non-empty email link must be visible");
  assert.match(
    html,
    /https:\/\/www\.linkedin\.com\/in\/person/,
    "a non-empty social profile link must be visible",
  );
  assert.doesNotMatch(html, /mailto:\s/, "empty contact values must not render links");
});
