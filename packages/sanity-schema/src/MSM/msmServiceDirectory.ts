import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'msmServiceDirectory', title: 'MSM service directory', type: 'object',
  fields: [
    defineField({name: 'headline', type: 'string', title: 'Headline'}),
    defineField({name: 'items', type: 'array', of: [{type: 'object', name: 'msmServiceEntry', fields: [
      defineField({name: 'reference', title: 'Service page', type: 'reference', to: [{type: 'page'}], options: {filter: ({document}) => ({filter: 'channel == "msmWeb" && language == $language && msmPageKind == "service"', params: {language: document.language}})}, validation: r => r.required()}),
      defineField({name: 'text', title: 'Directory teaser', type: 'text'}),
      defineField({name: 'linkLabel', title: 'Link label', type: 'string'}),
    ], preview: {select: {title: 'reference.title', subtitle: 'text'}}}]}),
  ],
  preview: {select: {title: 'headline'}, prepare: ({title}) => ({title: title || 'MSM service directory'})},
});
