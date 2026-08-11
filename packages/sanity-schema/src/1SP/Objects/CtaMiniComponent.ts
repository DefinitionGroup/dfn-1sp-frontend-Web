import { defineType, defineField } from 'sanity'
import { ArrowRightIcon } from '@sanity/icons'

export default defineType({
    name: 'ctaMiniComponent',
    title: 'CTA mini Component',
    type: 'object',
    fields: [
        defineField({
            name: 'heading',
            title: 'Heading',
            type: 'string',
        }),
        defineField({
            name: 'paragraph',
            title: 'Paragraph',
            type: 'string',
        }),
        defineField({
            name: 'buttonText',
            title: 'Button Text',
            type: 'string',
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'link', // your existing link type (internal/external)
        }),
        defineField({
            name: 'variant',
            title: 'Variant',
            type: 'string',
            description: 'Maps directly to Button2 variants',
            initialValue: 'glass',
            options: {
                list: [
                    { title: 'Glass', value: 'glass' },
                    { title: 'Violet', value: 'violet' },
                    { title: 'Violet (Small)', value: 'violetsmall' },
                    { title: 'Black', value: 'black' },
                    { title: 'Animated Strands', value: 'strands' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'alignment',
            title: 'Alignment',
            type: 'string',
            description: 'Maps directly to CtaMiniComponent alignment',
            initialValue: 'default',
            options: {
                list: [
                    { title: 'Left', value: 'left' },
                    { title: 'Right', value: 'right' },
                    { title: 'Center', value: 'center' },
                ],
                layout: 'radio',
            },
        }),
    ],
    preview: {
        select: {
            heading: 'heading',
            buttonText: 'buttonText',
            linkType: 'link.linkType',
            pageTitle: 'link.page.title',
            url: 'link.externalUrl',
            variant: 'variant',
        },
        prepare({ heading, buttonText, linkType, pageTitle, url, variant }) {
            const dest = linkType === 'internal' ? (pageTitle ?? 'Page') : (url ?? 'URL')
            const title = heading ?? 'CTA mini'
            const subtitleParts = [buttonText, dest, variant].filter(Boolean)
            const subtitle = subtitleParts.join(' • ')
            return {
                title,
                subtitle,
                media: ArrowRightIcon,
            }
        },
    },
})
