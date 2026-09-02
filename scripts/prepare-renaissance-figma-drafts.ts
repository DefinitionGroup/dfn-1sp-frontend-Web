import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";

const CHANNEL = "renaissanceWeb";
const LANGUAGE = "en";
const HOMEPAGE_ID = "page-renaissance-home-en";
const CONTACT_ID = "page-renaissance-contact-en";
const APPLY = process.argv.includes("--apply");
const backupArg = process.argv.find((argument) => argument.startsWith("--backup="));

type SanityDocument = Record<string, any> & {
  _id: string;
  _type: string;
  _rev?: string;
  content?: Array<Record<string, any>>;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function marker(
  key: string,
  sectionRole: string,
  badgeLabel: string,
) {
  return {
    _key: key,
    _type: "renaissanceSectionBand",
    mode: "section",
    sectionRole,
    badgeLabel,
  };
}

function portableText(key: string, text: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function verifyBackup(path?: string) {
  assert(path, "--apply requires --backup=/path/to/sanity-export.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], {
    encoding: "utf8",
  });
  assert(
    entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")),
    "Backup archive has no data.ndjson entry.",
  );
  return absolutePath;
}

function cleanDocument(document: SanityDocument, id: string) {
  const copy = structuredClone(document);
  delete copy._rev;
  delete copy._createdAt;
  delete copy._updatedAt;
  copy._id = id;
  return copy;
}

function findBlock(content: Array<Record<string, any>>, key: string) {
  const block = content.find((candidate) => candidate._key === key);
  assert(block, `Required homepage block is missing: ${key}`);
  return structuredClone(block);
}

function prepareHomepage(source: SanityDocument) {
  const sourceContent = source.content ?? [];
  const hero = findBlock(sourceContent, "renaissance-home-hero");
  const storiesIntro = findBlock(sourceContent, "renaissance-stories-intro");
  const stories = findBlock(sourceContent, "renaissance-stories");
  const logos = findBlock(sourceContent, "renaissance-client-logos");
  const servicesIntro = findBlock(sourceContent, "renaissance-services-intro");
  const services = findBlock(sourceContent, "renaissance-services");
  const peopleIntro = findBlock(sourceContent, "renaissance-people-intro");
  const origins = findBlock(sourceContent, "renaissance-origin");
  const reach = findBlock(sourceContent, "renaissance-global-reach");
  const network = sourceContent.find(
    (block) => block._type === "oneSpComponentGroupReference",
  );
  assert(network, "The approved 1SP network group reference is missing.");

  hero.heading = "GAME CHANGERS.\nHEADLINE *MAKERS.*\nREPUTATIONS MADE HERE.";
  hero.headingTag = "h1";
  hero.subheading = "Where games find their audience.";
  hero.fullWidth = true;
  hero.additionalContent = (hero.additionalContent ?? []).slice(0, 2).map(
    (cta: Record<string, any>, index: number) => ({
      ...cta,
      text: index === 0 ? "Start a conversation" : "See our stories",
      link: {
        ...(cta.link ?? {}),
        _type: "link",
        linkType: "external",
        externalUrl: index === 0 ? "/contact" : "#stories",
      },
    }),
  );

  storiesIntro.header = {
    ...(storiesIntro.header ?? {}),
    mainHeadline: "Great games deserve more than noise.",
    creativityTitle: undefined,
    uniquePeopleText: undefined,
  };

  servicesIntro.header = {
    ...(servicesIntro.header ?? {}),
    mainHeadline: "Six services. One mission.",
    creativityTitle: undefined,
    uniquePeopleText: undefined,
  };
  logos.headline = "You’re in great company.";

  peopleIntro.header = {
    ...(peopleIntro.header ?? {}),
    mainHeadline: "We work with people, not brands.",
    creativityTitle: undefined,
    uniquePeopleText: undefined,
  };

  origins.title = "21 years in the making";
  origins.showTitle = true;
  origins.content = [
    portableText(
      "renaissance-origins-copy",
      "Since our inception in 2015 we’ve been fortunate to work with a wide array of different clients, from Indie to AAA we can service your needs.",
    ),
  ];

  const draft = cleanDocument(source, `drafts.${HOMEPAGE_ID}`);
  draft.content = [
    hero,
    marker("renaissance-stories-section", "stories", "STORIES"),
    storiesIntro,
    stories,
    marker("renaissance-services-section", "services", "SERVICES"),
    servicesIntro,
    services,
    logos,
    marker("renaissance-people-section", "people", "PEOPLE POWERED"),
    peopleIntro,
    marker("renaissance-origins-section", "origins", "ORIGINS"),
    origins,
    marker("renaissance-reach-section", "reach", "REACH"),
    reach,
    marker("renaissance-join-section", "joinUs", "JOIN US"),
    {
      _key: "renaissance-join-intro",
      _type: "introBlockTypoSophisticated",
      hideFromNav: true,
      header: {
        _type: "peopleStepHeader",
        mainHeadline: "Register with us",
      },
    },
    {
      _key: "renaissance-join-subline",
      _type: "sublineComponent",
      description:
        "If you are a content creator/journalist or influencer register with us now to get all the latest news from our clients!",
      additionalContent: [
        {
          _key: "join-content-creators",
          _type: "cta",
          text: "Content creators",
          variant: "black",
          link: {
            _type: "link",
            linkType: "external",
            externalUrl: "/contact",
          },
        },
        {
          _key: "join-media",
          _type: "cta",
          text: "Media",
          variant: "black",
          link: {
            _type: "link",
            linkType: "external",
            externalUrl: "/contact",
          },
        },
      ],
    },
    {
      _key: "renaissance-sections-end",
      _type: "renaissanceSectionBand",
      mode: "reset",
    },
    structuredClone(network),
  ];

  return draft;
}

function prepareContact() {
  return {
    _id: `drafts.${CONTACT_ID}`,
    _type: "page",
    title: "Contact Renaissance",
    slug: { _type: "slug", current: "contact" },
    language: LANGUAGE,
    channel: CHANNEL,
    isHomepage: false,
    navbarVariant: "light",
    metadata: {
      _type: "metadata",
      title: "Contact Renaissance | Games PR and communications",
      description:
        "Tell Renaissance about your game, campaign or partnership opportunity.",
    },
    content: [
      marker("renaissance-contact-section", "contact", "CONTACT"),
      {
        _key: "renaissance-contact-intro",
        _type: "introBlockTypoSophisticated",
        hideFromNav: true,
        header: {
          _type: "peopleStepHeader",
          mainHeadline: "Let’s make your game impossible to ignore.",
        },
        description:
          "Tell us what you’re building, where you want it to go and what success looks like. We’ll come back with the right people and a clear next step.",
      },
    ],
    contactForm: {
      _type: "contactForm",
      headline: "Start a conversation",
      subheadline: "A few details are enough to get us moving.",
      submitLabel: "Send enquiry",
      successMessage:
        "Thank you. The Renaissance team has received your message and will be in touch.",
    },
  };
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  assert(projectId && dataset && apiVersion, "Sanity environment is incomplete.");

  const backup = APPLY ? verifyBackup(backupArg?.slice("--backup=".length)) : null;
  const client = getCliClient({ apiVersion }).withConfig({
    projectId,
    dataset,
    useCdn: false,
    perspective: "raw",
  });

  const [published, existingDrafts] = await Promise.all([
    client.fetch<SanityDocument | null>(`*[_id == $id][0]`, {
      id: HOMEPAGE_ID,
    }),
    client.fetch<Array<{ _id: string; _rev: string }>>(
      `*[_id in $ids]{_id,_rev}`,
      { ids: [`drafts.${HOMEPAGE_ID}`, `drafts.${CONTACT_ID}`] },
    ),
  ]);

  assert(published, `Published source ${HOMEPAGE_ID} was not found.`);
  assert(
    published.channel === CHANNEL && published.language === LANGUAGE,
    `Homepage scope mismatch: ${published.channel}/${published.language}`,
  );
  assert(
    existingDrafts.length === 0,
    `Refusing to overwrite existing drafts: ${existingDrafts.map((item) => item._id).join(", ")}`,
  );

  const homepageDraft = prepareHomepage(published);
  const contactDraft = prepareContact();

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? "apply" : "dry-run",
        projectId,
        dataset,
        source: { _id: published._id, _rev: published._rev },
        drafts: [
          { _id: homepageDraft._id, blocks: homepageDraft.content?.length ?? 0 },
          { _id: contactDraft._id, blocks: contactDraft.content.length },
        ],
        backup,
      },
      null,
      2,
    ),
  );

  if (!APPLY) return;

  await client
    .transaction()
    .create(homepageDraft)
    .create(contactDraft)
    .commit({ visibility: "async" });

  console.log("Created both Renaissance drafts. Published documents were unchanged.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
