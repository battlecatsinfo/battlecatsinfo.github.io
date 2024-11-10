import {getNumFormatter} from './common.mjs';
import {language} from "./datatables.mjs";

{{#each materials as |value key|}}
const {{{key}}} = {{{toJSON value}}};
{{/each}}

for (var j = 0; j < drop_SOL.length; ++j) {
	for (var i = 4; i < 11; ++i) {
		const rate = 100 - drop_SOL[j][11];
		drop_SOL[j][i] = rate * drop_SOL[j][i] / sum_SOL[j];
	}
}
for (var j = 0; j < drop_UL.length; ++j) {
	const rate = 100 - drop_UL[j][12];
	for (var i = 4; i < 12; ++i) {
		drop_UL[j][i] = rate * drop_UL[j][i] / sum_UL[j];
	}
}

for (var j = 0; j < drop_ZL.length; ++j) {
	const rate = 100 - drop_ZL[j][12];
	for (var i = 4; i < 12; ++i) {
		drop_ZL[j][i] = rate * drop_ZL[j][i] / sum_ZL[j];
	}
}
const F = getNumFormatter(2);

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

function format(num) {
	if (num)
		return F.format(num);
	return '';
}
$('#SOL').DataTable({
	data: drop_SOL,
	bAutoWidth: false,
	layout: layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10],
		render: format
	}]
});
$('#UL').DataTable({
	data: drop_UL,
	bAutoWidth: false,
	layout: layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10, 11],
		render: format
	}]
});
$('#ZL').DataTable({
	data: drop_ZL,
	bAutoWidth: false,
	layout: layout,
	language,
	columnDefs: [{
		targets: [4, 5, 6, 7, 8, 9, 10, 11],
		render: format
	}]
});
