# FLZR English content — verbatim source plan

Revised approval draft · 16 September 2026

This document replaces the previous proposal. The previous rewritten headlines, additional paragraphs, tool descriptions, claims corrections and new CTA labels are withdrawn. No CMS or frontend changes have been made.

## Source rules

- General English page copy comes only from **Rewrite Comparison, column E (Rewritten Copy)** in the supplied workbook. Column B supplies the existing page names. Columns D, F and G are not alternative public-copy sources.
- Keep the spreadsheet wording exactly, including spelling, punctuation, numbers, claims and arrow characters. Only block boundaries and visual formatting may change.
- The original FLZR website supplies only **actual case-study records and the Cases/References page**. Retain that source wording; do not use the earlier rewritten CMS case narratives as substitute source text.
- Proof paragraphs already written in the spreadsheet remain the exact spreadsheet text on their respective service pages. A linked case page separately retains its original-website wording. These are separate content blocks, not blended or rewritten paragraphs.
- Editorial recommendations and placeholders inside column E are shown below as **editorial notes**, not published as customer-facing copy. They do not authorize adding text from another source.
- No generated SEO copy, service-card descriptions, additional headings, process text, testimonials or page introductions. No new public section labels unless they are drawn verbatim from the spreadsheet.
- Existing navigation, legal text and global footer are outside this content replacement. Existing design, media and component behavior can be reused; existing marketing paragraphs cannot be carried into the revised pages as filler.

## Block treatment

Use the current homepage components and styling as the layout reference, not as an additional copy source. Keep its media treatment, typography, section surfaces and spacing. Do not retain every homepage section if the spreadsheet provides no copy for it.

| Component | Use |
|---|---|
| `oneSPHeader` | First sentence of Hero & Problem as headline; the remaining sentence as support copy. Preserve every character. |
| `flzrSectionBand` | Visual grouping only. Hide editorial badges/headings that would introduce extra text. |
| `contentSection` | Exact Services & Proof paragraph, or a sentence split where indicated. |
| `flzrTwoThirdsContentSection` | Exact proof paragraph beside existing relevant media; omit an invented headline. Use `contentSection` if the component requires extra heading text. |
| `casesGalleryFiltered` / paginated variant | Original-site case content with original titles and project details. |
| Existing CTA/link components | Exact quoted CTA labels from column E. Quotation marks, the separating slash, and `(kept)` are workbook notation, not button text. |

Do not shorten the long source sentences to fit the hero. Adjust type size, line breaks and spacing, and stack copy/media as needed on mobile. Do not turn all-caps styling into a stored copy change.

## Page-by-page content

Everything in the quoted blocks below is literal spreadsheet copy. Block labels, destinations and layout notes are planning annotations and do not appear as website text.

## 1. Home

Proposed app route: `/en`

**Block 1 — Hero heading · E2**

> Winning the moment your customer decides at the shelf takes more than good products — it takes the right people, in the right store, at the right time.

**Block 2 — Hero support · E2**

> FLZR has solved that problem for brands across Europe for more than 20 years: staffing, training, live video advice and performance reporting, from one team.

**Block 3 — Services & Proof · E3**

> We cover the full point-of-sale journey — training, promotion, live video consulting, merchandising, sales force, market entry and business intelligence — as one connected team instead of separate vendors. Brands like Intel, Microsoft, Telefónica and Sony already rely on this model; see how in our references.

Layout: the two sentences may be separated into adjacent service and case-introduction blocks. Their wording stays exactly as shown. A case gallery can follow using original-site case content. No additional Reach, Team or Careers prose is supplied in these Home rows.

**CTA block · E4**

> See how our team works →

Destination: /en/agency

> Read the case studies →

Destination: /en/cases


## 2. Agency

Proposed app route: `/en/agency`

**Block 1 — Hero heading · E5**

> Retail campaigns fail as often from weak execution as from weak ideas.

**Block 2 — Hero support · E5**

> Since 2004, FLZR's 420-person team — 370 of them working at the point of sale every day — has closed that gap for brands entering or expanding across European retail.

**Block 3 — Services & Proof · E6**

> We build campaigns around three things: people (a 24,000-strong personnel pool, matched to roles through AI-supported recruiting), data (in-house reporting for every campaign), and a 360° process from strategy to on-site execution. That's why departments from Account Management to Business Intelligence sit under one roof instead of being outsourced separately.

Layout: the paragraph may be split after its first sentence. Do not add number-strip labels, a new process section, team biographies or careers-teaser copy from another source.

**CTA block · E7**

> Talk to the team →

Destination: /en/contact

> See open roles →

Destination: /en/careers


## 3. Trainings

Proposed app route: `/en/trainings`

**Block 1 — Hero heading · E8**

> Untrained store staff cost brands sales every day — the wrong pitch, a missed cross-sell, no product confidence.

**Block 2 — Hero support · E8**

> FLZR closes that gap with practice-based sales training, product shows, live-streamed webinars and a certified e-learning platform — from a single in-store briefing to a Europe-wide rollout.

**Block 3 — Services & Proof · E9**

> For LEDVANCE, we built a multilingual e-learning platform and knowledge base for the SMART+ launch, with personalised logins and progress tracking for dealers and staff across Europe — the same model behind every FLZR training program.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E10**

> See more training case studies →

Destination: Training cases within /en/cases; provide a working filtered destination


## 4. Promotion

Proposed app route: `/en/promotion`

**Block 1 — Hero heading · E11**

> A promotion only pays off if it reaches the right shopper at the right moment — indoors, outdoors, online or in-store.

**Block 2 — Hero support · E11**

> FLZR plans and staffs contract, event and sales promotions, plus sampling campaigns, across Europe — backed by software-based analysis so you can see what's working while the campaign runs.

**Block 3 — Services & Proof · E12**

> For Telefónica's o2 brand, we built a permanently employed sales team for Saturn and Media Markt stores, backed by a trainer team, a stand-in team for outages, and daily BI-based sales analysis — the model we apply to every long-term promotion contract.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E13**

> Talk to us about your next promotion →

Destination: /en/contact


## 5. Video Consulting

Proposed app route: `/en/video-consulting`

**Block 1 — Hero heading · E14**

> Online shoppers abandon high-consideration purchases when nobody can answer their questions.

**Block 2 — Hero support · E14**

> PoSLive puts a trained advisor on video at that exact moment — in your online store, or via kiosk/tablet in-store — so the sale doesn't stall.

**Block 3 — Services & Proof · E15**

> For MediaSaturn, PoSLive runs permanent purchase advice across Germany, Austria and Spain with a 30-plus-strong consultant team, managed by a project team and shift leads, and backed by regular training — proof the model scales beyond a pilot.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E16**

> Try out live consulting on Saturn →

Destination: https://www.saturn.de/de/service/live-beratung


## 6. PoS Management

Proposed app route: `/en/pos-management`

**Block 1 — Hero heading · E17**

> Shelves that aren't maintained lose sales before a customer even picks up the product.

**Block 2 — Hero support · E17**

> FLZR's PoS management — visual merchandising, window dressing, showcase merchandising and rackjobbing — keeps shelves stocked, presentable and on-brand, with live reporting so you see the store, not just the sales number.

**Block 3 — Services & Proof · E18**

> For Ubisoft, our merchandising team manages block and special placements, stock clearance and display expansion across hundreds of retail partners nationwide, on a fixed visit schedule — the same rackjobbing and merchandising model behind every PoS management contract.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E19**

> See our merchandising results →

Destination: Merchandising cases within /en/cases; provide a working filtered destination


## 7. Sales Force

Proposed app route: `/en/sales-force`

**Block 1 — Hero heading · E20**

> A sales force only pays for itself if it's the right size and structure for your brand — dedicated, shared, or a hybrid of both.

**Block 2 — Hero support · E20**

> FLZR offers Community Managers, Omnichannel Managers, a shared sales force for lower-volume brands, and a classic dedicated sales force, so you're not paying for capacity you don't need.

**Block 3 — Services & Proof · E21**

> For Microsoft in the D-A-CH region, our omnichannel and community managers grew brand awareness and fanbase while keeping PoS readiness on target — with performance tracked and steered through regular business reviews.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E22**

> Talk to us about your sales force →

Destination: /en/contact


## 8. Go To Markets

Proposed app route: `/en/go-to-markets`

**Block 1 — Hero heading · E23**

> Launching a product into European retail fails as often on partner selection and timing as on the product itself.

**Block 2 — Hero support · E23**

> FLZR plans market entry and expansion for consumer electronics and technology brands — from retail partnerships to in-store training — so your product arrives at the right retailers, positioned correctly, from day one.

**Editorial note · E24 — not public copy**

> [Evidence gap — do not invent a case] This page currently has no dedicated case study. We recommend adding one (e.g. a market-entry project) before publishing an updated version, since Go To Markets is otherwise the only core service without named proof on the site.

No case/proof block is proposed for this page until you provide or identify approved original case content. The editorial note itself is not displayed.

**CTA block · E25**

> Talk to us about market entry →

Destination: /en/contact


## 9. Business Intelligence

Proposed app route: `/en/business-intelligence`

**Block 1 — Hero heading · E26**

> Decisions made on last month's numbers are already too late for this week's shelf.

**Block 2 — Hero support · E26**

> FLZR's BI tools — myInventory, myMission, mySalesPro, Sales Forecasting, myImages and mySurveyAnalyzer — give you real-time visibility into stock, staffing, sales and store conditions, so you can act while the campaign is still running.

**Block 3 — Services & Proof · E27**

> For Microsoft, weekly demand forecasting let us fine-tune inventory in near real time — reducing over- and understock and directly increasing sales, without extra headcount.

Layout: keep the full proof paragraph as its own block. An accompanying original-source case entry can remain a separate linked case component. Do not replace or edit the spreadsheet proof paragraph.

**CTA block · E28**

> See a sample dashboard →

Destination: A real sample-dashboard destination is needed; do not replace the label

Keep “See a sample dashboard →” unchanged. If no approved dashboard exists, leave the CTA pending rather than substituting new wording.

## 10. References

Proposed app route: `/en/cases`

**Source exception: original FLZR website only.**

Original page: [FLZR References](https://flzr.com/references/).

Do not use spreadsheet E29–E31 for this page, because your latest instruction assigns Cases/References to the original website. Do not use the earlier proposal’s new introduction, headline or CTA.

**Structure:** original page heading/media → existing original category labels → original case entries → original client section, where present.

Retain the original client names, project labels, descriptions, result wording, retail partners and project periods. Split each original record into corresponding case-detail blocks without rewriting it. Keep distinct projects for the same client separate. Preserve existing case IDs/URLs when matching records are found.

The new app currently has three English FLZR case records. Their existing rewritten narratives are not the approved copy source. Reconcile them with the original website, and populate missing cases from the original records only. Additional service-page case material on the original website may be used on the corresponding case detail page, without editorial additions.

Do not invent detail or results where an original case contains only a short record. This draft specifies the source and structure; the original wording remains available at the linked page for approval.

## 11. Career

Proposed app route: `/en/careers`

**Block 1 — Hero heading · E32**

> Deciding on a first job in retail promotion is hard when every listing sounds the same.

**Block 2 — Hero support · E32**

> At FLZR that means: flat hierarchies, fast decisions, and a real say from day one — whether you become a brand ambassador, merchandiser, trainer, or start in our back office.

**Editorial note · E33 — not public copy**

> (Role descriptions kept — already concrete and specific per role.) Recommend adding at least one employee testimonial or short video per role category, since the page currently offers no proof beyond the job descriptions themselves.

The workbook does not contain the actual role descriptions or testimonials. Do not import them from the original Career page under the current source restriction. Omit those blocks for now; this page contains the supplied hero/support and CTAs only.

**CTA block · E34**

> Apply now →

Destination: A verified FLZR application destination is needed

> Browse jobs at myFLZR →

Destination: https://www.my-flzr.com/


## Layout and implementation scope

1. Arrange the exact copy above into existing FLZR blocks; use fewer sections where the workbook contains less content.
2. Create the seven missing English service pages; update Home, Agency, Cases/References and Career. Link services to their pages without inventing card descriptions.
3. For Home, use the supplied hero, Services & Proof copy and two CTA labels, with original-source cases as a distinct gallery. Do not fill Reach, Team or Careers sections with legacy or newly written paragraphs.
4. Do not independently rewrite the Services hub, AI Solutions, contact page, navigation labels, metadata, or other languages. Route/link wiring needed to reach the approved pages can change.
5. Stage exact original case content separately, preserving existing IDs and relationships where possible. Reuse already-existing records when they represent the same case.
6. Before publishing, compare all revised public text fields against their source cells or original case record. Only approved formatting and block boundaries may differ.
7. Verify desktop/mobile layout and working links, then present previews for approval.

## Content not supplied

| Item | Treatment |
|---|---|
| Career role descriptions and testimonials | Omit; column E contains an editorial recommendation, not those texts. |
| Go To Markets case | Omit; no case text is supplied or identified. |
| Sample dashboard destination | Keep exact BI label pending an actual destination. |
| Additional Home reach/team/careers prose | Omit from the revised composition; no text is supplied in the relevant spreadsheet rows. |
| New service headings, tool explanations, card copy and SEO descriptions | Do not write them. |

## Approval

Approve the block arrangement and source separation shown here. This approval draft preserves the spreadsheet wording; it does not apply the previous proposal’s editorial corrections. No content or layout changes have been applied to the app or CMS.
