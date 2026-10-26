import type { ObjectRule, StringRule } from 'sanity';

export const STUDIOCO2_CHANNEL = 'studioco2Web';

/** Block-level validation shared by every Studio CO2 page block. */
export const studioco2PageOnly = (rule: ObjectRule) =>
  rule.custom((_value, context) => context.document?.channel === STUDIOCO2_CHANNEL || 'Use this block on Studio CO2 pages only.');

/** Section anchors the navigation links to, e.g. "work" for /#work. */
export const anchorValidation = (rule: StringRule) =>
  rule.regex(/^[a-z][a-z0-9-]*$/, { name: 'anchor' }).error('Use lowercase letters, numbers and hyphens, starting with a letter.');

/** Multi-line copy is entered one line per row and rendered with line breaks. */
export const LINE_PER_ROW = 'One line per row; line breaks are kept.';
