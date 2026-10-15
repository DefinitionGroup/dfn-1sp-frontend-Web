import {defineField} from 'sanity';

export const serviceReferenceField = () => defineField({
  name: 'service', title: 'Global service', type: 'reference', to: [{type: 'services'}],
  description: 'Use this service’s website-specific copy and media. Edit the service in Globals; page layout stays here.',
  hidden: ({document}) => document?.channel !== 'renaissanceWeb',
  options: {filter: ({document}) => ({filter: '$channel in channel && language == $language', params: {channel: document?.channel || 'renaissanceWeb', language: document?.language || 'en'}})},
  validation: r => r.custom(async (value, context) => {
    if (!value?._ref) return true;
    const found = await context.getClient({apiVersion: '2025-09-16'}).withConfig({perspective: 'drafts', useCdn: false}).fetch(
      'count(*[_type == "services" && _id == $id && $channel in channel && language == $language])',
      {id: value._ref.replace(/^drafts\./, ''), channel: context.document?.channel, language: context.document?.language || 'en'},
    );
    return found === 1 || 'Choose a service assigned to this website and language.';
  }),
});
