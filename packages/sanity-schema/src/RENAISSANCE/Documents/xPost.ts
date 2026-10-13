import { defineField, defineType } from 'sanity';

// Editors copy posts from https://x.com/RenaissancePRUK by hand; nothing here
// calls the X API. The newest visible post feeds the homepage news banner.
export const X_POST_URL_PATTERN = /^https:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)\/?$/;

export default defineType({
  name: 'renaissanceXPost', title: 'X post', type: 'document',
  initialValue: { channel: 'renaissanceWeb', language: 'en', authorName: 'Renaissance PR', authorHandle: 'RenaissancePRUK' },
  orderings: [{ title: 'Newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  fields: [
    defineField({ name: 'channel', type: 'string', hidden: true, readOnly: true, validation: r => r.required().custom(v => v === 'renaissanceWeb' || 'X posts belong to Renaissance.') }),
    defineField({ name: 'language', type: 'string', readOnly: true, validation: r => r.required().custom(v => v === 'en' || 'Renaissance uses English.') }),
    defineField({
      name: 'postUrl', title: 'Post URL', type: 'url',
      description: 'Copy the link from the post on x.com, e.g. https://x.com/RenaissancePRUK/status/123…',
      validation: r => r.required().uri({ scheme: ['https'] })
        .custom(v => !v || X_POST_URL_PATTERN.test(v) || 'Use a post link like https://x.com/RenaissancePRUK/status/123.')
        .custom(async (v, context) => {
          if (!v) return true;
          const id = context.document?._id.replace(/^drafts\./, '');
          const count = await context.getClient({ apiVersion: '2025-09-16' }).fetch<number>(
            'count(*[_type == "renaissanceXPost" && postUrl == $url && !(_id in [$id, "drafts." + $id])])', { url: v, id });
          return count === 0 || 'This post is already in the list.';
        }),
    }),
    defineField({ name: 'publishedAt', title: 'Posted at', type: 'datetime', description: 'Date and time shown on the post. Sets the order; the newest post appears on the homepage.', validation: r => r.required() }),
    defineField({ name: 'text', title: 'Post text', type: 'text', rows: 6, description: 'Paste the post text. Use full links instead of t.co short links.', validation: r => r.required().max(4000) }),
    defineField({ name: 'authorName', title: 'Author name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'authorHandle', title: 'Author handle', type: 'string', description: 'Without @.', validation: r => r.required().regex(/^[A-Za-z0-9_]{1,15}$/, { name: 'X handle' }) }),
    defineField({ name: 'imageUrl', title: 'Image URL', type: 'url', description: 'Optional. Direct link to the post image (pbs.twimg.com).', validation: r => r.uri({ scheme: ['https'] }) }),
    defineField({ name: 'imageAlt', title: 'Image description', type: 'string', hidden: ({ parent }) => !parent?.imageUrl, validation: r => r.custom((v, context) => !(context.parent as { imageUrl?: string })?.imageUrl || !!v?.trim() || 'Describe the image.') }),
    defineField({
      name: 'quotedPost', title: 'Quoted post', type: 'object', description: 'Fill in when this post quotes another post.', options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'authorName', title: 'Author name', type: 'string' }),
        defineField({ name: 'authorHandle', title: 'Author handle', type: 'string', description: 'Without @.' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }),
        defineField({ name: 'postUrl', title: 'Post URL', type: 'url', validation: r => r.custom(v => !v || X_POST_URL_PATTERN.test(v) || 'Use a post link like https://x.com/handle/status/123.') }),
        defineField({ name: 'imageUrl', title: 'Image URL', type: 'url' }),
      ],
    }),
    defineField({ name: 'hidden', title: 'Hide on website', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { text: 'text', publishedAt: 'publishedAt', hidden: 'hidden' },
    prepare: ({ text, publishedAt, hidden }) => ({
      title: text ? (text.length > 80 ? `${text.slice(0, 80)}…` : text) : 'X post',
      subtitle: [publishedAt ? new Date(publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date', hidden ? 'Hidden' : null].filter(Boolean).join(' · '),
    }),
  },
});
