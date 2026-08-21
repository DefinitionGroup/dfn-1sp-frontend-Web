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
    image: { secure_url: "/ci/flzr-logo.svg" },
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
});
