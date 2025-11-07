import { defineType, defineField } from 'sanity'


export default defineType({
    name: 'mediaGalleryItem',
    title: 'Media Gallery Item',
    type: 'object',
    fields: [
        defineField({
            name: 'mediaType',
            title: 'Media Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Image', value: 'image' },
                    { title: 'Video', value: 'video' }
                ]
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'cloudinary.asset',
            hidden: ({ parent }: { parent: any }) => parent?.mediaType !== 'image',
            validation: (Rule) => Rule.custom((image, context: any) => {
                const parent = context.parent;
                if (parent?.mediaType === 'image' && !image) {
                    return 'Image is required when media type is Image';
                }
                return true;
            })
        }),
        defineField({
            name: 'video',
            title: 'Video',
            type: 'cloudinary.asset',
            hidden: ({ parent }: { parent: any }) => parent?.mediaType !== 'video',
            validation: (Rule) => Rule.custom((video, context: any) => {
                const parent = context.parent;
                if (parent?.mediaType === 'video' && !video) {
                    return 'Video is required when media type is Video';
                }
                return true;
            })
        }),
        defineField({
            name: 'alt',
            title: 'Alt Text / Description',
            type: 'string',
            description: 'Alternative text for images or description for videos'
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string'
        })
    ],
    preview: {
        select: {
            mediaType: 'mediaType',
            image: 'image',
            video: 'video',
            alt: 'alt'
        },
        prepare({ mediaType, image, video, alt }) {
            return {
                title: alt || 'Untitled',
                subtitle: mediaType === 'image' ? 'Image' : 'Video',
                media: image || video
            }
        }
    }
})
