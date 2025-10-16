import { defineQuery } from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{
  ...,
  content[]{
    ...
  }
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == "home" && channel == $channel && language == $language][0]{
  ...,
  content1sp[]{
    ...
  }
}`);

export const NAVBAR_QUERY = defineQuery(`
*[_type == "menu" && menuType == "Navbar" && channel == $channel && language == $language][0]{
  _id,
  title,
  menuType,
  imageCloud,
  "logoUrl": imageCloud.secure_url,
  menuItems[]{
    _key,
    "slug": page->slug.current,
    "title": page->title,
    displayName
  }
}
`);

export const FOOTER_QUERY = defineQuery(`
*[_type == "menu" && menuType == "Footer" && channel == $channel && language == $language][0]{
  _id,
  title,
  menuType,
  imageCloud,
  "logoUrl": imageCloud.secure_url,
  footerColumns[]{
    _key,
    title,
    links[]{
      _key,
      linkType,
      "slug": page->slug.current,
      "pageTitle": page->title,
      externalUrl,
      displayName
    }
  },
  socialLinks[]{
    _key,
    platform,
    url
  },
  copyright
}
`);

export const CASE_STUDIES_QUERY = defineQuery(`
*[_type == "caseStudy" && channel match $channel && language == $language && isPublished == true] | order(publishedAt desc){
  _id,
  title,
  subtitle,
  slug,
  description,
  category,
  mainImage,
  mainVideo,
  logoImage,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  "logoImageUrl": logoImage.secure_url,
  websiteUrl,
  websiteUrlText,
  publishedAt
}
`);

export const CASE_STUDY_BY_SLUG_QUERY = defineQuery(`
*[_type == "caseStudy" && slug.current == $slug && channel match $channel && language == $language && isPublished == true][0]{
  _id,
  title,
  subtitle,
  slug,
  description,
  category,
  mainImage,
  mainVideo,
  logoImage,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  "logoImageUrl": logoImage.secure_url,
  websiteUrl,
  websiteUrlText,
  imageGallery[]{
    "imageUrl": image.secure_url,
    alt,
    caption
  },
  units[]->{
    _id,
    name,
    slug,
    tagline,
    "logoUrl": logo.secure_url
  },
  client->{
    _id,
    name,
    slug,
    "logoUrl": logo.secure_url
  },
  publishedAt
}
`);
