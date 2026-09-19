import { useState } from 'react';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { type ObjectInputProps, PatchEvent, set, unset, useFormValue } from 'sanity';

const COPY_FIELDS = ['title', 'description', 'subtitle', 'mainImage', 'mainVideo', 'isVerticalVideo', 'seo', 'discovery', 'casesPageBuilder'] as const;

export function copyCaseContent(document: Record<string, unknown>) {
  const copied = Object.fromEntries(COPY_FIELDS.filter(key => document[key] !== undefined).map(key => [key, structuredClone(document[key])]));
  if (!document.description) copied.hideDescription = true;
  if (!document.subtitle) copied.hideSubtitle = true;
  return copied;
}

export default function CaseEditionInput(props: ObjectInputProps) {
  const document = useFormValue([]) as Record<string, unknown>;
  const [pending, setPending] = useState<'copy' | 'reset' | null>(null);

  function apply() {
    if (props.readOnly) return;
    const patches = [...COPY_FIELDS, 'hideDescription', 'hideSubtitle'].map<ReturnType<typeof set> | ReturnType<typeof unset>>(key => unset([key]));
    if (pending === 'copy') {
      for (const [key, value] of Object.entries(copyCaseContent(document))) patches.push(set(value, [key]));
      patches.push(set('custom', ['bodyMode']), set('custom', ['mediaMode']));
    } else {
      patches.push(set('inherit', ['bodyMode']), set('inherit', ['mediaMode']));
    }
    props.onChange(PatchEvent.from(patches));
    setPending(null);
  }

  return <Stack space={4}>
    <Card padding={3} border radius={2}>
      <Stack space={3}>
        <Text size={1}>Unset text overrides use shared content. Custom media and body replace the complete shared selection. Publishing saves all editions in this document.</Text>
        <Flex gap={2} wrap="wrap">
          <Button text="Start from shared content" mode="ghost" disabled={props.readOnly} onClick={() => setPending('copy')} />
          <Button text="Use shared content" mode="ghost" disabled={props.readOnly} onClick={() => setPending('reset')} />
        </Flex>
        {pending && <Stack space={3}>
          <Text size={1}>{pending === 'copy' ? 'Replace this edition with a snapshot of the current shared content? Later shared edits will not synchronise.' : 'Remove this edition’s custom text, media and body and inherit shared content again?'}</Text>
          <Flex gap={2}><Button text="Confirm" tone="primary" disabled={props.readOnly} onClick={apply} /><Button text="Cancel" mode="bleed" onClick={() => setPending(null)} /></Flex>
        </Stack>}
      </Stack>
    </Card>
    {props.renderDefault(props)}
  </Stack>;
}
