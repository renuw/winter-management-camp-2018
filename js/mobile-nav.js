
$(document).ready(function() {
	$(".menu-trigger").on("click", function(e) {
	    $(this).stop(false, false).toggleClass('active');
        $(".mobilenav").fadeToggle(500);
        $("body").toggleClass("noscroll");
	});
	$(".menu_main_contents li a").on("click", function(e) {
        $(".mobilenav").fadeToggle(500);
        $("body").toggleClass("noscroll");
        $(".menu-trigger").toggleClass("active");
	});
});
