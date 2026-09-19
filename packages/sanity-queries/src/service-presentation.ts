/** Website overrides preserve shared service identities and other channels' copy. */
export function servicePresentationFields(channel = '$channel') {
  const edition = `siteContent[channel == ${channel}][0]`;
  const background = `select(${edition}.mediaMode == "custom" => ${edition}.serviceBackground, serviceBackground)`;
  const icon = `select(${edition}.mediaMode == "custom" => ${edition}.serviceicon, serviceicon)`;
  return `
    "name": coalesce(${edition}.name, name),
    "taglabel": coalesce(${edition}.taglabel, taglabel),
    "introText": coalesce(${edition}.introText, introText),
    "serviceDescription": coalesce(${edition}.serviceDescription, serviceDescription),
    "deliverables": coalesce(${edition}.deliverables, deliverables),
    "sortOrder": coalesce(${edition}.sortOrder, sortOrder),
    "serviceBackground": ${background},
    "serviceicon": ${icon},
    "iconUrl": (${icon}).asset.secure_url,
    "backgroundAsset": (${background}).asset
  `;
}

export const SERVICE_REFERENCE_PROJECTION = `
  "serviceConfigured": defined(service._ref),
  "service": service->{
    $channel in channel && language == $language => {_id, ${servicePresentationFields()}}
  }
`;
