import {useFormValue, type ObjectInputProps} from 'sanity';
import {hideMsmMetadata} from './metadata-context';
import {msmMetadataPreview, type MsmMetadataDocument} from './metadata-preview';

/** A read-only effective-value preview alongside the existing native field editors. */
export default function MsmMetadataInput(props: ObjectInputProps) {
  const document = useFormValue([]) as MsmMetadataDocument | undefined;
  const key = props.path.find(segment => typeof segment === 'object' && '_key' in segment) as {_key: string} | undefined;
  if (hideMsmMetadata({document, path: props.path})) return props.renderDefault(props);
  const {title, description, socialTitle, socialDescription, imageSource} = msmMetadataPreview(document, key?._key, props.value || {});
  return <>
    <div style={{padding: '16px 0', lineHeight: 1.5}} aria-label="Effective MSM metadata">
      <strong>MSM search &amp; sharing preview</strong>
      <p><b>Search title:</b> {title}</p>
      <p><b>Search description:</b> {description}</p>
      <p><b>Social title:</b> {socialTitle}</p>
      <p><b>Social description:</b> {socialDescription}</p>
      <p><b>Sharing image source:</b> {imageSource}</p>
      <small>Empty social overrides inherit the search fields. Images are delivered as 1200 × 630 stills. The frontend skips invalid image URLs; preview deployments remain noindex.</small>
    </div>
    {props.renderDefault(props)}
  </>;
}
