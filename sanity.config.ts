'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { documentInternationalization } from "@sanity/document-internationalization";
import { cloudinarySchemaPlugin } from "sanity-plugin-cloudinary";
import { presentationTool } from 'sanity/presentation'
import { syncServiceGroupRelationships } from './sanity/lib/syncRelationships'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { locations, mainDocuments } from './sanity/presentation/resolve';

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
      // page templates: only EN for 1SP and Studio CO2; MSM EN/DE; FLIZR EN/DE/PL
      {
        id: 'page-1spWeb-en',
        title: 'Page (1SP - English)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || '1spWeb', language: params.language || 'en' }),
      },
      {
        id: 'page-msmWeb-en',
        title: 'Page (MSM - English)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'msmWeb', language: params.language || 'en' }),
      },
      {
        id: 'page-msmWeb-de',
        title: 'Page (MSM - German)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'msmWeb', language: params.language || 'de' }),
      },
      {
        id: 'page-studioco2Web-en',
        title: 'Page (Studio CO2 - English)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'studioco2Web', language: params.language || 'en' }),
      },

      // FLIZR page templates (en, de, pl)
      {
        id: 'page-flizrWeb-en',
        title: 'Page (Flizr - English)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'en' }),
      },
      {
        id: 'page-flizrWeb-de',
        title: 'Page (Flizr - German)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'de' }),
      },
      {
        id: 'page-flizrWeb-pl',
        title: 'Page (Flizr - Polish)',
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'pl' }),
      },

      // menu templates: only EN for 1SP and Studio CO2; MSM EN/DE; FLIZR EN/DE/PL
      {
        id: 'menu-1spWeb-en',
        title: 'Menu (1SP - English)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || '1spWeb', language: params.language || 'en' }),
      },
      {
        id: 'menu-msmWeb-en',
        title: 'Menu (MSM - English)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'msmWeb', language: params.language || 'en' }),
      },
      {
        id: 'menu-msmWeb-de',
        title: 'Menu (MSM - German)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'msmWeb', language: params.language || 'de' }),
      },
      {
        id: 'menu-studioco2Web-en',
        title: 'Menu (Studio CO2 - English)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'studioco2Web', language: params.language || 'en' }),
      },
      // FLIZR menus
      {
        id: 'menu-flizrWeb-en',
        title: 'Menu (Flizr - English)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'en' }),
      },
      {
        id: 'menu-flizrWeb-de',
        title: 'Menu (Flizr - German)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'de' }),
      },
      {
        id: 'menu-flizrWeb-pl',
        title: 'Menu (Flizr - Polish)',
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || 'flizrWeb', language: params.language || 'pl' }),
      },

      ...menuTemplates,
    ],
  },
  document: {
    actions: (prev, context) => {
      const { schemaType } = context

      // Add our custom sync action for documents with bidirectional relationships
      if (schemaType === 'services' || schemaType === 'serviceGroup' || schemaType === 'unit' || schemaType === 'caseStudy' || schemaType === 'client' || schemaType === 'person') {
        return [...prev, syncServiceGroupRelationships]
      }

      return prev
    },
  },
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        { id: "de", title: "German" },
        { id: "en", title: "English" },
        { id: "pl", title: "Polish" },
      ],
      schemaTypes: [
        "page",
        "menu",
        "caseStudy",
        "unit",
        "client",
        "person",
        "services",
        "serviceGroup"
      ],
      weakReferences: true,
    }),
    structureTool({ structure }),
    cloudinarySchemaPlugin(),
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      resolve: { locations, mainDocuments },
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_ORIGIN,
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      allowOrigins: ['http://localhost:*'],
    }),
  ],
})
