import {getNumFormatter} from './common.mjs';
import {language} from "./datatables.mjs";

{{#each materials as |value key|}}
const {{{key}}} = {{{toJSON value}}};
{{/each}}

for (let j = 0; j < DROP_SOL.length; ++j) {
	for (let i = 4; i < 11; ++i) {
		const rate = 100 - DROP_SOL[j][11];
		DROP_SOL[j][i] = rate * DROP_SOL[j][i] / SUM_SOL[j];
	}
}
for (let j = 0; j < DROP_UL.length; ++j) {
	const rate = 100 - DROP_UL[j][12];
	for (let i = 4; i < 12; ++i) {
		DROP_UL[j][i] = rate * DROP_UL[j][i] / SUM_UL[j];
	}
}

for (let j = 0; j < DROP_ZL.length; ++j) {
	const rate = 100 - DROP_ZL[j][12];
	for (let i = 4; i < 12; ++i) {
		DROP_ZL[j][i] = rate * DROP_ZL[j][i] / SUM_ZL[j];
	}
}
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
