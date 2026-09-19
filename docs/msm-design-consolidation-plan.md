# MSM: Konsolidierung auf Basis der Homepage

Stand: 18. September 2026. Vom Nutzer zur Umsetzung beauftragt.

## Verbindliche Richtung

Die vorhandene MSM-Homepage ist der visuelle Maßstab. Zielgruppe: Gaming- und Marketing-Publikum. Filmische reale Medien, Aspekta, kantige Geometrie, Mosaikzeichen, MosaicButton und präzise Linien bleiben die Identität. Keine externe Referenzrichtung und keine vorgeschaltete Variantenwahl.

Die Typografie nutzt durchgängig Aspekta Medium (500). Hierarchie entsteht aus Größe, Zeilenabstand, Abstand und Kontrast, nicht aus wechselnden Bold-/Normal-Passagen. Die Darstellung bleibt auf die MSM-Site begrenzt; eingebettete kanonische 1SP-Gruppen behalten ihre eigene Grenze.

## Skills

- `impeccable`: Konsolidierung, Layout, responsive Qualität und Abschlussprüfung.
- `apple-design`: Hierarchie, Gruppierung, unmittelbare Rückmeldung, räumliche Konsistenz und unterbrechbare Übergänge.
- `animate`: zielgerichtete Umsetzung der Badge-Sequenz und Units-Auswahl mit Reduced Motion.

## Umsetzungsvertrag

### Fünf Gestaltungszusagen

- **THESIS:** Vier Fachbereiche als zusammenhängende MSM-Erfahrung verständlich und unmittelbar erkundbar machen.
- **OWN-WORLD:** Die vom Nutzer gesetzte Homepage liefert Aspekta, reale Medien, Mosaikzeichen, harte Kanten und Linien. Gaming und Marketing sind die Zielgruppe.
- **STORY:** Arbeit und Leistungen führen zu den Units, deren Ansatz und Fähigkeiten zum Projektkontakt; echte Cases und Personen ergänzen die Geschichte, sobald sie zugeordnet sind.
- **FIRST VIEWPORT:** Eine dominierende Medienfläche, erkennbare MSM-Zugehörigkeit, klare Headline und eine fokussierte Handlung. Auf der Units-Übersicht bilden gezeichnete, verlinkte Cards die Fachbereiche ab.
- **FORM:** Erweiterung der bestehenden Homepage-Gestaltung nach ausdrücklicher Nutzervorgabe. Kein neuer Konzept-Roll, keine neue Markenwelt und kein generierter Entwurf als Vergleichsvorlage.

### Homepage

Vorhandene Bild-/Video-Dramaturgie, Inhalte und Mosaikmechanik erhalten. Einheitliches Schriftgewicht, lesbare Textbreiten und klarere MSM-Markenpräsenz. Die echte MSM-Units-Auswahl wird vor dem Teamabschnitt ergänzt. Ein redaktionell vorhandener `msmUnitsGrid`-Block übernimmt die Platzierung; keine doppelte automatische Ergänzung. Die importierte Projekt-CTA mit Legal-Ziel wird auf Kontakt berichtigt.

### Badge

Nach Nutzerkorrektur: Zwei kleine Kreuzpaare ziehen nacheinander gepunktete Auswahlrechtecke auf. Erst links oben nach rechts unten, dann rechts oben nach links unten, um 180 ms versetzt. Ein Kreuz bleibt jeweils am Ursprung, das andere zieht die gegenüberliegende Ecke. Beide Rechtecke bleiben danach stark gedimmt sichtbar; vier kleine Pluszeichen wie auf der Homepage und der Inhalt bleiben. Reduced Motion zeigt diesen Endzustand mit schwachen Rahmen unmittelbar.

### Units-Übersicht und wiederverwendbare Cards

Nach Nutzerkorrektur: Die gemeinsame Bildbühne wird auf Homepage und Units-Seite durch verlinkte Cards ersetzt. Zwei Spalten auf Desktop, eine auf Mobile. Jede Card zeigt ihr echtes Unit-Medium, Namen, Claim und Linkhinweis. Die gesamte Card ist ein Link. Das gemeinsame `SelectionFrame`-Element zeichnet beim Eintritt ins Bild zwei gepunktete Rechtecke mit kleinen bewegten Kreuzen. Rechte Cards starten 120 ms versetzt. Die Rahmen bleiben nach der Animation stark gedimmt sichtbar (je 16% Deckkraft); dasselbe gilt für Badges. Dieses Zeichnen ist das verbindende MSM-UI-Motiv für weitere interaktive Cards.

### Services und Badge-Geometrie

„What we do“ verwendet dieselben gezeichneten Cards wie Units, als informative Artikel mit bestehenden Medien und vollständigen Beschreibungen. Das rotierende Sticky-Stack-Verhalten entfällt; die bestehende Sektions-CTA bleibt erhalten. Gemeinsame Card-Stile liegen in `SelectionCards.module.css`. Badges sind unabhängig von Bildschirmbreite und Kontext immer quadratisch (1:1), mit vertikal angeordnetem Logo und Text. Cards bleiben inhaltshoch.

### Unit-Detailseiten

Full-bleed-Medium, markanter Unit-Name, Claim und eindeutige Zugehörigkeit zu MSM. Danach Ansatz mit Badge, zugeordnete Cases (wenn vorhanden), Fähigkeiten, verantwortliche Personen (wenn vorhanden), Kontakt und Links zu weiteren Units. Keine Claim-Wiederholung als direkt folgende Überschrift. Keine erfundenen Case-/Person-Zuordnungen.

### Appweite Konsistenz

Gemeinsame Display-/Titel-/Textrollen, ein Schriftgewicht, strukturierende Haarlinien, konsistente Fokuszustände und zurückhaltende Akzentverwendung. Dekorativ zufällige Zwischenüberschriftsfarben entfallen. Bestehende Homepage-Animationen und MosaicButtons bleiben erhalten.

## Geprüfte Inhalte und technische Grenzen

- Projekt `wu6i3y0h`, Dataset `production`, API `2025-09-16`, Kanal `msmWeb`, Sprache `en` wurden read-only geprüft. Studio und App lesen dasselbe Projekt/Dataset/API.
- Homepage und vier aktive englische `msmUnit`-Dokumente vorhanden; keine Case- oder Leadership-Zuordnung an den Units. Der Sanity-Doctor zählt globale `unit`-Dokumente; dessen Nullwert bezeichnet nicht die eigenständigen MSM-Subunits.
- Unit-Medien stammen aus den vorhandenen redaktionellen URLs; keine Bildgenerierung und keine neuen Leistungsbehauptungen.
- Keine CMS-Mutationen, keine Änderungen an geteilten Queries/Schemas, kein Deployment.
- Arbeitsstand vor Redesign vollständig als `34bfe3078` auf `multiseite/stage` gesichert.
- Lokaler Entwicklungsserver benötigt wegen erschöpfter Dateiwatcher `WATCHPACK_POLLING=true`. Turbopack-Root ist auf das Monorepo begrenzt.

## Abnahme

Produktionsbuild und Typprüfung; gerenderte Homepage, Units-Übersicht und Unit-Detailseiten auf Desktop/Mobile; echte Bildladung; Unit-Auswahl und Direktlinks; Schriftgewichte; Fokus/Tastatur; Badge-Reihenfolge und Reduced Motion; URL-, Sitemap- und Robots-Smokechecks. Screenshots und konkrete Restpunkte im Implementierungsbericht dokumentieren.
