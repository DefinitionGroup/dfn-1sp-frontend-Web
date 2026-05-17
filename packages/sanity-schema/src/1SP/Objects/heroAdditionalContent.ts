import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'heroAdditionalContent',
    title: 'Hero Additional Content',
    type: 'object',
    fields: [
        defineField({
            name: 'contentType',
            title: 'Content Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Interactive Carousel', value: 'carousel' },
                    { title: 'Smart Carousel', value: 'smartCarousel' },
                    { title: 'Smart People', value: 'smartPeople' }
                ]
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'carousel',
            title: 'Interactive Carousel',
            type: 'carousel',
            hidden: ({ parent }) => parent?.contentType !== 'carousel',
            validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any;
                if (parent?.contentType === 'carousel' && !value) {
                    return 'Interactive Carousel is required when this content type is selected';
                }
                return true;
            })
        }),
        defineField({
            name: 'smartCarousel',
            title: 'Smart Carousel',
            type: 'smartCarousel',
            hidden: ({ parent }) => parent?.contentType !== 'smartCarousel',
            validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any;
                if (parent?.contentType === 'smartCarousel' && !value) {
                    return 'Smart Carousel is required when this content type is selected';
                }
                return true;
            })
        }),
        defineField({
            name: 'smartPeople',
            title: 'Smart People',
            type: 'smartPeople',
            hidden: ({ parent }) => parent?.contentType !== 'smartPeople',
            validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any;
                if (parent?.contentType === 'smartPeople' && !value) {
                    return 'Smart People is required when this content type is selected';
                }
                return true;
            })
        })
    ],
    preview: {
        select: {
            contentType: 'contentType',
            carouselItemsCount: 'carousel.items',
            smartCarouselMax: 'smartCarousel.maxItems',
            smartPeopleMax: 'smartPeople.maxItems'
        },
        prepare({ contentType, carouselItemsCount, smartCarouselMax, smartPeopleMax }) {
            if (contentType === 'carousel') {
                const count = Array.isArray(carouselItemsCount) ? carouselItemsCount.length : 0;
                return {
                    title: 'Interactive Carousel',
                    subtitle: `${count} item${count === 1 ? '' : 's'}`
                };
            } else if (contentType === 'smartCarousel') {
                return {
                    title: 'Smart Carousel',
                    subtitle: `Max ${smartCarouselMax || 5} items (Auto-populated)`
                };
            } else if (contentType === 'smartPeople') {
                return {
                    title: 'Smart People',
                    subtitle: `Max ${smartPeopleMax || 6} people (Auto-populated)`
                };
            }
            return {
                title: 'Additional Content',
                subtitle: 'Not configured'
            };
        }
    }
})
