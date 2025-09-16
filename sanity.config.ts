'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { documentInternationalization } from "@sanity/document-internationalization";
import { cloudinarySchemaPlugin } from "sanity-plugin-cloudinary";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

// Template definitions
const pageWithChannelTemplate = {
  id: "page-with-channel",
  title: "Page with Channel",
  schemaType: "page",
  parameters: [
    { name: "channel", title: "Channel", type: "string" },
    { name: "language", title: "Language", type: "string" }
  ],
  value: (params: { channel: string, language: string }) => ({
    channel: params.channel,
    language: params.language || "de",
  }),
};

const menuWithChannelTemplate = {
  id: "menu-with-channel",
  title: "Menu with Channel",
  schemaType: "menu",
  parameters: [
    { name: "channel", title: "Channel", type: "string" },
    { name: "language", title: "Language", type: "string" }
  ],
  value: (params: { channel: string, language: string }) => ({
    channel: params.channel,
    language: params.language || "de",
  }),
};

// Individual templates for each channel/language combination
const pageTemplates = [
  {
    id: 'page-1spWeb-en',
    title: 'Page (1SP - English)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || '1spWeb',
      language: params.language || 'en'
    })
  },
  {
    id: 'page-1spWeb-de',
    title: 'Page (1SP - German)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || '1spWeb',
      language: params.language || 'de'
    })
  },
  {
    id: 'page-msmWeb-en',
    title: 'Page (MSM - English)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'msmWeb',
      language: params.language || 'en'
    })
  },
  {
    id: 'page-msmWeb-de',
    title: 'Page (MSM - German)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'msmWeb',
      language: params.language || 'de'
    })
  },
  {
    id: 'page-studioco2Web-en',
    title: 'Page (Studio CO2 - English)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'studioco2Web',
      language: params.language || 'en'
    })
  },
  {
    id: 'page-studioco2Web-de',
    title: 'Page (Studio CO2 - German)',
    schemaType: 'page',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'studioco2Web',
      language: params.language || 'de'
    })
  }
];

const menuTemplates = [
  {
    id: 'menu-1spWeb-en',
    title: 'Menu (1SP - English)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || '1spWeb',
      language: params.language || 'en'
    })
  },
  {
    id: 'menu-1spWeb-de',
    title: 'Menu (1SP - German)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || '1spWeb',
      language: params.language || 'de'
    })
  },
  {
    id: 'menu-msmWeb-en',
    title: 'Menu (MSM - English)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'msmWeb',
      language: params.language || 'en'
    })
  },
  {
    id: 'menu-msmWeb-de',
    title: 'Menu (MSM - German)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'msmWeb',
      language: params.language || 'de'
    })
  },
  {
    id: 'menu-studioco2Web-en',
    title: 'Menu (Studio CO2 - English)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'studioco2Web',
      language: params.language || 'en'
    })
  },
  {
    id: 'menu-studioco2Web-de',
    title: 'Menu (Studio CO2 - German)',
    schemaType: 'menu',
    parameters: [
      { name: 'channel', type: 'string' },
      { name: 'language', type: 'string' }
    ],
    value: (params: any) => ({
      channel: params.channel || 'studioco2Web',
      language: params.language || 'de'
    })
  }
];

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schema.types,
    // Add all templates to the array
    templates: (prev) => [
      ...prev,
      pageWithChannelTemplate,
      menuWithChannelTemplate,
      ...pageTemplates,
      ...menuTemplates,
    ],
  },
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        { id: "de", title: "German" },
        { id: "en", title: "English" },
      ],
      schemaTypes: [
        "page",
        "menu",
        "caseStudy",
        "unit"
      ],
      weakReferences: true,
    }),
    structureTool({ structure }),
    cloudinarySchemaPlugin(),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
