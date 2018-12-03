/*
◆ 使い方 ◆
対象の要素のclass名に"rick_anime"と、animate.cssに定義されているアニメーション名(slideInRightとか)を入れると
スクロール時にアニメーションすることができます。
※ただしclass名に"animated"が含まれていると動きません。

また、以下のオプションが利用できます。
・スマホ用のアクション		… data-ra-sp-action（指定がなければclass名の指定に従う）
・delay						… data-ra-delay（単位省略時は秒）
・スマホdelay				… data-ra-sp-delay（単位省略時は秒・・指定がなければＰＣ版の指定に従う）
・実行時間					… data-ra-duration（単位省略時は秒）
・スマホ実行時間			… data-ra-sp-duration（単位省略時は秒・・指定がなければＰＣ版の指定に従う）
・第二アニメdelay			… data-ra-after-delay（単位省略時は秒）
・第二アニメスマホdelay		… data-ra-sp-after-delay（単位省略時は秒・・指定がなければＰＣ版の指定に従う）
・第二アニメ実行時間		… data-ra-after-duration（単位省略時は秒）
・第二アニメスマホ実行時間	… data-ra-sp-after-duration（単位省略時は秒・・指定がなければＰＣ版の指定に従う）
・第二アニメ				… data-ra-after-anime（animate.cssのanime指定）
・第二アニメ（スマホ）		… data-ra-sp-after-anime（animate.cssのanime指定・・指定がなければＰＣ版の指定に従う）

◆ 関数 ◆
・ra_set_scroll_target($obj)		スクロールベース設定
　$obj … 新スクロールベース
・ra_get_targets()					ターゲット要素再計算

◆ コールバック ◆
・第一アニメ実行時	… ra-start
・第一アニメ終了時	… ra-end
・第二アニメ実行時	… ra-after-start
・第二アニメ終了時	… ra-after-end

◆ 必要なもの ◆
・jQuery
・animate.css

◆ バージョン ◆
1.00
1.01	対象要素のtop再計測を200ms後に実行するように修正
1.02	第二アニメを実装
1.03	アニメ終了時イベント変更、第二アニメ終了イベント追加
1.10	スマホ用アニメーション追加
1.11	スマホ用設定追加
1.12	スマホ対応により、スマホ設定がない場合にＰＣ設定を引き継がないようになっていた不具合を修正
1.13	それなりに重いサイトで、画面初期表示時にrick_anime要素がちらっと見えてしまう現象を修正（※ただし、animatedの指定が必要）
1.20	初回取得時、高さ0pxの要素も範囲内であればアニメーション対象とするように修正（display:none対策）
1.21	第二アニメ未設定時、第一アニメ終了イベントがra-afterになっていた不具合を修正
1.22	リサイズ時に要素の再計算処理追加、任意のタイミングで再計算できる関数を用意
1.23	スクロールベース要素の変更機能追加
1.24	初期表示時の要素が出ないことがある不具合修正
*/

var targets = [];
var scroll_flg = true;
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
})(window.navigator.userAgent.toLowerCase());
var $ra_scroll_target = null;
function ra_set_scroll_target($target) {
	if ($ra_scroll_target) $ra_scroll_target.off('.ra_scroll');
	$ra_scroll_target = $target;
	$ra_scroll_target.on('scroll.ra_scroll', function() {
		scroll_flg = true;
	});

}

// ターゲット取得処理
function ra_get_targets() {
	var effect_classes = [
		"bounce","flash","pulse","rubberBand","shake","swing","tada","wobble","jello",
		"bounceIn","bounceInDown","bounceInLeft","bounceInRight","bounceInUp","bounceOut","bounceOutDown","bounceOutLeft","bounceOutRight","bounceOutUp",
		"fadeIn","fadeInDown","fadeInDownBig","fadeInLeft","fadeInLeftBig","fadeInRight","fadeInRightBig","fadeInUp","fadeInUpBig",
		"fadeOut","fadeOutDown","fadeOutDownBig","fadeOutLeft","fadeOutLeftBig","fadeOutRight","fadeOutRightBig","fadeOutUp","fadeOutUpBig",
		"flip","flipInX","flipInY","flipOutX","flipOutY","lightSpeedIn","lightSpeedOut",
		"rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight",
		"rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight",
		"slideInUp","slideInDown","slideInLeft","slideInRight","slideOutUp","slideOutDown","slideOutLeft","slideOutRight",
		"zoomIn","zoomInDown","zoomInLeft","zoomInRight","zoomInUp","zoomOut","zoomOutDown","zoomOutLeft","zoomOutRight","zoomOutUp",
		"hinge","rollIn","rollOut",
	];
	// 保管しているアニメーションを返却してtargetsリセット
	for (var key in targets) {
		targets[key]["target"].addClass(targets[key]["class"]);
	}
	targets = [];
	scroll_flg = true;
	$(".rick_anime").each(function() {
		if ( !$(this).hasClass("ra-end") ) {
			if ( $(this).hasClass("animated") ) $(this).removeClass("animated");
			var action = (_ua.Mobile && $(this).data("ra-sp-action") != undefined) ? $(this).data("ra-sp-action") : undefined;
			var delay = (_ua.Mobile && $(this).data("ra-sp-delay") != undefined) ? $(this).data("ra-sp-delay") : $(this).data("ra-delay");
			var duration = (_ua.Mobile && $(this).data("ra-sp-duration") != undefined) ? $(this).data("ra-sp-duration") : $(this).data("ra-duration");
			for ( var key in effect_classes ) {
				if ( $(this).hasClass(effect_classes[key]) ) {
					$(this).removeClass(effect_classes[key]);
					if (action == undefined) action = effect_classes[key];
					break;
				}
			}
			if ( action != undefined ) {
				// アニメーション対象を格納
				targets[targets.length] = {
					class: action, target: $(this), top: $(this).offset().top, height: $(this).height(),
					delay: "" + delay, duration: "" + duration,
				};
//console.log(key, $(this).data("ra-delay"), $(this).data("ra-duration"));
				$(this).css('visibility','hidden').on('webkitAnimationStart mozAnimationStart oAnimationStart oanimationstart animationstart', function(){
					$(this).trigger("ra-start").off('webkitAnimationStart mozAnimationStart oAnimationStart oanimationstart animationstart');
				});
//console.log($(this).height());
			}
		}
	});
}

$(function() {
	var scroll_timer = null;
	var end_count = 0;

	ra_get_targets();
	ra_set_scroll_target($(window));
	if ( targets.length !== 0 ) {
		scroll_timer_handle();
		// 初回再計測タイマー
		setTimeout(function(){
			for ( var key in targets ) {
//console.log("retry", targets[key]["target"].text(), targets[key]["top"], targets[key]["target"].offset().top);
				targets[key]["top"] = targets[key]["target"].offset().top;
				scroll_flg = true;
			}
		}, 200);
	}

	function scroll_timer_handle() {
		if ( scroll_flg ) {
			scroll_flg = false;
			var window_height = $(window).height();
			var window_top = $ra_scroll_target.scrollTop();
//console.log("window top & height", window_top, window_height, window_top + window_height);

			var end_targets = [];
			for ( var key in targets ) {
				// 範囲内にきた場合、アニメーション実行
				if (targets[key]["top"] < window_top + window_height && targets[key]["top"] + targets[key]["height"] >= window_top) {
					update_delay(targets[key]["target"], targets[key]["delay"]);
					update_duration(targets[key]["target"], targets[key]["duration"]);
					// 第二のアニメがある場合、設定
					var sp_sec_action = (_ua.Mobile) ? targets[key]["target"].data("ra-sp-after-anime") : undefined;
					var sec_action = (sp_sec_action == undefined) ? targets[key]["target"].data("ra-after-anime") : sp_sec_action;
					if ( sec_action != undefined ) {
						targets[key]["target"].data("ra-del-class", targets[key]["class"]);
						targets[key]["target"].data("after-key", key).data("after-anime", sec_action).on('webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend', function(){
							if ( $(this).data("ra-del-class") != undefined ) {
								// アニメーション終了後に、再度アニメをやり直す
								var delay = (_ua.Mobile && $(this).data("ra-sp-after-delay") != undefined) ? $(this).data("ra-sp-after-delay") : $(this).data("ra-after-delay");
								var duration = (_ua.Mobile && $(this).data("ra-sp-after-duration") != undefined) ? $(this).data("ra-sp-after-duration") : $(this).data("ra-after-duration");
								update_delay($(this), "" + delay);
								update_duration($(this), "" + duration);
								$(this).removeClass($(this).data("ra-del-class")).addClass($(this).data("after-anime")).removeData("ra-del-class").trigger("ra-end");
								$(this).on('webkitAnimationStart mozAnimationStart oAnimationStart oanimationstart animationstart', function(){
									$(this).trigger("ra-after-start").off('webkitAnimationStart mozAnimationStart oAnimationStart oanimationstart animationstart');
								});
							}
							else {
								$(this).trigger("ra-after-end").off('webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend');
							}
						});
					}
					else {
						// 終了イベント
						targets[key]["target"].on('webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend', function(){
							$(this).trigger("ra-end").off('webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend');
						});
					}
//console.log("exec!!", targets[key]["class"]);
					// animate.css実行
					targets[key]["target"].css('visibility','visible').addClass("animated " + targets[key]["class"]);
					end_targets[end_targets.length] = key;
				}
			}
			// ループ終了後、後ろから削除
			for ( var i = end_targets.length - 1; i >= 0; i-- ) {
//console.log(end_targets[i]);
				// アニメ終了フラグを付与
				targets[end_targets[i]]["target"].addClass("ra-end");
				targets.splice(end_targets[i], 1);
			}
		}
//console.log("timer end", targets, targets.length);
		if ( targets.length !== 0 ) {
			scroll_timer = setTimeout(scroll_timer_handle, 50);
		}
	}

	function update_delay($obj, value) {
		$obj.css({ 'animation-delay': '', '-webkit-animation-delay': '', });
		if ( value != "undefined" ) {
			var delay = (value.match(/^[\d\.]+$/)) ? value + "s" : value;
			$obj.css({ 'animation-delay': delay, '-webkit-animation-delay': delay, })
		}
	}
	function update_duration($obj, value) {
		$obj.css({ 'animation-duration': '', '-webkit-animation-duration': '', });
		if ( value != "undefined" ) {
			var duration = (value.match(/^[\d\.]+$/)) ? value + "s" : value;
			$obj.css({ 'animation-duration': duration, '-webkit-animation-duration': duration, })
		}
	}

	$(window).on('resize', function() {
		scroll_flg = true;
		// 高さが変動するので再計算
		ra_get_targets();
	});
});