import {getNumFormatter} from './common.mjs';
import {language} from "./datatables.mjs";

const numFormatter = getNumFormatter(2);
const layout = {
	topStart: {
		pageLength: {
			menu: [10, 20, 30, 40, 50]
		}
	},
	bottomStart: {
		buttons: [{
				extend: 'copyHtml5'
			},
			{
				extend: 'csvHtml5'
			},
			{
				extend: 'excelHtml5'
			},
		]
	}
};

{{#each materials as |value key|}}
const {{{key}}} = {{{toJSON value}}};
{{/each}}


function format(num) {
	if (num)
		return numFormatter.format(num);
	return '';
}
$('#SOL').DataTable({
	data: DROP_SOL,
	bAutoWidth: false,
	layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10],
		render: format
	}]
});
$('#UL').DataTable({
	data: DROP_UL,
	bAutoWidth: false,
	layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10, 11],
		render: format
	}]
});
$('#ZL').DataTable({
	data: DROP_ZL,
	bAutoWidth: false,
	layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10, 11],
		render: format
	}]
});
