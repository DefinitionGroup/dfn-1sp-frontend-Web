import { defineType, defineField } from 'sanity'
import { Globe } from '@phosphor-icons/react'

export default defineType({
    name: 'smartUnitsGlobe',
    title: 'Smart Units Globe',
    type: 'object',
    icon: Globe,
    description: 'Displays units on an interactive 3D globe using their coordinates',
    groups: [
        { name: 'content', title: 'Content' },
        { name: 'appearance', title: 'Appearance' },
        { name: 'behavior', title: 'Behavior' }
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Main heading text',
            initialValue: 'We are global.',
            validation: (Rule) => Rule.required(),
            group: 'content'
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
            description: 'Subtitle/description text',
            initialValue: 'You will find us connecting businesses and people across the world.',
            validation: (Rule) => Rule.required(),
            group: 'content'
        }),
        defineField({
            name: 'pointSize',
            title: 'Point Size',
            type: 'number',
            description: 'Size of the location markers on the globe',
            initialValue: 1,
            validation: (Rule) => Rule.required().min(0.1).max(10),
            group: 'appearance'
        }),
        defineField({
            name: 'globeColor',
            title: 'Globe Color',
            type: 'string',
            description: 'Base color of the globe (hex format)',
            initialValue: '#fdfdfd',
            validation: (Rule) => Rule.required(),
            group: 'appearance'
        }),
        defineField({
            name: 'arcTime',
            title: 'Arc Animation Time',
            type: 'number',
            description: 'Duration of arc animations in milliseconds',
            initialValue: 1555,
            validation: (Rule) => Rule.required().min(100).max(10000),
            group: 'appearance'
        }),
        defineField({
            name: 'arcLength',
            title: 'Arc Length',
            type: 'number',
            description: 'Length of connecting arcs (0-1)',
            initialValue: 0.95,
            validation: (Rule) => Rule.required().min(0).max(1),
            group: 'appearance'
        }),
        defineField({
            name: 'rings',
            title: 'Rings',
            type: 'number',
            description: 'Number of rings to display',
            initialValue: 1,
            validation: (Rule) => Rule.required().min(0).max(10),
            group: 'appearance'
        }),
        defineField({
            name: 'maxRings',
            title: 'Max Rings',
            type: 'number',
            description: 'Maximum number of rings',
            initialValue: 3,
            validation: (Rule) => Rule.required().min(1).max(20),
            group: 'appearance'
        }),
        defineField({
            name: 'initialLat',
            title: 'Initial Latitude',
            type: 'number',
            description: 'Starting latitude for camera position',
            initialValue: 30.3193,
            validation: (Rule) => Rule.required().min(-90).max(90),
            group: 'behavior'
        }),
        defineField({
            name: 'initialLng',
            title: 'Initial Longitude',
            type: 'number',
            description: 'Starting longitude for camera position',
            initialValue: 2.1694,
            validation: (Rule) => Rule.required().min(-180).max(180),
            group: 'behavior'
        }),
        defineField({
            name: 'autoRotate',
            title: 'Auto Rotate',
            type: 'boolean',
            description: 'Enable automatic globe rotation',
            initialValue: true,
            group: 'behavior'
        }),
        defineField({
            name: 'autoRotateSpeed',
            title: 'Auto Rotate Speed',
            type: 'number',
            description: 'Speed of automatic rotation',
            initialValue: 0.15,
            validation: (Rule) => Rule.min(0).max(5),
            hidden: ({ parent }) => !parent?.autoRotate,
            group: 'behavior'
        })
    ],
    preview: {
        select: {
            autoRotate: 'autoRotate',
            initialLat: 'initialLat',
            initialLng: 'initialLng'
        },
        prepare({ autoRotate, initialLat, initialLng }) {
            return {
                title: 'Smart Units Globe',
                subtitle: `Center: ${initialLat?.toFixed(2)}°, ${initialLng?.toFixed(2)}° • ${autoRotate ? 'Auto-rotating' : 'Static'}`,
                media: Globe
            }
        }
    }
})
