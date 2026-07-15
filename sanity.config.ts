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
import { revalidateAction } from './sanity/plugins/revalidateAction'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from '@1sp/sanity-queries/env'
import { schema } from '@1sp/sanity-schema'
import {
  ALL_PLATFORM_LOCALES,
  GLOBAL_CONTENT_SOURCE_LOCALE,
  SITE_CONFIGS,
  SUPPORTED_LANGUAGES,
  TRANSLATABLE_SCHEMA_TYPES,
  WEBSITE_CHANNELS,
} from '@1sp/site-config'
import { structure } from './sanity/structure'
import { locations, mainDocuments } from './sanity/presentation/resolve';

// Studio templates derive from the same channel/locale policy as the frontends.
const CHANNELS = WEBSITE_CHANNELS.map((id) => ({
  id,
  title: SITE_CONFIGS[id].shortName,
  languages: SITE_CONFIGS[id].locales,
}));

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

      [
        { schemaType: 'caseStudy', title: 'Case Study' },
        { schemaType: 'services', title: 'Service' },
        { schemaType: 'person', title: 'Person' },
        { schemaType: 'client', title: 'Client' },
        { schemaType: 'unit', title: 'Unit' },
      ].forEach((template) => {
        templates.push({
          id: `${template.schemaType}-${channel.id}-${lang}`,
          title: `${template.title} (${channel.title} - ${lang.toUpperCase()})`,
          schemaType: template.schemaType,
          parameters: [{ name: 'channel', type: 'string' }, { name: 'language', type: 'string' }],
          value: (params: any) => ({
            channel: [params.channel || channel.id],
            language: params.language || lang,
          }),
        });
      });
    });

    templates.push({
      id: `translationGuidelines-${channel.id}`,
      title: `Translation Guidelines (${channel.title})`,
      schemaType: 'translationGuidelines',
      parameters: [{ name: 'scope', type: 'string' }],
      value: () => ({
        scope: channel.id,
        sourceLanguage: SITE_CONFIGS[channel.id].defaultLocale,
        targetLanguages: channel.languages.filter(
          (language) => language !== SITE_CONFIGS[channel.id].defaultLocale,
        ),
        doNotTranslate: [channel.title],
        reviewChecklist: [
          'Check meaning, claims, dates, names, and calls to action.',
          'Confirm approved terminology and protected brand terms.',
          'Review SEO title, description, links, and locale-specific URLs.',
        ],
      }),
    });
  });

  templates.push({
    id: 'translationGuidelines-global',
    title: 'Translation Guidelines (Global Content)',
    schemaType: 'translationGuidelines',
    parameters: [{ name: 'scope', type: 'string' }],
    value: () => ({
      scope: 'global',
      sourceLanguage: GLOBAL_CONTENT_SOURCE_LOCALE,
      targetLanguages: ALL_PLATFORM_LOCALES.filter(
        (language) => language !== GLOBAL_CONTENT_SOURCE_LOCALE,
      ),
      reviewChecklist: [
        'Check meaning, claims, dates, names, and calls to action.',
        'Confirm the wording works for every assigned website channel.',
        'Confirm approved terminology and protected brand terms.',
      ],
    }),
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
        return [...prev, syncServiceGroupRelationships, revalidateAction]
      }

      if (schemaType === 'page' || schemaType === 'menu' || schemaType === 'oneSpComponentGroup') {
        return [...prev, revalidateAction]
      }

      return prev
    },
  },
  plugins: [
    documentInternationalization({
      supportedLanguages: [...SUPPORTED_LANGUAGES],
      schemaTypes: [...TRANSLATABLE_SCHEMA_TYPES],
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
