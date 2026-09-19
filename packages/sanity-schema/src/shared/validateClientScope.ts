import type { ValidationContext } from 'sanity';

/** Validate references against the same draft-aware scope used by the page query. */
export async function validateClientScope(
  references: Array<{ _ref?: string }> | undefined,
  context: ValidationContext,
  channel = typeof context.document?.channel === 'string' ? context.document.channel : '1spWeb',
  language = String(context.document?.language || 'en'),
) {
  const ids = [...new Set((references || []).flatMap(ref => ref?._ref ? [ref._ref.replace(/^drafts\./, '')] : []))];
  if (!ids.length) return true;
  const count = await context.getClient({ apiVersion: '2025-09-16' })
    .withConfig({ perspective: 'drafts', useCdn: false })
    .fetch<number>('count(*[_type == "client" && _id in $ids && $channel in channel && language == $language])', { ids, channel, language });
  return count === ids.length || 'Every selected client must be assigned to this website and language.';
}
