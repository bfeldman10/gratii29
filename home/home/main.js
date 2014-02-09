function navBarDecorate(){
	var currenturl = window.location;
	if(currenturl == "http://gratii.com/home/"){
		$(".home").css("text-decoration","underline");
	}else if(currenturl == "http://gratii.com/brands/"){
		$(".brands").css("text-decoration","underline");
	}else if(currenturl == "http://gratii.com/download/"){
		$(".download").css("text-decoration","underline");
	}	else if(currenturl == "http://gratii.com/about/"){
		$(".about").css("text-decoration","underline");
	}

	$("#header-logo").click(function(){
		window.location = "http://gratii.com/home";
	});
}