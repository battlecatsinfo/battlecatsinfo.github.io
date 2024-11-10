import {language} from "./datatables.mjs";

const data = {{{toJSON data}}};

$('#diff_table').DataTable({
	data,
	language,
	order: [],
});
