import { defineQuery } from "next-sanity";

const MINIMAL_CLOUDINARY_ASSET_PROJECTION = `{
  secure_url,
  url,
  width,
  height,
  public_id
}`;

const ADDITIONAL_CONTENT_PROJECTION = `additionalContent[]{
  ...,
  _type == 'cta' => {
    ...,
    link{
      ...,
      page->{
        _id,
        slug
      }
    }
  },
  _type == 'ctaMiniComponent' => {
    ...,
    link{
      ...,
      page->{
        _id,
        slug
      }
    }
  },
  _type == 'ctaSplitHeader' => {
    ...,
    cta{
      ...,
      link{
        ...,
        page->{
          _id,
          slug
        }
      }
    }
  },
  _type == 'unitCards' => {
    ...,
    units[]->{
      _id,
      _type,
      name,
      slug,
      logo,
      logoColor,
      backgroundImage,
      description,
      tagline,
      cta
    }
  }
}`;

/**
 * Resolve reusable 1SP component groups as part of the page request. Keeping
 * the group payload in the page query avoids client-side waterfalls and lets
 * the host app render the canonical 1SP blocks during SSR.
 *
 * Explicit references inside a reusable 1SP group are authoritative. They are
 * dereferenced without the host page's channel filter so the same canonical
 * group payload renders on 1SP, FLZR, MSM, and future host websites. Ordinary
 * page content outside this projection remains channel-scoped.
 */
export const ONE_SP_COMPONENT_GROUP_PROJECTION = `_type == 'oneSpComponentGroupReference' => {
  ...,
  group->{
    _id,
    _type,
    _rev,
    title,
    language,
    content[]{
      ...,
      cta{
        ...,
        link{
          ...,
          page->{
            _id,
            slug
          }
        }
      },
      ${ADDITIONAL_CONTENT_PROJECTION},
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
        useCTAMini,
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
        scrollHighlightContent{
          ...,
          contentType,
          textItems,
          serviceItems[]->{
            _id,
            _updatedAt,
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
        ${ADDITIONAL_CONTENT_PROJECTION}
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
          logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
          logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
          logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
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
      },
      _type == 'pageBuilderLogoFloat' => {
        ...,
        selectedUnits[]->{
          _id,
          _type,
          name,
          slug,
          logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
          logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
          logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
        }
      }
    }
  }
}`;

// =============================================================================
// Unified content projection
// =============================================================================
// PAGE_QUERY and HOME_PAGE_QUERY read the unified `content` field directly.
// The legacy per-channel fields (`content1sp`, `contentStudioFlizr`,
// `contentMSM`, `contentStudioCO2`) were removed from the schema after the
// unify-page-content migration ran.
// =============================================================================

export const PAGE_QUERY =
  defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{
  ...,
  content[]{
    ...,
    ${ONE_SP_COMPONENT_GROUP_PROJECTION},
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    ${ADDITIONAL_CONTENT_PROJECTION},
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
          teamMembers[$channel in @->channel]->{
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
          useCTAMini,
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
          scrollHighlightContent{
            ...,
            contentType,
            textItems,
            serviceItems[$channel in @->channel]->{
              _id,
              _updatedAt,
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
          ${ADDITIONAL_CONTENT_PROJECTION}
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
      teamMembers[$channel in @->channel]->{
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
      useCTAMini,
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
      scrollHighlightContent{
        ...,
        contentType,
        textItems,
        serviceItems[$channel in @->channel]->{
          _id,
          _updatedAt,
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
      ${ADDITIONAL_CONTENT_PROJECTION}
    },
    _type == 'smartCarousel' => {
      ...,
      selectedCases[$channel in @->channel]->{
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
    _type == 'smartServicesCarousel' => {
      ...,
      selectedServices[$channel in @->channel]->{
        _id,
        name,
        taglabel,
        introText,
        serviceDescription,
        "backgroundAsset": serviceBackground.asset
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[$channel in @->channel]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[$channel in @->channel]->{
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
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
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
    },
    _type == 'pageBuilderLogoFloat' => {
      ...,
      selectedUnits[]->{
        _id,
        _type,
        name,
        slug,
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
      }
    },
    _type == 'clientLogoCarousel' => {
      ...,
      selectedClients[]->{
        _id,
        name,
        slug,
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
      },
      selectionMode == "auto" => {
        "autoClients": *[_type == "client" && $channel in channel && defined(logo)] | order(name asc) {
          _id,
          name,
          slug,
          logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
        }
      }
    }
  }
}`);

export const HOME_PAGE_QUERY =
  defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]{
  ...,
  content[]{
    ...,
    ${ONE_SP_COMPONENT_GROUP_PROJECTION},
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    ${ADDITIONAL_CONTENT_PROJECTION},
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
          teamMembers[$channel in @->channel]->{
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
          useCTAMini,
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
          scrollHighlightContent{
            ...,
            contentType,
            textItems,
            serviceItems[$channel in @->channel]->{
              _id,
              _updatedAt,
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
          ${ADDITIONAL_CONTENT_PROJECTION}
        }
      }
    },
    _type == 'galleryPeopleStep' => {
      ...,
      teamMembers[$channel in @->channel]->{
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
      useCTAMini,
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
      scrollHighlightContent{
        ...,
        contentType,
        textItems,
        serviceItems[$channel in @->channel]->{
          _id,
          _updatedAt,
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
      ${ADDITIONAL_CONTENT_PROJECTION}
    },
    _type == 'smartCarousel' => {
      ...,
      selectedCases[$channel in @->channel]->{
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
    _type == 'smartServicesCarousel' => {
      ...,
      selectedServices[$channel in @->channel]->{
        _id,
        name,
        taglabel,
        introText,
        serviceDescription,
        "backgroundAsset": serviceBackground.asset
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[$channel in @->channel]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[$channel in @->channel]->{
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
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
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
    },
    _type == 'pageBuilderLogoFloat' => {
      ...,
      selectedUnits[]->{
        _id,
        _type,
        name,
        slug,
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
        logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
      }
    },
    _type == 'clientLogoCarousel' => {
      ...,
      selectedClients[]->{
        _id,
        name,
        slug,
        logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
      },
      selectionMode == "auto" => {
        "autoClients": *[_type == "client" && $channel in channel && defined(logo)] | order(name asc) {
          _id,
          name,
          slug,
          logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
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
    "slug": coalesce(route, page->slug.current),
    "title": coalesce(page->title, displayName),
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
*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true] | order(publishedAt desc){
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
  "mainImageUrl": coalesce(mainImage.secure_url, mainImage.url, mainImage.asset->url),
  "mainVideoUrl": coalesce(mainVideo.secure_url, mainVideo.url, mainVideo.asset->url),
  client->{
    _id,
    name,
    logo,
    "logoUrl": logo.secure_url
  },
  websiteUrl,
  websiteUrlText,
  publishedAt,
  "msmUnits": select(
    $channel == "msmWeb" => *[
      _type == "msmUnit" &&
      language == $language &&
      isActive != false &&
      references(^._id)
    ] | order(sortOrder asc){
      _id,
      name,
      slug,
      descriptor,
      claim
    },
    []
  )
}
`);

// Query for fetching specific case studies by IDs (for manual selection mode)
export const CASE_STUDIES_BY_IDS_QUERY = defineQuery(`
*[
  _type == "caseStudy" &&
  _id in $ids &&
  (!defined($channel) || $channel in channel) &&
  (!defined($language) || language == $language) &&
  isPublished == true
]{
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
  "mainImageUrl": coalesce(mainImage.secure_url, mainImage.url, mainImage.asset->url),
  "mainVideoUrl": coalesce(mainVideo.secure_url, mainVideo.url, mainVideo.asset->url),
  client->{
    _id,
    name,
    logo,
    "logoUrl": logo.secure_url
  },
  websiteUrl,
  websiteUrlText,
  publishedAt,
  "msmUnits": select(
    $channel == "msmWeb" => *[
      _type == "msmUnit" &&
      language == $language &&
      isActive != false &&
      references(^._id)
    ] | order(sortOrder asc){
      _id,
      name,
      slug,
      descriptor,
      claim
    },
    []
  )
}
`);

export const CASE_TRANSLATION_MAPPINGS_QUERY = defineQuery(`
*[
  _type == "translation.metadata" &&
  count(translations[value._ref in $ids]) > 0
]{
  "sourceId": translations[value._ref in $ids][0].value._ref,
  "translatedId": translations[value->language == $language][0].value._ref
}
`);

export const CASE_STUDY_BY_SLUG_QUERY = defineQuery(`
*[_type == "caseStudy" && slug.current == $slug && $channel in channel && language == $language && isPublished == true][0]{
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
  "mainImageUrl": coalesce(mainImage.secure_url, mainImage.url, mainImage.asset->url),
  "mainVideoUrl": coalesce(mainVideo.secure_url, mainVideo.url, mainVideo.asset->url),
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
  "msmUnits": select(
    $channel == "msmWeb" => *[
      _type == "msmUnit" &&
      language == $language &&
      isActive != false &&
      references(^._id)
    ] | order(sortOrder asc){
      _id,
      name,
      slug,
      descriptor,
      claim
    },
    []
  ),
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

export const MSM_UNITS_QUERY = defineQuery(`
*[_type == "msmUnit" && language == $language && isActive != false] | order(sortOrder asc){
  _id,
  _updatedAt,
  name,
  slug,
  descriptor,
  claim,
  body,
  capabilities,
  sortOrder,
  metadata,
  heroMedia,
  heroImageSource,
  "heroImageUrl": coalesce(heroMedia.secure_url, heroMedia.url, heroImageSource),
  heroAlt,
  unitMark,
  "unitMarkUrl": coalesce(unitMark.secure_url, unitMark.url),
  "caseCount": count(caseStudies),
  "leadershipCount": count(leadership)
}
`);

export const MSM_UNITS_BY_IDS_QUERY = defineQuery(`
*[_type == "msmUnit" && _id in $ids && language == $language && isActive != false]{
  _id,
  _updatedAt,
  name,
  slug,
  descriptor,
  claim,
  body,
  capabilities,
  sortOrder,
  metadata,
  heroMedia,
  heroImageSource,
  "heroImageUrl": coalesce(heroMedia.secure_url, heroMedia.url, heroImageSource),
  heroAlt,
  unitMark,
  "unitMarkUrl": coalesce(unitMark.secure_url, unitMark.url),
  "caseCount": count(caseStudies),
  "leadershipCount": count(leadership)
}
`);

export const MSM_UNIT_BY_SLUG_QUERY = defineQuery(`
*[_type == "msmUnit" && slug.current == $slug && language == $language && isActive != false][0]{
  _id,
  _updatedAt,
  name,
  slug,
  descriptor,
  claim,
  body,
  capabilities,
  sortOrder,
  metadata,
  heroMedia,
  heroImageSource,
  "heroImageUrl": coalesce(heroMedia.secure_url, heroMedia.url, heroImageSource),
  heroAlt,
  unitMark,
  "unitMarkUrl": coalesce(unitMark.secure_url, unitMark.url),
  leadership[]{
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
      "imageUrl": coalesce(image.secure_url, image.url),
      "videoUrl": coalesce(video.secure_url, video.url)
    }
  },
  "cases": caseStudies[]->{
    _id,
    title,
    subtitle,
    slug,
    description,
    services[]->{_id, name, taglabel},
    mainImage,
    mainVideo,
    isVerticalVideo,
    "mainImageUrl": coalesce(mainImage.secure_url, mainImage.url, mainImage.asset->url),
    "mainVideoUrl": coalesce(mainVideo.secure_url, mainVideo.url, mainVideo.asset->url),
    client->{
      _id,
      name,
      "logoUrl": logo.secure_url
    },
    publishedAt
  }
}
`);

export const MSM_UNIT_SLUGS_QUERY = defineQuery(`
*[_type == "msmUnit" && defined(slug.current) && isActive != false]{
  "slug": slug.current,
  language,
  _updatedAt
}
`);

export const HAS_CASE_STUDIES_QUERY = defineQuery(`
count(*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true]) > 0
`);

export const SERVICES_QUERY = defineQuery(`
*[_type == "services" && language == $language] | order(name asc){
  _id,
  _updatedAt,
  name,
  taglabel,
  introText,
  deliverables[]{
    _key,
    title,
    description
  },
  sortOrder,
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

export const SERVICES_BY_CHANNEL_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(sortOrder, 2147483647) asc, name asc){
  _id,
  _updatedAt,
  name,
  taglabel,
  channel,
  introText,
  deliverables[]{
    _key,
    title,
    description
  },
  sortOrder,
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

// Auto mode for the smart services carousel: all channel services, capped
export const INTERACTIVE_SERVICES_CAROUSEL_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(sortOrder, 2147483647) asc, name asc) [0...$maxItems] {
  _id,
  name,
  taglabel,
  introText,
  serviceDescription,
  deliverables[]{
    _key,
    title,
    description
  },
  sortOrder,
  "backgroundAsset": serviceBackground.asset
}
`);

export const CASE_STUDIES_BY_CHANNEL_LIMIT_QUERY = defineQuery(`
*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true] | order(publishedAt desc) [0...$maxItems] {
  _id,
  title,
  subtitle,
  slug,
  description,
  mainImage,
  "mainImageUrl": mainImage.secure_url,
  client->{
    _id,
    name,
    logo,
    "logoUrl": logo.secure_url
  },
  services[]->{
    _id,
    name,
    taglabel
  },
  publishedAt
}
`);

export const SERVICES_BY_CHANNEL_LIMIT_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(sortOrder, 2147483647) asc, name asc) [0...$maxItems] {
  _id,
  _updatedAt,
  name,
  taglabel,
  introText,
  serviceDescription,
  deliverables[]{
    _key,
    title,
    description
  },
  sortOrder,
  serviceicon,
  serviceBackground
}
`);

export const HAS_SERVICES_QUERY = defineQuery(`
count(*[_type == "services" && language == $language]) > 0
`);

export const HAS_SERVICES_BY_CHANNEL_QUERY = defineQuery(`
count(*[_type == "services" && $channel in channel && language == $language]) > 0
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
  logoColor,
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
  $channel in channel &&
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
  logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
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

export const UNIT_LOGO_FLOAT_QUERY = defineQuery(`
*[
  _type == "unit" &&
  isActive == true &&
  language == $language
] | order(name asc) [0...$maxItems] {
  _id,
  _type,
  name,
  slug,
  logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logoSignet${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
}
`);
