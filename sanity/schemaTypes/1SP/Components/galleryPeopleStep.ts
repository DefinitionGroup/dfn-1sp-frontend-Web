import { defineType, defineField } from 'sanity'
import { FiUsers } from 'react-icons/fi'

export default defineType({
    name: 'galleryPeopleStep',
    title: 'Gallery People Step',
    type: 'object',
    icon: FiUsers,
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
        defineField({
            name: 'hideFromNav',
            title: 'Hide from Navigation',
            type: 'boolean',
            description: 'If enabled, this section will not appear in the vertical navigation minimap.',
            initialValue: false,
            group: 'navigation'
        }),
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule', group: 'badge' }),
        defineField({
            name: 'showBadgeMiniCta',
            title: 'Show Badge CTA mini',
            type: 'boolean',
            initialValue: false,
            description: 'Enable to display a CTA mini component beneath the badge.',
            group: 'badge'
        }),
        defineField({
            name: 'badgeMiniCta',
            title: 'Badge CTA mini',
            type: 'ctaMiniComponent',
            description: 'Optional CTA mini component that renders under the badge.',
            group: 'badge',
            hidden: ({ parent }) => !parent?.showBadgeMiniCta
        }),
        defineField({
            name: 'header',
            title: 'Header Section',
            type: 'peopleStepHeader',
            group: 'content'
        }),
        defineField({
            name: 'description',
            title: 'Description Text',
            type: 'text',
            rows: 3,
            group: 'content'
        }),
        defineField({
            name: 'teamMembers',
            title: 'Team Members',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'person' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            // Get both language and channel from the parent page/document
                            const currentLanguage = document?.language || 'de';
                            const currentChannel = document?.channel || '1spWeb';
                            return {
                                filter: '_type == "person" && language == $language && $channel in channel',
                                params: {
                                    language: currentLanguage,
                                    channel: currentChannel
                                }
                            };
                        }
                    }
                }
            ],
            group: 'content'
        }),
        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset', group: 'media' }),
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
