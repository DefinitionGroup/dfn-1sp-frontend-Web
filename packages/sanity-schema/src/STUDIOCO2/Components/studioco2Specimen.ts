import { defineField, defineType } from 'sanity';
import { TextAa } from '@phosphor-icons/react';
import { LINE_PER_ROW, anchorValidation, studioco2PageOnly } from '../shared';

export default defineType({
  name: 'studioco2Specimen',
  title: 'Studio CO2 Type Specimen',
  type: 'object',
  icon: TextAa,
  description: 'Large statement headline with a weight slider and an optional image set inside the text.',
  fields: [
    defineField({ name: 'anchor', title: 'Section anchor', type: 'string', initialValue: 'studio', description: 'Navigation links to this section with #anchor.', validation: anchorValidation }),
    defineField({ name: 'label', title: 'Label', type: 'string', description: 'Small pixel label above the headline.', validation: rule => rule.max(60) }),
    defineField({ name: 'headline', title: 'Headline', type: 'text', rows: 2, description: `${LINE_PER_ROW} The inline image sits before the last word.`, validation: rule => rule.required().max(90) }),
    defineField({ name: 'inlineImage', title: 'Inline image', type: 'cloudinary.asset', description: 'Optional image set inside the headline. Decorative; it has no alt text.' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, description: LINE_PER_ROW, validation: rule => rule.max(180) }),
  ],
  validation: studioco2PageOnly,
  preview: {
    select: { headline: 'headline', label: 'label' },
    prepare: ({ headline, label }) => ({ title: headline?.split('\n').join(' ') || 'Studio CO2 Type Specimen', subtitle: label }),
  },
});
