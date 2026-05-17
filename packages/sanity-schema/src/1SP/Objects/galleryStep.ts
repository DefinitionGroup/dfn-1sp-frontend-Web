import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryStep',
    title: 'Gallery Step',
    type: 'object',
    fields: [
        defineField({
            name: 'type',
            title: 'Step Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Hero', value: 'hero' },
                    { title: 'Portfolio', value: 'portfolio' },
                    { title: 'Skills', value: 'skills' },
                    { title: 'People', value: 'people' },
                    { title: 'Newsroom', value: 'newsroom' },
                    // Add more as needed
                ]
            }
        }),
        defineField({ name: 'headline', title: 'Headline', type: 'string' }),
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule' }),
        defineField({ name: 'typewriter', title: 'Typewriter Text', type: 'string' }),
        defineField({ name: 'slideUpContent', title: 'Slide Up Content', type: 'slideUpContent' }),
        defineField({ name: 'carousel', title: 'Interactive Carousel', type: 'carousel' }),
    ]
})