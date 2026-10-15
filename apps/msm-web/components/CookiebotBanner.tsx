import { shouldLoadMsmCookiebot } from "@msm/lib/cookiebot-deployment";
import { COOKIEBOT_BANNER_SRC, COOKIEBOT_CID } from "@msm/lib/cookiebot";

const DIALOG_ANCHOR_ID = "cookiebot-dialog-anchor";

// Cookiebot prepends its dialog <div> to <body>, sometimes before React hydrates. React then hydrates Next's
// leading metadata <div hidden> onto the dialog, fails, re-renders the document and deletes the dialog.
// Cookiebot nodes are kept right before a <span> anchor instead, where React skips them as third-party nodes.
// This runs in <body>: Cookiebot inserts scripts into <head>, which would break hydration of an inline script there.
const keepCookiebotBeforeAnchor = `(function () {
  var anchor = document.getElementById("${DIALOG_ANCHOR_ID}");
  function isCookiebot(node) { return /^(Cybot|Cookiebot)/.test(node.id); }
  function needsMove(node) {
    for (var next = node.nextElementSibling; next && next !== anchor; next = next.nextElementSibling) {
      if (!isCookiebot(next)) return true;
    }
    return false;
  }
  function place() {
    for (var node = document.body.firstElementChild; node && node !== anchor; ) {
      var next = node.nextElementSibling;
      if (isCookiebot(node) && needsMove(node)) anchor.before(node);
      node = next;
    }
  }
  new MutationObserver(place).observe(document.body, { childList: true });
  place();
})();`;

/** Must be the first child of <body>; see `keepCookiebotBeforeAnchor`. */
export function CookiebotDialogAnchor() {
  if (!shouldLoadMsmCookiebot()) return null;
  return (
    <>
      <span id={DIALOG_ANCHOR_ID} hidden />
      {/* Cookiebot's auto-blocker sets this type on inline scripts; matching it avoids a hydration warning. */}
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: keepCookiebotBeforeAnchor }} />
    </>
  );
}

export default function CookiebotBanner({ language }: { language: string }) {
  if (!shouldLoadMsmCookiebot()) return null;

  // Cookiebot's automatic blocker must execute before hydration and tracking.
  // next/script defers execution; a synchronous head script preserves that order.
  return (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script
      id="Cookiebot"
      src={COOKIEBOT_BANNER_SRC}
      data-cbid={COOKIEBOT_CID}
      data-blockingmode="auto"
      data-culture={language.toUpperCase()}
      type="text/javascript"
    />
  );
}
