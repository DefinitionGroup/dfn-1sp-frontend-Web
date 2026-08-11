import { defineType, defineField, defineArrayMember } from 'sanity'
import { GlobeHemisphereWest } from '@phosphor-icons/react'
import { isFlzrStyleChannel } from '../../shared/flzrVisibility'

export default defineType({
    name: 'globeComponent',
    title: 'Globe Component',
    type: 'object',
    icon: GlobeHemisphereWest,
    description: 'Display custom locations on an interactive globe',
    groups: [
        { name: 'content', title: 'Content' },
        { name: 'navigation', title: 'Navigation' }
    ],
    fields: [
        defineField({
            name: 'navPointName',
            title: 'Navigation Point Name',
            type: 'string',
            description: 'Optional custom name to display in the vertical navigation minimap. If empty, uses auto-generated ID.',
            group: 'navigation',
        }),
        defineField({
            name: 'hideFromNav',
            title: 'Hide from Navigation',
            type: 'boolean',
            description: 'If enabled, this section will not appear in the vertical navigation minimap.',
            initialValue: false,
            group: 'navigation',
        }),
        defineField({
            name: 'sectionTitle',
            title: 'Section Title',
            type: 'string',
            description: 'The title displayed above the globe. Also used to generate the section ID for navigation.',
            group: 'content',
        }),
        defineField({
            name: 'sectionSubtitle',
            title: 'Section Subheadline',
            type: 'text',
            rows: 2,
            description: 'Optional supporting line displayed below the section title.',
            group: 'content',
        }),
        defineField({
            name: 'locations',
            title: 'Locations',
            type: 'array',
            description: 'Add locations to display on the globe. FLZR-style sites use their shared European market locations instead.',
            hidden: ({ document }) => isFlzrStyleChannel(document?.channel),
            validation: (Rule) => Rule.custom((locations, context) => {
                if (isFlzrStyleChannel(context.document?.channel)) return true
                return Array.isArray(locations) && locations.length > 0
                    ? true
                    : 'Add at least one location'
            }),
            group: 'content',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'location',
                    title: 'Location',
                    fields: [
                        defineField({
                            name: 'name',
                            title: 'Name',
                            type: 'string',
                            description: 'Location name',
                            validation: (Rule) => Rule.required()
                        }),
                        defineField({
                            name: 'subtitle',
                            title: 'Subtitle',
                            type: 'string',
                            description: 'Optional subtitle or additional info'
                        }),
                        defineField({
                            name: 'coordinateLon',
                            title: 'Longitude',
                            type: 'number',
                            description: 'Longitude coordinate (-180 to 180)',
                            validation: (Rule) => Rule.required().min(-180).max(180)
                        }),
                        defineField({
                            name: 'coordinateLat',
                            title: 'Latitude',
                            type: 'number',
                            description: 'Latitude coordinate (-90 to 90)',
                            validation: (Rule) => Rule.required().min(-90).max(90)
                        })
                    ],
                    preview: {
                        select: {
                            title: 'name',
                            subtitle: 'subtitle',
                            lat: 'coordinateLat',
                            lon: 'coordinateLon'
                        },
                        prepare({ title, subtitle, lat, lon }) {
                            return {
                                title: title || 'Unnamed Location',
                                subtitle: subtitle
                                    ? `${subtitle} (${lat?.toFixed(2)}, ${lon?.toFixed(2)})`
                                    : `${lat?.toFixed(2)}, ${lon?.toFixed(2)}`
                            }
                        }
                    }
                })
            ]
        })
    ],
    preview: {
        select: {
            locations: 'locations',
            sectionTitle: 'sectionTitle'
        },
        prepare({ locations, sectionTitle }) {
            const count = locations?.length || 0
            return {
                title: sectionTitle || 'Globe Component',
                subtitle: `${count} location${count !== 1 ? 's' : ''}`
            }
        }
    }
})
