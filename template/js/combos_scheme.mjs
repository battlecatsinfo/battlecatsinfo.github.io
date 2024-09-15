{{#each combos_scheme as |value key|}}
export const {{{key}}} = {{{toJSON value}}};
{{/each}}
