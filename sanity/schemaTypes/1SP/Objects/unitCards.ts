import { defineType, defineField } from 'sanity'
import { BsGrid3X3 } from "react-icons/bs";

export default defineType({
    name: 'unitCards',
    title: 'Unit Cards',
    type: 'object',
    icon: BsGrid3X3,
    fields: [
        defineField({
            name: 'units',
            title: 'Units',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'unit' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "unit" && language == $language && isActive == true',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                }
            ],
            description: 'Select units to display as cards'
        }),
        defineField({
            name: 'sortBy',
            title: 'Sort By',
            type: 'string',
            options: {
                list: [
                    { title: 'Manual Order', value: 'manual' },
                    { title: 'Name (A-Z)', value: 'name-asc' },
                    { title: 'Name (Z-A)', value: 'name-desc' },
                    { title: 'Recently Added', value: 'recent' }
                ],
                layout: 'radio'
            },
            initialValue: 'manual',
            description: 'Choose how to sort the unit cards'
        })
    ],
    preview: {
        select: {
            units: 'units',
            sortBy: 'sortBy'
        },
        prepare({ units, sortBy }: { units?: any[]; sortBy?: string }) {
            const count = units?.length ?? 0;
            const sortLabel = sortBy === 'manual' ? 'Manual Order' :
                sortBy === 'name-asc' ? 'Name (A-Z)' :
                    sortBy === 'name-desc' ? 'Name (Z-A)' :
                        sortBy === 'recent' ? 'Recently Added' : 'Manual';

            return {
                title: count ? `${count} unit${count > 1 ? 's' : ''}` : 'No units selected',
                subtitle: `Sort: ${sortLabel}`
            }
        }
    }
})
