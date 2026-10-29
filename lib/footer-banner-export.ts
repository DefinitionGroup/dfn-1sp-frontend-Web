import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { assetUrl, cloudinaryPosterUrl, optimizedImageUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import { getRenderableCta, resolveCtaLink } from "@1sp/utils/cta";
import type { FooterExportGroup, FooterExternalBannerUnit } from "@1sp/sanity-types";
import { orderFooterBannerUnits } from "@/components/menu/footerExternalBannerOrder";

/**
 * The 1SP Footer External Banner as a self-contained HTML snippet (inline CSS,
 * JS and font) for sites built outside this repository, served at
 * /1spfooter/<file> by app/(site)/[locale]/1spfooter/[file]/route.ts. It
 * renders in a shadow root, so the host page's CSS can't reach it and its CSS
 * can't leak out. Images and videos stay on Cloudinary; links are absolute.
 *
 * The stylesheet is components/menu/footerExternalBanner.module.css itself,
 * read as text with its class names unhashed, and the markup below repeats the
 * component's (components/menu/footerExternalBanner.tsx). Keep the two alike.
 */

/** One export per host site, each fed by its own 1SP Component Group in Studio. */
export const FOOTER_EXPORTS = {
  promopers: { site: "promoPers", file: "promopers.footer.html", groupId: "onesp-footer-export-promopers", language: "en" },
  newfluence: { site: "New Fluence", file: "newfluence.html", groupId: "onesp-footer-export-newfluence", language: "en" },
} satisfies Record<string, { site: string; file: string; groupId: string; language: string }>;

export type FooterExportName = keyof typeof FOOTER_EXPORTS;

/*
 * The live host, also for snippets built on previews or locally. Not the apex: it
 * redirects, and the loader's cross-origin fetch can't follow a redirect that has
 * no CORS headers.
 */
const ONE_SP_ORIGIN = "https://www.1sp.agency";

/** `<name>.html` and `<name>.footer.html` serve the snippet; `<name>.preview.html` wraps it in a stand-in host page. */
export function parseFooterExportFile(file: string) {
  const match = /^([a-z0-9-]+)\.(?:(footer|preview)\.)?html$/.exec(file);
  if (!match || !Object.hasOwn(FOOTER_EXPORTS, match[1])) return null;
  return { name: match[1] as FooterExportName, preview: match[2] === "preview" };
}

export const FOOTER_EXPORT_FILES = Object.keys(FOOTER_EXPORTS).flatMap((name) =>
  ["html", "footer.html", "preview.html"].map((suffix) => `${name}.${suffix}`),
);

// Literal paths, so the build traces just these three files into the function.
const BANNER_CSS = readFileSync(path.join(process.cwd(), "components/menu/footerExternalBanner.module.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n\s*/g, "\n")
  .trim();
const ARROW = `data:image/svg+xml;base64,${readFileSync(path.join(process.cwd(), "components/menu/footerExternalBannerArrow.svg")).toString("base64")}`;
const FONT = `data:font/woff2;base64,${readFileSync(path.join(process.cwd(), "app/fonts/AspektaVF.woff2")).toString("base64")}`;

/*
 * What the banner gets from its host apps (Tailwind preflight, body type, the
 * 1SP scope's font and lime), redone for the shadow root. Zero specificity
 * (:where), so the banner's own stylesheet always wins.
 */
const SHADOW_CSS = /* css */ `
:host { all: initial; display: block; --color-brand-lime: #afff40; }
:where(.banner) { font: 400 16px/1.5 "1SP Aspekta", sans-serif; text-align: left; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
:where(.banner), :where(.banner) *, :where(.banner) *::before, :where(.banner) *::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
:where(.banner) a { color: inherit; text-decoration: none; }
:where(.banner) ul { list-style: none; }
:where(.banner) :is(img, video) { display: block; max-width: 100%; height: auto; }
:where(.banner) [hidden] { display: none; }
`;

/* After the banner's stylesheet: what next/image `fill` sets inline on the site. */
const EXPORT_CSS = /* css */ `
.poster { position: absolute; inset: 0; }
`;

/* Plain ES2017 for the host page, called with { id, font }. No backticks or template placeholders in here (String.raw). */
const SCRIPT = String.raw`
(function (DATA) {
  "use strict";
  var host = document.getElementById(DATA.id);
  var tpl = document.getElementById(DATA.id + "-template");
  if (!host || !tpl || !host.attachShadow || host.shadowRoot) return;
  /* @font-face is ignored inside a shadow root, so the face goes on the host page under its own name */
  if (!document.getElementById("onesp-footer-font")) {
    var face = document.createElement("style");
    face.id = "onesp-footer-font";
    face.textContent = '@font-face { font-family: "1SP Aspekta"; src: url(' + DATA.font + ') format("woff2"); font-weight: 50 1000; font-display: swap; }';
    document.head.appendChild(face);
  }
  var root = host.attachShadow({ mode: "open" });
  root.appendChild(tpl.content.cloneNode(true));
  var banner = root.querySelector(".banner");
  var video = root.querySelector(".video");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var seen = false, inView = false, syncs = [];

  function play(v) {
    if (!v.getAttribute("src")) v.setAttribute("src", v.getAttribute("data-src"));
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* the background video loads once the banner is near and plays only while it is on screen */
  function syncBackground() {
    if (!video) return;
    if (seen && inView && !reduce.matches) return play(video);
    video.pause();
    if (reduce.matches) video.classList.remove("playing");
  }
  if (video) {
    video.addEventListener("playing", function () { video.classList.add("playing"); });
    video.addEventListener("error", function () { video.classList.remove("playing"); });
  }
  syncs.push(syncBackground);

  /* a card's video plays while the card is hovered or focused */
  [].forEach.call(root.querySelectorAll(".unit"), function (card) {
    var v = card.querySelector(".unitVideo");
    if (!v) return;
    var hovered = false, focused = false;
    function sync() {
      var on = (hovered || focused) && !reduce.matches;
      v.hidden = !on;
      if (on) play(v); else v.pause();
    }
    card.addEventListener("mouseenter", function () { hovered = true; sync(); });
    card.addEventListener("mouseleave", function () { hovered = false; sync(); });
    card.addEventListener("focusin", function () { focused = true; sync(); });
    card.addEventListener("focusout", function () { focused = false; sync(); });
    syncs.push(sync);
  });

  function syncAll() { syncs.forEach(function (sync) { sync(); }); }
  if (reduce.addEventListener) reduce.addEventListener("change", syncAll); else reduce.addListener(syncAll);

  if (!("IntersectionObserver" in window)) {
    seen = inView = true;
    banner.setAttribute("data-visible", "true");
    return syncBackground();
  }
  new IntersectionObserver(function (entries, observer) {
    if (!entries[0].isIntersecting) return;
    seen = true;
    banner.setAttribute("data-visible", "true");
    observer.disconnect();
    syncBackground();
  }, { rootMargin: "200px" }).observe(banner);
  new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting;
    syncBackground();
  }, { threshold: 0.01 }).observe(banner);
})`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
/** Text inside an HTML comment must not close it. */
const commentSafe = (s: string) => s.replace(/--/g, "–");

/** Site paths become absolute 1SP URLs; only web, mail and phone links survive (no javascript: on the host page). */
function absolute(href: string, language: string) {
  const value = href.trim();
  if (!value || value === "#") return null;
  if (value.startsWith("/") && !value.startsWith("//")) {
    // 1SP serves locale-free URLs and stores its home page as "home".
    const pathname = value.replace(new RegExp(`^/${language}(?=/|$)`), "") || "/";
    return new URL(pathname === "/home" ? "/" : pathname, ONE_SP_ORIGIN).href;
  }
  return /^(https?:|mailto:|tel:)/i.test(value) ? value : null;
}

function anchor(href: string, linkType: string | undefined, attributes: string, body: string) {
  const external = linkType === "external" ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${esc(href)}"${external} ${attributes}>${body}</a>`;
}

/** Cloudinary widths for the card images, which the site sizes through next/image. */
function cardImage(url: string, fromVideo: boolean) {
  const lazy = 'alt="" loading="lazy" decoding="async"';
  if (fromVideo || !url.includes("/upload/")) return `<img class="unitImage" src="${esc(url)}" ${lazy}>`;
  const at = (width: number) => optimizedImageUrl(url, { width, crop: "limit" }) as string;
  const srcset = [400, 800, 1200].map((width) => `${at(width)} ${width}w`).join(", ");
  return `<img class="unitImage" src="${esc(at(800))}" srcset="${esc(srcset)}" sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw" ${lazy}>`;
}

/* same markup as UnitCard in components/menu/footerExternalBanner.tsx */
function unitCard(unit: FooterExternalBannerUnit, language: string) {
  const logo = assetUrl(unit.footerBannerLogo) || assetUrl(unit.logo) || assetUrl(unit.logoColor);
  const href = absolute(resolveCtaLink(unit.cta?.link), language);
  const label = unit.name || "1SP unit";
  const discipline = unit.footerBannerLabel?.trim();
  const accessibleName = discipline ? `${label}, ${discipline.replace(/\s+/g, " ")}` : label;
  const videoUrl = assetUrl(unit.footerHoverVideo);
  const background = assetUrl(unit.backgroundImage);
  const poster = background || (videoUrl ? cloudinaryPosterUrl(videoUrl, { maxWidth: 640 }) : undefined);

  const media = (poster ? cardImage(poster, !background) : "")
    + (videoUrl ? `<video class="unitVideo" data-src="${esc(optimizedVideoUrl(videoUrl, { maxWidth: 640 }) as string)}"${poster ? ` poster="${esc(poster)}"` : ""} muted loop playsinline preload="none" hidden></video>` : "");
  const brand = logo
    ? `<img class="unitLogo" src="${esc(logo)}" alt="" width="240" height="120" loading="lazy" decoding="async">`
    : `<span class="unitName">${esc(label)}</span>`;
  const text = discipline || unit.tagline
    ? `<span class="unitText">${discipline ? `<span class="unitLabel">${esc(discipline)}</span>` : ""}${unit.tagline ? `<span class="unitTagline">${esc(unit.tagline)}</span>` : ""}</span>`
    : "";
  const content = `<span class="unitMedia" aria-hidden="true">${media}</span><span class="unitBrand">${brand}</span>${text}`;
  const attributes = `class="unit" aria-label="${esc(accessibleName)}" data-label="${Boolean(discipline)}" data-details="${Boolean(unit.tagline)}"`;

  return `<li>${href ? anchor(href, unit.cta?.link?.linkType, attributes, content) : `<div ${attributes}>${content}</div>`}</li>`;
}

export function renderFooterBannerSnippet({ name, group, units, generatedAt = new Date() }: {
  name: FooterExportName;
  group: FooterExportGroup | null;
  units: FooterExternalBannerUnit[];
  generatedAt?: Date;
}) {
  const { site, file, groupId } = FOOTER_EXPORTS[name];
  const banner = group?.banner;
  if (!banner) return `<!-- 1SP footer banner for ${site}: the 1SP Component Group "${groupId}" has no published Footer External Banner yet -->\n`;

  const language = group?.language || FOOTER_EXPORTS[name].language;
  const src = `${ONE_SP_ORIGIN}/1spfooter/${file}`;
  const stamp = generatedAt.toISOString();
  const id = `onesp-footer-${name}`;
  const videoUrl = assetUrl(banner.video);
  const posterUrl = assetUrl(banner.poster) || (videoUrl ? cloudinaryPosterUrl(videoUrl, { maxWidth: 1920 }) : undefined);
  const cta = getRenderableCta(banner.cta);
  const ctaHref = cta && absolute(cta.href, language);
  const logo = assetUrl(banner.logo) || `${ONE_SP_ORIGIN}/ci/1sp-fulllogotype.svg`;
  const logoAlt = banner.logoAlt || "1SP Agency";
  const orderedUnits = orderFooterBannerUnits(units, banner.unitOrder);

  /* same markup as FooterExternalBanner in components/menu/footerExternalBanner.tsx */
  const markup = [
    `<section class="banner" aria-label="${esc(logoAlt)}" data-visible="false">`,
    `<div class="media" aria-hidden="true">`,
    posterUrl ? `<img class="poster" src="${esc(posterUrl)}" alt="" loading="lazy" decoding="async">` : "",
    videoUrl ? `<video class="video" data-src="${esc(optimizedVideoUrl(videoUrl, { maxWidth: 1920 }) as string)}"${posterUrl ? ` poster="${esc(posterUrl)}"` : ""} muted loop playsinline preload="none"></video>` : "",
    `</div>`,
    `<div class="shade"></div>`,
    `<div class="content">`,
    `<div class="intro">`,
    `<img class="logo" src="${esc(logo)}" alt="${esc(logoAlt)}" width="440" height="238" loading="lazy" decoding="async">`,
    banner.headline || banner.text
      ? `<div class="copy">${banner.headline ? `<p>${esc(banner.headline)}</p>` : ""}${banner.text ? `<p>${esc(banner.text)}</p>` : ""}</div>`
      : "",
    `</div>`,
    orderedUnits.length ? `<ul class="units">${orderedUnits.map((unit) => unitCard(unit, language)).join("")}</ul>` : "",
    cta && ctaHref
      ? `<div class="action">${anchor(ctaHref, banner.cta?.link?.linkType, 'class="cta"', `${esc(cta.text)}<img class="ctaArrow" src="${ARROW}" alt="" width="13" height="13">`)}</div>`
      : "",
    banner.copyright ? `<p class="copyright">${esc(banner.copyright)}</p>` : "",
    `</div>`,
    `</section>`,
  ].filter(Boolean).join("\n");

  // JSON inside <script>: escape "<" so no value can close the tag
  const data = JSON.stringify({ id, font: FONT }).replace(/</g, "\\u003c");
  const loader = `<script>(function (s) { fetch("${src}").then(function (r) { return r.text(); }).then(function (html) { s.replaceWith(document.createRange().createContextualFragment(html)); }); })(document.currentScript);</script>`;

  return `<!--
  1SP footer banner for ${commentSafe(site)}, generated ${stamp} from the Sanity 1SP Component Group "${commentSafe(group?.title || groupId)}" (${src}).
  Paste this snippet once where the banner should appear. A pasted copy keeps the content it was generated with;
  to always show the latest published banner, paste this loader in its place instead:
    ${loader}
-->
<div id="${id}" data-generated="${stamp}"></div>
<template id="${id}-template">
<style>${SHADOW_CSS}${BANNER_CSS}${EXPORT_CSS}</style>
${markup}
</template>
<script>
${SCRIPT.trim()}(${data});
</script>
`;
}

/** A stand-in host page around the snippet, for trying it out: /1spfooter/<name>.preview.html */
export function renderFooterBannerPreview(name: FooterExportName, snippet: string) {
  const { site, file } = FOOTER_EXPORTS[name];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>1SP footer snippet: ${esc(site)} preview</title>
<style>
  body { margin: 0; font: 15px/1.5 Georgia, serif; color: #222; background: #f4f1ea; }
  header { display: flex; align-items: center; gap: 28px; height: 64px; padding: 0 32px; background: #fff; border-bottom: 1px solid #ddd; }
  header strong { margin-right: auto; font: 700 18px/1 Arial, sans-serif; }
  a { color: #1a5a96; text-decoration: underline; }
  section, ul, p { margin: 0 0 1em; padding: 0; }
  main { max-width: 720px; margin: 64px auto; padding: 0 32px; }
  footer { padding: 24px 32px; font: 13px/1.4 Arial, sans-serif; background: #fff; }
</style>
</head>
<body>
<header>
  <strong>${esc(site)} (stand-in)</strong>
  <a href="#">Services</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</header>
<main>
  <h1>Snippet preview</h1>
  <p>This page stands in for the ${esc(site)} site that embeds <code>/1spfooter/${esc(file)}</code>. Its own styles (serif type, underlined blue links, margins on every section and list) don't touch the banner below, and the banner's styles don't touch this page.</p>
  ${"<p>Scroll filler.</p>".repeat(12)}
</main>
${snippet}
<footer>Host site footer, after the snippet.</footer>
</body>
</html>
`;
}
