var currentPage = 0,
	arcadeData,
	//pullDownEl,
	//pullDownOffset,
	drawArcadeRequested = false;

// var Game = function(val){
// 	title = val.title;
// 	image = "images/"+val.image;
// }

$(document).bind('touchmove', function(e) {
	e.preventDefault();
});

$(document).ready(function(){

	getAndDrawArcade();

});

function pullDownAction () {
	$('#arcadeList').remove();
	getAndDrawArcade();
	//myScroll0.refresh();
	//initializeiScroll();
}

function initializeiScroll(){

	pullDownEl = document.getElementById('pullDown');
	pullDownOffset = pullDownEl.offsetHeight;

	myScroll0 = new iScroll('wrapper0', { 
		hScrollbar: false, vScrollbar: false, lockDirection:true, 
		useTransition: true,
		topOffset: pullDownOffset,
		onRefresh: function () {
			if (pullDownEl.className.match('loading')) {
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
			}
		},
		onScrollMove: function () {
			if (this.y > 100 && !pullDownEl.className.match('flip')) {
				pullDownEl.className = 'flip';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
				this.minScrollY = 0;
			} else if (this.y < 100 && pullDownEl.className.match('flip')) {
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
				this.minScrollY = -pullDownOffset;
			}
		},
		onScrollEnd: function () {
			if (pullDownEl.className.match('flip')) {
				pullDownEl.className = 'loading';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';				
				pullDownAction();	// Execute custom function (ajax call?)
			}
		}
	});

	myScroll1 = new iScroll('wrapper1', { hScrollbar: false, vScrollbar: false, lockDirection:true });
	myScroll2 = new iScroll('wrapper2', { hScrollbar: false, vScrollbar: false, lockDirection:true });
	myScroll3 = new iScroll('wrapper3', { hScrollbar: false, vScrollbar: false, lockDirection:true });
}

// Change page functions-------------------------------
function highlightSelectedNavItem(selectedPage){ //Highlight selected navItem
	console.log("Highlighting .navItem("+selectedPage+")...");
	$(".navItem:eq("+selectedPage+")").children().css("color","red");
	$(".navItem:eq("+selectedPage+")").children().css("opacity","1");
	console.log(".navItem("+selectedPage+") highlighted#");
}

function dimOtherNavItems(selectedPage){ //Dim non-selected navItems
	console.log("Dimming navItems other than .navItem("+selectedPage+")...");
	$(".navItem:eq("+selectedPage+")").siblings().children().css("color","blue");
	$(".navItem:eq("+selectedPage+")").siblings().children().css("opacity",".5");
	console.log("Dimmed navItems other than .navItem("+selectedPage+")#");
}

function changePage(selectedPage){ //Scroll to the new page	
	console.log("Switching to page "+selectedPage+"...");
	$(".main").clearQueue();

	if(selectedPage === 0){
		$(".main").animate({"marginLeft":"0px"}, 500);
	}else if(selectedPage === 1){
		$(".main").animate({"marginLeft":"-100%"}, 500);
	}else if(selectedPage === 2){
		$(".main").animate({"marginLeft":"-200%"}, 500);
	}else if(selectedPage === 3){
		$(".main").animate({"marginLeft":"-300%"}, 500);
	}
	
	currentPage = selectedPage;	
	console.log("On page "+selectedPage+"#");
}

// $(".navItem").on('click', function(){ //Mouse click on navItem
// 	console.log(".navItem onClick detected...");
// 	var selectedPage = $(this).index();
// 	if(selectedPage===currentPage){
// 		console.log('Already on this page');
// 		return;
// 	}
// 	changePage(selectedPage, 
// 		dimOtherNavItems(selectedPage,
// 			highlightSelectedNavItem(selectedPage)
// 		)
// 	)
// 	console.log(".navItem onClick executed#");
// });

$(".navItem").on('touchstart', function(){ //Mobile touch on navItem
	var selectedPage = $(this).index();
	if(selectedPage===currentPage){
		console.log('Already on this page');
		return;
	}
	runFunctionChain([highlightSelectedNavItem(selectedPage), 
						dimOtherNavItems(selectedPage),
						changePage(selectedPage)]);

});
// End of Change page functions-------------------------------

// Load arcade data-------------------------
function getArcadeData(){
	console.log("Arcade data requested...");

	$.ajax({
        url: "js/arcade.json",
        type: 'GET',
        async: true,
        cache: false,
        timeout: 30000,
        error: function(){
            return true;
        },
        success: function(data){ 
            console.log("Arcade data received#")
            arcadeDataReceived(data);
        }
    });
}

function arcadeDataReceived(data){

	console.log("Mapping arcade data to var arcadeData...");
	arcadeData = data;
	console.log("Arcade data mapped to arcadeData#");

	if(drawArcadeRequested===true){
		drawArcadeList();
	}else{
		console.log("Not drawing arcade list#");
	}

}

function drawArcadeList(){
	console.log("Drawing arcade list...");
	
	$("#arcade").append('<ul class="list" id="arcadeList" style="overflow:visible;">');
	$.each(arcadeData, function(key, val){
		
		//new Game(val);
		arcadeLI = drawArcadeLI(val.id,
								val.title,
								val.image,
								val.highScore,
								val.totalGratii,
								val.top1,
								val.top2,
								val.top3,
								val.top4,
								val.top5,
								val.top6,
								val.top7,
								val.top8,
								val.top9,
								val.top10,
								val.top1Score,
								val.top2Score,
								val.top3Score,
								val.top4Score,
								val.top5Score,
								val.top6Score,
								val.top7Score,
								val.top8Score,
								val.top9Score,
								val.top10Score);

		
		$("#arcadeList").append(arcadeLI);

		initiateSnapScroller("arcadeList", val.id);

	});
	$("#arcade").append('</ul>');
	initializeiScroll();
	console.log("Arcade list appended to page#");
}

function drawArcadeLI(id, title, image, highScore, totalGratii,
				top1, top2, top3, top4, top5, top6, top7, top8, top9, top10,
				top1Score, top2Score, top3Score, top4Score, top5Score, 
				top6Score, top7Score, top8Score, top9Score, top10Score){

	li = 
	'<li id="snap_'+id+'">'+
		'<div id="scroller">'+
			'<div class="arcadeFrame" id="a" style="background-image:url(images/arcade/'+image+');">'+
			'</div>'+
			'<div class="arcadeFrame" id="b">'+
				'<div class="myScores">'+
					'<font class="myHighScore">My best: '+highScore+'</font>'+
					'<font class="myTotalGratii">Total gratii: '+totalGratii+'</font>'+
				'</div>'+
				'<table class="top10">'+
					'<tr>'+
						'<td>'+top1+': '+top1Score+'</td>'+
						'<td>'+top6+': '+top6Score+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+top2+': '+top2Score+'</td>'+
						'<td>'+top7+': '+top7Score+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+top3+': '+top3Score+'</td>'+
						'<td>'+top8+': '+top8Score+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+top4+': '+top4Score+'</td>'+
						'<td>'+top9+': '+top9Score+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+top5+': '+top5Score+'</td>'+
						'<td>'+top10+': '+top10Score+'</td>'+
					'</tr>'+
				'</table>'+
			'</div>'+
		'</div>'+
		'<ul id="indicator">'+
			'<li class="active"></li>'+
			'<li></li>'+
		'</ul>'+
	'</li>';

	return li;
}

function initiateSnapScroller(listType, listItemID){

	new iScroll('snap_'+listItemID, {
		snap: true,
		momentum: false,
		hScrollbar: false,
		vScrollbar: false,
		lockDirection:true,
		onScrollEnd: function () {
			document.querySelector('#'+listType+' #snap_'+listItemID+' #indicator > li.active').className = '';
			document.querySelector('#'+listType+' #snap_'+listItemID+' #indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
		}
	});
}

function getAndDrawArcade(){
	drawArcadeRequested = true;
	getArcadeData();
}
// End of arcade data---------------

// Function chain engine------------------
runFunctionChain = function(functionArray) {
    //extract the first function        
    var nextFunction = functionArray.splice(0, 1);

    //run it. and wait till its finished 
    nextFunction[0].promise().done(function() {

        //then call run animations again on remaining array
        if (functionArray.length > 0){
        	runFunctionChain(functionArray);
        }
    });
}
// End of function chain engine-------------
