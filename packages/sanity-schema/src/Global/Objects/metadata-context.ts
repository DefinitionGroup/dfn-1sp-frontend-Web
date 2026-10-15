type MetadataDocument = {_type?: string; channel?: unknown; siteContent?: {_key?: string; channel?: string}[]};
export function hideMsmMetadata({document, path}: {document?: MetadataDocument; path?: unknown[]}) {
  const key = path?.find(segment => typeof segment === 'object' && segment !== null && '_key' in segment) as {_key: string} | undefined;
  if (key && document?.siteContent) return document.siteContent.find(edition => edition._key === key._key)?.channel !== 'msmWeb';
  return document?._type !== 'msmUnit' && document?.channel !== 'msmWeb' && !(Array.isArray(document?.channel) && document.channel.includes('msmWeb'));
}
