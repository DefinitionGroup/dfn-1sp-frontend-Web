# FLZR English implementation — 16 September 2026

**Homepage rollback:** The original 19-block homepage composition and copy have been restored in both published and draft documents at the user’s request. Other page updates remain. The import script now excludes Home. The implementation and verification record below describes the initial rewrite before that rollback.

Implemented on `multiseite/stage` against Sanity `wu6i3y0h / production / flizrWeb / en`. Frontend changes are local; no Vercel deployment was performed.

## Pages

- [Home](http://localhost:3000/en)
- [Agency](http://localhost:3000/en/agency)
- [Trainings](http://localhost:3000/en/trainings)
- [Promotion](http://localhost:3000/en/promotion)
- [Video Consulting](http://localhost:3000/en/video-consulting)
- [PoS Management](http://localhost:3000/en/pos-management)
- [Sales Force](http://localhost:3000/en/sales-force)
- [Go To Markets](http://localhost:3000/en/go-to-markets)
- [Business Intelligence](http://localhost:3000/en/business-intelligence)
- [References](http://localhost:3000/en/cases)
- [Career](http://localhost:3000/en/careers)

## Sources and layout

The 28 public English source cells from workbook column E are stored verbatim in `scripts/content/flzr-english-2026-09/sources.json`, with the workbook SHA-256. Hero sentence boundaries and block boundaries are the only text splits. CTA quotation marks, separators and `(kept)` are workbook notation rather than button text. E24 and E33 are editorial instructions and are omitted from public copy. E29–E31 are excluded because References uses the original website.

Thirty-three reference records retain the original names, subtitles and paragraphs from `https://flzr.com/references/`. Source extraction only collapses HTML whitespace. Existing Sony, o2 Studio and Bose document IDs and URLs are retained; 30 missing records are added. The five original sector categories are retained, with service filters and pagination. Card captions use original case subtitles.

Pages use the existing homepage hero, section bands, two-column media/copy blocks, CTAs and case gallery. Long headlines get smaller responsive type and an intrinsic-height hero. Proof blocks have no invented headings. Pages with less supplied copy contain fewer blocks.

Media is reused from the homepage hero, homepage proof video and its three existing case assets. These remain normal Cloudinary asset fields in Sanity. No new imagery was generated or uploaded. Existing homepage draft media darkening is preserved.

Service cards and footer service links open the seven new English service pages. English `/about-us`, `/jobs`, `/career` and `/references` aliases resolve to their implemented routes. The Services hub, AI Solutions, contact copy, other languages and other site channels were not rewritten.

## Pending supplied content

“See a sample dashboard →” is displayed as text because no dashboard URL was supplied. It deliberately has no fabricated destination. Career role descriptions/testimonials and the Go To Markets proof block remain omitted because their workbook cells contain editorial notes rather than public copy.

## Verification and maintenance

- Revision-guarded Sanity API dry-run passed; 45 documents applied and re-queried, including the existing homepage draft.
- All 28 public workbook cells and all paragraphs of all 33 references verified in rendered HTML.
- `pnpm build:flzr` passed.
- Desktop/mobile layouts, homepage video playback, service links, case detail rendering and filtered Training destination checked in the browser.

Read-only mutation preview:

```sh
pnpm exec sanity exec scripts/flzr-verbatim-content-cli.cjs --with-user-token
```

Rendered text verification, with the FLZR dev server on port 3000:

```sh
python3 scripts/content/flzr-english-2026-09/verify-rendered.py
```

The mutation runner writes only when `FLZR_APPLY_VERBATIM=1` is explicitly set. Reapplying restores this source snapshot and can overwrite later copy edits; inspect the dry-run first. The source snapshot is an audit artifact, not a second runtime CMS.

## Services layout update — 17 September 2026

The Services page now wraps each of its six blocks in a distinct homepage-style section band. The services carousel is replaced by the existing eight-item service grid. Existing text, media, CTA links and case selections are preserved. Section bands own outer spacing; the hero uses its existing internal spacing. Homepage content is untouched. Desktop (1280px) and mobile (390px) checks confirmed six one-block bands, positive gaps between every band, eight grid items and no horizontal overflow.

The revision-guarded mutation is reproducible using `scripts/flzr-services-section-layout.cjs` (dry-run by default; `FLZR_APPLY_SERVICES_LAYOUT=1` applies it).

The Services contact section now uses the homepage Careers `flzrTwoThirdsContentSection`, its violet surface, accent badge and video. The original contact title, supporting sentences and CTA are retained. Desktop two-thirds/one-third composition and mobile stacking were verified.
