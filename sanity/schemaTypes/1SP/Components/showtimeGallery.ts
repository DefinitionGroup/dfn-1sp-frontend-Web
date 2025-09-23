import { defineType, defineField } from 'sanity'
import { FiGrid } from 'react-icons/fi'

export default defineType({
    name: 'showtimeGallery',
    title: 'Showtime Gallery',
    type: 'object',
    icon: FiGrid,
    fields: [
        defineField({
            name: 'steps',
            title: 'Gallery Steps',
            type: 'array',
            of: [
                { type: 'galleryHeroStep' },
                { type: 'galleryListStep' },
                { type: 'galleryScrollHighlightStep' },
                { type: 'galleryPeopleStep' },
                { type: 'galleryCardsStep' },
                { type: 'galleryRevealStep' },
                { type: 'galleryOverview' },
            ]
        })
    ],
    preview: {
        select: {
            count: 'steps'
        },
        prepare(selection) {
            const { count } = selection as any;
            const stepCount = Array.isArray(count) ? count.length : (count ? 1 : 0);
            return {
                title: `Gallery items ${stepCount}`,
                media: FiGrid
            };
        }
    }
})
