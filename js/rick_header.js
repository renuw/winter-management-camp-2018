/*
◆ 使い方 ◆
対象の要素のclass名に"rick_header"を入れるとスクロール時に画面上部にふわっと表示されます。

また、以下のオプションが利用できます。
・ターゲットデバイス				… data-rh-target（pc/sp/pc,sp・・指定がなければＰＣ・ＳＰ両方に適用）
・表示までの長さ					… data-rh-delay（単位はミリ秒　※100以上の設定が必要）
・フェードインの時間				… data-rh-fade-time（単位はミリ秒）
・ふわっと表示開始の高さ			… data-rh-height（単位はピクセル・・指定がなければrick_headerの高さ）
・ふわっと表示開始までの表示有無	… data-rh-disp（0(非表示)/1(表示)・・指定がなければ表示）

◆ 必要なもの ◆
・jQuery

◆ バージョン ◆
1.00
*/

$(function() {
	var _ua = (function(u){
		return {
			Tablet:(u.indexOf("windows") != -1 && u.indexOf("touch") != -1 && u.indexOf("tablet pc") == -1)
				|| u.indexOf("ipad") != -1
				|| (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
				|| (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
				|| u.indexOf("kindle") != -1
				|| u.indexOf("silk") != -1
				|| u.indexOf("playbook") != -1,
			Mobile:(u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
				|| u.indexOf("iphone") != -1
				|| u.indexOf("ipod") != -1
				|| (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
				|| (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
				|| u.indexOf("blackberry") != -1
		}
	})(window.navigator.userAgent.toLowerCase())

	var $rick_header_target = null;
	var _device = (_ua.Mobile) ? "sp" : "pc";
	$('.rick_header').each( function(i, e) {
		if ($rick_header_target) return;
		if ($(e).data("rh-target") == undefined || $(e).data("rh-target").indexOf(_device) >= 0) $rick_header_target = $(e);
	});
	// ターゲットが存在する場合
	if ($rick_header_target) {
		var rick_header_timer = null;
		var pre_position = 0;
		var delay = ($rick_header_target.data("rh-delay") != undefined) ? $rick_header_target.data("rh-delay") : "100";
		var fade_time = ($rick_header_target.data("rh-fade-time") != undefined) ? $rick_header_target.data("rh-fade-time") : "150";
		var disp = ($rick_header_target.data("rh-disp") != undefined) ? $rick_header_target.data("rh-disp") : "1";
		var height = ($rick_header_target.data("rh-height") != undefined) ? $rick_header_target.data("rh-height") : $rick_header_target.height();

		if (disp) $rick_header_target.show().css('top', 0);
		else $rick_header_target.hide();

		$rick_header_target.css('position','absolute');
		$(window).on('scroll touchmove', function(){
			if(rick_header_timer) {
				clearTimeout(rick_header_timer);
				rick_header_timer = null;
			}
			if(height < $(window).scrollTop() ){
				$rick_header_target.hide();
				rick_header_timer = setTimeout(loop_check_top, delay);
			} else {
				if (disp) $rick_header_target.show().css('top', 0);
				else $rick_header_target.hide();
			}

		});

		function loop_check_top () {
			if ( pre_position == $(window).scrollTop() ) {
				rick_header_timer = null;
				$rick_header_target.css('top', pre_position).fadeIn(fade_time);
			}
			else {
				pre_position = $(window).scrollTop();
				rick_header_timer = setTimeout(loop_check_top, delay);
			}
		}
	}
});
