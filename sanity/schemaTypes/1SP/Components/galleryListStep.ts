import { defineType, defineField, defineArrayMember } from 'sanity'
import { FiList } from 'react-icons/fi'

export default defineType({
    name: 'galleryListStep',
    title: 'Gallery List Step',
    type: 'object',
    icon: FiList,
    groups: [
        { name: 'badge', title: 'Badge' },
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' },
        { name: 'navigation', title: 'Navigation' }
    ],
    fields: [
        defineField({
            name: 'navPointName',
            title: 'Navigation Point Name',
            type: 'string',
            description: 'Optional custom name to display in the vertical navigation minimap.',
            group: 'navigation'
        }),
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule', group: 'badge' }),
        defineField({
            name: 'showBadgeMiniCta',
            title: 'Show Badge CTA mini',
            type: 'boolean',
            initialValue: false,
            description: 'Enable to display a CTA mini component beneath the badge.',
            group: 'badge',
        }),
        defineField({
            name: 'badgeMiniCta',
            title: 'Badge CTA mini',
            type: 'ctaMiniComponent',
            description: 'Optional CTA mini component that renders under the badge.',
            group: 'badge',
            hidden: ({ parent }) => !parent?.showBadgeMiniCta,
        }),

        // Staggered slide up toggle
        defineField({
            name: 'staggeredSlideUp',
            title: 'Staggered Slide Up',
            type: 'boolean',
            description: 'When enabled, uses the Staggered header and hides the regular header',
            group: 'content',
            initialValue: false
        }),

        // Regular header (hidden when staggeredSlideUp is true)
        defineField({
            name: 'header',
            title: 'Header Section',
            type: 'listStepHeader',
            group: 'content',
            hidden: ({ parent }) => Boolean(parent?.staggeredSlideUp)
        }),

        // Staggered header shown only when staggeredSlideUp is true
        defineField({
            name: 'staggeredHeader',
            title: 'Staggered Header',
            type: 'staggeredHeader',
            group: 'content',
            hidden: ({ parent }) => !Boolean(parent?.staggeredSlideUp)
        }),

        defineField({
            name: 'listItems',
            title: 'List Items',
            type: 'array',
            group: 'content',
            of: [
                { type: 'listItem' }
            ]
        }),

        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset', group: 'media' }),
        defineField({ name: 'grid', title: 'Grid Element', type: 'gridElement', group: 'media' }),

        defineField({
            name: "additionalContent",
            title: "Additional Content",
            description: "Composable items that render after the paragraphs.",
            type: "array",
            group: "content",
            of: [
                defineArrayMember({ type: "cta" }),
                defineArrayMember({ type: "cards" }),
                defineArrayMember({ type: "unitCards" }),
                defineArrayMember({ type: "ctaMiniComponent" }),
                defineArrayMember({ type: "ctaSplitHeader" })
            ],
            validation: (Rule) => Rule.max(1).error('You can add up to 1 additional content item only.')
        }),
    ],
    preview: {
        select: { headline: 'header.mainHeadline', badgeText: 'badge.text', itemCount: 'listItems' },
        prepare({ headline, badgeText, itemCount }) {
            const count = Array.isArray(itemCount) ? itemCount.length : 0
            return {
                title: headline || 'List Step',
                subtitle: `${badgeText || 'No badge'} • ${count} items`
            }
        }
    }
})
