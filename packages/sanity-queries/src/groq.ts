import {servicePresentationFields, SERVICE_REFERENCE_PROJECTION} from "./service-presentation";
import { defineQuery } from "next-sanity";
import { casePresentationFields, CASE_BODY_PROJECTION } from "./case-presentation";

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

const NEWS_CTA_BLOCK_PROJECTION = `_type == 'newsCTABlock' => {
  ...,
  link{
    ...,
    page->{_id, slug}
  }
}`;

const REGISTER_BLOCK_PROJECTION = `_type == 'registerBlock' => {
  ...,
  cards[]{
    ...,
    link{
      ...,
      page->{
        _id,
        slug
      }
    }
  }
}`;

const RENAISSANCE_PORTRAIT_FIELDS = `
  ...,
  portraits[!defined(person._ref) || ($channel in person->channel && person->language == $language)]{
    ..., "name": coalesce(name, person->fullname, person->name),
    "position": coalesce(position, person->position), "image": coalesce(image, person->image)
  }
`;
const RENAISSANCE_SHARED_DOCUMENT_FIELDS = `
  _id, _type, title, channel, language,
  channel == $channel && language == $language && $channel == "renaissanceWeb" => {content{..., _type == 'renaissancePortraitGrid' => {${RENAISSANCE_PORTRAIT_FIELDS}}}}
`;
export const RENAISSANCE_CASE_CAROUSEL_PROJECTION = `_type == 'renaissanceCaseCarousel' => {
  "caseStudies": select($channel == 'renaissanceWeb' => selectedCases[
    $channel in @->channel && @->language == $language && @->isPublished == true && defined(@->slug.current)
  ]->{_id, slug, ${casePresentationFields()}}, [])
}`;

const RENAISSANCE_SHARED_CONTENT_PROJECTION = `
  ${RENAISSANCE_CASE_CAROUSEL_PROJECTION},
  _type == 'contentSection' && $channel == 'renaissanceWeb' => {${SERVICE_REFERENCE_PROJECTION}},
  _type == 'cardContainerComponent' && $channel == 'renaissanceWeb' => {
    cards[]{..., ${SERVICE_REFERENCE_PROJECTION}}
  },
  _type == 'renaissancePortraitGrid' && $channel == 'renaissanceWeb' => {${RENAISSANCE_PORTRAIT_FIELDS}},
  _type == 'renaissanceSharedContentReference' => {
    ...,
    sharedContent->{${RENAISSANCE_SHARED_DOCUMENT_FIELDS}}
  },
  _type == 'renaissanceSectionBand' && sectionRole == 'people' && $channel == 'renaissanceWeb' => {
    ...,
    "sharedDefaults": *[_type == 'siteSettings' && channel == $channel && language == $language][0]{
      "portraitsConfigured": defined(renaissanceDefaultPortraits._ref),
      "awardsConfigured": defined(renaissanceDefaultAwards._ref),
      "portraits": renaissanceDefaultPortraits->{${RENAISSANCE_SHARED_DOCUMENT_FIELDS}},
      "awards": renaissanceDefaultAwards->{${RENAISSANCE_SHARED_DOCUMENT_FIELDS}}
    }
  }
`;

const CLIENT_LOGO_BLOCK_PROJECTION = `_type == 'clientLogoCarousel' => {
  ...,
  selectedClients[$channel in @->channel && @->language == $language]->{
    _id, name, slug, logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
  },
  "autoClients": select(selectionMode == "auto" => *[_type == "client" && $channel in channel && language == $language && defined(logo)] | order(name asc){
    _id, name, slug, logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
  }, []),
  "collectionClients": select($channel == "renaissanceWeb" && collection->channel == $channel && collection->language == $language => collection->items[$channel in client->channel && client->language == $language]{
    "_id": client->_id,
    "name": coalesce(displayName, client->name),
    "altText": coalesce(altText, displayName, client->name),
    "logo": coalesce(logoOverride, client->logo)${MINIMAL_CLOUDINARY_ASSET_PROJECTION}
  }, [])
}`;

/* Cinematic 3 cards reveal: the closing button and every card link may point
   at internal pages, so their references must be dereferenced like `cta`. */
const CINEMATIC_REVEAL_PROJECTION = `_type == 'cinematicBlock3CardsReveal' => {
  ...,
  outroCta{
    ...,
    link{..., page->{_id, slug}}
  },
  cards[]{
    ...,
    link{..., page->{_id, slug}}
  }
}`;

const CAROUSEL_PROJECTION = `_type == 'carousel' => {
  ...,
  items[]{
    ...,
    cta{
      ...,
      link{..., page->{_id, slug}}
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
      ${CAROUSEL_PROJECTION},
      ${CINEMATIC_REVEAL_PROJECTION},
    ${RENAISSANCE_SHARED_CONTENT_PROJECTION},
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
        ,
        ${casePresentationFields('"1spWeb"')}
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
        ,
        ${casePresentationFields('"1spWeb"')}
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
        ,
        ${casePresentationFields('"1spWeb"')}
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
    ${CAROUSEL_PROJECTION},
    ${CINEMATIC_REVEAL_PROJECTION},
    ${RENAISSANCE_SHARED_CONTENT_PROJECTION},
    ${ONE_SP_COMPONENT_GROUP_PROJECTION},
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    ${REGISTER_BLOCK_PROJECTION},
    ${NEWS_CTA_BLOCK_PROJECTION},
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
        "profileUrl": select($channel == "msmWeb" && defined(siteContent[channel == $channel][0].slug.current) => "/" + select(language == "en" => "", language + "/") + "people/" + siteContent[channel == $channel][0].slug.current, profileUrl),
        "tagline": coalesce(siteContent[channel == $channel][0].quote, tagline),
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
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
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
      ,
        ${casePresentationFields()}
      }
    },
    _type == 'smartServicesCarousel' => {
      ...,
      selectedServices[$channel in @->channel && @->language == $language]->{
        _id,
        name,
        taglabel,
        introText,
        serviceDescription,
        "backgroundAsset": serviceBackground.asset,
        ${servicePresentationFields()}
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      ,
        ${casePresentationFields()}
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      ,
        ${casePresentationFields()}
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
    ${CLIENT_LOGO_BLOCK_PROJECTION}
  }
}`);

export const HOME_PAGE_QUERY =
  defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]{
  ...,
  content[]{
    ...,
    ${CAROUSEL_PROJECTION},
    ${CINEMATIC_REVEAL_PROJECTION},
    ${RENAISSANCE_SHARED_CONTENT_PROJECTION},
    ${ONE_SP_COMPONENT_GROUP_PROJECTION},
    cta{
      ...,
      link{
        ...,
        page->{slug}
      }
    },
    ${REGISTER_BLOCK_PROJECTION},
    ${NEWS_CTA_BLOCK_PROJECTION},
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
        "profileUrl": select($channel == "msmWeb" && defined(siteContent[channel == $channel][0].slug.current) => "/" + select(language == "en" => "", language + "/") + "people/" + siteContent[channel == $channel][0].slug.current, profileUrl),
        "tagline": coalesce(siteContent[channel == $channel][0].quote, tagline),
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
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
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
      ,
        ${casePresentationFields()}
      }
    },
    _type == 'smartServicesCarousel' => {
      ...,
      selectedServices[$channel in @->channel && @->language == $language]->{
        _id,
        name,
        taglabel,
        introText,
        serviceDescription,
        "backgroundAsset": serviceBackground.asset,
        ${servicePresentationFields()}
      }
    },
    _type == 'casesGalleryFiltered' => {
      ...,
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      ,
        ${casePresentationFields()}
      }
    },
    _type == 'casesGalleryFilteredWithPagination' => {
      ...,
      selectedCases[$channel in @->channel && @->language == $language && @->isPublished == true]->{
        _id,
        title,
        slug,
        description,
        "mainImageUrl": mainImage.secure_url
      ,
        ${casePresentationFields()}
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
    ${CLIENT_LOGO_BLOCK_PROJECTION}
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
  renaissanceLegalText,
  footerExternalBanner{..., cta{..., link{..., page->{slug}}}},
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
    "name": coalesce(siteContent[channel == $channel][0].name, name),
    "taglabel": coalesce(siteContent[channel == $channel][0].taglabel, taglabel)
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
  ),
  ${casePresentationFields()}
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
    "name": coalesce(siteContent[channel == $channel][0].name, name),
    "taglabel": coalesce(siteContent[channel == $channel][0].taglabel, taglabel)
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
  ),
  ${casePresentationFields()}
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
  ${CASE_BODY_PROJECTION},
  publishedAt,
  ${casePresentationFields()}
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
  "heroImageUrl": coalesce(image.secure_url, image.url, heroMedia.secure_url, heroMedia.url, heroImageSource),
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
  "heroImageUrl": coalesce(image.secure_url, image.url, heroMedia.secure_url, heroMedia.url, heroImageSource),
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
  introductionHeading, leadershipHeading, casesHeading,
  "additionalContent": coalesce(content[_type != "intertitleCTA"], additionalContent),
  "contactCta": coalesce(content[_type == "intertitleCTA"][0], contactCta),
  capabilities,
  sortOrder,
  metadata,
  heroMedia,
  heroImageSource,
  "heroImageUrl": coalesce(image.secure_url, image.url, heroMedia.secure_url, heroMedia.url, heroImageSource),
  heroAlt,
  unitMark,
  "unitMarkUrl": coalesce(unitMark.secure_url, unitMark.url),
  leadership[person->language == $language && "msmWeb" in person->channel]{
    isPrimary, position, quote, phone,
    person->{
      _id,
      name,
      fullname,
      altText,
      position,
      email,
      profileUrl,
      "profileSlug": siteContent[channel == "msmWeb"][0].slug.current,
      image,
      video,
      "imageUrl": coalesce(image.secure_url, image.url),
      "videoUrl": coalesce(video.secure_url, video.url)
    }
  },
  "cases": caseStudies[@->language == $language && "msmWeb" in @->channel && @->isPublished == true]->{
    _id,
    title,
    subtitle,
    slug,
    description,
    services[]->{_id, "name": coalesce(siteContent[channel == "msmWeb"][0].name, name), "taglabel": coalesce(siteContent[channel == "msmWeb"][0].taglabel, taglabel)},
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
  ,
    ${casePresentationFields('"msmWeb"')}
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
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(siteContent[channel == $channel][0].sortOrder, sortOrder, 2147483647) asc, name asc){
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
  },
  ${servicePresentationFields()}
}
`);

// Auto mode for the smart services carousel: all channel services, capped
export const INTERACTIVE_SERVICES_CAROUSEL_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(siteContent[channel == $channel][0].sortOrder, sortOrder, 2147483647) asc, name asc) [0...$maxItems] {
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
  "backgroundAsset": serviceBackground.asset,
  ${servicePresentationFields()}
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
    "name": coalesce(siteContent[channel == $channel][0].name, name),
    "taglabel": coalesce(siteContent[channel == $channel][0].taglabel, taglabel)
  },
  publishedAt,
  ${casePresentationFields()}
}
`);

export const SERVICES_BY_CHANNEL_LIMIT_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(coalesce(siteContent[channel == $channel][0].sortOrder, sortOrder, 2147483647) asc, name asc) [0...$maxItems] {
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
  serviceBackground,
  ${servicePresentationFields()}
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
  ($channel != "1spWeb" || smartPeoplePromo1SP == true) &&
  language == $language &&
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
  slug,
  ${casePresentationFields()}
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

export const FOOTER_EXTERNAL_BANNER_UNITS_QUERY = defineQuery(`
*[_type == "unit" && isActive == true && language == $language &&
  coalesce(slug.current, "") != "1sp-agency" &&
  ($channel in channel || ($channel == "1spWeb" && !defined(channel)))
] | order(name asc) {
  _id, name, tagline,
  backgroundImage${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  footerHoverVideo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logo${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  logoColor${MINIMAL_CLOUDINARY_ASSET_PROJECTION},
  cta{..., link{..., page->{slug}}}
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
