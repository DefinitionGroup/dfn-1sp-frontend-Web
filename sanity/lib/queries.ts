import { defineQuery } from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{
  ...,
  content1sp[]{
    ...,
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    _type == 'showtimeGallery' => {
      ...,
      steps[]{
        ...,
        ctaMini{
          _type,
          heading,
          paragraph,
          buttonText,
          variant,
          alignment,
          link{
            _type,
            linkType,
            externalUrl,
            page->{
              _id,
              slug
            }
          }
        },
        _type == 'galleryPeopleStep' => {
          ...,
          showBadgeMiniCta,
          badgeMiniCta{
            _type,
            heading,
            paragraph,
            buttonText,
            variant,
            alignment,
            link{
              _type,
              linkType,
              externalUrl,
              page->{
                _id,
                slug
              }
            }
          },
          teamMembers[]->{
            _id,
            name,
            image{
              ...,
              secure_url,
              resource_type,
              public_id
            },
            video{
              ...,
              secure_url,
              resource_type,
              public_id
            },
            altText,
            fullname,
            position,
            email,
            profileUrl,
            tagline,
            channel,
            unit->{
              _id,
              name,
              logoSignet
            }
          }
        },
        _type == 'galleryScrollHighlightStep' => {
          ...,
          scrollHighlightContent{
            ...,
            contentType,
            textItems,
            serviceItems[]->{
              _id,
              _type,
              name,
              taglabel,
              introText,
              serviceBackground
            }
          }
        },
        _type == 'galleryListStep' => {
          ...,
          showBadgeMiniCta,
          badgeMiniCta{
            _type,
            heading,
            paragraph,
            buttonText,
            variant,
            alignment,
            link{
              _type,
              linkType,
              externalUrl,
              page->{
                _id,
                slug
              }
            }
          },
          additionalContent[]{
            ...,
            _type == 'unitCards' => {
              ...,
              units[]->{
                _id,
                _type,
                name,
                slug,
                logo,
                backgroundImage,
                description,
                tagline,
                cta
              }
            }
          }
        }
      }
    },
    _type == 'galleryPeopleStep' => {
      ...,
      showBadgeMiniCta,
      badgeMiniCta{
        _type,
        heading,
        paragraph,
        buttonText,
        variant,
        alignment,
        link{
          _type,
          linkType,
          externalUrl,
          page->{
            _id,
            slug
          }
        }
      },
      teamMembers[]->{
        _id,
        name,
        image{
          ...,
          secure_url,
          resource_type,
          public_id
        },
        video{
          ...,
          secure_url,
          resource_type,
          public_id
        },
        altText,
        fullname,
        position,
        email,
        profileUrl,
        tagline,
        channel,
        unit->{
          _id,
          name,
          logoSignet
        }
      }
    },
    _type == 'galleryScrollHighlightStep' => {
      ...,
      scrollHighlightContent{
        ...,
        contentType,
        textItems,
        serviceItems[]->{
          _id,
          _type,
          name,
          taglabel,
          introText,
          serviceBackground
        }
      }
    },
    _type == 'galleryListStep' => {
      ...,
      showBadgeMiniCta,
      badgeMiniCta{
        _type,
        heading,
        paragraph,
        buttonText,
        variant,
        alignment,
        link{
          _type,
          linkType,
          externalUrl,
          page->{
            _id,
            slug
          }
        }
      },
      additionalContent[]{
        ...,
        _type == 'unitCards' => {
          ...,
          units[]->{
            _id,
            _type,
            name,
            slug,
            logo,
            backgroundImage,
            description,
            tagline,
            cta
          }
        }
      }
    },
    _type == 'smartCarousel' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        subtitle,
        description,
        services[]->{_id, name},
        mainImage,
        mainVideo,
        client->{
          _id,
          name,
          logo
        },
        slug
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'unitLogoGrid' => {
      ...,
      selectedUnits[]->{
        _id,
        _type,
        name,
        slug,
        logo,
        logoColor,
        logoSignet,
        cta{
          ...,
          link{
            ...,
            linkType,
            externalUrl,
            page->{
              _id,
              slug
            }
          }
        }
      }
    }
  }
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]{
  ...,
  content1sp[]{
    ...,
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    _type == 'showtimeGallery' => {
      ...,
      steps[]{
        ...,
        ctaMini{
          _type,
          heading,
          paragraph,
          buttonText,
          variant,
          alignment,
          link{
            _type,
            linkType,
            externalUrl,
            page->{
              _id,
              slug
            }
          }
        },
        _type == 'galleryPeopleStep' => {
          ...,
          teamMembers[]->{
            _id,
            name,
            image{
              ...,
              secure_url,
              resource_type,
              public_id
            },
            video{
              ...,
              secure_url,
              resource_type,
              public_id
            },
            altText,
            fullname,
            position,
            email,
            profileUrl,
            tagline,
            channel,
            unit->{
              _id,
              name,
              logoSignet
            }
          }
        },
        _type == 'galleryScrollHighlightStep' => {
          ...,
          scrollHighlightContent{
            ...,
            contentType,
            textItems,
            serviceItems[]->{
              _id,
              _type,
              name,
              taglabel,
              introText,
              serviceBackground
            }
          }
        },
        _type == 'galleryListStep' => {
          ...,
          additionalContent[]{
            ...,
            _type == 'unitCards' => {
              ...,
              units[]->{
                _id,
                _type,
                name,
                slug,
                logo,
                backgroundImage,
                description,
                tagline,
                cta
              }
            }
          }
        }
      }
    },
    _type == 'galleryPeopleStep' => {
      ...,
      teamMembers[]->{
        _id,
        name,
        image{
          ...,
          secure_url,
          resource_type,
          public_id
        },
        video{
          ...,
          secure_url,
          resource_type,
          public_id
        },
        altText,
        fullname,
        position,
        email,
        profileUrl,
        tagline,
        channel,
        unit->{
          _id,
          name,
          logoSignet
        }
      }
    },
    _type == 'galleryScrollHighlightStep' => {
      ...,
      scrollHighlightContent{
        ...,
        contentType,
        textItems,
        serviceItems[]->{
          _id,
          _type,
          name,
          taglabel,
          introText,
          serviceBackground
        }
      }
    },
    _type == 'galleryListStep' => {
      ...,
      additionalContent[]{
        ...,
        _type == 'unitCards' => {
          ...,
          units[]->{
            _id,
            _type,
            name,
            slug,
            logo,
            backgroundImage,
            description,
            tagline,
            cta
          }
        }
      }
    },
    _type == 'smartCarousel' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        subtitle,
        description,
        services[]->{_id, name},
        mainImage,
        mainVideo,
        client->{
          _id,
          name,
          logo
        },
        slug
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'unitLogoGrid' => {
      ...,
      selectedUnits[]->{
        _id,
        _type,
        name,
        slug,
        logo,
        logoColor,
        logoSignet,
        cta{
          ...,
          link{
            ...,
            linkType,
            externalUrl,
            page->{
              _id,
              slug
            }
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
  imageCloud,
  addressTitle,
  locations[]{
    _key,
    name,
    address
  },
  footerColumns[]{
    _key,
    title,
    links[]{
      _key,
      linkType,
      isCaseLink,
      "slug": page->slug.current,
      "case": case->{ "slug": slug },
      externalUrl,
      displayName
    }
  },
  socialLinks[]{
    _key,
    icon,
    name,
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
    name,
    taglabel
  },
  mainImage,
  isVerticalVideo,
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

// Query for fetching specific case studies by IDs (for manual selection mode)
export const CASE_STUDIES_BY_IDS_QUERY = defineQuery(`
*[_type == "caseStudy" && _id in $ids && isPublished == true]{
  _id,
  title,
  subtitle,
  slug,
  description,
  services[]->{
    _id,
    name,
    taglabel
  },
  mainImage,
  isVerticalVideo,
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
  isVerticalVideo,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  websiteUrl,
  websiteUrlText,
  units[]->{
    _id,
    name,
    slug,
    tagline,
    logo,
    logoColor,
    logoSignet,
    "logoUrl": logo.secure_url,
    backgroundImage,
    cta
  },
  people[]{
    isPrimary,
    person->{
      _id,
      name,
      fullname,
      altText,
      position,
      email,
      profileUrl,
      image,
      video,
      unit->{
        _id,
        name,
        logoSignet
      }
    }
  },
  client->{
    _id,
    name,
    slug,
    "logoUrl": logo.secure_url
  },
  casesPageBuilder[]{
    _type,
    _key,
    title,
    headline,
    description,
    navPointName,
    hideFromNav,
    showGridBackground,
    paddingY,
    badgeText,
    badgeSubtitle,
    badgeNumber,
    contentType,
    showContent,
    challengeDescription,
    challengeTitle,
    challenges,
    services[]->{_id, name},
    showCta,
    ctaHeading,
    ctaParagraph,
    showButton,
    ctaButton{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    showSolution,
    solutionHeadline,
    solution,
    backgroundColor,
    mainHeadline,
    subHeadline,
    approachDetails,
    mediaType,
    backgroundImage,
    backgroundVideo,
    enableParallax,
    backgroundOpacity,
    metrics[]{
      type,
      label,
      value,
      suffix
    }
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
  serviceBackground,
  serviceDescription,
  servicegrouprel[]->{
    _id,
    name,
    taglabel
  },
  unitsrel[]->{
    _id,
    name,
    slug,
    tagline,
    "logoUrl": logo.secure_url,
    backgroundImage,
    cta
  }
}
`);

export const HAS_SERVICES_QUERY = defineQuery(`
count(*[_type == "services" && language == $language]) > 0
`);

export const SMART_PEOPLE_QUERY = defineQuery(`
*[
  _type == "person" && 
  smartPeoplePromo1SP == true &&
  $channel in channel
] | order(_createdAt desc) [0...$maxItems] {
  _id,
  name,
  slug,
  image,
  video,
  altText,
  fullname,
  position,
  email,
  profileUrl,
  tagline,
  channel,
  language,
  smartPeoplePromo1SP,
  unit->{
    _id,
    name,
    logoSignet
  }
}
`);

export const SMART_UNITS_QUERY = defineQuery(`
*[
  _type == "unit" && 
  isActive == true &&
  language == $language &&
  slug.current != "1sp" &&
  !(lower(name) match "*1sp*")
] | order(_createdAt desc) [0...$maxItems] {
  _id,
  _type,
  name,
  slug,
  logo,
  backgroundImage,
  description,
  tagline,
  cta,
  _createdAt
}
`);

export const SMART_UNITS_GLOBE_QUERY = defineQuery(`
*[
  _type == "unit" && 
  isActive == true &&
  language == $language &&
  (showOnGlobe == true || !defined(showOnGlobe)) &&
  defined(coordinateLat) &&
  defined(coordinateLon)
] | order(_createdAt desc) {
  _id,
  _type,
  name,
  slug,
  coordinateLat,
  coordinateLon,
  tagline,
  logo,
  showOnGlobe
}
`);

// Helper function to generate interactive carousel query with dynamic field
export const getInteractiveCarouselQuery = (carouselField: string) => `
*[
  _type == "caseStudy" && 
  ${carouselField} == true &&
  isPublished == true &&
  language == $language
] | order(publishedAt desc) [0...$maxItems] {
  _id,
  title,
  subtitle,
  description,
  services[]->{ _id, name },
  mainImage,
  mainVideo,
  client->{ _id, name, logo },
  slug
}
`;

export const UNIT_LOGO_GRID_QUERY = defineQuery(`
*[
  _type == "unit" && 
  isActive == true &&
  language == $language &&
  defined(cta.link)
] | order(name asc) [0...$maxItems] {
  _id,
  _type,
  name,
  slug,
  logo,
  logoColor,
  logoSignet,
  cta{
    ...,
    link{
      ...,
      linkType,
      externalUrl,
      page->{
        _id,
        slug
      }
    }
  }
}
`);
