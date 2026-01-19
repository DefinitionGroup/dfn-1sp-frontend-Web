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

// Channel Configuration
const CHANNELS = [
  { id: '1spWeb', title: '1SP', languages: ['en'] },
  { id: 'msmWeb', title: 'MSM', languages: ['en', 'de'] },
  { id: 'studioco2Web', title: 'Studio CO2', languages: ['en'] },
  { id: 'flizrWeb', title: 'Flizr', languages: ['en', 'de', 'pl'] },
];

// Helper to generate templates
const generateTemplates = (excludeBase = false) => {
  const templates: any[] = [];

  CHANNELS.forEach((channel) => {
    channel.languages.forEach((lang) => {
      // Page Template
      templates.push({
        id: `page-${channel.id}-${lang}`,
        title: `Page (${channel.title} - ${lang.toUpperCase()})`,
        schemaType: 'page',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || channel.id, language: params.language || lang }),
      });

      // Menu Template
      templates.push({
        id: `menu-${channel.id}-${lang}`,
        title: `Menu (${channel.title} - ${lang.toUpperCase()})`,
        schemaType: 'menu',
        parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
        value: (params: any) => ({ channel: params.channel || channel.id, language: params.language || lang }),
      });
    });
  });

  // Base templates if needed
  if (!excludeBase) {
    templates.push({
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
    });

    templates.push({
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
    });
  }

  return templates;
};

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schema.types,
    // Add all templates to the array
    templates: (prev) => [
      ...prev,
      ...generateTemplates(),
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
        origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
          (typeof window === 'undefined' ? undefined : window.location.origin),
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],
})
