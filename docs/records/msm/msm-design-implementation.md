> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

> Aktuelle Nutzerkorrektur: Units verwenden jetzt auf Homepage und Übersicht verlinkte Cards mit dem gemeinsamen `SelectionFrame`. Zwei Spalten auf Desktop, eine auf Mobile, in-view Draw mit 120-ms-Spaltenstagger. Badge- und Card-Rahmen bleiben nach dem Zeichnen stark gedimmt sichtbar. Die folgende ursprüngliche Review-Historie beschreibt noch die frühere Bildbühne und ist keine unabhängige Bewertung der neuen Cards.

# MSM Design-Konsolidierung

Stand: 18. September 2026. Lokale Umsetzung auf `multiseite/stage`.

## Ausgangspunkt und Ergebnis

Der vollständige vorherige Arbeitsstand wurde zuerst unter `34bfe3078` gesichert. Die anschließenden Änderungen betreffen die MSM-App und ihre Designdokumentation. Kein Push oder Deployment und keine CMS-Mutation.

Die bestehende Homepage bleibt der visuelle Maßstab für das Gaming- und Marketing-Publikum. Aspekta Medium (500), ein gemeinsamer Titel-/Textmaßstab, harte Kanten und präzise Haarlinien verbinden die Oberflächen. Der MosaicButton, das MSM-Mosaikzeichen und die filmische Homepage bleiben erhalten.

- Badges ziehen nach Nutzerkorrektur zwei gepunktete Auswahlboxen in gegenläufigen Diagonalen auf (180 ms versetzt). Kleine Pluszeichen wie auf der Homepage bewegen sich mit den Ecken; danach bleiben nur Inhalt und vier Kreuze.
- Der neue Units-Explorer verbindet vier auswählbare Fachbereiche mit einer gemeinsamen, bildfüllenden Bühne und eindeutigen Detailseitenlinks. Auf der Homepage steht er vor dem Teamabschnitt; ein redaktionell platzierter Units-Block verhindert die automatische Doppelung.
- Unit-Detailseiten folgen derselben Gestaltung mit Ansatz, Fähigkeiten, Kontakt und Links zu den weiteren Units. Cases und Leadership werden bei vorhandenen CMS-Zuordnungen dargestellt.
- Auf Mobile ist die Hauptnavigation jetzt sichtbar. Die importierte Homepage-Projekt-CTA führt zu Kontakt.
- Ungenutzte Gradient-Text-Hilfsklassen wurden entfernt. Bestehende Homepage-Motion bleibt erhalten; es wurden keine Design-Hook-Regeln unterdrückt.

## Verifikation

| Prüfung | Ergebnis |
| --- | --- |
| MSM-Produktionsbuild | Erfolgreich, 29 statische Seiten einschließlich aller vier Unit-Details |
| TypeScript | Separater Check und Build-Typecheck erfolgreich |
| ESLint | Units-Explorer, Units-Detail, Units-Block und Badge erfolgreich |
| Desktop | Homepage, eingebettete Units, Units-Übersicht und XR-Detail bei 1440 px; Units zusätzlich bei 1280 px geprüft |
| Mobile | Homepage, Navigation, Units-Auswahl, XR-Hero und Ansatz/Badge bei 390 × 844 px geprüft; kein horizontaler Überlauf |
| Tastatur | XR Labs per Enter auswählbar; sichtbare cyanfarbene Fokuslinie und korrektes `/units/xr-labs`-Ziel |
| Typografie | Gerenderte Titel, Texte und Auswahlbuttons im Explorer verwenden Gewicht 500 |
| Badge | Zwei Kreuzpaare ziehen gepunktete Boxen von 80–560 ms und 260–740 ms auf; Ränder verschwinden bis 940 ms, Inhalt erscheint von 740–980 ms |
| Reduced Motion | Badge-Animationen `none`, Inhalt/Kreuze sichtbar, kein Rahmen; Explorer ohne Bildübergang |
| Routen | `/`, `/units`, vier Unit-Details, `/cases`, `/services`, `/contact`, Sitemap und Robots jeweils HTTP 200 |
| Canonical/Sitemap | Bestehende `https://www.msm.digital`-Canonicals und alle vier Unit-Details in der Sitemap bestätigt |
| Browser | Keine ungefangenen JavaScript-Fehler in der abschließenden Browsersitzung |

Bildnachweise: [Review-Ordner](../../../apps/msm-web/.impeccable/review/msm-consolidation). Die einzelnen Ansichten wurden nach abgeschlossener Einblendung geöffnet und visuell geprüft; keine gestitchten Ganzseitenaufnahmen.

## Unabhängige Abschlussprüfung

Der erste visuelle Review bestätigte die Übernahme der Homepage-Gestaltung, die Typografie, Bildflächen, responsive Units-Auswahl und Badge-Geometrie. Zwei konkrete Korrekturen wurden verlangt: das redundante „Our Units“ über dem aktiven Unit-Namen entfernen und die veralteten Design-Tokens aktualisieren.

Beide Korrekturen wurden umgesetzt. Der Produktionsbuild wurde erneut erfolgreich ausgeführt, die betroffenen Ansichten erneut aufgenommen und geprüft. Der Reviewer bewertet beide Punkte als **resolved**, Disposition **ship** für diese beiden Korrekturen. Das ist keine zusätzliche vollständige Prüfung anderer Oberflächen. `DESIGN.md` und `design.json` wurden mit dem offiziellen Impeccable-Parser sowie Schema-/Aktualitätsprüfungen validiert.

Design-Hinweise wurden ohne Unterdrückung bearbeitet: Die ungenutzten Gradient-Text-Klassen sind entfernt; die vorhandene Homepage-Bewegung bleibt gemäß Gestaltungsvorgabe bestehen. Veraltete Typografie- und Farbangaben sind mit der Implementierung abgeglichen.

## Inhaltliche und technische Grenzen

Die vier englischen `msmUnit`-Dokumente haben derzeit keine Case- oder Leadership-Zuordnungen. Diese wurden nicht erfunden. Vorhandene redaktionelle Unit-Bilder werden weiterverwendet; ihre gestalterische Erneuerung und belastbare Projektbelege bleiben redaktionelle Arbeit.

Geprüft wurde das aktuell konfigurierte Sanity-Projekt `wu6i3y0h`, Dataset `production`, Kanal `msmWeb`, API `2025-09-16`. Das ist keine Freigabe eines MSM-Produktionsdeployments. Robots-/Canonical-Verhalten wurde geprüft, nicht verändert. Der lokale Produktionsserver läuft unter `http://localhost:3102`.

Der Turbopack-Root ist jetzt auf das Monorepo begrenzt. Im lokalen Entwicklungsbetrieb erfordert die ausgeschöpfte Dateiwatcher-Grenze zusätzlich `WATCHPACK_POLLING=true`; für die Abnahme wurde der gebaute Produktionsserver verwendet. Bestehende Next-Middleware- und Sanity-Image-URL-Deprecation-Hinweise bleiben bestehen. Cookiebot meldet auf localhost die fehlende Domain-Freigabe.

Die aktuelle Runde umfasst keine vollständige Accessibility-, Performance- oder Cross-Browser-Zertifizierung und keine Awwwards-Bewertung.
