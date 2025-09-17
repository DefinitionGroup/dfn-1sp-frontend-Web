import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryPeopleStep',
    title: 'Gallery People Step',
    type: 'object',
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule' }),
        defineField({
            name: 'header',
            title: 'Header Section',
            type: 'object',
            fields: [
                { name: 'superText', title: 'Super Text', type: 'string' },
                { name: 'mainHeadline', title: 'Main Headline', type: 'string' },
                { name: 'creativityTitle', title: 'Creativity Title', type: 'string' },
                { name: 'uniquePeopleText', title: 'Unique People Text', type: 'string' }
            ]
        }),
        defineField({
            name: 'description',
            title: 'Description Text',
            type: 'text',
            rows: 3
        }),
        defineField({
            name: 'teamMembers',
            title: 'Team Members',
            type: 'array',
            of: [
                { type: 'member' },
            ]
        }),
        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset' }),
    ],
    preview: {
        select: {
            headline: 'header.mainHeadline',
            badgeText: 'badge.text',
            memberCount: 'teamMembers'
        },
        prepare({ headline, badgeText, memberCount }) {
            const count = Array.isArray(memberCount) ? memberCount.length : 0;
            return {
                title: headline || 'People Step',
                subtitle: `${badgeText || 'No badge'} • ${count} members`
            }
        }
    }
})