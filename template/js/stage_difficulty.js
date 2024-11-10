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
};

const data = {{{toJSON data}}};

$('#diff_table').DataTable({
	data,
	language: lang,
	order: [],
});
