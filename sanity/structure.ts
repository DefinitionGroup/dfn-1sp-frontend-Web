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
} from "@phosphor-icons/react";
import {
  getChannelLanguageDefinitions,
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
                    createAssignedGlobalListItem(
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
              S.listItem()
                .title("Case Studies")
                .icon(Briefcase)
                .child(
                  S.list()
                    .title("Case Studies by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("caseStudy")
                            .title("English Case Studies")
                            .filter('_type == "caseStudy" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("caseStudy-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("caseStudy")
                            .title("German Case Studies")
                            .filter('_type == "caseStudy" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("caseStudy-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
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
              S.listItem()
                .title("Clients")
                .icon(Users)
                .child(
                  S.list()
                    .title("Clients by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("client")
                            .title("English Clients")
                            .filter('_type == "client" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("client-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("client")
                            .title("German Clients")
                            .filter('_type == "client" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("client-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
              S.listItem()
                .title("People")
                .icon(UserCircle)
                .child(
                  S.list()
                    .title("People by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("person")
                            .title("English People")
                            .filter('_type == "person" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("person-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("person")
                            .title("German People")
                            .filter('_type == "person" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("person-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
              S.listItem()
                .title("Services")
                .icon(SquaresFour)
                .child(
                  S.list()
                    .title("Services by Language")
                    .items([
                      S.listItem()
                        .title("English (EN)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("services")
                            .title("English Services")
                            .filter('_type == "services" && language == "en"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("services-en", {
                                language: "en",
                              }),
                            ])
                        ),
                      S.listItem()
                        .title("German (DE)")
                        .icon(Translate)
                        .child(
                          S.documentTypeList("services")
                            .title("German Services")
                            .filter('_type == "services" && language == "de"')
                            .initialValueTemplates([
                              S.initialValueTemplateItem("services-de", {
                                language: "de",
                              }),
                            ])
                        ),
                    ])
                ),
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
            "caseStudy",
            "unit",
            "client",
            "person",
            "services",
            "serviceGroup",
            "translationGuidelines",
          ].includes(listItem.getId?.() || "")
      ),
    ]);
