import { defineQuery } from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{
  ...,
  content[]{
    ...,
    _type == 'showtimeGallery' => {
      ...,
      steps[]{
        ...,
        _type == 'galleryPeopleStep' => {
          ...,
          teamMembers[]->{
            _id,
            name,
            image,
            video,
            altText,
            fullname,
            position,
            email,
            profileUrl,
            tagline,
            channel
          }
        }
      }
    }
  }
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == "home" && channel == $channel && language == $language][0]{
  ...,
  content1sp[]{
    ...,
    _type == 'showtimeGallery' => {
      ...,
      steps[]{
        ...,
        _type == 'galleryPeopleStep' => {
          ...,
          teamMembers[]->{
            _id,
            name,
            image,
            video,
            altText,
            fullname,
            position,
            email,
            profileUrl,
            tagline,
            channel
          }
        }
      }
    }
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
  services[]->{
    _id,
    name
  },
  mainImage,
  mainVideo,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  client->{
    _id,
    name,
    logo,
    "logoUrl": logo.secure_url
  },
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
  services[]->{
    _id,
    name
  },
  mainImage,
  mainVideo,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  websiteUrl,
  websiteUrlText,
  mediaGallery[]{
    mediaType,
    "imageUrl": image.secure_url,
    "videoUrl": video.asset->url,
    alt,
    caption
  },
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
    logo,
    "logoUrl": logo.secure_url
  },
  challenges,
  solution,
  approachToSolution,
  metrics[]{
    label,
    value
  },
  publishedAt
}
`);

export const HAS_CASE_STUDIES_QUERY = defineQuery(`
count(*[_type == "caseStudy" && channel match $channel && language == $language && isPublished == true]) > 0
`);

export const SERVICES_QUERY = defineQuery(`
*[_type == "services" && language == $language] | order(name asc){
  _id,
  name,
  taglabel,
  "iconUrl": serviceicon.asset.secure_url,
  serviceicon,
  servicegrouprel[]->{
    _id,
    name,
    taglabel
  },
  unitsrel[]->{
    _id,
    name,
    slug
  }
}
`);

export const HAS_SERVICES_QUERY = defineQuery(`
count(*[_type == "services" && language == $language]) > 0
`);
