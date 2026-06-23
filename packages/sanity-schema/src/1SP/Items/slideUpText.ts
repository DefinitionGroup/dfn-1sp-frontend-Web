import { defineType, defineField } from 'sanity'
import { CaretUp } from '@phosphor-icons/react'

export default defineType({
    name: 'slideUpText',
    title: 'Slide Up Text',
    type: 'object',
    icon: CaretUp,
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text' })
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'text'
        },
        prepare({ title, subtitle }) {
            const short = subtitle ? (subtitle.length > 80 ? `${subtitle.slice(0, 77)}...` : subtitle) : ''
            return {
                title: title || 'Untitled slide',
                subtitle: short,
                media: CaretUp
            }
        }
    }
})