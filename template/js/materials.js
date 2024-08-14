{{#each (loadJSON "materials.json") as |value key|}}
const {{{key}}} = {{{toJSON value}}};
{{/each}}

for (var j = 0; j < drop_SOL.length; ++j) {
	for (var i = 4; i < 11; ++i) {
		const rate = 100 - drop_SOL[j][9];
		drop_SOL[j][i] = rate * drop_SOL[j][i] / sum_SOL[j];
	}
}
for (var j = 0; j < drop_UL.length; ++j) {
	const rate = 100 - drop_UL[j][9];
	for (var i = 4; i < 12; ++i) {
		drop_UL[j][i] = rate * drop_UL[j][i] / sum_UL[j];
	}
}

for (var j = 0; j < drop_ZL.length; ++j) {
	const rate = 100 - drop_ZL[j][9];
	for (var i = 4; i < 12; ++i) {
		drop_ZL[j][i] = rate * drop_ZL[j][i] / sum_ZL[j];
	}
}
const F = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': 2
});

const lang = {
	"processing": "處理中...",
	"loadingRecords": "載入中...",
	"paginate": {
		"first": "第一頁",
		"previous": "上一頁",
		"next": "下一頁",
		"last": "最後一頁"
	},
	"emptyTable": "目前沒有資料",
	"buttons": {
		"copySuccess": {
			"_": "複製了 %d 筆資料",
			"1": "複製了 1 筆資料"
		},
		"copyTitle": "已經複製到剪貼簿",
		"excel": "Excel",
		"pdf": "PDF",
		"print": "列印",
		"copy": "複製",
		"colvis": "欄位顯示",
		"colvisRestore": "重置欄位顯示",
		"csv": "CSV",
		"pageLength": {
			"-1": "顯示全部",
			"_": "顯示 %d 筆"
		},
		"createState": "建立狀態",
		"removeAllStates": "移除所有狀態",
		"removeState": "移除",
		"renameState": "重新命名",
		"savedStates": "儲存狀態",
		"stateRestore": "狀態 %d",
		"updateState": "更新",
		"collection": "更多"
	},
	"searchPanes": {
		"collapse": {
			"_": "搜尋面版 (%d)",
			"0": "搜尋面版"
		},
		"emptyPanes": "沒搜尋面版",
		"loadMessage": "載入搜尋面版中...",
		"clearMessage": "清空",
		"count": "{total}",
		"countFiltered": "{shown} ({total})",
		"showMessage": "顯示全部",
		"collapseMessage": "摺疊全部",
		"title": "篩選條件 - %d"
	},
	"zeroRecords": "沒有符合的資料",
	"aria": {
		"sortAscending": "：升冪排列",
		"sortDescending": "：降冪排列"
	},
	"info": "顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆",
	"infoEmpty": "顯示第 0 至 0 筆結果，共 0 筆",
	"infoThousands": ",",
	"lengthMenu": "顯示 _MENU_ 筆結果",
	"search": "搜尋：",
	"searchPlaceholder": "請輸入關鍵字",
	"thousands": ",",
	"infoFiltered": "(從 _MAX_ 筆結果中篩選)"
}

const layout = {
	'topStart': {
		'pageLength': {
			'menu': [10, 20, 30, 40, 50]
		}
	},
	'bottomStart': {
		'buttons': [{
				'extend': 'copyHtml5'
			},
			{
				'extend': 'csvHtml5'
			},
			{
				'extend': 'excelHtml5'
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
	'data': drop_SOL,
	"bAutoWidth": false,
	'layout': layout,
	'language': lang,
	"columnDefs": [{
		"targets": [4, 5, 6, 7, 8, 9, 10],
		"render": format
	}]
});
$('#UL').DataTable({
	'data': drop_UL,
	"bAutoWidth": false,
	'layout': layout,
	'language': lang,
	"columnDefs": [{
		"targets": [4, 5, 6, 7, 8, 9, 10, 11],
		"render": format
	}]
});
$('#ZL').DataTable({
	'data': drop_ZL,
	"bAutoWidth": false,
	'layout': layout,
	'language': lang,
	"columnDefs": [{
		"targets": [4, 5, 6, 7, 8, 9, 10, 11],
		"render": format
	}]
});
