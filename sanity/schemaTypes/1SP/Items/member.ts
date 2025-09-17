import { defineType, defineField } from "sanity";
export default defineField({
    name: 'member',
    title: 'Team Member',
    type: 'object',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset' }),
        defineField({
            name: 'altText',
            title: 'Alt Text',
            type: 'string',
            description: 'Alternative text for accessibility'
        })
    ],
    preview: {
        select: {
            name: 'name',
            videoSrc: 'media.assetId'
        },
        prepare({ name, videoSrc }) {
            return {
                title: name || 'Unnamed Member',
                subtitle: videoSrc ? 'Has video' : 'No video'
            }
        }
    }
})