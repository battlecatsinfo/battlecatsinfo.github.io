import {language} from "./datatables.mjs";

{{#each crown as |value key|}}
const {{{key}}} = {{{toJSON value}}};
{{/each}}

function format(num) {
	if (num)
		return num.toString(); //return F.format(num);
	return '';
}
$('#SOL').DataTable({
	data: SOL,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [3, 4, 5, 6],
		render: format
	}]
});
$('#UL').DataTable({
	data: UL,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [3, 4, 5, 6],
		render: format
	}]
});
$('#ZL').DataTable({
	data: ZL,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [3, 4, 5, 6],
		render: format
	}]
});
$('#MONTHY').DataTable({
	data: MONTHY,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [3, 4, 5, 6],
		render: format
	}]
});
$('#STAR').DataTable({
	data: STAR,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [2, 3, 4, 5],
		render: format
	}]
});
$('#COLLAB').DataTable({
	data: COLLAB,
	bAutoWidth: false,
	language,
	columnDefs: [{
		targets: [3, 4, 5, 6],
		render: format
	}],
	rowGroup: {
		dataSrc: 0
	}
});

