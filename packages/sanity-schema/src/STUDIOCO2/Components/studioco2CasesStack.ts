import { defineField, defineType } from 'sanity';
import { Cards, Stack } from '@phosphor-icons/react';
import { LINE_PER_ROW, STUDIOCO2_CHANNEL, anchorValidation, studioco2PageOnly } from '../shared';

/** One stacked card; its copy and media come from the case’s Studio CO2 version. */
export const studioco2CaseStackCard = defineType({
  name: 'studioco2CaseStackCard',
  title: 'Case stack card',
  type: 'object',
  icon: Cards,
  fields: [
    defineField({
      name: 'case', title: 'Case', type: 'reference', to: [{ type: 'caseStudy' }],
      description: 'Title, summary, image, discipline and sector come from the case and its Studio CO2 version.',
      options: {
        filter: ({ document }) => ({
          filter: `$channel in channel && language == $language && isPublished == true && defined(slug.current)`,
          params: { channel: STUDIOCO2_CHANNEL, language: document?.language || 'en' },
        }),
      },
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'case.title',
      editions: 'case.siteContent',
      media: 'case.mainImage',
    },
    prepare: ({ title, editions }) => {
      const edition = (editions as { channel?: string; title?: string; discipline?: string }[] | undefined)?.find(item => item.channel === STUDIOCO2_CHANNEL);
      return { title: edition?.title || title || 'Choose a case', subtitle: edition ? edition.discipline || 'No discipline' : 'No Studio CO2 version yet' };
    },
  },
});

export default defineType({
  name: 'studioco2CasesStack',
  title: 'Studio CO2 Cases Stack',
  type: 'object',
  icon: Stack,
  description: 'Selected work as a sticky stack of reveal cards, with the “We design … for …” filter dock.',
  fields: [
    defineField({ name: 'anchor', title: 'Section anchor', type: 'string', initialValue: 'work', description: 'Navigation links to this section with #anchor.', validation: anchorValidation }),
    defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Selected work', validation: rule => rule.max(40) }),
    defineField({ name: 'hint', title: 'Hint', type: 'string', initialValue: 'Move across. Look closer.', validation: rule => rule.max(60) }),
    defineField({ name: 'headline', title: 'Headline', type: 'text', rows: 2, description: `${LINE_PER_ROW} The last word is set in the muted colour.`, validation: rule => rule.required().max(60) }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 2, description: LINE_PER_ROW, validation: rule => rule.max(120) }),
    defineField({ name: 'showFilters', title: 'Show the filter dock', type: 'boolean', initialValue: true, description: 'Filters by each case’s discipline (Studio CO2 version) and sector.' }),
    defineField({
      name: 'cards', title: 'Cards', type: 'array', of: [{ type: 'studioco2CaseStackCard' }],
      description: 'Drag to reorder. Later cards stack on top of earlier ones.',
      validation: rule => rule.required().min(1).max(12).custom(cards => {
        const refs = ((cards ?? []) as { case?: { _ref?: string } }[]).map(card => card.case?._ref).filter(Boolean);
        return new Set(refs).size === refs.length || 'Each case can appear only once.';
      }),
    }),
  ],
  validation: studioco2PageOnly,
  preview: {
    select: { headline: 'headline', cards: 'cards' },
    prepare: ({ headline, cards }) => ({ title: headline?.split('\n').join(' ') || 'Studio CO2 Cases Stack', subtitle: `${cards?.length || 0} cases` }),
  },
});
