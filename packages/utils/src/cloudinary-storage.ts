/** Provider bookkeeping is useful in Cloudinary, but not in each CMS placement. */
export const CLOUDINARY_BOOKKEEPING_FIELDS = [
  'created_by', 'uploaded_by', 'folder_id', 'asset_folder',
  '_version', 'bytes', 'created_at', 'access_mode', 'access_control',
] as const;
const bookkeeping = new Set<string>(CLOUDINARY_BOOKKEEPING_FIELDS);

/** Keep meaningful access restrictions and unknown future plugin versions. */
export function omitCloudinaryField(key: string, value: unknown): boolean {
  if (key === 'access_mode') return value === 'public';
  if (key === 'access_control') return Array.isArray(value) && value.length === 0;
  if (key === '_version') return value === 1;
  return bookkeeping.has(key);
}

/** Preserve every other field, including custom metadata, tags and focal points. */
export function compactCloudinaryStorage<T>(value: T, assetRoot = false): T {
  if (Array.isArray(value)) return value.map(item => compactCloudinaryStorage(item)) as T;
  if (!value || typeof value !== 'object') return value;
  const object = value as Record<string, unknown>;
  const isAsset = assetRoot || object._type === 'cloudinary.asset';
  return Object.fromEntries(Object.entries(object)
    .filter(([key, item]) => !isAsset || !omitCloudinaryField(key, item))
    .map(([key, item]) => [key, compactCloudinaryStorage(item)])) as T;
}

/** Revision-guarded migrations can safely address array positions from a snapshot. */
export function cloudinaryBookkeepingPaths(value: unknown): string[] {
  const paths: string[] = [];
  function visit(item: unknown, path: string) {
    if (Array.isArray(item)) {
      item.forEach((child, index) => visit(child, `${path}[${index}]`));
    } else if (item && typeof item === 'object') {
      const object = item as Record<string, unknown>;
      for (const [key, child] of Object.entries(object)) {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          throw new Error(`Unsupported field name in media cleanup: ${key}`);
        }
        const childPath = path ? `${path}.${key}` : key;
        if (object._type === 'cloudinary.asset' && omitCloudinaryField(key, child)) paths.push(childPath);
        else visit(child, childPath);
      }
    }
  }
  visit(value, '');
  return paths;
}
