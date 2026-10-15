// Sanity counts unique field paths plus data types (including object containers).
export function attributeCount(documents: any[]) {
  const attributes = new Set<string>();
  const visit = (value: any, path = '') => {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value === 'number' ? Number.isInteger(value) ? 'integer' : 'float' : typeof value;
    if (path) attributes.add(`${path}:${type}`);
    if (Array.isArray(value)) value.forEach(item => visit(item, `${path}[]`));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => visit(item, path ? `${path}.${key}` : key));
  };
  documents.forEach(document => visit(document));
  return attributes.size;
}
