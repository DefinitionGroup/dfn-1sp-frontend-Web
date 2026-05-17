import { defineField } from "sanity";

/**
 * Shared navigation field definitions for pagebuilder components
 * Use these in the "navigation" group of any component schema
 */

export const navPointNameField = defineField({
    name: "navPointName",
    title: "Navigation Point Name",
    type: "string",
    description: "Optional custom name to display in the vertical navigation minimap. If empty, uses the section title or auto-generated ID.",
    group: "navigation",
});

export const hideFromNavField = defineField({
    name: "hideFromNav",
    title: "Hide from Navigation",
    type: "boolean",
    description: "If enabled, this section will not appear in the vertical navigation minimap.",
    initialValue: false,
    group: "navigation",
});

/**
 * Returns both navigation fields as an array
 * Usage: fields: [...navigationFields, ...otherFields]
 */
export const navigationFields = [navPointNameField, hideFromNavField];
