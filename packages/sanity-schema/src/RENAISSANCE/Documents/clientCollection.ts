import { defineField, defineType } from 'sanity';
import { validateClientScope } from '../../shared/validateClientScope';

export default defineType({
  name: 'renaissanceClientCollection', title: 'Client logo collection', type: 'document',
  initialValue: { channel: 'renaissanceWeb', language: 'en' },
  fields: [
    defineField({ name: 'title', title: 'Internal name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'channel', type: 'string', hidden: true, readOnly: true, validation: r => r.required().custom(v => v === 'renaissanceWeb' || 'This collection belongs to Renaissance.') }),
    defineField({ name: 'language', type: 'string', readOnly: true, validation: r => r.required().custom(v => v === 'en' || 'Renaissance uses English.') }),
    defineField({ name: 'items', title: 'Clients in display order', type: 'array', of: [{
      name: 'renaissanceClientItem', title: 'Client logo', type: 'object',
      fields: [
        defineField({ name: 'client', title: 'Global client', type: 'reference', to: [{ type: 'client' }],
          options: { filter: '"renaissanceWeb" in channel && language == "en"' }, validation: r => r.required() }),
        defineField({ name: 'logoOverride', title: 'Renaissance artwork', type: 'cloudinary.asset', description: 'Unset uses the global client logo. This artwork is only used in this collection.' }),
        defineField({ name: 'displayName', title: 'Display name override', type: 'string' }),
        defineField({ name: 'altText', title: 'Accessible logo name', type: 'string' }),
      ],
      preview: { select: { override: 'displayName', name: 'client.name' }, prepare: ({ override, name }) => ({ title: override || name || 'Select a client' }) },
    }], validation: r => r.custom((items: Array<{ client?: { _ref?: string } }> | undefined) => {
      const ids = (items || []).flatMap(item => item.client?._ref ? [item.client._ref] : []);
      return new Set(ids).size === ids.length || 'Each client should appear once in a collection.';
    }).custom((items: Array<{ client?: { _ref?: string } }> | undefined, context) => validateClientScope(items?.flatMap(item => item.client ? [item.client] : []), context, 'renaissanceWeb', 'en')) }),
  ],
  preview: { select: { title: 'title' } },
});
