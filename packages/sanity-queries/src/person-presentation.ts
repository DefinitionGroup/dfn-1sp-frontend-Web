/** A person's portrait for one website: the website image, else the shared one. */
const websitePhoto = (channel: string) => `siteContent[channel == ${channel}][0].image`;

/** On MSM, an MSM-only photo replaces the shared (1SP) video. */
export const msmPhotoWins = (channel = '$channel') =>
  `${channel} == "msmWeb" && defined(${websitePhoto(channel)})`;

/** Person media for every website. MSM order: MSM photo, shared video, shared
 * image. Other websites keep the shared video ahead of their image. */
export function personMediaFields(channel = '$channel') {
  return `
    "image": coalesce(${websitePhoto(channel)}, image),
    "video": select(${msmPhotoWins(channel)} => null, video)`;
}
