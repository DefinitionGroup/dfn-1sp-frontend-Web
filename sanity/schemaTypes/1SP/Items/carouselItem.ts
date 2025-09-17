import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'carouselItem',
    title: 'Carousel Item',
    type: 'object',
    fields: [
        defineField({
            name: 'id',
            title: 'ID',
            type: 'number',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string'
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'cloudinary.asset'
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text'
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string'
        }),
        defineField({
            name: 'logoSrc',
            title: 'Logo',
            type: 'cloudinary.asset'
        })
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'subtitle',
            media: 'image',
            category: 'category'
        },
        prepare({ title, subtitle, media, category }) {
            return {
                title: title || 'Untitled Item',
                subtitle: `${category || 'No category'} • ${subtitle || 'No subtitle'}`,
                media
            }
        }
    }
})