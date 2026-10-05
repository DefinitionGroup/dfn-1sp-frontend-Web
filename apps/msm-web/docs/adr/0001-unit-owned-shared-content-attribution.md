# Keep MSM Unit relationships on the Unit

MSM Units own unidirectional references to systemwide Cases and People, with many-to-many attribution resolved for MSM views at query time. We chose this over extending the existing bidirectional global Unit model because MSM-specific organization must not alter or couple the shared Case and Person documents used by other websites.

## Editing assignments from a case

Cases assigned to `msmWeb` expose an **MSM Unit assignments** panel in Studio. Select any number of units in the case's language, then choose **Save unit drafts**. This writes the existing `msmUnit.caseStudies[]` references; the case gains no stored assignment field. The regular global `caseStudy.units` relationship remains separate.

Checkboxes show the effective unit draft selection, with a separate indication of published membership. Open each affected unit to review and publish it. Saving or publishing the case does not publish these unit drafts. Publishing a unit also publishes its other pending edits, so the panel links to the normal unit editor instead of publishing automatically. Reload discards local, unsaved checkbox selections and reads the current assignments.

The case must first be published with the MSM channel and matching language, so newly added references can safely use its published ID. Inactive units remain visible for removing old assignments, but cannot receive new ones. The panel observes Studio's document edit permissions and does not edit Content Release versions.

On save, the panel re-reads current unit state, rejects conflicting membership changes and sends all changed units in one Sanity Actions request. Existing draft patches use revision guards. When a unit has no draft, the native edit action copies its current published content on the server. Patches add/remove only the selected case reference, preserving other cases and unit content. Published documents remain unchanged until the editor publishes the units.

Implementation: `packages/sanity-schema/src/Global/Cases/MsmUnitAssignmentsInput.tsx` and `msmUnitAssignments.ts`. Run `pnpm test:msm-unit-assignments` for the assignment and save-path tests.
