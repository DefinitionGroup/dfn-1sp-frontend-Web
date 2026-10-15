import {useEffect, useId, useState} from 'react';
import {Box, Button, Card, Checkbox, Flex, Stack, Text} from '@sanity/ui';
import {type ObjectInputProps, useClient, useDocumentPairPermissions, usePerspective} from 'sanity';
import {IntentLink} from 'sanity/router';
import {canAssignCase, fetchAssignments, saveAssignments, unitAssignments,
  type AssignmentSnapshot, type UnitAssignment} from './msmUnitAssignments';

function UnitRow({unit, checked, disabled, onChange}: {
  unit: UnitAssignment; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void;
}) {
  const id = useId();
  const [permission, loadingPermission] = useDocumentPairPermissions({id: unit.id, type: 'msmUnit', permission: 'update'});
  const inactive = unit.document.isActive === false;
  const status = checked !== unit.assigned
    ? checked ? 'Unsaved addition' : 'Unsaved removal'
    : unit.assigned !== unit.publishedAssigned
    ? unit.assigned ? 'Addition awaiting unit publication' : 'Removal awaiting unit publication'
    : unit.publishedAssigned ? 'Published assignment' : 'Not assigned';
  return <Card paddingY={3} borderBottom>
    <Flex gap={3} align="flex-start">
      <Checkbox id={id} checked={checked} disabled={disabled || loadingPermission || !permission?.granted || (inactive && !unit.assigned)}
        onChange={event => onChange(event.currentTarget.checked)} />
      <Stack space={3} flex={1}>
        <Text size={1} weight="semibold"><label htmlFor={id}>{unit.document.name || unit.id}{inactive ? ' (inactive)' : ''}</label></Text>
        <Text size={1} muted>{status}{!unit.published ? ' · Unit not published' : ''}</Text>
        {!loadingPermission && !permission?.granted && <Text size={1} muted>You do not have permission to edit this unit.</Text>}
        <Text size={1}><IntentLink intent="edit" params={{id: unit.id, type: 'msmUnit'}}>Open unit to review and publish</IntentLink></Text>
      </Stack>
    </Flex>
  </Card>;
}

function AssignmentPanel({caseId, language, readOnly}: {caseId: string; language: string; readOnly: boolean}) {
  const client = useClient({apiVersion: '2025-09-16'});
  const [snapshot, setSnapshot] = useState<AssignmentSnapshot | null>(null);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [needsReload, setNeedsReload] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAssignments(client, caseId).then(data => {
      if (!cancelled) {setSnapshot(data); setChoices({}); setNeedsReload(false);}
    }).catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load unit assignments.');
    }).finally(() => {if (!cancelled) setLoading(false);});
    return () => {cancelled = true;};
  }, [client, caseId, reload]);

  const units = snapshot ? unitAssignments(snapshot.units, caseId, language) : [];
  const dirty = units.some(unit => (choices[unit.id] ?? unit.assigned) !== unit.assigned);
  const eligible = snapshot && canAssignCase(snapshot.case, caseId, language);
  const disabled = readOnly || loading || saving || !eligible || needsReload;

  async function save() {
    if (disabled || !dirty) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const saved = await saveAssignments(client, caseId, language, units, choices);
      setMessage(`Saved ${saved.length} unit draft${saved.length === 1 ? '' : 's'}. Review and publish each affected unit to update the website. Publishing this case does not publish the units.`);
      setNeedsReload(true);
      try {
        const data = await fetchAssignments(client, caseId);
        setSnapshot(data); setChoices({}); setNeedsReload(false);
      } catch {
        setError('The unit drafts were saved, but their status could not be refreshed. Reload assignments before editing again.');
      }
    } catch (cause) {
      setNeedsReload(true);
      setError(`${cause instanceof Error ? cause.message : 'Could not save unit assignments.'} Reload assignments to check the current state before retrying.`);
    } finally {setSaving(false);}
  }

  return <Card border padding={4}>
    <Stack space={4}>
      <Text size={2} weight="semibold">MSM Unit assignments</Text>
      <Text size={1}>Select all units involved in this case. Assignments are saved on the units, separately from this case.</Text>
      <Text size={1} muted>Save unit drafts, then open the affected units to review and publish. Publishing a unit includes its other pending changes.</Text>
      {readOnly && <Text size={1} muted>Assignments are read-only here. Open the regular editable case draft to make changes.</Text>}
      {loading && <Text size={1} role="status">Loading unit assignments…</Text>}
      {!loading && snapshot && !eligible && <Text size={1}>Publish this case with its MSM channel and language before assigning units.</Text>}
      {!loading && snapshot && units.length === 0 && <Text size={1}>No MSM units exist in this case’s language.</Text>}
      {!loading && units.map(unit => <UnitRow key={unit.id} unit={unit} checked={choices[unit.id] ?? unit.assigned}
        disabled={Boolean(disabled)} onChange={checked => {setChoices(previous => ({...previous, [unit.id]: checked})); setMessage('');}} />)}
      {error && <Card padding={3} tone="critical"><Text size={1} role="alert">{error}</Text></Card>}
      {message && <Card padding={3} tone="positive"><Text size={1} role="status">{message}</Text></Card>}
      {dirty && <Text size={1} muted>Unsaved selections — save before leaving this case, or reload to discard them.</Text>}
      <Flex gap={3} wrap="wrap">
        <Button text={saving ? 'Saving unit drafts…' : 'Save unit drafts'} tone="primary" disabled={Boolean(disabled) || !dirty} onClick={save} />
        <Button text={dirty ? 'Discard selections and reload' : 'Reload assignments'} mode="ghost" disabled={loading || saving}
          onClick={() => {setLoading(true); setError(''); setMessage(''); setReload(value => value + 1);}} />
      </Flex>
    </Stack>
  </Card>;
}

/** A document input adds no stored case fields or second relationship list. */
export default function MsmUnitAssignmentsInput(props: ObjectInputProps) {
  const {selectedReleaseId} = usePerspective();
  const document = props.value;
  const channels = document?.channel as string[] | undefined;
  const id = typeof document?._id === 'string' ? document._id : '';
  const language = typeof document?.language === 'string' ? document.language : '';
  const release = Boolean(selectedReleaseId) || id.startsWith('versions.');
  return <Stack space={5}>
    {channels?.includes('msmWeb') && id && language && !release && <AssignmentPanel
      key={`${id.replace(/^drafts\./, '')}:${language}`} caseId={id.replace(/^drafts\./, '')} language={language} readOnly={Boolean(props.readOnly)} />}
    {channels?.includes('msmWeb') && release && <Box padding={3}><Text size={1}>Manage MSM Unit assignments from the regular case draft, outside a Content Release.</Text></Box>}
    {props.renderDefault(props)}
  </Stack>;
}
