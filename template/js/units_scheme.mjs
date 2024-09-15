{{#each units_scheme as |value key|}}
export const {{{key}}} = {{{toJSON value}}};
{{/each}}
export const limited_cats = new Set({{{toJSON limited_cats}}});
export const levelcurves = {{{toJSON level_curve}}};
