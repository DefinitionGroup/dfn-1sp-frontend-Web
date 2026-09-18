# MSM: Konsolidierung und gestalterische Weiterentwicklung

Stand: 18. September 2026. Planungsstand, keine Implementierungsfreigabe.

## Ziel

MSM als zusammenhängenden Markenauftritt erlebbar machen. Communications, Channel Marketing, XR Labs und Technology Systems sollen klar unterscheidbare Kompetenzen zeigen und zugleich selbstverständlich zu MSM gehören. Die Website soll Interessenten von der passenden Expertise über belegbare Arbeit zum richtigen Ansprechpartner führen.

Die bestehende Markenidentität bleibt die Grundlage: Aspekta, kantige Geometrie, dunkle Bildflächen, sparsam eingesetzte Mosaikfarben, animiertes MSM-Zeichen und MosaicButton. Der Anspruch ist herausragende Art Direction, eigenständige Interaktion und präzise Ausführung. Ein tatsächlicher Award lässt sich daraus nicht zusichern.

## Geprüfte Grundlage und Grenzen

Geprüft wurden PRODUCT.md, DESIGN.md, globals.css, MsmUnitsGrid.tsx, MsmUnitPage.tsx sowie repräsentative Header- und Cases-Komponenten. Dies ist eine Quellcodeanalyse, noch kein gerenderter Desktop-/Mobile-Audit und keine aktuelle Sanity-Inhaltsprüfung.

- Der Units-Index verwendet vier gleich aufgebaute Bild-/Textflächen in zwei Spalten. Der Hero nutzt `units[0]?.heroImageUrl`; damit bestimmt die erste Unit das übergeordnete Bild.
- Akzentfarben hängen im Grid am Array-Index. Eine redaktionelle Umsortierung ändert damit die Farbe einer Unit.
- Detailseiten folgen derselben Abfolge: Hero, Einleitung, Capabilities, optional Leadership, optional Cases, Kontakt. Der Claim wiederholt sich unmittelbar nach dem Hero als Abschnittsüberschrift.
- Andere Hero-Komponenten definieren eigene Schriftgrößen und Zeilenhöhen neben `headline-display`. Die konkrete Wirkung muss im Browser beurteilt werden.
- Leadership und Cases werden bei fehlenden Zuordnungen ausgeblendet. Ob aktuell Inhalte fehlen, muss im aktiven Dataset geprüft werden; aus dem Template folgt keine Aussage über den aktuellen CMS-Stand.
- Refero-Liverecherche wurde versucht, ist jedoch durch `NO_SUBSCRIPTION` blockiert. Es wurden keine externen visuellen Referenzen als bereits geprüft oder ausgewählt festgelegt.

## Skills und ihre Aufgaben

| Skill | Aufgabe |
| --- | --- |
| refero-design | Führende Methode für Referenzrecherche und Art Direction. Bestehende MSM-Identität als verbindliche Grundlage; externe Referenzen liefern gezielte Impulse für Komposition, Rhythmus und Medienführung. Bei weiter blockiertem Refero-Zugang direkt zugängliche Referenzsites prüfen. |
| impeccable | Konsistenzprüfung und Umsetzungshilfe: critique, extract, typeset, layout, adapt und polish. Bolder/delight gezielt auf die Units anwenden. Keine konkurrierende zweite Designrichtung entwickeln. |
| apple-design | Ergänzende Beurteilung von visueller Hierarchie, Typografie, Gruppierung, Orientierung und zusammenhängender Interaktion. Besonders den Wechsel zwischen Units, direkte Rückmeldung und unterbrechbare Übergänge prüfen. MSM behält Aspekta, kantige Flächen und strukturelle Haarlinien; Apple-spezifische Systemfonts, Glasflächen oder Materialeffekte werden nicht pauschal übernommen. |
| prototype | In einer später ausdrücklich beauftragten Prototypenphase drei tatsächlich unterschiedliche Kompositionen für den Units-Explorer vergleichen. Isolierte Vorschau, keine vorzeitige Integration. |
| animate | Nach Auswahl einer Richtung die gemeinsame Bewegungssprache umsetzen: Zweck, Zustände, Dauer, Unterbrechbarkeit, Touch und Reduced Motion. Bestehendes Motion/CSS verwenden. |
| review-animations | Abschließende Prüfung auf konkurrierende Bewegungen, Konsistenz, Bedienbarkeit und unnötige Animation. |

Imagegen nur bei konkretem Bedarf für abgestimmte abstrakte Markenmedien einsetzen. Echte Projekt-, Team- und Leistungsnachweise benötigen authentisches Material.

## Gestaltungshypothese: eine Marke, vier Perspektiven

Die Units werden durch ihren Inhalt und ihre Inszenierung unterschieden, nicht durch vier unabhängige Designsysteme. Ein gemeinsames Raster, eine typografische Hierarchie, dieselbe Navigation, Medienbehandlung und CTA-Sprache halten den Auftritt zusammen.

Der Units-Explorer wird der charakteristische Moment: große Unit-Namen, jeweils ein klarer Leistungsclaim und eine dominante reale Bild-/Videofläche. Auswahl und Medienwechsel folgen einer aus dem MSM-Mosaik abgeleiteten geometrischen Bewegung. Alle vier Units bleiben auffindbar und direkt erreichbar. Der Hero trägt eine bewusste MSM-Gruppenbildwelt statt automatisch das erste Unit-Bild.

Für die Bildredaktion prüfen:

- Communications: Menschen, öffentliche Kommunikation und reale Kampagnen.
- Channel Marketing: Handel, Aktivierung und reale Touchpoints.
- XR Labs: tatsächlich erlebbare räumliche oder interaktive Anwendungen.
- Technology Systems: konkrete Systeme und ihre Nutzung.

Diese Punkte sind Bildbriefings, keine Behauptungen über vorhandene Assets oder Projekte. Keine neuen Unit-Logos oder Farbzuordnungen ohne abgestimmte Markenentscheidung.

## Ablauf und Ergebnisse

### 1. Gesamteindruck und Inhalte erfassen

Homepage, Services, Cases, Units-Index, alle Unit-Detailseiten, Kontakt sowie Navigation/Footer auf Desktop und Mobile gemeinsam prüfen. Screenshots und Seitenabfolgen statt nur isolierter Komponenten bewerten. Wiederkehrende Abweichungen bei Typografie, Breiten, Abständen, Medien, CTAs und Motion priorisieren.

Vor jeder Diagnose fehlender CMS-Inhalte die geladenen öffentlichen Sanity-Variablen, Projekt/Dataset/Kanal/Sprache und Studio-Abgleich prüfen; `pnpm doctor:sanity` ausführen. Danach tatsächliche MSM-Cases, Personen, Unit-Zuordnungen und Medien read-only inventarisieren.

Ergebnis: kompakter Audit mit Behalten/Vereinheitlichen/Ersetzen, Inhaltstabelle pro Unit und Screenshot-Baseline.

Apple-Design-Prüflinse im Audit und erneut am Prototyp:

- Ist auf jedem Screen ein eindeutiger Schwerpunkt sichtbar, und unterstützen Größe, Gewicht, Zeilenabstand und Kontrast gemeinsam die Hierarchie?
- Werden zusammengehörige Inhalte durch Nähe und Ausrichtung verständlich, und bleibt der Rhythmus über Abschnittsgrenzen hinweg konsistent?
- Ist beim Units-Explorer unmittelbar klar, welche Unit aktiv ist, welches Medium dazugehört und wie ihre Detailseite erreicht wird?
- Reagiert ein Wechsel sofort, kann er während der Bewegung erneut ausgelöst werden und bleibt die räumliche Beziehung nachvollziehbar?
- Bleiben Lesbarkeit und Bedienbarkeit bei Touch, größerem Text und Reduced Motion vollständig erhalten?

Diese Kriterien beurteilen die gestalterische Präzision und das Verhalten. Eigenständige MSM-Art-Direction und die inhaltliche Qualität der Medien werden separat anhand des Markenbriefings und der Referenzen beurteilt.

### 2. Eine verbindliche Gestaltung festlegen

Drei bis fünf passende Referenzen recherchieren und wenige gründlich prüfen. Eine klare Hauptrichtung festlegen und höchstens einzelne Details anderer Referenzen übernehmen. Referenzen nach ihrer konkreten Rolle benennen, nicht nach einem pauschalen Premium-Eindruck.

Eine MSM-Kompositionsübersicht definieren: Hero-/Titel-/Fließtextrollen, Raster, Seitenränder, Abschnittsrhythmus, Bildbehandlung, Link-/CTA-Zustände, Farbrollen und Bewegungsregeln. Bestehendes DESIGN.md weiterführen statt eine parallele Autorität einzuführen.

Ergebnis: visuelle Richtung, konkrete Referenzentscheidungen und gemeinsam nutzbare Layout-/Typografie-Regeln.

### 3. Units als Pilot prototypisieren

Drei Varianten derselben Units-Übersicht mit denselben echten Inhalten und MSM-Tokens vergleichen:

1. **Typografischer Explorer:** große auswählbare Unit-Namen steuern eine dominante Medienfläche. Fokus und Touch funktionieren gleichwertig zu Hover. Auswahl und Navigation zur Detailseite sind klar getrennt.
2. **Filmische Kapitel:** vier Bildkapitel in einem sorgfältig abgestimmten Scrollrhythmus. Direkte Sprungnavigation; gewöhnliches Scrollen bleibt erhalten.
3. **Mosaik-Komposition:** eine zusammenhängende kantige Medienkomposition entfaltet bei Auswahl den Schwerpunkt einer Unit. Keine Ansammlung unabhängiger Karten; nur reale, bedienbare Interaktionen.

Arbeitshypothese ist Variante 1: schnelle Orientierung mit Raum für starke Medien. Die Entscheidung fällt anhand funktionierender Desktop-/Mobile-Prototypen. Zusätzlich die gewählte Richtung an einer inhaltlich repräsentativen Unit-Detailseite prüfen.

Mobile erhält eine eigenständig komponierte vertikale Folge. Keine Hover-Abhängigkeit, keine erzwungene horizontale Reise und kein Scroll-Lock. Reduced Motion zeigt alle Inhalte vollständig.

Ergebnis: gewählte Units-Komposition und eine vollständige exemplarische Detailseite als Maßstab.

### 4. Inhalt und Dramaturgie der Units ausarbeiten

Gemeinsame Aufgaben der Detailseiten: Identität und Nutzen klären, reale Arbeit zeigen, Fähigkeiten erläutern, verantwortliche Menschen sichtbar machen und Kontakt ermöglichen. Den stärksten passenden Case früher einsetzen, sofern redaktionell zugeordnet. Claims nicht mechanisch wiederholen.

Pro Unit einen inhaltlich begründeten Schwerpunkt gestalten. Unterschiede dürfen aus Medien, Schwerpunkt und Erzählrhythmus entstehen. Typografie, Layoutregeln und Bedienung bleiben gemeinsam.

Mindestinhalt und Medienbedarf im Audit vereinbaren. Keine erfundenen Referenzen, Resultate oder Personenzuordnungen. Fehlende Inhalte als redaktionelle Aufgaben führen; der reduzierte Seitenzustand muss trotzdem bewusst gestaltet sein.

Ergebnis: vier unterscheidbare, kohärente Unit-Seiten mit belegbaren Inhalten.

### 5. Gestaltung auf die MSM-App übertragen

Die im Pilot bestätigten Regeln auf Homepage, Services, Cases, Navigation, Kontakt und Footer übertragen. Wiederholte lokale Sonderwerte durch MSM-eigene Bausteine und Tokens ablösen. Abschnittsübergänge und Seitenrhythmus im Zusammenhang prüfen; nicht jede Sektion bekommt dieselbe Höhe oder dieselbe Animation.

Drei priorisierte Bewegungsmomente: Markenauftritt, Units-Auswahl/Medienwechsel und Übergang zum Arbeitsnachweis. WebGL nur, wenn die gewählte Idee davon sichtbar profitiert und das Gerätebudget es trägt.

Ergebnis: durchgängige MSM-Gestaltung und aktualisierte Design-Dokumentation.

### 6. Abnahme

- Desktop und Mobile mit realistischen langen Namen, unterschiedlichen Textmengen und vollständigen sowie reduzierten Inhaltszuständen prüfen.
- Gesamte Strecke Homepage → Unit → Case → Kontakt ohne Sackgassen durchlaufen.
- Tastatur, sichtbaren Fokus, Touch, Kontrast und Reduced Motion prüfen.
- Ladeverhalten, Layoutstabilität, Mediengewicht und flüssige Interaktion messen; Budgets vor der Umsetzung anhand der Baseline festlegen.
- MSM-Build, Routing, Canonicals, Sitemap, Robots und Tracking entsprechend dem tatsächlichen Änderungsscope verifizieren.
- Bei gemeinsamen Plattformänderungen zusätzlich 1SP-Build und betroffene Kanalflüsse prüfen.
- Eine gebündelte visuelle Prüfrunde, gemeinsame Korrektur, gezielte Bestätigung. Kein offener Polishing-Zyklus.

## Grenzen und Entscheidungspunkt

App-Änderungen zunächst auf `apps/msm-web` begrenzen. Das eigenständige `msmUnit`-Modell und seine Case-/Person-Referenzen erhalten. 1SP, FLZR und Renaissance nicht als Nebeneffekt umgestalten. Planung autorisiert weder CMS-Mutationen noch Deployment.

Der erste Umsetzungsschritt wäre der Gesamtaudit mit anschließendem Units-Prototyp. Erst nach Auswahl der überprüfbaren Komposition wird deren Gestaltung auf die gesamte App übertragen.
