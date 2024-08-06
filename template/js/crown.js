const
	SOL = {{{SOL}}},
	UL = {{{UL}}},
	ZL = {{{ZL}}},
	COLLAB = {{{COLLAB}}},
	MONTHY = [
		[1, '新年快樂？', '新年、あけました！おめっ…', 10, 15, 20, 30],
		[2, '被召喚的福！', '召喚された福！', 10, 15, 20, 25],
		[3, '人偶架上的戰士們', '雛壇の戦士達', 10, 15, 20, 30],
		[4, '春天來了!高校教師', '春だよ！高校教師', 10, 15, 20, 30],
		[5, '相思病戀歌', 'コイの五月病', 10, 15, 20, 30],
		[6, '禁斷之妻', '禁断の花嫁', 10, 15, 20, 30],
		[7, '因為夏天喵！', 'だって夏じゃニャーイ！', 10, 15, 20, 30],
		[8, '返鄉熱潮！', 'あの世からの帰省ラッシュ！', 10, 15, 20, 30],
		[9, '在鎮上看到的超強老人', '町でみたすごい老人', 10, 15, 20, 30],
		[10, '秋天運動會！', '秋だよ運動会！', 10, 15, 20, 30],
		[11, '勞動感謝特別活動！', '勤労感謝スペシャル！', 10, 15, 20, 30],
		[12, '聖誕節居然來了！', 'なんとクリスマスが来た！', 10, 15, 20, 30],
	],
	STAR = [
		['月間活動全明星 特別紀念！', 10, 15, 20, 0],
		['月間活動全明星 超強紀念！', 10, 15, 20, 0],
		['月間活動全明星 無敵紀念！', 10, 15, 20, 0],
		['月間活動全明星 絕佳紀念！', 10, 15, 20, 0],
		['活動全明星關卡 卓越紀念！', 10, 15, 20, 0],
		['活動全明星 偉大紀念！', 10, 15, 20, 0],
	],
	lang = {
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

const F = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': 2
});

function format(num) {
	if (num)
		return (num / 10).toString(); //return F.format(num);
	return '';
}
$('#SOL').DataTable({
	'data': SOL,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [3, 4, 5, 6],
		"render": format
	}]
});
$('#UL').DataTable({
	'data': UL,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [3, 4, 5, 6],
		"render": format
	}]
});
$('#ZL').DataTable({
	'data': ZL,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [3, 4, 5, 6],
		"render": format
	}]
});
$('#MONTHY').DataTable({
	'data': MONTHY,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [3, 4, 5, 6],
		"render": format
	}]
});
$('#STAR').DataTable({
	'data': STAR,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [1, 2, 3, 4],
		"render": format
	}]
});
$('#COLLAB').DataTable({
	'data': COLLAB,
	"bAutoWidth": false,
	'language': lang,
	"columnDefs": [{
		"targets": [3, 4, 5, 6],
		"render": format
	}],
	'rowGroup': {
		'dataSrc': 0
	}
});
const _sis = document.getElementById('site-search');
const _s_r = document.getElementById('site-s-result');

document.getElementById('search-btn').onclick = function(event) {
	event.preventDefault();
	event.currentTarget.previousElementSibling.style.display = 'inline-block';
}
_sis.oninput = _sis.onfocus = _sis.onkeydown = function() {
	_s_r.style.display = 'block';
}
_sis.onblur = function() {
	setTimeout(function() {
		_s_r.style.display = 'none';
	}, 500);
}

function _s_open(w) {
	location.href = w + _sis.value;
}
_sis.parentNode.onsubmit = function(e) {
	if (!_sis.value)
		return false;
	if (location.href.includes('enemy') || location.href.includes('esearch'))
		location.href = '/esearch.html?q=' + _sis.value;
	else if (location.href.includes('stage'))
		location.href = '/stage.html?q=' + _sis.value;
	else
		location.href = '/search.html?q=' + _sis.value;
	return false;
}
