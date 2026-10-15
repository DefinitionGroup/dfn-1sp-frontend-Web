import {defineField, defineType} from 'sanity';
import {SlidersHorizontal} from '@phosphor-icons/react';

export default defineType({
  name: 'interactiveServiceCarousel', title: 'InteractiveServiceCarousel', type: 'object', icon: SlidersHorizontal,
  description: 'MSM service cards. Select Globals services and drag to set their order.',
  fields: [
    defineField({name: 'title', type: 'string', title: 'Heading', initialValue: 'Explore our services'}),
    defineField({name: 'selectedServices', title: 'Assigned services', type: 'array',
      validation: rule => rule.required().min(1).max(17).unique(),
      of: [{type: 'reference', to: [{type: 'services'}], options: {
        filter: ({document}) => ({filter: '"msmWeb" in channel && language == $language', params: {language: document.language || 'en'}}),
      }}],
    }),
    defineField({name: 'navPointName', title: 'Navigation label', type: 'string'}),
    defineField({name: 'hideFromNav', title: 'Hide from navigation', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'title', services: 'selectedServices'}, prepare: ({title, services}) => ({
    title: title || 'InteractiveServiceCarousel', subtitle: `${services?.length || 0} assigned services`,
  })},
});
