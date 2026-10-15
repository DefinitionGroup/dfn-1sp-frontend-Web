> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# Renaissance Results and count-up metrics plan

Approved, implemented and published 19 September 2026: the shared Results contract is extended, and 60 published Renaissance English cases in `wu6i3y0h/production` now contain 107 Results groups and 248 metrics. This document retains the agreed design and starting inventory. See the [implementation and verification record](renaissance-results-metrics-implementation.md) and [complete source mapping](../../renaissance-results-metrics-mapping.md). Expansion to other channels remains a separate content pass. The [publication record](renaissance-content-publication.md) documents the authorized CMS publication. Frontend deployment remains separate.

## Verified starting point

- The authenticated Gamescom 2025 page shows one long Results paragraph followed by Powered by.
- The published/draft inventory, resolved draft-first and by website edition, contains 66 Renaissance English cases. 60 have one Results block each, all with an empty metrics array; six have no Results block.
- Of the 60 supplied Results paragraphs, 56 contain count/score/percentage measurements suitable for structured metrics. Four need qualitative or ranking-led treatment: The Walking Dead, Ancestors, Yooka-Laylee and Overcooked.
- Shared `resultsMetrics` already supports `animatedNumber`, numeric `value`, `label` and `suffix`. Renaissance already renders this mode; a new block type is unnecessary.
- Gaps: the shared TypeScript metric union omits animatedNumber/suffix; Studio's metric preview always appends `%`; metrics have no separate explanation, scope, qualifiers or explicit scale/precision. The counter parses string values as integers and has no explicit reduced-motion behavior. Repeated Results blocks currently reuse the same HTML ID and force near-viewport-height sections.
- English production case inventory also finds existing structured metrics on seven 1SP cases and two MSM cases (overlapping global identities; do not add these counts). These must retain their current values and presentation. This is not an exhaustive all-language/all-dataset audit of every nested shared page group.

## 1. Remove Powered by from Renaissance cases

Stop mounting `CasePoweredByContact` in Renaissance's case page. This removes the combined unit/person attribution surface there. Keep global unit/person relationships and their use by other sites. The separate footer network banner remains controlled by its existing footer setting.

No CMS field or per-case deletion is needed for this site-wide temporary presentation decision.

## 2. Compose Results from related groups

Reuse ordered `resultsMetrics` blocks. Each represents one clearly scoped group, for example **Media results**, **Creator results**, **Launch week**, or **Campaign to date**. Typical cases need one or two groups; add a third only when there is a distinct timeframe or outcome.

Each group contains a heading, compact explanatory copy, two to four prominent metrics where the source supports them, and any relevant qualitative outcome or attributed quote. Secondary figures can remain in the explanatory copy. Do not force four metrics where only one is available, or repeat the same paragraph below figures extracted from it.

Keep campaign phase/timeframe next to the figures. Preserve all substantive facts, media highlights, qualifications and quotes. The original v4 wording stays recorded in the source ledger; the public restructuring is an explicitly identified editorial derivative, with every original statement mapped to a destination.

Use Renaissance's existing large compressed type, teal/petrol/sand surfaces and hairline separators. Metrics sit directly on the section surface. Avoid the current decorative grey glass card around them. Use up to three columns for suitable groups, two-by-two for four metrics, and a readable mobile stack. Let content set section height.

Use one Results chapter with uniquely identified group anchors derived from stable block keys. Preserve `#results` for the first group; additional groups must not duplicate that ID. Apply the same behavior to both the case builder and the general Renaissance page builder.

## 3. Extend the existing metric object compatibly

Proposed optional fields, alongside current `type`, `value`, `label`, `suffix`:

| Field | Purpose |
| --- | --- |
| `description` | Explain what the individual number measures. |
| `context` | Measurement period, territory, campaign phase or comparison basis. |
| `displayScale` | none / thousand / million / billion; presentation only. |
| `decimalPlaces` | Explicit precision; never silently round away supplied detail. |
| `qualifier` | exact / plus / more than / approximately / nearly / less than. |
| `prefix` | Optional literal prefix when needed. |
| `animationMode` | count-up / static; rankings can reveal without counting. |

For newly structured metrics store the underlying numeric amount: 4,900,000 with scale million renders `4.9m`; add the source's plus qualifier to render `4.9m+`. Preserve old suffix/value pairs exactly when new options are absent; do not infer or rescale legacy values automatically. Qualifiers such as “nearly” must remain visible, not become an exact achievement.

Descriptions and context are editorial fields; units are not inferred from labels. Review scores remain scores, not percentages. Rankings such as #1 or Top 50 stay static and retain their meaning. A missing metric is omitted; an explicit zero remains valid.

Update schema, Studio preview/validation, shared types, query projections where explicit, and all consuming renderers. New fields must not be silently ignored by another channel. Keep legacy chart modes and old documents working. Extract a small shared numeric formatting/animation utility where useful while preserving each website's typography and layout.

Source references and extraction decisions live in a migration ledger keyed by document ID, website edition, block `_key`, metric `_key` and workbook cell. Do not add another independent global metrics collection.

## 4. Gamescom 2025 — concrete proposed split

Source: Rewrite Comparison F68. Proposed labels and explanations below are editorial derivatives of that supplied text, not independently verified measurements.

**Media results**

| Display | Label / explanation |
| --- | --- |
| 1,675 | Pieces of ambassador coverage. |
| 34bn | Reported UVPM. Preserve this metric name; do not call it actual views or unique people reached. |
| 28,397 | Coverage pieces worldwide mentioning Gamescom. Keep distinct from the ambassador programme's coverage count. |

Supporting copy retains the outlet highlights: Tech Radar, GamesRadar+, PCGamesN, VGC and Jeux Video.

**Creator ambassador results**

| Display | Label / explanation |
| --- | --- |
| 142 | Creator ambassador content pieces. |
| +215% | Year-on-year growth in creator ambassador content pieces. This is growth, not 215% of the previous total. |
| 4.9m+ | Creator ambassador content views. |

Supporting copy preserves the **11.7m combined subscriber base** as audience context, separate from actual content views. It could become a fourth figure if desired; the layout should not force that choice.

## 5. Extraction rules for every case

- UVPM, UMV, potential reach, estimated audience, subscribers and actual views keep their supplied labels. Do not relabel or merge them.
- Do not sum overlapping phases, outlet audiences, channels, campaign totals or media and creator audiences. Dune's 3,257 articles since announcement and 389 articles around the launch announcement require separate groups.
- Preserve `+`, approximations, thresholds, scores and decimal precision. Keep exact totals such as 4,058,049 when supplied rather than replacing them with an imprecise headline.
- Preserve timeframe distinctions such as seven days, two years and campaign to date. Do not assign a timeframe to a figure where the source does not establish it.
- Preserve quotes and earned outcomes such as an EDGE cover as explanatory proof. Do not turn a title's year, “Tier 1”, review denominator, rank or campaign duration into a performance counter.
- The Walking Dead and Overcooked retain narrative Results. Ancestors and Yooka-Laylee retain ranking-led Results without artificial count-up targets.
- Leave the six intro-only cases without a Results section until actual Results material exists.
- Flag internally unclear wording for review; do not manufacture measurement definitions to make a cleaner grid.

## 6. Count-up behavior

Use the existing Motion stack. Animate once when a group enters the viewport, finishing in approximately 1.2–1.5 seconds with a gentle ease-out. Start related metrics together or with a small stagger; keep qualifiers, units and explanatory labels readable throughout. Reserve final-value width and use tabular numerals to avoid layout movement.

Render the final value for server/non-JavaScript output and assistive technology. The animated duplicate is hidden from screen readers; do not announce every increment. Reduced motion displays the final value immediately. Scrolling away/back must not reset the figures, and a draft CMS edit should settle on its new value without stale timers. Test decimals, large values, percentages, qualifiers, zero and static rankings.

## 7. Implementation order and acceptance

1. Finish a field-level extraction ledger for all 60 Results paragraphs, preserving original text and scope. Refresh affected revisions and backup before any write.
2. Extend the compatible shared contract and build the Renaissance presentation. Hide Powered by in the Renaissance case template.
3. Implement representative drafts: Gamescom 2025 (media/creators/YoY), Dune (different timeframes), Dave the Diver (exact totals and decimal score), Autonauts (quote) and The Walking Dead (qualitative-only).
4. Verify those examples locally, then migrate the remaining Renaissance Results drafts using stable keys, revision guards and repeat-safe checks. For the shared STALKER 2 case change only its Renaissance custom body; other website editions/shared defaults remain intact. Update source reconciliation so it validates statement/metric mapping rather than demanding the old paragraph exist intact in one field.
5. Re-query every affected case. Verify no published or unrelated draft changes, no lost statements, no duplicate anchors and no silent numeric precision loss. Test desktop/mobile, reduced motion, no-JS final values and Studio edits. Run focused formatter/resolver tests, Renaissance/1SP builds and relevant cross-site compatibility checks.
6. Review through local Studio and authenticated preview. Publication/deployment remains a separate action. If the user chooses all-channel migration, first expand the inventory to every channel/language, nested page/group owner and actual deployment dataset; Renaissance's production snapshot cannot serve as a complete 1SP live-content audit.

## Case coverage ledger

This starting inventory identifies every Renaissance case and its agreed treatment, now saved in drafts. The complete field-level extraction is recorded in the linked source mapping. F references identify the supplied workbook; source block keys are stable, not array indices.

| Case | Source / existing Results key | Body owner | Proposed treatment |
| --- | --- | --- | --- |
| [Guns Of Eschaton](http://localhost:3003/cases/guns-of-eschaton) | F41 / `rpr-v4-41` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Dave The Diver In The Jungle DLC](http://localhost:3003/cases/dave-the-diver-in-the-jungle-dlc) | F44 / `rpr-v4-44` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Wax Heads](http://localhost:3003/cases/wax-heads) | F47 / `rpr-v4-47` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Poppy Playtime: Chapter 5](http://localhost:3003/cases/poppy-playtime-chapter-5) | F50 / `rpr-v4-50` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Starsand Island](http://localhost:3003/cases/starsand-island) | F53 / `rpr-v4-53` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Romeo Is A Dead Man (2026, full launch)](http://localhost:3003/cases/romeo-is-a-dead-man-2026-full-launch) | F56 / `rpr-v4-56` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Genigods Nezha](http://localhost:3003/cases/genigods-nezha) | F58 / `rpr-v4-58` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [The God Slayer](http://localhost:3003/cases/the-god-slayer) | F60 / `rpr-v4-60` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Yooka-Replaylee](http://localhost:3003/cases/yooka-replaylee) | F62 / `rpr-v4-62` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Ratatan](http://localhost:3003/cases/ratatan) | F64 / `rpr-v4-64` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Formula Legends](http://localhost:3003/cases/formula-legends) | F66 / `rpr-v4-66` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Gamescom 2025](http://localhost:3003/cases/gamescom-2025) | F68 / `rpr-v4-68` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Romeo Is A Dead Man (2025, Gamescom activation)](http://localhost:3003/cases/romeo-is-a-dead-man-2025-gamescom-activation) | F70 / `rpr-v4-70` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Wuchang: Fallen Feathers](http://localhost:3003/cases/wuchang-fallen-feathers) | F72 / `rpr-v4-72` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Dune: Awakening](http://localhost:3003/cases/dune-awakening) | F74 / `rpr-v4-74` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Pipistrello and the Cursed Yoyo](http://localhost:3003/cases/pipistrello-and-the-cursed-yoyo) | F76 / `rpr-v4-76` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Xbox Retro Classics](http://localhost:3003/cases/xbox-retro-classics) | F78 / `rpr-v4-78` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [S.T.A.L.K.E.R. Legends Of The Zone Trilogy](http://localhost:3003/cases/s-t-a-l-k-e-r-legends-of-the-zone-trilogy) | F80 / `rpr-v4-80` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [The Precinct](http://localhost:3003/cases/the-precinct) | F82 / `rpr-v4-82` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Yasha: Legends Of The Demon Blade](http://localhost:3003/cases/yasha-legends-of-the-demon-blade) | F84 / `rpr-v4-84` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Revenge Of The Savage Planet](http://localhost:3003/cases/revenge-of-the-savage-planet) | F86 / `rpr-v4-86` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Hordes Of Hunger](http://localhost:3003/cases/hordes-of-hunger) | F88 / `rpr-v4-88` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Infinity Nikki](http://localhost:3003/cases/infinity-nikki) | F90 / `rpr-v4-90` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [S.T.A.L.K.E.R. 2: Heart of Chornobyl](http://localhost:3003/cases/making-stalker-2-unmissableeverywhere-all-at-once) | F92 / `rpr-v4-92` | Renaissance website edition | Split into scoped metrics and explanatory copy |
| [Broken Sword Shadow Of Templars Reforged](http://localhost:3003/cases/broken-sword-shadow-of-templars-reforged) | F94 / `rpr-v4-94` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [My Time At Evershine](http://localhost:3003/cases/my-time-at-evershine) | F96 / `rpr-v4-96` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Gamescom 2024](http://localhost:3003/cases/gamescom-2024) | F98 / `rpr-v4-98` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Delta Force](http://localhost:3003/cases/delta-force) | F100 / `rpr-v4-100` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Kena Bridge Of Spirits - Xbox](http://localhost:3003/cases/kena-bridge-of-spirits-xbox) | F102 / `rpr-v4-102` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Soulmask](http://localhost:3003/cases/soulmask) | F104 / `rpr-v4-104` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Capes](http://localhost:3003/cases/capes) | F106 / `rpr-v4-106` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Pine Hearts](http://localhost:3003/cases/pine-hearts) | F108 / `rpr-v4-108` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [TMNT: Wrath Of The Mutants](http://localhost:3003/cases/tmnt-wrath-of-the-mutants) | F110 / `rpr-v4-110` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Shadow Of The Depth](http://localhost:3003/cases/shadow-of-the-depth) | F112 / `rpr-v4-112` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Powerwash Simulator: Warhammer 40K](http://localhost:3003/cases/powerwash-simulator-warhammer-40k) | F114 / `rpr-v4-114` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [New Cycle](http://localhost:3003/cases/new-cycle) | F116 / `rpr-v4-116` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Den Of Wolves](http://localhost:3003/cases/den-of-wolves) | F118 / `rpr-v4-118` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Exoborne](http://localhost:3003/cases/exoborne) | F120 / `rpr-v4-120` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [My Time At Sandrock](http://localhost:3003/cases/my-time-at-sandrock) | F122 / `rpr-v4-122` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Gamescom 2023](http://localhost:3003/cases/gamescom-2023) | F124 / `rpr-v4-124` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Broken Sword (2023)](http://localhost:3003/cases/broken-sword-2023) | F126 / `rpr-v4-126` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Synced](http://localhost:3003/cases/synced) | F128 / `rpr-v4-128` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Dark Envoy](http://localhost:3003/cases/dark-envoy) | F130 / `rpr-v4-130` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [IIDEA 2023 - IVGA & First Playable](http://localhost:3003/cases/iidea-2023-ivga-first-playable) | F132 / `rpr-v4-132` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [The Last Worker](http://localhost:3003/cases/the-last-worker) | F134 / `rpr-v4-134` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Luna Abyss](http://localhost:3003/cases/luna-abyss) | F136 / `rpr-v4-136` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Peaky Blinders: The King's Ransom](http://localhost:3003/cases/peaky-blinders-the-king-s-ransom) | F138 / `rpr-v4-138` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Wo Long: Fallen Dynasty](http://localhost:3003/cases/wo-long-fallen-dynasty) | F140 / `rpr-v4-140` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Inkulinati](http://localhost:3003/cases/inkulinati) | F142 / `rpr-v4-142` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Metal Hellsinger](http://localhost:3003/cases/metal-hellsinger) | F144 / `rpr-v4-144` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Hubris](http://localhost:3003/cases/hubris) | F146 / `rpr-v4-146` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Arcade Paradise](http://localhost:3003/cases/arcade-paradise) | F148 / `rpr-v4-148` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [The Ascent](http://localhost:3003/cases/the-ascent) | F150 / `rpr-v4-150` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [The Outer Worlds](http://localhost:3003/cases/the-outer-worlds) | F152 / `rpr-v4-152` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Autonauts](http://localhost:3003/cases/autonauts) | F154 / `rpr-v4-154` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Baldur's Gate (Enhanced Edition)](http://localhost:3003/cases/baldur-s-gate-enhanced-edition) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
| [The Walking Dead](http://localhost:3003/cases/the-walking-dead) | F158 / `rpr-v4-158` | Renaissance-only global case | Keep qualitative outcome and media proof |
| [Felix the Reaper](http://localhost:3003/cases/felix-the-reaper) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
| [Ancestors: The Humankind Odyssey](http://localhost:3003/cases/ancestors-the-humankind-odyssey) | F161 / `rpr-v4-161` | Renaissance-only global case | Keep ranking and supporting narrative; static |
| [Kerbal Space Program 2](http://localhost:3003/cases/kerbal-space-program-2) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
| [Pacer](http://localhost:3003/cases/pacer) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
| [Beyond a Steel Sky](http://localhost:3003/cases/beyond-a-steel-sky) | F165 / `rpr-v4-165` | Renaissance-only global case | Split into scoped metrics and explanatory copy |
| [Disintegration](http://localhost:3003/cases/disintegration) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
| [Yooka-Laylee](http://localhost:3003/cases/yooka-laylee) | F168 / `rpr-v4-168` | Renaissance-only global case | Keep Top 50 ranking with source/year; static |
| [Overcooked](http://localhost:3003/cases/overcooked) | F170 / `rpr-v4-170` | Renaissance-only global case | Keep supplied narrative; no invented figures |
| [Forgotton Anne](http://localhost:3003/cases/forgotton-anne) | — | Renaissance-only global case | Keep intro-only; no Results supplied |
