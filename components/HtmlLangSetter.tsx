"use client";

import { useEffect } from "react";

/**
 * Sets the `lang` attribute on `<html>` to the current locale.
 *
 * The root layout renders `<html lang="en">` and nested layouts cannot
 * re-render it, so the locale layout mounts this component to override the
 * attribute. Previously this was an inline `<script>`, but React never
 * executes script tags it renders on the client (and React 19.2 logs a dev
 * error for them), so the attribute went stale on client-side navigation.
 * An effect runs on every locale change instead.
 */
export default function HtmlLangSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
