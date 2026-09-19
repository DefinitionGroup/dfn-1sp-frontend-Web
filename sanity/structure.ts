import GlobalsBrowser from "@1sp/sanity-schema/studio";
import type {
  StructureResolver,
  ListItemBuilder,
} from "sanity/structure";
import {
  Globe,
  Buildings,
  ListBullets,
  Tag,
  Translate,
  Briefcase,
  Users,
  SquaresFour,
  UserCircle,
  Gear,
} from "@phosphor-icons/react";
import {
  getChannelLanguageDefinitions,
  getGlobalLanguageDefinitions,
  SITE_CONFIGS,
  WEBSITE_CHANNELS,
  type LanguageDefinition,
  type WebsiteChannel,
} from "@1sp/site-config";

type Language = LanguageDefinition;

// Per-channel supported languages
const CHANNEL_LANGUAGES = Object.fromEntries(
  WEBSITE_CHANNELS.map((channel) => [
    channel,
    getChannelLanguageDefinitions(channel),
  ]),
) as Record<WebsiteChannel, Language[]>;

const GLOBAL_LANGUAGES = getGlobalLanguageDefinitions();

// Helper for initial value templates
const createDocWithChannel = (
  S: any,
  schemaType: string,
  channel: string,
  language: string = "de"
): ReturnType<any["initialValueTemplateItem"]> =>
  S.initialValueTemplateItem(`${schemaType}-${channel}-${language}`, {
    channel,
    language,
  });

const createGlobalDocWithChannel = (
  S: any,
  schemaType: string,
  channel: string,
  language: string
): ReturnType<any["initialValueTemplateItem"]> =>
  S.initialValueTemplateItem(`${schemaType}-${channel}-${language}`, {
    channel,
    language,
  });

const createAssignedGlobalListItem = (
  S: any,
  title: string,
  schemaType: string,
  channel: string,
  language: string,
  icon: React.ComponentType
): ListItemBuilder =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.documentTypeList(schemaType)
        .title(`${title} (${language.toUpperCase()})`)
        .filter('_type == $schemaType && language == $language && $channel in channel')
        .params({ schemaType, channel, language })
        .initialValueTemplates([
          createGlobalDocWithChannel(S, schemaType, channel, language),
        ])
    );

// --------- Channel Structure ---------

const createChannelStructure = (
  S: any,
  channelTitle: string,
  channelValue: WebsiteChannel,
  channelIcon: React.ComponentType
): ListItemBuilder =>
  S.listItem()
    .title(channelTitle)
    .icon(channelIcon)
    .child(
      S.list()
        .title(`${channelTitle} Content`)
        .items(
          CHANNEL_LANGUAGES[channelValue].map((lang: Language) =>
            S.listItem()
              .title(`${lang.title} (${lang.id.toUpperCase()})`)
              .icon(Translate)
              .child(
                S.list()
                  .title(`${channelTitle} - ${lang.title}`)
                  .items([
                    S.listItem()
                      .title("Site Settings")
                      .icon(Gear)
                      .child(
                        S.document()
                          .schemaType("siteSettings")
                          .documentId(`site-settings-${channelValue}-${lang.id}`)
                          .title(`Site Settings (${lang.title})`)
                          .initialValueTemplate(
                            `siteSettings-${channelValue}-${lang.id}`,
                            {
                              channel: channelValue,
                              language: lang.id,
                            },
                          )
                      ),
                    S.listItem()
                      .title("Pages")
                      .icon(Globe)
                      .child(
                        S.documentTypeList("page")
                          .title(`Pages (${lang.title})`)
                          .filter(
                            '_type == "page" && channel == $channel && language == $language'
                          )
                          .params({
                            channel: channelValue,
                            language: lang.id,
                          })
                          .initialValueTemplates([
                            createDocWithChannel(
                              S,
                              "page",
                              channelValue,
                              lang.id
                            ),
                          ])
                      ),
                    S.listItem()
                      .title("Menus")
                      .icon(ListBullets)
                      .child(
                        S.documentTypeList("menu")
                          .title(`Menus (${lang.title})`)
                          .filter(
                            '_type == "menu" && channel == $channel && language == $language'
                          )
                          .params({
                            channel: channelValue,
                            language: lang.id,
                          })
                          .initialValueTemplates([
                            createDocWithChannel(
                              S,
                              "menu",
                              channelValue,
                              lang.id
                            ),
                          ])
                      ),
                    ...(channelValue === 'renaissanceWeb' ? [
                      S.listItem().title('Shared content').icon(SquaresFour).child(
                        S.list().title('Renaissance shared content').items([
                          ['renaissanceSharedPortraits', 'Portrait grids'],
                          ['renaissanceSharedAwards', 'Award logo walls'],
                          ['renaissanceClientCollection', 'Client logo collections'],
                        ].map(([type, title]) => S.listItem().title(title).icon(SquaresFour).child(
                          S.documentTypeList(type).title(title)
                            .filter('_type == $type && channel == "renaissanceWeb" && language == $language')
                            .params({ type, language: lang.id })
                        )))
                      ),
                    ] : []),
                    S.divider(),
                    createAssignedGlobalListItem(
                      S,
                      "Assigned Case Studies",
                      "caseStudy",
                      channelValue,
                      lang.id,
                      Briefcase
                    ),
                    createAssignedGlobalListItem(
                      S,
                      "Assigned Services",
                      "services",
                      channelValue,
                      lang.id,
                      SquaresFour
                    ),
                    createAssignedGlobalListItem(
                      S,
                      "Assigned People",
                      "person",
                      channelValue,
                      lang.id,
                      UserCircle
                    ),
                    createAssignedGlobalListItem(
                      S,
                      "Assigned Clients",
                      "client",
                      channelValue,
                      lang.id,
                      Users
                    ),
                    channelValue === "msmWeb"
                      ? S.listItem()
                          .title("MSM Units")
                          .icon(SquaresFour)
                          .child(
                            S.documentTypeList("msmUnit")
                              .title(`MSM Units (${lang.title})`)
                              .filter('_type == "msmUnit" && language == $language')
                              .params({ language: lang.id })
                              .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
                              .initialValueTemplates([
                                S.initialValueTemplateItem(`msmUnit-${lang.id}`, { language: lang.id }),
                              ])
                          )
                      : createAssignedGlobalListItem(
                          S,
                          "Assigned Units",
                          "unit",
                          channelValue,
                          lang.id,
                          SquaresFour
                        ),
                  ])
              )
          )
        )
    );

const createTranslationGuidelinesStructure = (S: any): ListItemBuilder =>
  S.listItem()
    .title("Translation Guidelines")
    .icon(Translate)
    .child(
      S.list()
        .title("Translation Guidelines")
        .items([
          S.listItem()
            .title("Global Content")
            .icon(Translate)
            .child(
              S.document()
                .schemaType("translationGuidelines")
                .documentId("translation-guidelines-global")
                .initialValueTemplate("translationGuidelines-global")
            ),
          ...WEBSITE_CHANNELS.map((channel) =>
            S.listItem()
              .title(SITE_CONFIGS[channel].name)
              .icon(Translate)
              .child(
                S.document()
                  .schemaType("translationGuidelines")
                  .documentId(`translation-guidelines-${channel}`)
                  .initialValueTemplate(`translationGuidelines-${channel}`)
              )
          ),
        ])
    );

const createGlobalBrowser = (S: any, title: string, type: string, icon: React.ComponentType, id: string) =>
  S.listItem().id(id).title(title).icon(icon).child(
    S.component().id(id).title(title).component(GlobalsBrowser).options({schemaType:type})
      .canHandleIntent((intent: string, params: {type?:string}) => intent === 'edit' && params.type === type)
      .child((documentId: string) => {
        // Preserve saved links from the former language-pane structure.
        const legacyLanguage = ({englishEn:'en',germanDe:'de',polishPl:'pl'} as Record<string,string>)[documentId];
        return legacyLanguage
          ? S.documentTypeList(type).title(`${title} (${legacyLanguage.toUpperCase()})`)
              .filter('_type == $type && language == $language').params({type,language:legacyLanguage})
              .initialValueTemplates([S.initialValueTemplateItem(`${type}-global-browser`, {language:legacyLanguage,channel:''})])
          : S.document().documentId(documentId).schemaType(type);
      })
  );

// --------- Main Structure Export ---------

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      createTranslationGuidelinesStructure(S),
      S.divider(),
      // --- Globals section at the top ---
      S.listItem()
        .title("Globals")
        .icon(Tag)
        .child(
          S.list()
            .title("Global Content")
            .items([
              createGlobalBrowser(S, "Case Studies", "caseStudy", Briefcase, "caseStudies"),
              S.listItem()
                .title("Units")
                .icon(SquaresFour)
                .child(
                  S.list()
                    .title("Units by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("unit")
                            .title("English Units")
                            .filter('_type == "unit" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("unit-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("unit")
                            .title("German Units")
                            .filter('_type == "unit" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("unit-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
              createGlobalBrowser(S, "Clients", "client", Users, "clients"),
              createGlobalBrowser(S, "People", "person", UserCircle, "people"),
              createGlobalBrowser(S, "Services", "services", SquaresFour, "services"),
              S.listItem()
                .title("Service Groups")
                .icon(Tag)
                .child(
                  S.list()
                    .title("Service Groups by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("serviceGroup")
                            .title("English Service Groups")
                            .filter('_type == "serviceGroup" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("serviceGroup-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("serviceGroup")
                            .title("German Service Groups")
                            .filter('_type == "serviceGroup" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("serviceGroup-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
            ])
        ),

      // --- Per-channel sections ---
      ...WEBSITE_CHANNELS.map((channel) =>
        createChannelStructure(
          S,
          SITE_CONFIGS[channel].shortName,
          channel,
          Buildings,
        )
      ),
      S.divider(),

      // Hide these types from "all documents"
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            "page",
            "menu",
            "siteSettings",
            "renaissanceSharedPortraits",
            "renaissanceSharedAwards",
            "renaissanceClientCollection",
            "caseStudy",
            "unit",
            "msmUnit",
            "client",
            "person",
            "services",
            "serviceGroup",
            "translationGuidelines",
          ].includes(listItem.getId?.() || "")
      ),
    ]);
