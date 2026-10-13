import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCliClient } from 'sanity/cli';
import { X_POST_URL_PATTERN } from '../packages/sanity-schema/src/RENAISSANCE/Documents/xPost';

// Copies hand-picked X posts into `renaissanceXPost` documents. Post data comes
// from X's public embed endpoint (no API key). Existing documents are left
// untouched so editorial changes such as "Hide on website" survive re-runs.
//
//   pnpm import:renaissance-x-posts                       # dry run, scripts/data list
//   RENAISSANCE_X_POSTS_APPLY=1 pnpm import:renaissance-x-posts -- <post URL> …
//   RENAISSANCE_X_POSTS_REFRESH=1 also overwrites the copied post data
const APPLY = process.env.RENAISSANCE_X_POSTS_APPLY === '1';
// Re-reads post data into existing documents, keeping "Hide on website".
const REFRESH = process.env.RENAISSANCE_X_POSTS_REFRESH === '1';
const LIST = 'scripts/data/renaissance-x-posts.json';

type XEntities = { urls?: Array<{ url: string; expanded_url: string }> };
type XMedia = { media_url_https?: string; ext_alt_text?: string; type?: string };
type XTweet = {
  __typename?: string; id_str: string; created_at: string; text: string;
  entities?: XEntities; mediaDetails?: XMedia[];
  in_reply_to_status_id_str?: string; video?: { poster?: string };
  user: { name: string; screen_name: string }; quoted_tweet?: XTweet;
};

const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Visible post text with t.co links expanded and media links removed. */
function postText(tweet: XTweet) {
  // display_text_range offsets are unreliable for quoted posts, so the remaining
  // (media) t.co links are stripped after expanding the real ones instead.
  let text = tweet.text;
  for (const { url, expanded_url } of tweet.entities?.urls ?? []) text = text.split(url).join(expanded_url);
  return decode(text.replace(/\s*https:\/\/t\.co\/\w+/g, '')).trim();
}

function image(tweet: XTweet) {
  const media = tweet.mediaDetails?.[0];
  const url = media?.media_url_https || tweet.video?.poster;
  if (!url) return {};
  const kind = !media || media.type === 'photo' ? 'Image' : 'Video still';
  return { imageUrl: url, imageAlt: media?.ext_alt_text?.trim() || `${kind} from the post by @${tweet.user.screen_name}` };
}

async function fetchTweet(id: string): Promise<XTweet> {
  const response = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=4&lang=en`);
  assert(response.ok, `X embed request failed (${response.status}) for ${id}`);
  const tweet = await response.json() as XTweet;
  assert.equal(tweet.__typename, 'Tweet', `Post ${id} is unavailable (${tweet.__typename ?? 'no data'})`);
  return tweet;
}

type XPostDocument = { _id: string; _type: string; publishedAt: string; text: string; imageUrl?: string; quotedPost?: object; hidden: boolean; [field: string]: unknown };

function toDocument(tweet: XTweet): XPostDocument {
  const quoted = tweet.quoted_tweet;
  const own = image(tweet);
  return {
    _id: `xpost-renaissance-${tweet.id_str}`,
    _type: 'renaissanceXPost',
    channel: 'renaissanceWeb',
    language: 'en',
    postUrl: `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
    publishedAt: new Date(tweet.created_at).toISOString(),
    text: postText(tweet),
    authorName: tweet.user.name,
    authorHandle: tweet.user.screen_name,
    ...own,
    ...(quoted ? {
      quotedPost: {
        authorName: quoted.user.name,
        authorHandle: quoted.user.screen_name,
        text: postText(quoted),
        postUrl: `https://x.com/${quoted.user.screen_name}/status/${quoted.id_str}`,
        ...(image(quoted).imageUrl ? { imageUrl: image(quoted).imageUrl } : {}),
      },
    } : {}),
    hidden: false,
  };
}

async function main() {
  const args = process.argv.slice(2).filter(arg => arg !== '--');
  const urls: string[] = args.length ? args : JSON.parse(readFileSync(LIST, 'utf8'));
  const ids = urls.map(url => {
    const id = /^\d+$/.test(url) ? url : url.match(X_POST_URL_PATTERN)?.[2];
    assert(id, `Not an X post link: ${url}`);
    return id;
  });

  const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({ useCdn: false, perspective: 'raw' });
  if (APPLY) assert(client.config().token, 'Use sanity exec --with-user-token');
  console.log(`${APPLY ? 'Importing' : 'Dry run for'} ${ids.length} posts into ${client.config().dataset}`);

  const transaction = client.transaction();
  for (const id of ids) {
    const tweet = await fetchTweet(id);
    if (tweet.in_reply_to_status_id_str) console.warn(`  ${id} is a reply; importing it as its own post`);
    const doc = toDocument(tweet);
    console.log(`  ${doc.publishedAt.slice(0, 10)} ${doc._id}  ${doc.text.slice(0, 60).replace(/\n/g, ' ')}`);
    transaction.createIfNotExists(doc);
    if (REFRESH) {
      const { _id, _type, hidden, ...data } = doc;
      transaction.patch(_id, patch => patch.set(data).unset(doc.imageUrl ? [] : ['imageUrl', 'imageAlt']).unset(doc.quotedPost ? [] : ['quotedPost']));
    }
  }
  if (!APPLY) return console.log('Set RENAISSANCE_X_POSTS_APPLY=1 to write.');
  await transaction.commit({ visibility: 'sync' });
  console.log(REFRESH ? 'Done. Post data refreshed.' : 'Done. Existing posts were left unchanged.');
}

main().catch(error => { console.error(error); process.exit(1); });
