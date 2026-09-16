import { useEffect, useState } from 'react';
import { useClient, useFormValue } from 'sanity';
import { IntentLink } from 'sanity/router';

type Usage = { _id: string; _type: string; title?: string; viaDefault?: boolean };
export default function SharedContentUsage() {
  const id = String(useFormValue(['_id']) || '').replace(/^drafts\./, '');
  const type = useFormValue(['_type']);
  const client = useClient({ apiVersion: '2025-09-16' });
  const [rows, setRows] = useState<Usage[]>([]);
  const [status, setStatus] = useState('Loading usage…');
  useEffect(() => {
    let active = true;
    const field = type === 'renaissanceSharedPortraits' ? 'renaissanceDefaultPortraits' : 'renaissanceDefaultAwards';
    const blockType = type === 'renaissanceSharedPortraits' ? 'renaissancePortraitGrid' : 'renaissanceAwardLogoWall';
    client.fetch(`{
      "direct": *[references($id) && !(_id in path("drafts.**"))]{_id,_type,title},
      "isDefault": count(*[_type == "siteSettings" && channel == "renaissanceWeb" && language == "en" && ${field}._ref == $id && !(_id in path("drafts.**"))]) > 0,
      "pages": *[_type == "page" && channel == "renaissanceWeb" && language == "en" && !(_id in path("drafts.**"))]{_id,_type,title,content[]{_type,sectionRole,"sharedType":sharedContent->content._type}}
    }`, { id }).then(result => {
      if (!active) return;
      const indirect = result.isDefault ? result.pages.filter((page: any) => {
        let people = false, explicit = false;
        for (const block of [...(page.content || []), { _type: 'renaissanceSectionBand' }]) {
          if (block._type === 'renaissanceSectionBand') {
            if (people && !explicit) return true;
            people = block.sectionRole === 'people'; explicit = false;
          } else if (people && (block._type === blockType || block.sharedType === blockType)) explicit = true;
        }
        return false;
      }).map((page: Usage) => ({ ...page, viaDefault: true })) : [];
      setRows([...new Map<string, Usage>([...result.direct, ...indirect].map((row: Usage) => [row._id, row])).values()]);
      setStatus('');
    }).catch(() => { if (active) setStatus('Usage could not be loaded. Reopen this document to retry.'); });
    return () => { active = false; };
  }, [client, id, type]);
  return <div style={{ padding: 12 }}>
    <p>Published references (updates when this document is reopened).</p>
    {status ? <p>{status}</p> : rows.length ? <ul>{rows.map(row => <li key={row._id}>
      <IntentLink intent="edit" params={{ id: row._id, type: row._type }}>{row.title || row._id}</IntentLink>
      {row.viaDefault ? ' — People section default' : ''}
    </li>)}</ul> : <p>No published references yet.</p>}
  </div>;
}
