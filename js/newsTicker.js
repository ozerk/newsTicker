var active=0;
var previous=0;
$.fn.NewsTicker = function(params) {
	var defaults = {
		modid : 'news',
		width : '100%',
		color : 'default',
		effect : 'slide-hor',
		fontstyle : 'normal',
		autoplay : false,
		timer : 2000,
		feed : false,
		feedlabels : false,
		feedcount : 50,
		reloadtime: false
	};
	var feeds = [];
	var labels = [];
	var params = $.extend(defaults, params);
	
	if(params.reloadtime!=false){
		reloadRss(params);
	}

	
	return this.each(function(){
		params.modid=$("#"+$(this).attr("id"));
		var timername=params.modid;
		var active=0;
		var previous=0;
		var count=params.modid.find("ul li").length;
		var changestate=true;
		if (params.feed!=false)
		{
			getRSS(params);
		}
		else
		{
			params.modid.find("ul li").eq(active).fadeIn();
		}
		resizeEvent(params);
		
		if (params.autoplay)
		{
			timername=setInterval(function(){autoPlay(params)},params.timer);					
			$(params.modid).on("mouseenter",function (){
				clearInterval(timername);
			});
			
			$(params.modid).on("mouseleave",function (){
				timername=setInterval(function(){autoPlay(params)},params.timer);
			});
		}
		else
		{
			clearInterval(timername);
		}
		
		if (!params.border)
		{
			params.modid.addClass("newsticker-bordernone");
		}

		if (params.fontstyle=="italic")
			params.modid.addClass("newsticker-italic");
			
		if (params.fontstyle=="bold")
			params.modid.addClass("newsticker-bold");
			
		if (params.fontstyle=="bold-italic")
			params.modid.addClass("newsticker-bold newsticker-italic");
			
		params.modid.addClass("newsticker-"+params.color);
		
		// Events---------------------------------------
		$(window).on("resize",function (){
			resizeEvent(params);
		});
		
		params.modid.find(".newsticker-navi span").on("click",function(){
			if (changestate)
			{
				changestate=false;
				if ($(this).index()==0)
				{
					active--;
					if (active<0)
						active=count-1;
						
					changeNews(params);
				}
				else
				{
					active++;
					if (active==count)
						active=0;
					
					changeNews(params);
				}
			}
		});
 });
}
function reloadRss(params){
	var time=params.reloadtime*6*10000
	setTimeout(function(){
		   window.location.reload(1);
		}, time);
}
function resizeEvent(params) {
	if (params.modid.width() < 480) {
		params.modid.find(".newsticker-title h2").css({
			"display" : "none"
		});
		params.modid.find(".newsticker-title").css({
			"width" : 10
		});
		params.modid.find("ul").css({
			"left" : 30
		});
	} else {
		params.modid.find(".newsticker-title h2").css({
			"display" : "inline-block"
		});
		params.modid.find(".newsticker-title").css({
			"width" : "auto"
		});
		params.modid.find("ul").css({
			"left" : $(params.modid).find(".newsticker-title").width() + 65
		});
	}
}

function autoPlay(params) {
	active++;
	if (active == count){
		active = 0;
	}
	changeNews(params);
}

function changeNews(params) {
	if (params.effect == "fade") {
		params.modid.find("ul li").css({
			"display" : "none"
		});
		params.modid.find("ul li").eq(active).fadeIn("normal", function() {
			changestate = true;
		});
	} else if (params.effect == "slide-hor") {
		params.modid.find("ul li").eq(previous).animate({
			width : 0
		}, function() {
			$(this).css({
				"display" : "none",
				"width" : "100%"
			});
			params.modid.find("ul li").eq(active).css({
				"width" : 0,
				"display" : "block"
			});
			params.modid.find("ul li").eq(active).animate({
				width : "100%"
			}, function() {
				changestate = true;
				previous = active;
			});
		});
	} else if (params.effect == "slide-vert") {
		if (previous <= active) {
			params.modid.find("ul li").eq(previous).animate({
				top : -60
			});
			params.modid.find("ul li").eq(active).css({
				top : 60,
				"display" : "block"
			});
			params.modid.find("ul li").eq(active).animate({
				top : 0
			}, function() {
				previous = active;
				changestate = true;
			});
		} else {
			params.modid.find("ul li").eq(previous).animate({
				top : 60
			});
			params.modid.find("ul li").eq(active).css({
				top : -60,
				"display" : "block"
			});
			params.modid.find("ul li").eq(active).animate({
				top : 0
			}, function() {
				previous = active;
				changestate = true;
			});
		}
	}
}

function getRSSx(a, b, c) {
	c = new XMLHttpRequest;
	c.open('GET', a);
	c.onload = b;
	c.send()
}

function yql(a, b, feedcount) {
	return 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent('select * from ' + b + ' where url=\"' + a	+ '\" limit ' + feedcount) + '&format=json';
};
function getRSS(params) {
	
	feeds = params.feed.split(",");
	labels = params.feedlabels.split(",");
	count = 0;
	params.modid.find("ul").html("");
	xx = 0;
	for (k = 0; k < feeds.length; k++) {
		getRSSx(yql(feeds[k].trim(), 'rss',params.feedcount), function() {
			var resultx = JSON.parse(this.response);
			console.log(resultx);
			resultx = resultx.query.results.item;
			console.log(resultx);
			$(resultx).each(
					function(index, element) {
						count++;
						dataLink = $('<a>').prop('href', resultx[index].link)
								.prop('hostname');
						params.modid.find("ul").append('<li><a target="_blank" href="'+ resultx[index].link + '"><span>'+ dataLink + '</span> - '+ resultx[index].title + '</a></li>');
						if (xx == 0)
							params.modid.find("ul li").eq(0).fadeIn();
						xx++;

					});

		})
	}

}