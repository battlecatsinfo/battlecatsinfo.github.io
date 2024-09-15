{{#each units_scheme as |value key|}}
{{#if (op key '==' 'limited_cats')}}
export const {{{key}}} = new Set({{{toJSON value}}});
{{else}}
export const {{{key}}} = {{{toJSON value}}};
{{/if}}
{{/each}}
export const eggs = {{{toJSON eggs}}};
