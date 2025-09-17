import { defineField, defineType } from "sanity";

export default defineType({
    name: 'cardItem',
    title: 'Card Item',
    type: 'object',
    fields: [
        defineField({ name: 'description', title: 'Description', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'src', title: 'Image', type: 'cloudinary.asset' }),
        defineField({ name: 'logo', title: 'Logo', type: 'cloudinary.asset' }),
        defineField({ name: 'ctaButton', title: 'Button', type: 'cta' }),
        defineField({ name: 'content', title: 'Content', type: 'text' })
    ]
})