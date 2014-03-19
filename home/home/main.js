function navBarDecorate(){

	var currenturl = window.location.pathname;
	var pathRoot = "/gratii29/home";

	if(currenturl == pathRoot+"/home/"){
		$(".home").css("text-decoration","underline");
	}else if(currenturl == pathRoot+"/brands/"){
		$(".brands").css("text-decoration","underline");
	}else if(currenturl == pathRoot+"/download/"){
		$(".download").css("text-decoration","underline");
	}	else if(currenturl == pathRoot+"/about/"){
		$(".about").css("text-decoration","underline");
	}

	$("#header-logo").click(function(){
		window.location = "http://gratii.com/home";
	});
}