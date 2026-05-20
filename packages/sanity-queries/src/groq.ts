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

const FLZR_CONTENT_PROJECTION = `contentStudioFlizr[]{
  ...,
  cta{
    ...,
    link{
      ...,
      page->{slug}
    }
  },
  ${ADDITIONAL_CONTENT_PROJECTION},
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
      "mainImageUrl": mainImage.secure_url,
      services[]->{_id, name, taglabel},
      client->{_id, name}
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
      }
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
  _type == 'servicesHeroWithBadge' => {
    ...,
    serviceGroups[]->{
      _id,
      name,
      taglabel,
      services[]->{
        _id,
        name,
        taglabel,
        introText,
        serviceDescription,
        serviceicon,
        serviceBackground
      }
    }
  },
  _type == 'contentSection' => {
    ...,
    content[]{
      ...
    }
  }
}`;

// =============================================================================
// Phase 1A: unified content projection
// =============================================================================
// PAGE_QUERY and HOME_PAGE_QUERY both project the new `content` field with
// the same deep transformations as the legacy `content1sp` field, so that
// once data has migrated to `content` (PR 3) the frontend keeps resolving
// references correctly. The legacy `content1sp` and `contentStudioFlizr`
// projections remain intact during the transition; consumers read
// `page.content` first and fall back to the legacy fields. After PR 3
// runs and PR 4 deprecates the legacy fields, the duplicated projection
// bodies can be unified via a shared constant.
// =============================================================================

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{
  ...,
  ${FLZR_CONTENT_PROJECTION},
  content1sp[]{
    ...,
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
  },
  "content": coalesce(content, content1sp, contentStudioFlizr, contentMSM, contentStudioCO2)[]{
    ...,
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
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]{
  ...,
  ${FLZR_CONTENT_PROJECTION},
  content1sp[]{
    ...,
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
          ${ADDITIONAL_CONTENT_PROJECTION}
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
  },
  "content": coalesce(content, content1sp, contentStudioFlizr, contentMSM, contentStudioCO2)[]{
    ...,
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
          ${ADDITIONAL_CONTENT_PROJECTION}
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
count(*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true]) > 0
`);

export const SERVICES_QUERY = defineQuery(`
*[_type == "services" && language == $language] | order(name asc){
  _id,
  _updatedAt,
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

export const SERVICES_BY_CHANNEL_QUERY = defineQuery(`
*[_type == "services" && $channel in channel && language == $language] | order(name asc){
  _id,
  _updatedAt,
  name,
  taglabel,
  channel,
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
*[_type == "services" && $channel in channel && language == $language] | order(name asc) [0...$maxItems] {
  _id,
  _updatedAt,
  name,
  taglabel,
  introText,
  serviceDescription,
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
