/** Keep every case surface on the same website edition. Empty strings are
 * intentional; only absent values inherit. Custom media replaces both assets. */
export function casePresentationFields(channel = '$channel') {
  const edition = `siteContent[channel == ${channel}][0]`;
  const image = `select(${edition}.mediaMode == "custom" => ${edition}.mainImage, mainImage)`;
  const video = `select(${edition}.mediaMode == "custom" => ${edition}.mainVideo, mainVideo)`;
  return `
    "discovery": coalesce(${edition}.discovery, discovery),
    "title": coalesce(${edition}.title, title),
    "description": select(${edition}.hideDescription == true => "", coalesce(${edition}.description, description)),
    "subtitle": select(${edition}.hideSubtitle == true => "", coalesce(${edition}.subtitle, subtitle)),
    "mainImage": ${image},
    "mainVideo": ${video},
    "isVerticalVideo": select(${edition}.mediaMode == "custom" => coalesce(${edition}.isVerticalVideo, false), isVerticalVideo),
    "mainImageUrl": coalesce((${image}).secure_url, (${image}).url, (${image}).asset->url),
    "mainVideoUrl": coalesce((${video}).secure_url, (${video}).url, (${video}).asset->url),
    "seo": {
      "title": coalesce(${edition}.seo.title, ${edition}.title, seo.title, title),
      "description": coalesce(${edition}.seo.description, select(${edition}.hideDescription == true => "", coalesce(${edition}.description, seo.description, description)))
    }
  `;
}

export const CASE_BODY_PROJECTION = `
  "casesPageBuilder": select(siteContent[channel == $channel][0].bodyMode == "custom" => coalesce(siteContent[channel == $channel][0].casesPageBuilder, []), casesPageBuilder)[]{
    ...,
    services[]->{_id, name},
    ctaButton{..., link{..., page->{slug}}}
  }
`;
