import type {
  StructureResolver,
  ListItemBuilder,
  ListBuilder,
} from "sanity/structure";
import {
  MdWeb,
  MdBusiness,
  MdMenu,
  MdCategory,
  MdTranslate,
  MdCases,
  MdGroup,
} from "react-icons/md";

// Define language type
type Language = {
  id: string;
  title: string;
};

const supportedLanguages: Language[] = [
  { id: "de", title: "German" },
  { id: "en", title: "English" },
];

// Per-channel supported languages
const CHANNEL_LANGUAGES: Record<string, Language[]> = {
  '1spWeb': [supportedLanguages[1], supportedLanguages[0]], // EN, DE
  'msmWeb': [supportedLanguages[1], supportedLanguages[0]], // EN, DE
  'studioco2Web': [supportedLanguages[1]], // EN only
};

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

// --------- Channel Structure ---------

const createChannelStructure = (
  S: any,
  channelTitle: string,
  channelValue: string,
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
              .icon(MdTranslate)
              .child(
                S.list()
                  .title(`${channelTitle} - ${lang.title}`)
                  .items([
                    S.listItem()
                      .title("Pages")
                      .icon(MdWeb)
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
                      .icon(MdMenu)
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
                  ])
              )
          )
        )
    );

// --------- Main Structure Export ---------

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // --- Globals section at the top ---
      S.listItem()
        .title("Globals")
        .icon(MdCategory)
        .child(
          S.list()
            .title("Global Content")
            .items([
              S.listItem()
                .title("Case Studies")
                .icon(MdCases)
                .child(
                  S.list()
                    .title("Case Studies by Language")
                    .items([
                      S.listItem()
                        .title("German (DE)")
                        .icon(MdTranslate)
                        .child(
                          S.documentTypeList("caseStudy")
                            .title("German Case Studies")
                            .filter('_type == "caseStudy" && language == "de"')
                        ),
                      S.listItem()
                        .title("English (EN)")
                        .icon(MdTranslate)
                        .child(
                          S.documentTypeList("caseStudy")
                            .title("English Case Studies")
                            .filter('_type == "caseStudy" && language == "en"')
                        ),
                    ])
                ),
              S.listItem()
                .title("Units")
                .icon(MdGroup)
                .child(
                  S.list()
                    .title("Units by Language")
                    .items([
                      S.listItem()
                        .title("German (DE)")
                        .icon(MdTranslate)
                        .child(
                          S.documentTypeList("unit")
                            .title("German Units")
                            .filter('_type == "unit" && language == "de"')
                        ),
                      S.listItem()
                        .title("English (EN)")
                        .icon(MdTranslate)
                        .child(
                          S.documentTypeList("unit")
                            .title("English Units")
                            .filter('_type == "unit" && language == "en"')
                        ),
                    ])
                ),
            ])
        ),

      // --- Per-channel sections ---
      createChannelStructure(S, "1SP", "1spWeb", MdBusiness),
      createChannelStructure(S, "MSM", "msmWeb", MdBusiness),
      createChannelStructure(S, "Studio CO2", "studioco2Web", MdBusiness),

      S.divider(),

      // Hide these types from "all documents"
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            "page",
            "menu",
            "caseStudy",
            "unit",
          ].includes(listItem.getId?.() || "")
      ),
    ]);
