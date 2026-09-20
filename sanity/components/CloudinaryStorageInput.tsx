'use client';

import {PatchEvent, type FormPatch, type InputProps} from 'sanity';
import {CLOUDINARY_BOOKKEEPING_FIELDS, compactCloudinaryStorage} from '../../packages/utils/src/cloudinary-storage';

/** Handles both the plugin's asset replacement and its multi-asset insert patches. */
export function compactCloudinaryPatches(patches: FormPatch[], assetInput: boolean): FormPatch[] {
  return patches.flatMap<FormPatch>(patch => {
    const field = patch.path[0];
    if (assetInput && typeof field === 'string' &&
      CLOUDINARY_BOOKKEEPING_FIELDS.some(key => key === field) && patch.type !== 'unset') return [];
    if (patch.type === 'set' || patch.type === 'setIfMissing') {
      return [{...patch, value: compactCloudinaryStorage(patch.value, assetInput && patch.path.length === 0)}];
    }
    if (patch.type === 'insert') return [{...patch, items: compactCloudinaryStorage(patch.items)}];
    return [patch];
  });
}

export function CloudinaryStorageInput(props: InputProps) {
  return props.renderDefault({
    ...props,
    onChange: change => {
      const patches = compactCloudinaryPatches(PatchEvent.from(change).patches, props.schemaType.name === 'cloudinary.asset');
      if (patches.length) props.onChange(PatchEvent.from(patches));
    },
  });
}
