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
