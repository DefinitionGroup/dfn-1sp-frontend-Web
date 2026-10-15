import { defineField, defineType } from 'sanity';
import { SquaresFour } from '@phosphor-icons/react';
import SharedContentUsage from './SharedContentUsage';

export const RENAISSANCE_SHARED_TYPES = [
  'renaissanceSharedPortraits', 'renaissanceSharedAwards',
] as const;

function sharedDocument(name: string, title: string, contentType: string) {
  return defineType({
    name, title, type: 'document', icon: SquaresFour,
    initialValue: { channel: 'renaissanceWeb', language: 'en' },
    fields: [
      defineField({ name: 'title', title: 'Internal name', type: 'string', validation: r => r.required() }),
      defineField({ name: 'channel', type: 'string', hidden: true, readOnly: true,
        validation: r => r.required().custom(value => value === 'renaissanceWeb' || 'Renaissance shared content requires renaissanceWeb.') }),
      defineField({ name: 'language', type: 'string', readOnly: true, validation: r => r.required().custom(value => value === 'en' || 'Renaissance shared content currently supports English only.') }),
      defineField({ name: 'content', title: 'Shared content', type: contentType,
        description: 'Publishing changes updates every reference and every People section using this default.',
        validation: r => r.required() }),
      defineField({ name: 'usage', title: 'Used by', type: 'string', readOnly: true,
        components: { input: SharedContentUsage } }),
    ],
    preview: { select: { title: 'title', subtitle: 'language' } },
  });
}

export const renaissanceSharedPortraits = sharedDocument(
  'renaissanceSharedPortraits', 'Shared Portrait Grid', 'renaissancePortraitGrid',
);
export const renaissanceSharedAwards = sharedDocument(
  'renaissanceSharedAwards', 'Shared Award Logo Wall', 'renaissanceAwardLogoWall',
);
