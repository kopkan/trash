$('body').append("<div id=debugInfo><div>");
$('#debugInfo').append("<div id=debugInfoPosition></div>");
$('#debugInfo').append("<div id=debugInfoScroll></div>");
$('#debugInfo').append("<div id=debugInfoClicks></div>");
$('#debugInfo').append("<div id=debugDropClicks>drop click</div>");


$('#debugInfo').css("position", "fixed");
$('#debugInfo').css("border", "4px double black");
$('#debugInfo').css("right", "0");
$('#debugInfo').css("bottom", "0");


$('html').mousemove(function (e) {
	$("#debugInfoPosition").html("<div>" + e.pageX + " , " + e.pageY + "<div>");
});

$(window).scroll(function (e) {
	$("#debugInfoScroll").html("<div>" + window.pageXOffset + " , " + window.pageYOffset + "<div>");
});


$('html').click(function (e) {
	$("#debugInfoClicks").append("<div>" + e.pageX + " , " + e.pageY + "<div>");
});

$('#debugDropClicks').click(function (e) {
	setTimeout(function(){
		$("#debugInfoClicks").html("");
	},0);	
});
