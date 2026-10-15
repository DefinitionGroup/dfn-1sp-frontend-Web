import { defineArrayMember, defineField, defineType } from 'sanity'

const uniquePersonReferences = (items: Array<{ person?: { _ref?: string } }> | undefined) => {
  if (!items) return true
  const refs = items.map((item) => item?.person?._ref).filter(Boolean)
  return refs.length === new Set(refs).size || 'A person can only be assigned once per Unit.'
}

export default defineType({
  name: 'msmUnit',
  title: 'MSM Unit',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'content', title: 'Content' },
    { name: 'relationships', title: 'Cases & Leadership' },
    { name: 'media', title: 'Media' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    ...['introductionHeading', 'leadershipHeading', 'casesHeading'].map(name => defineField({name, type: 'string', group: 'content'})),
    defineField({name: 'content', title: 'Additional content and contact', type: 'array', of: [{type: 'contentSection'}, {type: 'twoColContentSection'}, {type: 'intertitleCTA'}], group: 'content'}),
    defineField({name: 'image', title: 'Hero Media', type: 'cloudinary.asset', group: 'media'}),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: (context: any) => context?.document?.__inferMetadata?.params?.language || 'en',
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: async (slug: string, context: any) => {
          const document = context.document
          const language = document?.language || 'en'
          const baseId = document?._id?.replace(/^drafts\./, '')
          const client = context.getClient({ apiVersion: '2025-09-16' })
          const existing = await client.fetch(
            `count(*[_type == "msmUnit" && slug.current == $slug && language == $language && !(_id in [$draftId, $publishedId])])`,
            {
              slug,
              language,
              draftId: `drafts.${baseId}`,
              publishedId: baseId,
            },
          )
          return existing === 0
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'descriptor',
      title: 'Descriptor',
      type: 'string',
      group: 'identity',
      description: 'A concise scope label, for example “AR, VR, MR & AI Glasses”.',
    }),
    defineField({
      name: 'claim',
      title: 'Claim',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Introduction',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'block' })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'capabilities',
      title: 'Capabilities',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'caseStudies',
      title: 'Assigned Cases',
      type: 'array',
      group: 'relationships',
      description: 'MSM attribution is owned here. The shared Case document is not modified.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'caseStudy' }],
          options: {
            filter: ({ document }: any) => ({
              filter: '_type == "caseStudy" && language == $language && "msmWeb" in channel',
              params: { language: document?.language || 'en' },
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'leadership',
      title: 'Leadership',
      type: 'array',
      group: 'relationships',
      description: 'People come from the shared Person pool; the Person document is not modified.',
      of: [defineArrayMember({ type: 'personReference' }), defineArrayMember({type:'object',name:'msmUnitLeader',title:'Unit leader',fields:[
        defineField({name:'person',type:'reference',to:[{type:'person'}],validation:r=>r.required(),options:{filter:({document})=>({filter:'language == $language && "msmWeb" in channel',params:{language:document.language}})}}),
        defineField({name:'isPrimary',type:'boolean',title:'Primary contact'}),
        defineField({name:'position',type:'string',title:'Role in this unit'}),
        defineField({name:'quote',type:'text',title:'Quote'}),
        defineField({name:'phone',type:'url',title:'Phone link',validation:r=>r.uri({scheme:['tel']})}),
      ],preview:{select:{title:'person.name',subtitle:'position'}}})],
      validation: (Rule) => Rule.custom(uniquePersonReferences),
    }),
    defineField({
      name: 'heroMedia',
      title: 'Legacy Hero Media',
      hidden: ({parent}) => !parent?.heroMedia,
      type: 'cloudinary.asset',
      group: 'media',
      description: 'Preferred permanent Unit hero asset.',
    }),
    defineField({
      name: 'heroImageSource',
      title: 'Temporary Hero Image URL',
      type: 'url',
      group: 'media',
      description: 'Temporary source from the legacy msm.digital website. Replace with Hero Media later.',
    }),
    defineField({
      name: 'heroAlt',
      title: 'Hero Alternative Text',
      type: 'string',
      group: 'media',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'unitMark',
      title: 'Unit Mark',
      type: 'cloudinary.asset',
      group: 'media',
      description: 'Optional future Unit-specific mark. The animated MSM mark is used until this is set.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      group: 'identity',
      initialValue: 10,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'identity',
      initialValue: true,
    }),
    defineField({ name: 'metadata', title: 'Metadata', type: 'metadata', group: 'seo' }),
  ],
  orderings: [
    {
      title: 'Unit order',
      name: 'unitOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'claim', media: 'unitMark' },
    prepare({ title, subtitle, media }) {
      return { title: title || 'Untitled MSM Unit', subtitle, media }
    },
  },
})
