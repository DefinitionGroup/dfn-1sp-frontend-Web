import {useDeferredValue, useEffect, useState} from 'react';
import {Badge, Box, Button, Card, Flex, Label, Select, Spinner, Stack, Text, TextInput} from '@sanity/ui';
import {SquaresFour} from '@phosphor-icons/react';
import {useClient, usePerspective} from 'sanity';
import {IntentLink} from 'sanity/router';
import {usePaneRouter, type UserComponent} from 'sanity/structure';
import {SITE_CONFIGS, WEBSITE_CHANNELS} from '@1sp/site-config';
import {GLOBAL_BROWSER_LANGUAGES, GLOBAL_BROWSER_QUERY, channelLabels, globalBrowserScope, globalCreateTemplate, type GlobalBrowserType} from './globalBrowserModel';

type Item = {_id:string; sourceId?:string; title:string; channel?:string[]; language?:string; hasPublished:boolean; image?:string};
type Result = {total:number; items:Item[]};

const GlobalsBrowser: UserComponent = ({options, childItemId}) => {
  const schemaType = options?.schemaType as GlobalBrowserType;
  const client = useClient({apiVersion:'2025-09-16'});
  const router = usePaneRouter();
  const {selectedPerspectiveName, perspectiveStack} = usePerspective();
  const perspectiveKey = selectedPerspectiveName ? perspectiveStack.join(',') : 'raw';
  const {channel, language} = globalBrowserScope(router.params);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [limit, setLimit] = useState(100);
  const [result, setResult] = useState<Result>({total:0,items:[]});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const template = globalCreateTemplate(schemaType, channel, language);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setLoading(true); setError(undefined);
    const words = deferredSearch.trim().replace(/[*?]/g, '').split(/\s+/).filter(Boolean);
    async function load() {
      try {
        const data = await client.fetch<Result>(GLOBAL_BROWSER_QUERY, {schemaType, channel, language, search:words.length ? words.map(w=>`${w}*`).join(' ') : '', limit}, {perspective:perspectiveKey === 'raw' ? 'raw' : perspectiveKey.split(',')});
        if (active) {setResult(data); setError(undefined);}
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load documents.');
      } finally {if(active) setLoading(false);}
    }
    void load();
    const subscription = client.listen('*[_type == $schemaType]', {schemaType}, {includeResult:false, visibility:'query'}).subscribe({
      next: () => {clearTimeout(timer); timer=setTimeout(()=>void load(),200);},
      error: () => {if(active) setError('Live updates disconnected. Retry to reconnect.');},
    });
    return () => {active=false;clearTimeout(timer);subscription.unsubscribe();};
  }, [client,schemaType,channel,language,deferredSearch,limit,retry,perspectiveKey]);

  function changeScope(key: string, value: string) {
    setLimit(100);
    router.setParams({...router.params,[key]:value});
  }

  return <Stack space={3} padding={3}>
    <Flex gap={2} wrap="wrap">
      <Stack space={2} flex={1} style={{minWidth:140}}>
        <Label size={0}><label htmlFor={`${schemaType}-channel`}>Channel</label></Label>
        <Select id={`${schemaType}-channel`} value={channel} onChange={e=>changeScope('channel',e.currentTarget.value)}>
          <option value="all">All channels</option><option value="unassigned">Unassigned</option>
          {WEBSITE_CHANNELS.map(c=><option key={c} value={c}>{SITE_CONFIGS[c].shortName}</option>)}
        </Select>
      </Stack>
      <Stack space={2} flex={1} style={{minWidth:120}}>
        <Label size={0}><label htmlFor={`${schemaType}-language`}>Language</label></Label>
        <Select id={`${schemaType}-language`} value={language} onChange={e=>changeScope('language',e.currentTarget.value)}>
          {GLOBAL_BROWSER_LANGUAGES.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}
          <option value="all">All languages</option>
        </Select>
      </Stack>
    </Flex>
    <TextInput aria-label="Search documents" placeholder="Search documents…" value={search} onChange={e=>{setSearch(e.currentTarget.value);setLimit(100);}} />
    <Flex align="center" justify="space-between" gap={2}>
      <Text size={1} muted aria-live="polite">{loading ? 'Loading…' : `${result.total} document${result.total===1?'':'s'}`}</Text>
      {template && <Button as={IntentLink} intent="create" params={[{type:schemaType,template:template.template},template.parameters]} text="New document" mode="ghost" fontSize={1} />}
    </Flex>
    {!template && <Text size={1} muted>Choose a supported language to create a document.</Text>}
    {channel === 'unassigned' && <Card padding={3} tone="transparent" radius={2}><Text size={1}>No website assigned. These documents can still have references or published content.</Text></Card>}
    {error ? <Stack space={3}><Text size={1}>{error}</Text><Button text="Retry" onClick={()=>setRetry(v=>v+1)} /></Stack> : loading ? <Box padding={4}><Spinner muted /></Box> : <Stack space={1}>
      {result.items.map(item=>{
        const id=item._id.replace(/^drafts\./,'');
        const draft=(item.sourceId || item._id).startsWith('drafts.');
        const release=(item.sourceId || item._id).startsWith('versions.');
        return <Card as={router.ChildLink} childId={id} key={id} padding={3} radius={2} border selected={childItemId===id} tone="inherit">
          <Flex align="center" gap={3}>
            {schemaType === 'services' ? <Flex align="center" justify="center" aria-hidden="true" style={{width:36,height:36,flexShrink:0}}><SquaresFour size={24} /></Flex> : item.image && !/\/video\//.test(item.image) && <img src={item.image} alt="" loading="lazy" decoding="async" width={36} height={36} style={{objectFit:'contain',flexShrink:0}} />}
            <Stack space={2} flex={1} style={{minWidth:0}}>
              <Text size={1} weight="medium" style={{overflowWrap:'anywhere'}}>{item.title}</Text>
              <Text size={0} muted>{channelLabels(item.channel)}{language==='all'?` · ${(item.language || 'No language').toUpperCase()}`:''}</Text>
              {(draft || release) && <Box><Badge tone="caution" fontSize={0}>{release?'Release version':item.hasPublished?'Unpublished changes':'Draft'}</Badge></Box>}
            </Stack>
          </Flex>
        </Card>;
      })}
      {!result.items.length && <Box padding={4}><Text size={1} muted>No documents match these filters.</Text></Box>}
      {result.items.length < result.total && <Button text={`Load more (${result.items.length} of ${result.total})`} mode="ghost" onClick={()=>setLimit(v=>v+100)} />}
    </Stack>}
  </Stack>;
};

export default GlobalsBrowser;
