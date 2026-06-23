// Example GROQ queries for Services and Service Groups

// Get all services with their service groups, units, and case studies
export const getAllServicesWithRelations = `
  *[_type == "services"] | order(name asc) {
    _id,
    name,
    taglabel,
    serviceicon,
    servicegrouprel[]-> {
      _id,
      name,
      taglabel,
      servicegroupicon
    },
    unitsrel[]-> {
      _id,
      name,
      slug
    },
    "relatedCaseStudies": *[_type == "caseStudy" && references(^._id)] {
      _id,
      title,
      slug
    }
  }
`

// Get all services with their service groups (simplified)
export const getAllServicesWithGroups = `
  *[_type == "services"] | order(name asc) {
    _id,
    name,
    taglabel,
    serviceicon,
    servicegrouprel[]-> {
      _id,
      name,
      taglabel,
      servicegroupicon
    },
    unitsrel[]-> {
      _id,
      name
    }
  }
`

// Get all service groups with their services
export const getAllServiceGroupsWithServices = `
  *[_type == "serviceGroup"] | order(name asc) {
    _id,
    name,
    taglabel,
    servicegroupicon,
    services[]-> {
      _id,
      name,
      taglabel,
      serviceicon
    }
  }
`

// Get a specific service by ID with full details
export const getServiceById = `
  *[_type == "services" && _id == $id][0] {
    _id,
    name,
    taglabel,
    serviceicon {
      ...,
      asset-> {
        url,
        metadata
      }
    },
    servicegrouprel[]-> {
      _id,
      name,
      taglabel,
      servicegroupicon {
        ...,
        asset-> {
          url,
          metadata
        }
      }
    },
    unitsrel[]-> {
      _id,
      name,
      slug
    }
  }
`

// Get a specific service group by ID with full details
export const getServiceGroupById = `
  *[_type == "serviceGroup" && _id == $id][0] {
    _id,
    name,
    taglabel,
    servicegroupicon {
      ...,
      asset-> {
        url,
        metadata
      }
    },
    services[]-> {
      _id,
      name,
      taglabel,
      serviceicon {
        ...,
        asset-> {
          url,
          metadata
        }
      }
    }
  }
`

// Get services by service group tag
export const getServicesByGroupTag = `
  *[_type == "services" && references(*[_type == "serviceGroup" && taglabel == $groupTag]._id)] {
    _id,
    name,
    taglabel,
    serviceicon,
    servicegrouprel[]-> {
      _id,
      name,
      taglabel
    }
  }
`

// Get service groups containing a specific service
export const getGroupsContainingService = `
  *[_type == "serviceGroup" && references($serviceId)] {
    _id,
    name,
    taglabel,
    servicegroupicon
  }
`

// Get services with specific tag labels
export const getServicesByTag = `
  *[_type == "services" && taglabel match $tag] {
    _id,
    name,
    taglabel,
    serviceicon
  }
`

// Get related services based on shared service groups
export const getRelatedServices = `
  *[_type == "services" && _id != $currentServiceId && count(servicegrouprel[@._ref in *[_type == "services" && _id == $currentServiceId].servicegrouprel[]._ref]) > 0] {
    _id,
    name,
    taglabel,
    serviceicon,
    "sharedGroups": servicegrouprel[_ref in *[_type == "services" && _id == $currentServiceId].servicegrouprel[]._ref]-> {
      name,
      taglabel
    }
  }
`

// Get units with their services
export const getUnitsWithServices = `
  *[_type == "unit"] | order(name asc) {
    _id,
    name,
    slug,
    services[]-> {
      _id,
      name,
      taglabel,
      serviceicon
    }
  }
`

// Get case studies with their services
export const getCaseStudiesWithServices = `
  *[_type == "caseStudy"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    services[]-> {
      _id,
      name,
      taglabel,
      serviceicon
    }
  }
`

// Get services used by a specific unit
export const getServicesByUnit = `
  *[_type == "services" && references($unitId)] {
    _id,
    name,
    taglabel,
    serviceicon,
    servicegrouprel[]-> {
      _id,
      name,
      taglabel
    }
  }
`

// Get services used by a specific case study
export const getServicesByCaseStudy = `
  *[_type == "services" && _id in *[_type == "caseStudy" && _id == $caseStudyId].services[]._ref] {
    _id,
    name,
    taglabel,
    serviceicon,
    servicegrouprel[]-> {
      _id,
      name,
      taglabel
    }
  }
`