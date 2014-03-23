var currentPage = 0,
	currentAuctionScope = 0,
	currentProfileScope = 0,
	currentInboxScope = 0,
	secondsPerAuction = 2100,
	gameObjects = [],
	auctionObjects = [],
	inboxObjects = [],
	transactionObjects = [],
	pageObjects = [],
	verticaliScrolls = [],
	drawArcadeRequested = false,
	drawAuctionRequested = false,
	drawInboxRequested = false,
	drawTransactionsRequested = false,
	stopSignVisible = false,
	loggedIn = false,
	userFBLoggedIn = false,
	inboxUpdateRequested = false,
	auctionUpdateRequested = false,
	triggerMessageInProgress = false,
	sessionID = 0,
	newMessages = 0,
	apiRoot = "../backend/public/api/v1/",
	inApp = true;

// if (window.navigator.standalone) {
//   	inApp = true;
// } else {
	
// 	$(".homeScreen").hide();

// 	if($(window).width() == "320"){

// 		if(navigator.userAgent.match('CriOS')) {
// 		   //Mobile chrome
// 		    $(".downloadInstructions").html("</br></br>Sorry, Gratii is only available on mobile Safari at this time. Please reopen this link in Safari.");
// 			$(".downloadInstructions").css({"font-size":"26px", "color":"red", "text-align":"center"});
// 			$(".downloadScreen").show();
// 			window.setTimeout(function(){
// 				$(".downloadInstructions").append("</br></br><font style='font-size:18px; color:black'>Redirecting to gratii.com...</font>");
// 				window.setTimeout(function(){
// 					window.location = "../home/home";
// 				}, 3000);
// 			}, 4000);	
// 		} else {
// 			//Not mobile chrome
// 			$(".downloadScreen").show();
// 		}

// 	}else{
		
// 		$(".downloadInstructions").html("</br></br>Sorry, Gratii is only available on iPhone at this time.");
// 		$(".downloadInstructions").css({"font-size":"26px", "color":"red", "text-align":"center"});
// 		$(".downloadScreen").show();
// 		window.setTimeout(function(){
// 			$(".downloadInstructions").append("</br></br><font style='font-size:18px; color:black'>Redirecting to gratii.com...</font>");
// 			window.setTimeout(function(){
// 				window.location = "../home/home";
// 			}, 3000);
// 		}, 4000);	
// 	}

// }


function is_touch_device() {

  return 'ontouchstart' in window // works on most browsers 
      || 'onmsgesturechange' in window; // works on ie10
};

/*************Convert JS Date to MySql Format***************/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};
/*************Convert JS Date to MySql Format***************/

window.setInterval(function(){
	var online = navigator.onLine;
	if(!online){
		alert("Uh oh, you lost your internet connection! You must have internet to use Gratii.");
		$(".homeScreen").show();
	}
},30000);

$(document).bind('touchmove', function(e) {
	e.preventDefault();
});

$(window).resize(function() {
	$(".homeScreenLogo").css({"height":($(window).width()*.25)});
  	$(".mainLI").css({"height":($(window).width()*.5)});
  	$(".arcadeLI").css({"height":($(window).width()*.5)});
  	$(".messageContentContainer").css({"height":(($(window).width()*.5)+50)});
});

$(document).ready(function(){
	document.addEventListener("touchstart", function(){}, true);
	$(".homeScreenLogo").css({"height":($(window).width()*.25)});
	$(".downloadScreenLogo").css({"height":($(window).width()*.25)});

	if(inApp === true){
		getData("session");
		getData("arcade");
		getData("auctions");
		getData("inbox");
		getData("transactions");
		hideFunctions();
		initializeVerticaliScroll(3, false);
	}
	
	FastClick.attach(document.body);

});

// START home screen------------------------
function hideFunctions(){

	if($(window).width() == 320){
		$(".homeScreen input, .homeScreen select, .homeScreen textarea").focus( function(){
			$("#inbox input, #inbox select, #inbox textarea").prop('disabled', true);
			$("#profile input, #profile select, #profile textarea").prop('disabled', true);
		});

		$("#inbox input, #inbox select, #inbox textarea").focus( function(){
			$(".homeScreen input, .homeScreen select, .homeScreen textarea").prop('disabled', true);
			$("#profile input, #profile select, #profile textarea").prop('disabled', true);
		});

		$("#profile input, #profile select, #profile textarea").focus( function(){
			$(".homeScreen input, .homeScreen select, .homeScreen textarea").prop('disabled', true);
			$("#inbox input, #inbox select, #inbox textarea").prop('disabled', true);
		});

		$("input, select, textarea").blur( function(){
			$("input, select, textarea").not(this).prop('disabled', false);
			$(".settings #email").prop('disabled', true);
		});
	}

	$('.stopSignWrapper').on('click', function(e) { 	

  		event.stopPropagation();
  		
  		if(e.target.tagName != "DIV"){
  			return;
  		}else{
  			hideStopSign();
  		}
	});

	$(".gratiiLogo#header").click(function(){
		if(user.gameInProgress.length == 0){
			location.reload();
		}
	});

	$('#twitterConnect').click(function(){
    	console.log("click!");
    	if(user.twitterOAuthToken=="---"){
    		window.location = '../backend/app/controllers/twitterSDK/redirect.php';	
    	}
    		
	});


	$(".peekAround").on('click', function(){
		event.preventDefault();
		$(".homeScreen").hide();
	});

	$("#dimmer").on('click', function(){
		event.stopPropagation();
		if(stopSignVisible===true){
			hideStopSign();
		}
	});

	$("#arcade .cancelButton").on('click', function(){
		$("#arcade .challenge").hide();
	});

	$(".backToHomeIcon").on('click', function(){
		$(".loginWrapper").hide();
		$(".signupWrapper").hide();
		$(".homeScreenButtonWrapper").show();
	});

	$(".login.button").on('click', function(){
		event.preventDefault();
		$(".homeScreenButtonWrapper").hide();
		$(".loginWrapper").show();
	});

	$(".signUp.button").on('click', function(){
		event.preventDefault();
		$(".homeScreenButtonWrapper").hide();
		$(".signupWrapper").show();
	});


	document.getElementById("upgrade").addEventListener("click", function(evt) {
	   	if(loggedIn == true){
		    var a = document.createElement('a');
		    a.setAttribute("href", "upgradeaccount.html?id="+user.id+"&username="+user.username);
		    a.setAttribute("target", "_blank");

		    var dispatch = document.createEvent("HTMLEvents");
		    dispatch.initEvent("click", true, true);
		    a.dispatchEvent(dispatch);
		}else{
			triggerErrorMessage("notLoggedIn");
		}
	}, false);


	$(".signupButton").click(function(){
		$(".signupButton").html('please wait..');
		var userEmail = $(".signupWrapper .email").val();
		var usernameInput = $(".signupWrapper .usernameInput").val();
		var userPassword = $(".signupWrapper .passwordInput").val();
		var referralUsername = $(".signupWrapper .referralInput").val();
		var userGender = $(".signupWrapper .genderSelect").find(":selected").val();
		var userBirthMonth = $(".signupWrapper .monthSelect").find(":selected").val();
		var userBirthDate = $(".signupWrapper .dateSelect").find(":selected").val();
		var userBirthYear = $(".signupWrapper .yearSelect").find(":selected").val();

		$.ajax({
	        url: apiRoot+"user",
	        type: 'POST',
	        dataType: 'json',
	        data: { userEmail: userEmail, 
	        		userNickname: usernameInput,
	        		userPassword: userPassword,
	        		promoterUserNickname: referralUsername,
	        		userGender: userGender,
	        		userBirthMonth: userBirthMonth,
	        		userBirthDate: userBirthDate,
	        		userBirthYear: userBirthYear },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON;
	        	alert(jsonResponse['msg']);
	        	$("#profile #save").css({color:"red"});
	        	$(".signupButton").html('Try again');
	            return true;
	        },
	        success: function(data){ 
	        	$(".signupWrapper").html('<font style="font-family:Trebuchet MS; font-size:18px"><b>Success!</b></br></br>You should receive an activation email shortly. You must open it to verify your account before you can log in. If you do not receive an email within 5 minutes (make sure you check your spam folders!), contact support: </br> info@gratii.com.');
	        }
	    });

	});

	$("#profile #save").click(function(){
		
		$("#profile #save").html('please wait..');
		var userEmail = $("#profile #email").val();
		var usernameInput = $("#profile #username").val();
		var userGender = $("#profile #gender").find(":selected").val();
		var userBirthMonth = $("#profile #month").find(":selected").val();
		var userBirthDate = $("#profile #date").find(":selected").val();
		var userBirthYear = $("#profile #year").find(":selected").val();

		$.ajax({
	        url: apiRoot+"user/"+sessionID,
	        type: 'PUT',
	        dataType: 'json',
	        data: { userEmail: userEmail, 
	        		userNickname: usernameInput,
	        		userGender: userGender,
	        		userBirthMonth: userBirthMonth,
	        		userBirthDate: userBirthDate,
	        		userBirthYear: userBirthYear },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON;
	        	console.log(jsonResponse['msg']);
	        	alert(jsonResponse['msg']);
	        	$("#profile #save").css({color:"red"});
	        	$("#profile #save").html('Try again');
	            return true;
	        },
	        success: function(data){ 
	        	$("#profile #save").css({color:"lightgreen"});
	        	$("#profile #save").html('Success!');

	        	
	        	window.setTimeout(function () {
			    	$("#profile #save").html('Save');
			    	$("#profile #save").css({color:"white"});
				}, 3000);
	        	
	        }
	    });

	});

	$(".send .sendButton").on('click', function(){

		if(loggedIn===false){
			triggerErrorMessage("notLoggedIn");
			return;
		}

		$(".send .sendButton").html('sending..');
		
		var recipientNicknames = [];
		var recipientNickname = $(".send #username").val();
		recipientNicknames.push(recipientNickname);
		var gift = $(".send #gift").val();
		var textMessage = $(".send #textMessage").val();

		if(recipientNickname == ""){
			triggerErrorMessage("default", "Please enter a username you want to send this message to.");
			$(".send .sendButton").html('Send');
			return;
		}else if(textMessage == ""){
			triggerErrorMessage("default", "Whoops, you forgot to write a messge.");
			$(".send .sendButton").html('Send');
			return;
		}else if(textMessage.length > 150){
			var overload = textMessage.length-150;
			triggerErrorMessage("default", "Your message is too long. Please remove "+overload+" characters.");
			$(".send .sendButton").html('Send');
			return;
		}else if(recipientNickname == user.username){
			triggerErrorMessage("default", "You can't send a message to yourself silly.");
			$(".send .sendButton").html('Send');
			return;
		}
		
		if(gift>0){
			var template = "userGift";
		}else{
			var template = "userText";
		}

		$.ajax({
	        url: apiRoot+"msg",
	        type: 'POST',
	        dataType: 'json',
	        data: { recipientNicknames: recipientNicknames, 
	        		gratiiReward: gift,
	        		template: template,
	        		body: textMessage},
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON; //come back to this
	        	console.log(jsonResponse['msg']);
	        	if(jsonResponse['msg'].substring(0, 5) == "PRO##"){
	        		var errorMessage = jsonResponse['msg'].replace("PRO##", "");
	        	}else{
					var errorMessage = jsonResponse['msg'];
	        	}
	        	triggerErrorMessage("default", errorMessage);
	        	$(".send .sendButton").css({color:"red"});
	        	$(".send .sendButton").html('Try again');
	            return true;
	        },
	        success: function(data){ 
	        	$(".send .sendButton").css({color:"lightgreen"});
	        	$(".send .sendButton").html('Message sent!');
	        	$(".send #username").val('');
	        	$(".send #gift").val('0');
	        	$(".send #textMessage").val('');


	        	
	        	window.setTimeout(function () {
			    	$(".send .sendButton").html('Send');
			    	$(".send .sendButton").css({color:"white"});
				}, 5000);
	        	
	        }
	    });
	});

	$(".whatFor").on('click', function(){
		alert("Knowing the demographics of our fans helps us get better prizes for you. Also, certain prizes offered on Gratii have age restrictions. We will never share your personally identifiable information with any third party. Period.");
	});

	$(".scopeButton").on('click', function(){
		if(stopSignVisible===true){
			hideStopSign();
		}
	});

	$("#gameiFrame").on('click', function(event){
		event.stopPropagation();
	});

	$(".loginButton").click(function(){
		
		$(".loginButton").html('please wait..');
		var userEmail = $(".loginWrapper .emailInput").val();
		var userPassword = $(".loginWrapper .passwordInput").val();

		$.ajax({
	        url: apiRoot+"user/login",
	        type: 'POST',
	        dataType: 'json',
	        data: { userEmail: userEmail, 
	        		userPassword: userPassword },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON;
	        	if(jsonResponse){
	        		alert(jsonResponse['msg']);
	        	};
	        	console.log(data);
	        	$("#profile #save").css({color:"red"});
	        	$(".loginButton").html('Try again');
	            return true;
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	$(".loginButton").html(data['msg']);
	        	location.reload();
	        }
	    });
	});
	

	$("#passwordReset").on('click', function(){
		if(loggedIn === false){
			triggerErrorMessage("notLoggedIn");
			return;
		}

		$.ajax({
	        url: apiRoot+"user/password/request",
	        type: 'PUT',
	        data: {userEmail: user.email},
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log(data);

	        	triggerErrorMessage("default");
	        	
	            return true;
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	alert("An email has been sent");
	        }
	    });

	});

	$(".forgotPassword").click(function(){

		var userEmail = $(".emailInput").val();

		if(userEmail==""){
			alert("Please enter your email so we can send you password reset instructions.");
			return;
		}

		$.ajax({
	        url: apiRoot+"user/password/request",
	        type: 'PUT',
	        data: {userEmail: userEmail},
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log(data);

	        	alert("Something broke.. please try again.");
	        	
	            return true;
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	alert("An email has been sent");
	        }
	    });
	});
}
// END home screen------------------------

// iScroll Functions-------------------------------

function initializeVerticaliScroll(pageIndex, snapTo){

	this.snapTo = snapTo;
	this.momentum = pageIndex==1?false:true;
	this.wrapperEl = "iScrollVerticalWrapper"+pageIndex;

	if(verticaliScrolls[pageIndex]){
		verticaliScrolls[pageIndex].destroy();
	}

	verticaliScrolls[pageIndex] = new iScroll(wrapperEl, { 
		snap: this.snapTo,
		hScrollbar: false, 
		vScrollbar: false, 
		lockDirection:true, 
		// useTransform: false, //<---Uncomment to save memory if crashing occurs
		momentum: this.momentum,
		onBeforeScrollStart: function (e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
        }
	});
}

function initializeHorizontaliScroll(wrapperID){

	new iScroll(wrapperID, {
		snap: true,
		momentum: false,
		vScroll: false,
		hScrollbar: false,
		vScrollbar: false,
		lockDirection:true,
		onScrollEnd: function () {
			document.querySelector('#'+wrapperID+' #indicator > li.active').className = '';
			document.querySelector('#'+wrapperID+' #indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
		}

	});

}


// End iScroll Functions-------------------------------




// start of User-------------------------
var User = function(val){ //Game object
	this.id = sessionID;
	this.email = val.userEmail;
	this.username = val.userNickname;
	this.month = val.userBirthMonth;
	this.date = val.userBirthDate;
	this.year = val.userBirthYear;
	this.gender = val.userGender;
	this.PRO = val.PRO;
	this.isPRO = this.PRO > new Date().toMysqlFormat() ? true : false;
	this.gratii = val.userGratii;
	this.rank = val.userRank;
	this.secondsAddedToAuction = val.secondsAddedToAuction;
	this.totalUsers = val.totalUsers;
	this.twitterOAuthToken = val.twitterOAuthToken;
	
	if(this.gratii == "0"){
		this.rank = this.totalUsers;
	}

	if(this.rank.slice(-1) == "1" && this.rank.slice(-2) != "11" ){
		this.rankGrammarText = "st";
	}else if(this.rank.slice(-1) == "2"){
		this.rankGrammarText = "nd";
	}else if(this.rank.slice(-1) == "3"){
		this.rankGrammarText = "rd";
	}else{
		this.rankGrammarText = "th";
	}

	this.newMessages = 0;
	this.gameInProgress = [];
	this.challengeIssueInProgress = false;
	this.challengeIDInProgress = 0;
	this.challengeResponseInProgress = false;
	this.arcadeEvents = [];	
}

User.prototype.completeProfile = function(){
	$("#profile #email").val(this.email);
	$("#profile #username").val(this.username);
	$("#profile #month").val(this.month);
	$("#profile #date").val(this.date);
	$("#profile #year").val(this.year);
	$("#profile #gender").val(this.gender);
	$(".header .gratiiScore").html(this.gratii);
	$("#profile #twitterShare").attr("href", "https://twitter.com/intent/tweet?button_hashtag=BonusGratii&text=When%20you%20signup%20for%20the%20new%20Gratii%20app%2C%20type%20%22"+this.username+"%22%20in%20as%20the%20referral%20please!%20Thanks%20http%3A//gratii.com");

	if(loggedIn===true){
		$("#profile .rank").html("My Gratii Rank: <b>"+this.rank+this.rankGrammarText+"</b> out of "+this.totalUsers+" players");
	}
	if(this.twitterOAuthToken!="---"){
		$("#profile #twitterConnect").css("background-image", "none");
		$("#profile #twitterConnect").html("Twitter account connected");
		$("#profile #twitterConnect").css("width", "200px");
	}

	if(this.isPRO === true){
		$("#profile .accountStatusText").html("You crush it! You got a <font style='color:lightgreen;font-weight:bold;font-family:boostsskregular;font-size:20px;text-align:center;'>Gratii PRO</font> account.</br>Expires: "+this.PRO);
		$("#profile #upgrade").html("Add more time");
	}
	
}

User.prototype.deliverChallenge = function(score){

	$.ajax({
        url: apiRoot+"challenge/issue",
        type: 'POST',
        dataType: 'json',
        data: { challengeID: user.challengeIDInProgress,
        		score: score },
        async: true,
        cache: false,
        timeout: 30000,
        error: function(data){
        	console.log(data);
        	var jsonResponse = data.responseJSON;
        	triggerErrorMessage("default");
            return true;
        },
        success: function(data){ 
        	
        	console.log(data);
        	user.challengeIDInProgress = 0;
        	user.challengeIssueInProgress = false;

        	setTimeout(function(){
        		closeGameiFrame();
        		alert("Challenge sent!");
        	},1500);
        	
        }
    });

}

User.prototype.deliverChallengeResponse = function(score){

	$.ajax({
        url: apiRoot+"challenge/complete",
        type: 'POST',
        dataType: 'json',
        data: { challengeID: user.challengeIDInProgress,
        		score: score },
        async: true,
        cache: false,
        timeout: 30000,
        error: function(data){
        	console.log(data);
        	var jsonResponse = data.responseJSON;
        	triggerErrorMessage("default");
            return true;
        },
        success: function(data){ 
        	
        	console.log(data);
        	user.challengeIDInProgress = 0;
        	user.challengeResponseInProgress = false;

        	setTimeout(function(){
        		closeGameiFrame();
        		alert("Challenge complete!");
        	},1500);
        	
        }
    });

}

User.prototype.changeGratii = function(changeInGratii){
	if(changeInGratii>=0){
		var changeSymbol = "+";
		var changeColor = "green";
	}else{
		var changeSymbol = "";
		var changeColor = "red";
	}
	

	
	$(".header .gratiiScore").html(changeSymbol+changeInGratii);
	$(".header .gratiiScore").css({color:changeColor});
	$(".header .gratiiScore").animate({opacity:".2", fontSize:"60px"}, {
	    queue:    false,
	    duration: 1000,
	    complete: function() { 
	        var beforeGratii = parseInt(user.gratii);
			user.gratii = beforeGratii + changeInGratii;
			$(".header .gratiiScore").html(user.gratii);
			$(".header .gratiiScore").css({color:"black", fontSize:"24px", opacity:"1", zIndex:""});
	    }
	});

}

User.prototype.updateNewMessageIndicator = function(){
	if(user.newMessages>0){
		$(".newMessageIndicator").html(user.newMessages);
		$(".newMessageIndicator").show();
	}else{
		$(".newMessageIndicator").html('');
		$(".newMessageIndicator").hide();
	}

}

User.prototype.postGameEvents = function (){

	var eventsPending = user.arcadeEvents.length;

	if(eventsPending<=0){
		console.log("No pending events");
		return;
	}

	if(loggedIn===false){
		console.log("User not logged in");
		user.arcadeEvents = [];
		return;
	}

	var jsonString = JSON.stringify(user.arcadeEvents);

	$.ajax({
        url: apiRoot+"user/game/event",
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: jsonString,
        async: false,
        cache: false,
        timeout: 30000,
        error: function(data){
        	var jsonResponse = data.responseJSON;
        	triggerErrorMessage("default", jsonResponse['msg']);
        	console.log(jsonResponse['msg']);
            return;
        },
        success: function(data){ 
        	console.log(data['msg']);
        	user.arcadeEvents = [];
        	return;
        }
    });
    
}


// end of User-------------------------


// start of Arcade-------------------------
var Game = function(val){ //Game object
	this.id = val.id;
	this.title = val.gameName;
	this.image = "images/arcade/"+val.gameImage;
	this.challengeable = val.challengeable;
	this.challengeButtonBackground = this.challengeable?"url('../app/images/boxingGloves1.png')":"none";
	this.myHighScore = val.highScore || "N/A";
	this.myTotalGratii = val.totalGratiiEarned;
	this.topTen = val.top10;
	this.equations = val.equations;
	this.demoable = val.demoable;
	this.locked = val.locked;
	
	this.li = document.createElement('li');
	this.li.className = "mainLI vSnapToHere";
	this.li.id = "gameSnapWrapper_"+this.id;
	this.li.style.height = $(window).width()*.5;



	gameObjects.push(this);
}

Game.prototype.challengeClick = function(event){
		
	event.stopPropagation();
	if(stopSignVisible===false){
		triggerChallengePanel(this.Game.id, this.Game.title);
	}	
}

Game.prototype.playGame = function(event){

	event.stopPropagation();
	event.preventDefault();
	if(stopSignVisible===false){
		if(loggedIn===false && this.Game.demoable == 0){
			triggerErrorMessage("notLoggedIn");
			return;
		}else if(this.Game.locked.locked == "1"){
			triggerErrorMessage("default", this.Game.locked.reasonForLock);
			return;
		}

		openGameiFrame(this.Game.id, this.Game.equations);
		
		user.gameInProgress = { "gameID" : this.Game.id,
								"equations" : this.Game.equations }; 

		console.log(user.gameInProgress);
	}
                                
}

function openGameiFrame(gameID, equations){
	$(".mainApp").hide();
	$(".footer").hide();
	$("#gameiFrame").attr('src','games/'+gameID+'/index.html?v=4');
	$("#gameiFrame").show();
	$(".gratiiLogo#header").css({backgroundImage:"url(images/backArrow.png)", width:"35px", height:"35px", backgroundSize:"35px 35px"});
	$(".refreshGame").show();
	$(".refreshGame").click(function(){
		refreshGameiFrame();
	});
	$(".gratiiLogo#header").click(function(){
		if(user.challengeIssueInProgress===false && user.challengeResponseInProgress===false){
			closeGameiFrame();
		}else{
			alert("You can't bail in the middle of a challenge!");
			return;
		}
	});
	
	user.gameInProgress = { "gameID" : gameID,
							"equations" : equations }; 

	console.log(user.gameInProgress);
}

function closeGameiFrame(){
	$("#gameiFrame").attr('src','');
	$("#gameiFrame").hide();
	$(".mainApp").show();
	$(".footer").show();
	$(".refreshGame").hide();
	$(".gratiiLogo#header").css({backgroundImage:"url(images/gratiiColorShadow.png)", width:"99px", height:"30px", backgroundSize:"99px 30px"});
	$(".gratiiLogo#header").click(function(){
		location.reload();
	});
	
}

function refreshGameiFrame(){
	document.getElementById('gameiFrame').contentWindow.location.reload();
}

Game.prototype.createDomElements = function(){ //Game draw method
	
	$("#arcade .games").append(this.li);

	this.scrollerDiv = document.createElement('div');
	this.scrollerDiv.id = "scroller";
	this.li.appendChild(this.scrollerDiv);

	this.arcadeFrameA = document.createElement('div');
	this.arcadeFrameA.className = "arcadeFrame";
	this.arcadeFrameA.id = "a";
	this.scrollerDiv.appendChild(this.arcadeFrameA);

	this.arcadeContent = document.createElement('div');
	this.arcadeContent.className = "arcadeContent";
	this.arcadeContent.style.backgroundImage = "url('"+this.image+"')";
	this.arcadeFrameA.appendChild(this.arcadeContent);

	if(this.challengeable==1){
		this.challengeButton = document.createElement('div');
		this.challengeButton.className = "challengeButton";
		this.challengeButton.style.backgroundImage = "url('"+this.challengeButtonBackground+"')";
		this.challengeButton.style.opacity = user.PRO?1:.5;
		this.arcadeContent.appendChild(this.challengeButton);

		this.challengeButton.addEventListener('click', {
                                 handleEvent:this.challengeClick,                  
                                 Game:this}, false);
	}

	if(this.locked.locked == "1"){
		$(this.challengeButton).remove();

		this.lockContainer = document.createElement('div');
		this.lockContainer.className = "lockContainer";
		this.arcadeContent.appendChild(this.lockContainer);

		this.lockImage = document.createElement('div');
		this.lockImage.className = "lockImage";
		this.lockContainer.appendChild(this.lockImage);
	}
	
	this.arcadeFrameA.addEventListener('click', {
                                 handleEvent:this.playGame,                  
                                 Game:this}, false);

	this.arcadeFrameB = document.createElement('div');
	this.arcadeFrameB.className = "arcadeFrame";
	this.arcadeFrameB.id = "b";
	this.scrollerDiv.appendChild(this.arcadeFrameB);

	this.arcadeContent = document.createElement('div');
	this.arcadeContent.className = "arcadeContent";
	this.arcadeFrameB.appendChild(this.arcadeContent);

	this.myScores = document.createElement('div');
	this.myScores.className = "myScores";
	this.arcadeContent.appendChild(this.myScores);

	this.myHighScoreDiv = document.createElement('div');
	this.myHighScoreDiv.className = "myHighScore";
	this.myHighScoreDiv.innerHTML = "My best: "+this.myHighScore;
	this.myScores.appendChild(this.myHighScoreDiv);

	this.myTotalGratiiDiv = document.createElement('div');
	this.myTotalGratiiDiv.className = "myTotalGratii";
	this.myTotalGratiiDiv.innerHTML = "Gratii accumulated: "+this.myTotalGratii;
	this.myScores.appendChild(this.myTotalGratiiDiv);

	this.top10Table = document.createElement('table');
	this.top10Table.className = "top10";
	this.arcadeContent.appendChild(this.top10Table);

	if(this.topTen!=null){
		for(var i=0;i<5;i++){
			if(this.topTen[i]){
				this.row = document.createElement('tr');
				this.top10Table.appendChild(this.row);
				this.td = document.createElement('td');
				this.td.className = 'username';
				this.td.id = this.topTen[i].userNickname;
				this.td.innerHTML = this.topTen[i].userNickname+': '+this.topTen[i].finalScore;
				this.row.appendChild(this.td);
				this.td.addEventListener('click', function(event){
					triggerUserInteractionPanel(this.id, this.id);
				});
			}else{
				this.row = document.createElement('tr');
				this.top10Table.appendChild(this.row);
				this.td = document.createElement('td');
				this.td.className = 'username';
				this.td.innerHTML = 'NULL: ---';
				this.row.appendChild(this.td);
			}

			if(this.topTen[i+5]){
				this.td = document.createElement('td');
				this.td.className = 'username';
				this.td.id = this.topTen[i+5].userNickname;
				this.td.innerHTML = this.topTen[i+5].userNickname+': '+this.topTen[i+5].finalScore;
				this.row.appendChild(this.td);
				this.td.addEventListener('click', function(event){
					triggerUserInteractionPanel(this.id, this.id);
				});
			}else{
				this.td = document.createElement('td');
				this.td.className = 'username';
				this.td.innerHTML = 'NULL: ---';
				this.row.appendChild(this.td);
			}

		}
	}
	

	this.indicatorUL = document.createElement('ul');
	this.indicatorUL.id = "indicator";
	this.li.appendChild(this.indicatorUL);

	this.activeLI = document.createElement('li');
	this.activeLI.className = "active";
	this.indicatorUL.appendChild(this.activeLI);

	this.inactiveLI = document.createElement('li');
	this.indicatorUL.appendChild(this.inactiveLI);

	initializeHorizontaliScroll('gameSnapWrapper_'+this.id);
}
// end of Arcade-------------------------



// start of Auctions-------------------------
var Auction = function(val){ //Game object
	this.id = val.id;
	this.title = val.promoName;
	this.client = val.clientName;
	this.details = val.promoDetails;
	this.bids = ""+val.totalBids+"";
	
	if(this.bids.slice(-1) == "1" && this.bids.slice(-2) != "11" ){
		this.bidCountGrammarText = "st";
	}else if(this.bids.slice(-1) == "2"){
		this.bidCountGrammarText = "nd";
	}else if(this.bids.slice(-1) == "3"){
		this.bidCountGrammarText = "rd";
	}else{
		this.bidCountGrammarText = "th";
	}

	this.leader = val.leaderNickname;
	this.leaderID = val.leaderID;

	if(val.maxBid===null){
		this.currentBid = 0;
	}else{
		this.currentBid = val.maxBid;
	}

	this.image = "images/auctions/"+val.promoPic;
	this.clickthrough = val.promoWebsite;
	this.fbDiv = val.fbDiv;
	this.fb = val.promoFacebook;
	this.twitter = val.promoTwitter;
	this.secondsUntilStart = val.secondsUntil;
	this.secondsRemaining = val.secondsRemaining;
	this.secondsLasted = val.secondsLasted;
	this.inputVisible = false;
	
	this.li = document.createElement('li');
	this.li.className = "mainLI vSnapToHere";
	this.li.id = "auctionSnapWrapper_"+this.id;
	this.li.style.height = $(window).width()*.5;
	
	auctionObjects.push(this);
}

function getAuctionObjectByID(id){
	var idRequested = id;
	for(var i=0; i<auctionObjects.length; i++){
		if(auctionObjects[i].id==idRequested){
			return i;
		}
	}
}

function updateLiveAuctionAfterBidFromNode(auctionID, leader, bid){
	var i = getAuctionObjectByID(auctionID);
	auctionObjects[i].bids++;
	var totalBids = ""+auctionObjects[i].bids+"";
	console.log(totalBids);
	if(totalBids.slice(-1) == "1" && totalBids.slice(-2) != "11" ){
		auctionObjects[i].bidCountGrammarText = "st";
	}else if(totalBids.slice(-1) == "2" && totalBids.slice(-2) != "12"){
		auctionObjects[i].bidCountGrammarText = "nd";
	}else if(totalBids.slice(-1) == "3" && totalBids.slice(-2) != "13"){
		auctionObjects[i].bidCountGrammarText = "rd";
	}else{
		auctionObjects[i].bidCountGrammarText = "th";
	}
	auctionObjects[i].currentBid = bid;
	auctionObjects[i].leader = leader;
	auctionObjects[i].secondsRemaining = user.secondsAddedToAuction;
	auctionObjects[i].leaderDiv.innerHTML = leader;
	auctionObjects[i].styleLiveAuctionStats(true);
}

Auction.prototype.styleLiveAuctionStats = function(viaNode){
	
	if(viaNode===true){
    	$(this.auctionStatsContent).effect( "highlight", {color:"lightgreen"}, 800);
	}
	
	this.auctionStatsContent.innerHTML = "";
	this.leaderInfoDiv = document.createElement('div');
	this.leaderInfoDiv.className = "leaderInfoWrapper";
	this.auctionStatsContent.appendChild(this.leaderInfoDiv);
	
	this.bidsDiv = document.createElement('div');
	this.bidsDiv.className = "bidCount";
	if(this.bids > 0){
		this.bidsDiv.innerHTML = this.bids+this.bidCountGrammarText+" bid:&nbsp&nbspclick the coin to bid --->";
	}else{
		this.bidsDiv.innerHTML = "No bids yet. Be the first!";
	}
	this.leaderInfoDiv.appendChild(this.bidsDiv);

	this.leaderDiv = document.createElement('div');
	this.leaderDiv.className = "leader";
	this.leaderDiv.id = this.leader;
	if(this.bids > 0){
		this.leaderDiv.innerHTML = this.leader;
		this.leaderDiv.addEventListener('click', function(event){

			event.stopPropagation();
			event.preventDefault();
			triggerUserInteractionPanel(this.id, this.innerHTML);
		});
	}else{
		this.leaderDiv.innerHTML = "Tap the coin to bid -->";
	}
	this.leaderInfoDiv.appendChild(this.leaderDiv);
	

	this.bidInfoDiv = document.createElement('div');
	this.bidInfoDiv.className = "bidInfoWrapper";
	this.auctionStatsContent.appendChild(this.bidInfoDiv);

	this.auctionCoin = document.createElement('div');
	this.auctionCoin.className = "auctionCoin";
	this.bidInfoDiv.appendChild(this.auctionCoin);

	this.currentBidDiv = document.createElement('div');
	this.currentBidDiv.className = "currentBid";
	this.currentBidDiv.innerHTML = this.currentBid;
	this.bidInfoDiv.appendChild(this.currentBidDiv);

	this.bidInfoDiv.addEventListener('click', {
                             handleEvent:this.showBidInputs,                  
                             Auction:this}, false);

	this.scrollerDiv.addEventListener('click', {
                             handleEvent:this.removeBidInputs,                  
                             Auction:this}, false);

	this.auctionStatsWrapperDiv.addEventListener('click', {
                             handleEvent:this.removeBidInputs,                  
                             Auction:this}, false);
	
}

Auction.prototype.placeBidClick = function(event){
	event.stopPropagation();

	if(loggedIn===false){
		triggerErrorMessage("notLoggedIn");
		return;
	}else{
		var that = this;
		var bidAmount = this.BidDiv.value;
		var auctionID = this.Auction.id;
		var ButtonDiv = this.ButtonDiv;

		ButtonDiv.innerHTML = "sending..";

		$.ajax({
	        url: apiRoot+"bid",
	        type: 'POST',
	        dataType: 'json',
	        data: { bidAmount: bidAmount, 
	        		auctionID: auctionID },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON;
	        	ButtonDiv.style.color = "red";
	        	ButtonDiv.innerHTML = "Try again";
	        	if(jsonResponse['msg'].substring(0, 5) == "PRO##"){
	        		var errorMessage = jsonResponse['msg'].replace("PRO##", "");
	        	}else{
					var errorMessage = jsonResponse['msg'];
	        	}
	        	triggerErrorMessage("default", errorMessage);
	            return true;
	        },
	        success: function(data){ 
	        	ButtonDiv.style.color = "white";
	        	ButtonDiv.innerHTML = "Place bid";

	        	that.Auction.leaderInfoDiv.style.display = "";
				$(that.Auction.newBidInput).remove();
				$(that.Auction.newBidButton).remove();
				that.Auction.currentBidDiv.style.display = "";
				that.Auction.auctionCoin.style.display = "";

				that.Auction.inputVisible = false;
	        }
	    });
		
	}
	
}

Auction.prototype.showBidInputs = function(){

	that = this.Auction;

	event.stopPropagation();
	if(that.inputVisible === false){

		that.currentBidDiv.style.display = "none";
		that.auctionCoin.style.display = "none";

		that.leaderInfoDiv.style.display = "none";

		that.newBidButton = document.createElement('div');
		that.newBidButton.className = "newBidButton";
		that.newBidButton.innerHTML = "Place bid";
		that.bidInfoDiv.appendChild(that.newBidButton);

		that.newBidInput = document.createElement('input');
		that.newBidInput.className = "newBidInput";
		that.newBidInput.type = "number";
		that.newBidInput.placeholder = that.currentBid;
		that.bidInfoDiv.appendChild(that.newBidInput);

		that.inputVisible = true;
		that.newBidButton.addEventListener('click', {
                            handleEvent:that.placeBidClick,                  
                            Auction:that,
                        	BidDiv:that.newBidInput,
                        	ButtonDiv:that.newBidButton}, false);
		that.newBidButton.addEventListener('click', function(event){
			event.stopPropagation();
		});
		that.newBidInput.addEventListener('click', function(event){
			event.stopPropagation();
		});


	}
}

Auction.prototype.removeBidInputs = function(thisAuction){
	console.log("Entered removal of BID INPUTS!");
	that = this.Auction;
	console.log(that);
	if(that.inputVisible === true){
		console.log("REMOVING BID INPUTS!");
		that.leaderInfoDiv.style.display = "";

		$(that.newBidInput).remove();
		$(that.newBidButton).remove();
		that.currentBidDiv.style.display = "";
		that.auctionCoin.style.display = "";

		that.inputVisible = false;

	}

}

Auction.prototype.styleClickthrough = function(){
	
	var clickthroughHTML = "<a onclick='testClick("+this.clickthrough+")'>Check them out online.</a>";
	return clickthroughHTML;	

}

Auction.prototype.postClickthrough = function(){

	var thisAuctionID = this.Auction.id;
	var thisClickthrough = this.Auction.clickthrough;
	
	console.log(thisAuctionID+" ::: "+thisClickthrough);
	$.ajax({
        url: apiRoot+"clickthru",
        type: 'POST',
        dataType: 'json',
        data: { auctionID: thisAuctionID },
        async: true,
        cache: false,
        timeout: 30000,
        error: function(data){
        	console.log(data);
        	triggerErrorMessage("default");
            return true;
        },
        success: function(data){         	
        	console.log(data);

        }
    });
}

Auction.prototype.styleFB = function(){
	var thisAuctionID = this.id;

	if(userFBLoggedIn === true){
		var likeBtn = '<fb:like data-href="https://www.'+this.fb+'" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false" data-ref="gratiiApp"></fb:like>';
		FB.Event.subscribe('edge.create',
			function(response) {
				console.log('You liked the URL: ' + response);
				$.ajax({
			        url: apiRoot+"like",
			        type: 'POST',
			        dataType: 'json',
			        data: { auctionID: thisAuctionID },
			        async: true,
			        cache: false,
			        timeout: 30000,
			        error: function(data){
			        	console.log(data);
			        	triggerErrorMessage("default", data.responseJSON['msg']);
			            return true;
			        },
			        success: function(data){ 
			        	
			        	console.log(data);
			        	
			        }
			    });
			}
		);
	}else{
		var likeBtn = '<fb:login-button show-faces="false" width="100" max-rows="1" data-size="small"></fb:login-button>';
	}

	return likeBtn;
}

Auction.prototype.styleTwitter = function(){
	
	if(user.twitterOAuthToken!="---"){
		var thisAuctionID = this.id;

		var followBtn = twttr.widgets.createFollowButton(this.twitter, 
															this.twitterButtonDiv, 
															function (el) {
																console.log("Follow button created."); //callback function
															},
															{ size: 'medium', count: 'none' }
														);
		twttr.events.bind('follow', function (event) {
			var followed_user_id = event.data.user_id;
			var followed_screen_name = event.data.screen_name;
			console.log('You followed the twitter handle: ' + followed_screen_name);
			$.ajax({
		        url: apiRoot+"follow",
		        type: 'POST',
		        dataType: 'json',
		        data: { auctionID: thisAuctionID },
		        async: true,
		        cache: false,
		        timeout: 30000,
		        error: function(data){
		        	console.log(data);

		        	triggerErrorMessage("default", data.responseJSON['msg']);
		            return true;
		        },
		        success: function(data){ 
		        	
		        	console.log(data);
		        	
		        }
		    });

		});

		return followBtn;
	}else{

		var followBtn = this.twitterButtonDiv;

		followBtn.id = "twitterConnect";

		$(followBtn).click(function(){
			window.location = '../backend/app/controllers/twitterSDK/redirect.php';	
		});

		return followBtn;
	}

	
}

Auction.prototype.styleLiveTimerDynamicProperties = function(){

	var widthPercentage = ((1-(this.secondsRemaining/secondsPerAuction))*100).toFixed(1);
	this.auctionTimerBlackout.style.width = widthPercentage+"%";

	if(this.bids==0){
		// var timer = convertSecondsToTimer(this.secondsRemaining);
		// this.auctionTimerBlackout.innerHTML = "&nbsp"+timer;
	}else if(this.secondsRemaining!=0){
		var timer = convertSecondsToTimer(this.secondsRemaining);
		this.auctionTimerBlackout.innerHTML = "&nbsp"+timer;
	}else{
		this.auctionTimerBlackout.innerHTML = "This auction has ended.";
		this.bidsDiv.innerHTML = "WINNER!";
		this.bidsDiv.style.fontWeight = "bold";
		this.bidsDiv.style.color = "red";
	}

}

Auction.prototype.styleUpnextTimerDynamicProperties = function(){

	if(this.secondsUntilStart!=0){
		var timer = convertSecondsToTimer(this.secondsUntilStart);
		this.upnextTimerDiv.innerHTML = "Starts in: "+timer;
	}else{
		this.upnextTimerDiv.innerHTML = "This auction is now Live!";
		this.upnextTimerDiv.style.fontWeight = "bold";
		this.upnextTimerDiv.style.color = "red";
	}

}

function convertSecondsToTimer(seconds){
	if(seconds<60){
		if(seconds<10){
			var timer = "0"+seconds;
		}else{
			var timer = seconds;
		}
		
		return timer;
	}else if(seconds<3600){
		var minutes = Math.floor(seconds/60);
		var remainingSeconds = seconds%(minutes*60);

		if(remainingSeconds<10){
			remainingSeconds = "0"+remainingSeconds;
		}
		
		var timer = minutes+":"+remainingSeconds; 
		
		return timer;
	}else if(seconds>=3600){
		var hours = Math.floor(seconds/3600);
		var remainingMinutes = Math.floor(seconds/60)%(hours*60);
		if(remainingMinutes<10){
			remainingMinutes = "0"+remainingMinutes;
		}
		var remainingSeconds = seconds%(hours*60*60+remainingMinutes*60);
		if(remainingSeconds<10){
			remainingSeconds = "0"+remainingSeconds;
		}

		var timer = hours+":"+remainingMinutes+":"+remainingSeconds; 

		return timer;
	}
}

var t=setInterval(updateAuctionTimers,1000);

function updateAuctionTimers(){

	$.each(auctionObjects, function(key, val){			
	 	if(this.secondsRemaining>0 && this.bids>0){
	 		this.secondsRemaining--;
	 	}
	 	if(currentPage===1 && currentAuctionScope===0){
	 		this.styleLiveTimerDynamicProperties();
	 	}
	 	if(this.secondsUntilStart>0){
	 		this.secondsUntilStart--;
	 	}
	 	if(currentPage===1 && currentAuctionScope===1){
	 		this.styleUpnextTimerDynamicProperties();
	 	}
	});
}


Auction.prototype.createLiveAuction = function(){
	
	$("#auctions .auctions").append(this.li);

	this.scrollerDiv = document.createElement('div');
	this.scrollerDiv.id = "scroller";
	this.li.appendChild(this.scrollerDiv);

	this.auctionFrameDivA = document.createElement('div');
	this.auctionFrameDivA.className = "auctionFrame";
	this.auctionFrameDivA.id = "a";
	this.scrollerDiv.appendChild(this.auctionFrameDivA);

	this.auctionContent = document.createElement('div');
	this.auctionContent.className = "auctionContent";
	this.auctionContent.style.backgroundImage = "url('"+this.image+"')";
	this.auctionFrameDivA.appendChild(this.auctionContent);

	this.auctionFrameDivB = document.createElement('div');
	this.auctionFrameDivB.className = "auctionFrame";
	this.auctionFrameDivB.id = "b";
	this.scrollerDiv.appendChild(this.auctionFrameDivB);

	this.auctionContent = document.createElement('div');
	this.auctionContent.className = "auctionContent";
	this.auctionFrameDivB.appendChild(this.auctionContent);

	this.detailsTitleDiv = document.createElement('div');
	this.detailsTitleDiv.className = "auctionDetailsTitle";
	this.detailsTitleDiv.innerHTML = "Win "+this.title+" from "+this.client+"!";
	this.auctionContent.appendChild(this.detailsTitleDiv);

	this.detailsTextDiv = document.createElement('div');
	this.detailsTextDiv.className = "auctionDetailsText";
	this.detailsTextDiv.innerHTML = this.details;
	this.auctionContent.appendChild(this.detailsTextDiv);

	this.indicatorUL = document.createElement('ul');
	this.indicatorUL.id = "indicator";
	this.li.appendChild(this.indicatorUL);

	this.activeLI = document.createElement('li');
	this.activeLI.className = "active";
	this.indicatorUL.appendChild(this.activeLI);

	this.inactiveLI = document.createElement('li');
	this.indicatorUL.appendChild(this.inactiveLI);

	this.auctionTimerContainer = document.createElement('div');
	this.auctionTimerContainer.className = "auctionTimerContainer";
	$("#auctions .auctions").append(this.auctionTimerContainer);

	this.auctionTimerWrapper = document.createElement('div');
	this.auctionTimerWrapper.className = "auctionTimerWrapper";
	this.auctionTimerContainer.appendChild(this.auctionTimerWrapper);

	this.auctionTimerImage = document.createElement('div');
	this.auctionTimerImage.className = "auctionTimerImage";
	this.auctionTimerWrapper.appendChild(this.auctionTimerImage);

	this.auctionTimerBlackout = document.createElement('div');
	this.auctionTimerBlackout.className = "auctionTimerBlackout";
	this.styleLiveTimerDynamicProperties();
	this.auctionTimerWrapper.appendChild(this.auctionTimerBlackout);

	this.auctionTitleContainerDiv = document.createElement('div');
	this.auctionTitleContainerDiv.className = "auctionTitleContainer";
	$("#auctions .auctions").append(this.auctionTitleContainerDiv);

	this.auctionTitleWrapperDiv = document.createElement('div');
	this.auctionTitleWrapperDiv.className = "auctionTitleWrapper";
	this.auctionTitleContainerDiv.appendChild(this.auctionTitleWrapperDiv);

	this.auctionClientDiv = document.createElement('div');
	this.auctionClientDiv.className = "auctionClientDiv";
	this.auctionClientDiv.innerHTML = this.client;
	this.auctionTitleWrapperDiv.appendChild(this.auctionClientDiv);

	this.auctionTitleDiv = document.createElement('div');
	this.auctionTitleDiv.className = "auctionTitleDiv";
	this.auctionTitleDiv.innerHTML = this.title;
	this.auctionTitleWrapperDiv.appendChild(this.auctionTitleDiv);

	this.auctionStatsWrapperDiv = document.createElement('div');
	this.auctionStatsWrapperDiv.className = "auctionStatsWrapper";
	$("#auctions .auctions").append(this.auctionStatsWrapperDiv);

	this.auctionStatsContent = document.createElement('div');
	this.auctionStatsContent.className = "auctionStatsContent";
	this.auctionStatsWrapperDiv.appendChild(this.auctionStatsContent);

	this.styleLiveAuctionStats();

	initializeHorizontaliScroll('auctionSnapWrapper_'+this.id);
}

Auction.prototype.createUpnextAuction = function(){
	
$("#auctions .auctions").append(this.li);

	this.scrollerDiv = document.createElement('div');
	this.scrollerDiv.id = "scroller";
	this.li.appendChild(this.scrollerDiv);

	this.auctionFrameDivA = document.createElement('div');
	this.auctionFrameDivA.className = "auctionFrame";
	this.auctionFrameDivA.id = "a";
	this.scrollerDiv.appendChild(this.auctionFrameDivA);

	this.auctionContent = document.createElement('div');
	this.auctionContent.className = "auctionContent";
	this.auctionContent.style.backgroundImage = "url('"+this.image+"')";
	this.auctionFrameDivA.appendChild(this.auctionContent);

	this.auctionFrameDivB = document.createElement('div');
	this.auctionFrameDivB.className = "auctionFrame";
	this.auctionFrameDivB.id = "b";
	this.scrollerDiv.appendChild(this.auctionFrameDivB);

	this.auctionContent = document.createElement('div');
	this.auctionContent.className = "auctionContent";
	this.auctionFrameDivB.appendChild(this.auctionContent);

	if(sessionID == "0"){
		this.bonusTitleDiv = document.createElement('div');
		this.bonusTitleDiv.className = "bonusTitle";
		this.bonusTitleDiv.innerHTML = "You must login to view the bonus gratii options here";
		this.auctionContent.appendChild(this.bonusTitleDiv);
	}else if(this.clickthrough == "---" && this.fb == "---" && this.twitter == "---"){
		this.bonusTitleDiv = document.createElement('div');
		this.bonusTitleDiv.className = "bonusTitle";
		this.bonusTitleDiv.innerHTML = "Sorry, no bonus gratii available here. Check other auctions.";
		this.auctionContent.appendChild(this.bonusTitleDiv);
	}else{
		this.bonusTitleDiv = document.createElement('div');
		this.bonusTitleDiv.className = "bonusTitle";
		this.bonusTitleDiv.innerHTML = "Free bonus gratii from "+this.client+"!";
		this.auctionContent.appendChild(this.bonusTitleDiv);

		if(this.clickthrough != "---"){

			this.clickthroughATag = document.createElement('a');
			this.clickthroughATag.href = this.clickthrough;
			this.clickthroughATag.target = "_blank";
			this.clickthroughATag.addEventListener('click', {
                                 handleEvent:this.postClickthrough,                  
                                 Auction:this}, false);
			this.auctionContent.appendChild(this.clickthroughATag); 

			this.clickthroughWrapperDiv = document.createElement('div');
			this.clickthroughWrapperDiv.className = "clickthroughWrapper";
			this.clickthroughWrapperDiv.innerHTML = "Check them out online";
			this.clickthroughATag.appendChild(this.clickthroughWrapperDiv); 
		}

		if(this.twitter != "---"){
			this.twitterWrapperDiv = document.createElement('div');
			this.twitterWrapperDiv.className = "twitterWrapper";
			this.auctionContent.appendChild(this.twitterWrapperDiv); 

			this.twitterTitleDiv = document.createElement('div');
			this.twitterTitleDiv.className = "twitterTitle";
			this.twitterTitleDiv.innerHTML = "Follow them on twitter";
			this.twitterWrapperDiv.appendChild(this.twitterTitleDiv);

			this.twitterButtonDiv = document.createElement('div');
			this.twitterButtonDiv.className = "twitterButton";
			this.styleTwitter();
			this.twitterWrapperDiv.appendChild(this.twitterButtonDiv);
		}

		if(this.fb != "---"){
			this.fbWrapperDiv = document.createElement('div');
			this.fbWrapperDiv.className = "fbWrapper";
			this.auctionContent.appendChild(this.fbWrapperDiv); 

			this.fbTitleDiv = document.createElement('div');
			this.fbTitleDiv.className = "fbTitle";
			this.fbTitleDiv.innerHTML = "Like them on Facebook";
			this.fbWrapperDiv.appendChild(this.fbTitleDiv);

			this.fbButtonDiv = document.createElement('div');
			this.fbButtonDiv.innerHTML = this.styleFB();
			this.fbWrapperDiv.appendChild(this.fbButtonDiv);
		}
	}

	this.indicatorUL = document.createElement('ul');
	this.indicatorUL.id = "indicator";
	this.li.appendChild(this.indicatorUL);

	this.activeLI = document.createElement('li');
	this.activeLI.className = "active";
	this.indicatorUL.appendChild(this.activeLI);

	this.inactiveLI = document.createElement('li');
	this.indicatorUL.appendChild(this.inactiveLI);

	this.auctionTimerContainer = document.createElement('div');
	this.auctionTimerContainer.className = "auctionTimerContainer";
	$("#auctions .auctions").append(this.auctionTimerContainer);

	this.auctionTimerWrapper = document.createElement('div');
	this.auctionTimerWrapper.className = "auctionTimerWrapper";
	this.auctionTimerContainer.appendChild(this.auctionTimerWrapper);

	this.upnextTimerDiv = document.createElement('div');
	this.upnextTimerDiv.className = "upnextTimer";
	this.styleUpnextTimerDynamicProperties();
	this.auctionTimerWrapper.appendChild(this.upnextTimerDiv);

	this.auctionTitleContainerDiv = document.createElement('div');
	this.auctionTitleContainerDiv.className = "auctionTitleContainer";
	$("#auctions .auctions").append(this.auctionTitleContainerDiv);

	this.auctionTitleWrapperDiv = document.createElement('div');
	this.auctionTitleWrapperDiv.className = "auctionTitleWrapper";
	this.auctionTitleContainerDiv.appendChild(this.auctionTitleWrapperDiv);

	this.auctionClientDiv = document.createElement('div');
	this.auctionClientDiv.className = "auctionClientDiv";
	this.auctionClientDiv.innerHTML = this.client;
	this.auctionTitleWrapperDiv.appendChild(this.auctionClientDiv);

	this.auctionTitleDiv = document.createElement('div');
	this.auctionTitleDiv.className = "auctionTitleDiv";
	this.auctionTitleDiv.innerHTML = this.title;
	this.auctionTitleWrapperDiv.appendChild(this.auctionTitleDiv);

	this.auctionStatsWrapperDiv = document.createElement('div');
	this.auctionStatsWrapperDiv.className = "auctionStatsWrapper";
	$("#auctions .auctions").append(this.auctionStatsWrapperDiv);

	this.auctionStatsContent = document.createElement('div');
	this.auctionStatsContent.className = "auctionStatsContent";
	this.auctionStatsWrapperDiv.appendChild(this.auctionStatsContent);

	this.bonusMessageDiv = document.createElement('div');
	this.bonusMessageDiv.className = "bonusMessage";
	this.bonusMessageDiv.innerHTML = "Psst.. swipe left above for free bonus gratii from "+this.client+"!";
	this.auctionStatsContent.appendChild(this.bonusMessageDiv);



	initializeHorizontaliScroll('auctionSnapWrapper_'+this.id);

}

Auction.prototype.createPastAuction = function(){
	
	$("#auctions .auctions").append(this.li);

	this.scrollerDiv = document.createElement('div');
	this.scrollerDiv.id = "scroller";
	this.li.appendChild(this.scrollerDiv);

	this.auctionFrameDivA = document.createElement('div');
	this.auctionFrameDivA.className = "auctionFrame";
	this.auctionFrameDivA.id = "a";
	this.scrollerDiv.appendChild(this.auctionFrameDivA);

	this.auctionContentA = document.createElement('div');
	this.auctionContentA.className = "auctionContent";
	this.auctionContentA.style.backgroundImage = "url('"+this.image+"')";
	this.auctionFrameDivA.appendChild(this.auctionContentA);

	this.auctionFrameDivB = document.createElement('div');
	this.auctionFrameDivB.className = "auctionFrame";
	this.auctionFrameDivB.id = "b";
	this.scrollerDiv.appendChild(this.auctionFrameDivB);

	this.auctionContent = document.createElement('div');
	this.auctionContent.className = "auctionContent";
	this.auctionFrameDivB.appendChild(this.auctionContent);

	this.detailsTitleDiv = document.createElement('div');
	this.detailsTitleDiv.className = "auctionDetailsTitle";
	this.detailsTitleDiv.innerHTML = "Win "+this.title+" from "+this.client+"!";
	this.auctionContent.appendChild(this.detailsTitleDiv);

	this.detailsTextDiv = document.createElement('div');
	this.detailsTextDiv.className = "auctionDetailsText";
	this.detailsTextDiv.innerHTML = this.details;
	this.auctionContent.appendChild(this.detailsTextDiv);

	this.indicatorUL = document.createElement('ul');
	this.indicatorUL.id = "indicator";
	this.li.appendChild(this.indicatorUL);

	this.activeLI = document.createElement('li');
	this.activeLI.className = "active";
	this.indicatorUL.appendChild(this.activeLI);

	this.inactiveLI = document.createElement('li');
	this.indicatorUL.appendChild(this.inactiveLI);

	this.auctionTimerContainer = document.createElement('div');
	this.auctionTimerContainer.className = "auctionTimerContainer";
	$("#auctions .auctions").append(this.auctionTimerContainer);

	this.auctionTimerWrapper = document.createElement('div');
	this.auctionTimerWrapper.className = "auctionTimerWrapper";
	this.auctionTimerContainer.appendChild(this.auctionTimerWrapper);

	this.upnextTimerDiv = document.createElement('div');
	this.upnextTimerDiv.className = "upnextTimer";
	this.upnextTimerDiv.innerHTML = "Duration: "+convertSecondsToTimer(this.secondsLasted);
	this.auctionTimerWrapper.appendChild(this.upnextTimerDiv);

	this.auctionTitleContainerDiv = document.createElement('div');
	this.auctionTitleContainerDiv.className = "auctionTitleContainer";
	$("#auctions .auctions").append(this.auctionTitleContainerDiv);

	this.auctionTitleWrapperDiv = document.createElement('div');
	this.auctionTitleWrapperDiv.className = "auctionTitleWrapper";
	this.auctionTitleContainerDiv.appendChild(this.auctionTitleWrapperDiv);

	this.auctionClientDiv = document.createElement('div');
	this.auctionClientDiv.className = "auctionClientDiv";
	this.auctionClientDiv.innerHTML = this.client;
	this.auctionTitleWrapperDiv.appendChild(this.auctionClientDiv);

	this.auctionTitleDiv = document.createElement('div');
	this.auctionTitleDiv.className = "auctionTitleDiv";
	this.auctionTitleDiv.innerHTML = this.title;
	this.auctionTitleWrapperDiv.appendChild(this.auctionTitleDiv);

	this.auctionStatsWrapperDiv = document.createElement('div');
	this.auctionStatsWrapperDiv.className = "auctionStatsWrapper";
	$("#auctions .auctions").append(this.auctionStatsWrapperDiv);

	this.auctionStatsContent = document.createElement('div');
	this.auctionStatsContent.className = "auctionStatsContent";
	this.auctionStatsWrapperDiv.appendChild(this.auctionStatsContent);

	this.leaderInfoDiv = document.createElement('div');
	this.leaderInfoDiv.className = "leaderInfoWrapper";
	this.auctionStatsContent.appendChild(this.leaderInfoDiv);

	this.bidsDiv = document.createElement('div');
	this.bidsDiv.className = "bidCount";
	this.bidsDiv.style.color = "red";
	this.bidsDiv.style.fontWeight = "bold";
	this.bidsDiv.innerHTML = "Winner ("+this.bids+this.bidCountGrammarText+" bid):";
	this.leaderInfoDiv.appendChild(this.bidsDiv);

	this.leaderDiv = document.createElement('div');
	this.leaderDiv.className = "leader";
	this.leaderDiv.id = this.leader;
	this.leaderDiv.innerHTML = this.leader;
	this.leaderDiv.addEventListener('click', function(event){

		event.stopPropagation();
		event.preventDefault();
		triggerUserInteractionPanel(this.id, this.innerHTML);
	});
	this.leaderInfoDiv.appendChild(this.leaderDiv);
	
	this.bidInfoDiv = document.createElement('div');
	this.bidInfoDiv.className = "bidInfoWrapper";
	this.auctionStatsContent.appendChild(this.bidInfoDiv);

	this.auctionCoin = document.createElement('div');
	this.auctionCoin.className = "auctionCoin";
	this.bidInfoDiv.appendChild(this.auctionCoin);

	this.currentBidDiv = document.createElement('div');
	this.currentBidDiv.className = "currentBid";
	this.currentBidDiv.innerHTML = this.currentBid;
	this.bidInfoDiv.appendChild(this.currentBidDiv);

	initializeHorizontaliScroll('auctionSnapWrapper_'+this.id);
}


Auction.prototype.createDomElements = function(){
	if(currentAuctionScope===0){
		this.createLiveAuction();
	}else if(currentAuctionScope===1){
		this.createUpnextAuction();
	}else if(currentAuctionScope===2){
		this.createPastAuction();
	}
}
// end of Auctions-------------------------





// start of INBOX-------------------------
var Message = function(val){ //Game object
	this.id = val.id;
	this.title = val.title;
	this.template = val.template;
	this.timestamp = val.createdAt;
	this.body = val.body;
	this.senderEntity = val.senderEntity;
	this.senderID = val.senderID;
	this.footer = val.footer;
	if(this.senderEntity=="user"){
		this.senderName = val.senderNickname;
	}else{
		this.senderName = "Gratii";
	}

	this.image = val.msgBackgroundPic;
	this.newMessage = (val.openedAt=="0000-00-00 00:00:00")?true:false;
	this.pendingResponse = (val.respondedAt=="0000-00-00 00:00:00")?true:false;
	this.gratii = val.gratiiReward;
	this.optionA = val.optionA;
	this.optionB = val.optionB;
	this.optionC = val.optionC;
	this.response = val.response;
	this.link = val.link;

	this.li = document.createElement('li');
	this.li.className = "messageLI vSnapToHere";
	this.li.id = this.id;
	
	inboxObjects.push(this);

}

Message.prototype.openMessage = function(event)
{ 	
	event.stopPropagation();

	if(this.Message.template == "demoTemplate"){
		
		triggerErrorMessage("notLoggedIn");
	
	}else if(this.Message.newMessage===true){
		var newMessageCover = $(this.Message.newMessageDiv);
		$.ajax({
	        url: apiRoot+"msg/open",
	        type: 'PUT',
	        dataType: 'json',
	        data: { msgID: this.Message.id },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	var jsonResponse = data.responseJSON;
	        	triggerErrorMessage("default");
	            return true;
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	newMessageCover.slideUp("slow");
	        	user.newMessages--;
	        	user.updateNewMessageIndicator();
	        }
	    });

	}
}

Message.prototype.createUnopenedMessage = function(){
	
	$("#inbox .messages").append(this.li);

	this.messageContentContainer = document.createElement('div');
	this.messageContentContainer.className = "messageImage new";
	this.messageContentContainer.style.height = $(window).width()*.5;
	
	this.li.appendChild(this.messageContentContainer);

	this.newMessageDiv = document.createElement('div');
	this.newMessageDiv.className = "newMessage";
	this.newMessageDiv.addEventListener('click', {
                                 handleEvent:this.openMessage,                  
                                 Message:this}, false);
	this.messageContentContainer.appendChild(this.newMessageDiv);


}

Message.prototype.applyNewMessageWrapper = function(){
	
	if(this.newMessage === true){
		this.newMessageDiv = document.createElement('div');
		this.newMessageDiv.className = "newMessage";
		this.newMessageDiv.addEventListener('click', {
                                 handleEvent:this.openMessage,                  
                                 Message:this}, false);
		this.messageContentWrapper.appendChild(this.newMessageDiv);	
	}
	
}

Message.prototype.sendPrizeEmail = function(event){
	
	event.stopPropagation();
	
	if(this.Message.pendingResponse === true){

		var thisMessage = this.Message;
		var thisAucitonID = thisMessage.senderID;
		var thisResponse = this.Response;
		
		$.ajax({
	        url: apiRoot+"auction/"+thisAucitonID+"/email",
	        type: 'GET',
	        dataType: 'json',
	        data: { msgID: thisMessage.id,
	        		response: thisResponse },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log(data);
	        
        		thisMessage.claimGiftDiv.innerHTML = "Try again";
        		var jsonResponse = data.responseJSON;
        		triggerErrorMessage("default", jsonResponse['msg']);
            	return true;
	        	
	        	
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	thisMessage.pendingResponse = false;
	        	thisMessage.giftWrapper.style.opacity = ".4";

	        	thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
				thisMessage.claimGiftDiv.innerHTML = "Email sent!";
				thisMessage.claimGiftDiv.style.opacity = ".4";
			}

	    });
	}
}

Message.prototype.respondToMessage = function(event){
	
	event.stopPropagation();
	if(this.Message.pendingResponse === true){

		var thisMessage = this.Message;
		var thisResponse = this.Response;

		if(thisMessage.template == "adminSurvey"){
			if(thisResponse=="optionA"){
				var thisDivClicked = thisMessage.optionADiv;
				var otherDiv1 = thisMessage.optionBDiv;
				var otherDiv2 = thisMessage.optionCDiv;
			}else if(thisResponse=="optionB"){
				var thisDivClicked = thisMessage.optionBDiv;
				var otherDiv1 = thisMessage.optionADiv;
				var otherDiv2 = thisMessage.optionCDiv;
			}else if(thisResponse=="optionC"){
				var thisDivClicked = thisMessage.optionCDiv;
				var otherDiv1 = thisMessage.optionADiv;
				var otherDiv2 = thisMessage.optionBDiv;
			}else{
				triggerErrorMessage("default");
			}

			var thisDivClickedHTML = thisDivClicked.innerHTML;
			thisDivClicked.innerHTML = "Please wait..";
		
		}else if(thisMessage.template == "issueChallenge"){
			if(thisResponse=="optionA"){
				var thisDivClicked = thisMessage.optionADiv;
				var otherDiv1 = thisMessage.optionBDiv;
			}else if(thisResponse=="optionB"){
				var thisDivClicked = thisMessage.optionBDiv;
				var otherDiv1 = thisMessage.optionADiv;
			}else{
				triggerErrorMessage("default");
			}

			var thisDivClickedHTML = thisDivClicked.innerHTML;
			thisDivClicked.innerHTML = "Please wait..";
		}else{
		
			thisMessage.claimGiftDiv.innerHTML = "Please wait..";
		}


		$.ajax({
	        url: apiRoot+"msg/respond",
	        type: 'PUT',
	        dataType: 'json',
	        data: { msgID: thisMessage.id,
	        		response: thisResponse },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log(data);
	        	if(thisMessage.template == "survey" || thisMessage.template == "issueChallenge"){
	        		thisDivClicked.innerHTML = thisDivClickedHTML;
	        		var jsonResponse = data.responseJSON;
	        		triggerErrorMessage("default", jsonResponse['msg']);
	            	return true;
	        	}else{
	        		thisMessage.claimGiftDiv.innerHTML = "Try again";
	        		var jsonResponse = data.responseJSON;
	        		triggerErrorMessage("default", jsonResponse['msg']);
	            	return true;
	        	}
	        	
	        },
	        success: function(data){ 
	        	console.log(data['msg']);
	        	thisMessage.pendingResponse = false;
	        	thisMessage.giftWrapper.style.opacity = ".4";

	        	switch(thisMessage.template){
		
					case "adminSurvey":
					  	thisDivClicked.innerHTML = thisDivClickedHTML;
						thisDivClicked.className = "messageOptionSelected";	
						otherDiv1.className = "messageOptionDisabled";	
						otherDiv2.className = "messageOptionDisabled";
					  	break;
					case "issueChallenge":
						thisDivClicked.innerHTML = thisDivClickedHTML;
						thisDivClicked.className = "messageOptionSelected";	
						otherDiv1.className = "messageOptionDisabled";
						if(thisResponse == "optionA"){
							console.log(data);
							user.challengeResponseInProgress = true;
							user.challengeIDInProgress = data['results']['challengeID'];
							openGameiFrame(data['results']['arcadeID']);
						}
						break;
					case "forfeitChallenge":
	        			thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Wager reclaimed!";
						thisMessage.claimGiftDiv.style.opacity = ".4";
						break;
					case "winChallenge":
						thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Prize claimed!";
						thisMessage.claimGiftDiv.style.opacity = ".4";
						break;
					case "loseChallenge":
						thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Ok";
						thisMessage.claimGiftDiv.style.opacity = ".4";
						break;
					case "loseAuction":
						thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Bid reclaimed!";
						thisMessage.claimGiftDiv.style.opacity = ".4";
						break;
					case "winAuction":
						thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Prize claimed!";
						thisMessage.claimGiftDiv.style.opacity = ".4";
						break;
					default:
						thisMessage.claimGiftDiv.className = "claimGiftButtonDisabled";
						thisMessage.claimGiftDiv.innerHTML = "Gift claimed!";
						thisMessage.claimGiftDiv.style.opacity = ".4";
				
	        	}
	        }

	    });
		
	}

}

Message.prototype.winAuctionTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/auctions/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body+"</br>"+"</br>";
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		this.claimGiftDiv.innerHTML = "Claim my prize!";
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.sendPrizeEmail,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Email sent!";
	}
	this.messageFooterDiv.appendChild(this.claimGiftDiv);

	this.applyNewMessageWrapper();
}

Message.prototype.loseAuctionTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/auctions/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body+"</br>"+"</br>";
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		this.claimGiftDiv.innerHTML = "Reclaim my gratii";
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.respondToMessage,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Bid reclaimed!";
	}
	this.messageFooterDiv.appendChild(this.claimGiftDiv);

	this.applyNewMessageWrapper();
}

Message.prototype.winChallengeTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/arcade/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br><font style='font-family:boostsskregular'>Finale Score: "+this.footer+"</font></br></br>"+this.body;
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		this.claimGiftDiv.innerHTML = "Claim my prize";
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.respondToMessage,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Prize claimed!";
	}
	this.messageFooterDiv.appendChild(this.claimGiftDiv);

	this.applyNewMessageWrapper();
}

Message.prototype.loseChallengeTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/arcade/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br><font style='font-family:boostsskregular'>Finale Score: "+this.footer+"</font></br></br>"+this.body;
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		this.claimGiftDiv.innerHTML = "Ok";
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.respondToMessage,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Ok";
	}
	this.messageFooterDiv.appendChild(this.claimGiftDiv);

	this.applyNewMessageWrapper();
}

Message.prototype.receivedChallengeTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/arcade/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body+"</br>"+"</br>";
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	if(this.pendingResponse == true){

		this.optionADiv = document.createElement('div');
		this.optionADiv.className = "messageOption";
		this.optionADiv.innerHTML = this.optionA;
		this.optionADiv.addEventListener('click', {
                                    handleEvent:this.respondToMessage,                  
  	                                Message:this,
  	                            	Response: "optionA"}, false);
		this.messageBodyWrapper.appendChild(this.optionADiv);
		this.messageFooterDiv.appendChild(this.optionADiv);

		this.optionBDiv = document.createElement('div');
		this.optionBDiv.className = "messageOption";
		this.optionBDiv.innerHTML = this.optionB;
		this.optionBDiv.addEventListener('click', {
                                    handleEvent:this.respondToMessage,                  
  	                                Message:this,
  	                            	Response: "optionB"}, false);
		this.messageBodyWrapper.appendChild(this.optionBDiv);
		this.messageFooterDiv.appendChild(this.optionBDiv);

	}else{

		this.optionADiv = document.createElement('div');
		this.optionADiv.className = (this.response == "optionA")?"messageOptionSelected":"messageOptionDisabled";
		this.optionADiv.innerHTML = this.optionA;
		this.messageBodyWrapper.appendChild(this.optionADiv);
		this.messageFooterDiv.appendChild(this.optionADiv);

		this.optionBDiv = document.createElement('div');
		this.optionBDiv.className = (this.response == "optionB")?"messageOptionSelected":"messageOptionDisabled";
		this.optionBDiv.innerHTML = this.optionB;
		this.messageBodyWrapper.appendChild(this.optionBDiv);
		this.messageFooterDiv.appendChild(this.optionBDiv);
	}
	

	this.applyNewMessageWrapper();
}

Message.prototype.adminSurveyTemplate = function(){
	
	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.openedMessageDiv.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body;
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	if(this.pendingResponse == true){

		this.optionADiv = document.createElement('div');
		this.optionADiv.className = "messageOption";
		this.optionADiv.innerHTML = this.optionA;
		this.optionADiv.addEventListener('click', {
                                    handleEvent:this.respondToMessage,                  
  	                                Message:this,
  	                            	Response: "optionA"}, false);
		this.messageFooterDiv.appendChild(this.optionADiv);

		this.optionBDiv = document.createElement('div');
		this.optionBDiv.className = "messageOption";
		this.optionBDiv.innerHTML = this.optionB;
		this.optionBDiv.addEventListener('click', {
                                    handleEvent:this.respondToMessage,                  
  	                                Message:this,
  	                            	Response: "optionB"}, false);
		this.messageFooterDiv.appendChild(this.optionBDiv);

		this.optionCDiv = document.createElement('div');
		this.optionCDiv.className = "messageOption";
		this.optionCDiv.innerHTML = this.optionC;
		this.optionCDiv.addEventListener('click', {
                                    handleEvent:this.respondToMessage,                  
  	                                Message:this,
  	                            	Response: "optionC"}, false);
		this.messageFooterDiv.appendChild(this.optionCDiv);


	}else{
		this.optionADiv = document.createElement('div');
		this.optionADiv.className = (this.response == "optionA")?"messageOptionSelected":"messageOptionDisabled";
		this.optionADiv.innerHTML = this.optionA;
		this.messageFooterDiv.appendChild(this.optionADiv);

		this.optionBDiv = document.createElement('div');
		this.optionBDiv.className = (this.response == "optionB")?"messageOptionSelected":"messageOptionDisabled";
		this.optionBDiv.innerHTML = this.optionB;
		this.messageFooterDiv.appendChild(this.optionBDiv);

		this.optionCDiv = document.createElement('div');
		this.optionCDiv.className = (this.response == "optionC")?"messageOptionSelected":"messageOptionDisabled";
		this.optionCDiv.innerHTML = this.optionC;
		this.messageFooterDiv.appendChild(this.optionCDiv);
	}

	this.applyNewMessageWrapper();

}

Message.prototype.forfeitChallengeTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapperBackground = document.createElement('div');
	this.messageBodyWrapperBackground.className = "messageBodyWrapper";
	this.messageBodyWrapperBackground.style.backgroundImage = "url(images/arcade/"+this.image+")";
	this.messageBodyWrapperBackground.style.backgroundSize = "100% 100%";
	this.messageBodyWrapperBackground.style.backgroundRepeat = "no-repeat";
	this.openedMessageDiv.appendChild(this.messageBodyWrapperBackground);

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.width = "100%";
	this.messageBodyWrapper.style.height = "100%";
	this.messageBodyWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.messageBodyWrapperBackground.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body;
	this.messageBodyText.style.fontWeight = "bold";
	this.messageBodyText.style.color = "white";
	this.messageBodyText.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		this.claimGiftDiv.innerHTML = "Reclaim my wager";
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.respondToMessage,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Wager reclaimed!";
	}
	
	this.messageFooterDiv.appendChild(this.claimGiftDiv);


	this.applyNewMessageWrapper();
}

Message.prototype.adminTextTemplate = function(){

	this.senderNameDiv.style.fontFamily = "boostsskregular";
	this.senderNameDiv.style.fontSize = "22px";
	this.senderNameDiv.style.color = "white";
	this.senderNameDiv.style.textShadow = "-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue";

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.openedMessageDiv.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body;
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		if(this.gratii==0){
			claimButtonText = "OK";
		}else{
			claimButtonText = "Claim my gift";
		}
		this.claimGiftDiv.innerHTML = claimButtonText;
		this.claimGiftDiv.addEventListener('click', {
                                handleEvent:this.respondToMessage,                  
                                Message:this,
                             	Response: null}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Gift claimed!";
	}
	
	this.messageFooterDiv.appendChild(this.claimGiftDiv);


	this.applyNewMessageWrapper();
}

Message.prototype.userTextTemplate = function(){

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.messageBodyWrapper.style.height = $(this.messageContentContainer).height()-"50";
	this.openedMessageDiv.appendChild(this.messageBodyWrapper);

	this.messageBodyText = document.createElement('div');
	this.messageBodyText.className = "messageBodyText";
	this.messageBodyText.innerHTML = "</br>"+this.body;
	this.messageBodyWrapper.appendChild(this.messageBodyText);

	this.messageFooterDiv = document.createElement('div');
	this.messageFooterDiv.className = "messageFooter";
	this.messageBodyWrapper.appendChild(this.messageFooterDiv);

	this.claimGiftDiv = document.createElement('div');
	if(this.pendingResponse == true){
		this.claimGiftDiv.className = "claimGiftButton";
		if(this.gratii==0){
			claimButtonText = "OK";
		}else{
			claimButtonText = "Claim my gift";
		}
		this.claimGiftDiv.innerHTML = claimButtonText;
		this.claimGiftDiv.addEventListener('click', {
                                 handleEvent:this.respondToMessage,                  
                                 Message:this}, false);
	}else{
		this.claimGiftDiv.className = "claimGiftButtonDisabled";
		this.claimGiftDiv.innerHTML = "Gift claimed!";
	}
	
	this.messageFooterDiv.appendChild(this.claimGiftDiv);


	this.applyNewMessageWrapper();
}

Message.prototype.demoTemplate = function(){

	this.messageBodyWrapper = document.createElement('div');
	this.messageBodyWrapper.className = "messageBodyWrapper";
	this.openedMessageDiv.appendChild(this.messageBodyWrapper);

	this.applyNewMessageWrapper();
}

Message.prototype.createMessageBody = function(){


	switch(this.template){
		
		case "demoTemplate":
			this.demoTemplate();
			break;
		case "userText":
		  	this.userTextTemplate();
		  	break;
		case "userGift":
			this.userTextTemplate();
			break;
		case "forfeitChallenge":
			this.forfeitChallengeTemplate();
			break;
		case "adminText":
			this.adminTextTemplate();
			break;
		case "adminSurvey":
			this.adminSurveyTemplate();
			break;
		case "clientSurvey":
			this.adminSurveyTemplate();
			break;
		case "issueChallenge":
			this.receivedChallengeTemplate();
			break;
		case "winChallenge":
			this.winChallengeTemplate();
			break;
		case "loseChallenge":
			this.loseChallengeTemplate();
			break;
		case "loseAuction":
			this.loseAuctionTemplate();
			break;
		case "winAuction":
			this.winAuctionTemplate();
			break;
		default:
		  console.log('ERROR GENERATING MESSAGE TEMPLATE');

	}
}

Message.prototype.createMessageHeader = function(){
	$("#inbox .messages").append(this.li);

	this.messageContentContainer = document.createElement('div');
	this.messageContentContainer.className = "messageContentContainer";
	this.messageContentContainer.style.height = ($(window).width()*.5)+50;
	this.li.appendChild(this.messageContentContainer);

	this.messageContentWrapper = document.createElement('div');
	this.messageContentWrapper.className = "messageContentWrapper";
	this.messageContentContainer.appendChild(this.messageContentWrapper);

	this.openedMessageDiv = document.createElement('div');
	this.openedMessageDiv.className = "openedMessage";
	this.messageContentWrapper.appendChild(this.openedMessageDiv);

	this.headerDiv = document.createElement('div');
	this.headerDiv.className = "messageHeader";
	this.openedMessageDiv.appendChild(this.headerDiv);

	this.timstampDiv = document.createElement('div');
	this.timstampDiv.className = "messageTimestamp";
	this.timstampDiv.innerHTML = this.timestamp;
	this.headerDiv.appendChild(this.timstampDiv);

	this.senderWrapper = document.createElement('div');
	this.senderWrapper.className = "senderWrapper";
	this.headerDiv.appendChild(this.senderWrapper);

	this.senderNameDiv = document.createElement('div');
	this.senderNameDiv.className = "senderName";
	this.senderNameDiv.id = this.senderID;
	this.senderNameDiv.innerHTML = this.senderName;
	if(this.senderEntity == "user"){
		this.senderNameDiv.addEventListener('click', function(event){
	
			event.stopPropagation();
			event.preventDefault();
			triggerUserInteractionPanel(this.id, this.innerHTML);
		});
	}
	this.senderWrapper.appendChild(this.senderNameDiv);

	this.giftWrapper = document.createElement('div');
	this.giftWrapper.className = "messageGiftWrapper";
	if(this.pendingResponse===true){
		this.giftWrapper.style.opacity = "1";
	}else{
		this.giftWrapper.style.opacity = ".4";
	}
	this.headerDiv.appendChild(this.giftWrapper);

	this.giftCoinDiv = document.createElement('div');
	this.giftCoinDiv.className = "messageGiftCoin";
	this.giftWrapper.appendChild(this.giftCoinDiv);

	this.giftAmountDiv = document.createElement('div');
	this.giftAmountDiv.className = "messageGiftAmount";
	this.giftAmountDiv.innerHTML = this.gratii;
	this.giftWrapper.appendChild(this.giftAmountDiv);

	this.createMessageBody();	
	
}

Message.prototype.createDomElements = function(){
	if(this.newMessage===true){
		user.newMessages++;
	}

	user.updateNewMessageIndicator();
	
	this.createMessageHeader();
	
}
// end of INBOX-------------------------



// start of TRANSACTIONS-------------------------
var Transaction = function(val){ //Game object
	this.id = val.id;
	this.timestamp = val.createdAt;
	this.description = val.memo;
	this.gratiiChange = val.gratiiAmount;
	this.deltaColor = this.gratiiChange>=0?"green":"red";
	this.balance = val.newBalance;
	this.gratiiCoin = "images/gratiiCoinIconiOSGradient.png";
	this.html = "";
	this.backgroundColor = transactionObjects.length%2?"#fcfcfc":"#f4fbff";

	this.li = document.createElement('li');
	this.li.className = "transactionLI";
	this.li.style.backgroundColor = this.backgroundColor;

	transactionObjects.push(this);
}

Transaction.prototype.createDomElements = function(){ 
	
	$("#profile .transactions").append(this.li);

	this.div = document.createElement('div');
	this.div.className = "transactionID";
	this.div.innerHTML = "id: "+this.id;
	this.li.appendChild(this.div);	

	this.div = document.createElement('div');
	this.div.className = "transactionTimestamp";
	this.div.innerHTML = this.timestamp;
	this.li.appendChild(this.div);	

	this.div = document.createElement('div');
	this.div.className = "transactionDescription";
	this.div.innerHTML = this.description+': <font style="color:'+this.deltaColor+';">'+this.gratiiChange+''+'</font>';
	this.li.appendChild(this.div);	

	this.div = document.createElement('div');
	this.div.className = "transactionCoin";
	this.li.appendChild(this.div);

	this.div = document.createElement('div');
	this.div.className = "transactionBalance";
	this.div.innerHTML = this.balance;
	this.li.appendChild(this.div);	

}

// end of TRANSACTIONS-------------------------




// start of UNIVERSAL DATA-------------------------
function createDomElementsFromObjects(dataRequested){
	console.log("Request to create DOM elements from Objects received: "+dataRequested+"...");
	
	if(dataRequested==="arcade"){
		
		for(var i=0;i<gameObjects.length;i++){
			gameObjects[i].createDomElements();
		}
		initializeVerticaliScroll(0, ".vSnapToHere");

	}else if(dataRequested==="auctions"){
		
		for(var i=0;i<auctionObjects.length;i++){
			auctionObjects[i].createDomElements();
		}
		$("#auctions .auctions").append('</br></br></br></br>');
		initializeVerticaliScroll(1, ".vSnapToHere");
		if(currentAuctionScope===1){
			FB.XFBML.parse(document.getElementById('auction'));
		}

	}else if(dataRequested==="inbox"){
		
		for(var i=0;i<inboxObjects.length;i++){
			inboxObjects[i].createDomElements();
		}
		$("#inbox .messages").append('</br></br>');
		initializeVerticaliScroll(2, ".vSnapToHere");

	}else if(dataRequested==="transactions"){
		
		for(var i=0;i<transactionObjects.length;i++){ 
			transactionObjects[i].createDomElements();
		}
		initializeVerticaliScroll(3, false);

	}	

	console.log("DOM elements appended: "+dataRequested+"#");
}

// $(".gratiiLogo").click(function(){
// 	FB.XFBML.parse(document.getElementById('auction'));
// });

function createObjects(dataRequested, data){

	console.log("Creating objects: "+dataRequested+"...");
	if(dataRequested==="session"){

		var entity = data['entity'];
		
		if(entity=="user"){
			//user is logged in
			loggedIn = true;
			sessionID = data['id'];
	
			if (navigator.geolocation){

				navigator.geolocation.getCurrentPosition(saveGeoLocation, handleGeoError);

				function saveGeoLocation(positions){

					var userLat = positions.coords.latitude;
					var userLong = positions.coords.longitude;
					
					$.ajax({
				        url: apiRoot+"user/"+sessionID+"/location/google",
				        type: 'PUT',
				        dataType: 'json',
				        data: { userLat: userLat, 
				        		userLong: userLong },
				        async: true,
				        cache: false,
				        timeout: 30000,
				        error: function(data){
				        	console.log("Geo Error");
				            return true;
				        },
				        success: function(data){ 
				        	//console.log(data);
				        }
				    });
				}

				function handleGeoError(){
					console.log("Could not get geo data. Access Denied.");
				}
			}else{
				console.log("Could not get geo data. Browser incompatible.");
			}
  		
		}

		getData("profile");
	
	}else if(dataRequested==="profile"){
					
		user = new User(data);
		user.completeProfile();

	}else if(dataRequested==="arcade"){
	
		$.each(data, function(key, val){			
			new Game(val);
		});
		
		createDomElementsFromObjects(dataRequested);
	
	}else if(dataRequested==="auctions"){
		
		$.each(data, function(key, val){			
			new Auction(val);
		});
		
		createDomElementsFromObjects(dataRequested);
	
	}else if(dataRequested==="inbox"){
	
		$.each(data, function(key, val){			
			new Message(val);
		});
		
		createDomElementsFromObjects(dataRequested);
	
	}else if(dataRequested==="transactions"){
	
		$.each(data, function(key, val){			
			new Transaction(val);
		});
		createDomElementsFromObjects(dataRequested);
	
	}

}

function getData(dataRequested, extra){
	console.log("Getting data: "+dataRequested+"...");

	if(dataRequested==="session"){

		$.ajax({
	        url: apiRoot+'user/session',
	        type: 'GET',
	        dataType: 'json',
	        async: false,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log('Error checking session.');
	            return true;
	        },
	        success: function(data){ 
	        	console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}else if(dataRequested==="profile"){
		
		if(loggedIn===false){
			var  getProfileURL = 'js/profile.json';
		}else{
			var  getProfileURL = apiRoot+'user/'+sessionID;
		}

		$.ajax({
	        url: getProfileURL,
	        type: 'GET',
	        dataType: 'json',
	        async: false,
	        cache: false,
	        timeout: 30000,
	        error: function(){
	        	console.log("Error getting data: "+dataRequested+"#");
	            return true;
	        },
	        success: function(data){ 
	            console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}else if(dataRequested==="arcade"){

		$("#arcade .pageUL").html('');
		gameObjects = []; 
		$.ajax({
	        url: apiRoot+'arcade',
	        type: 'GET',
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log("Error getting data: "+dataRequested+"#");
	        	if(data.status == "404"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		noDataWrapper.innerHTML = "Uh oh.. I think something broke. I can't seem to find our games right now..";
	        		$("#inbox .pageUL").append(noDataWrapper);
	        	}
	            return true;
	        },
	        success: function(data){ 
	            console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}else if(dataRequested==="auctions"){

		if(currentAuctionScope===0){
			URL = apiRoot+'auction/live';
		}else if(currentAuctionScope===1){
			URL = apiRoot+'auction/upnext';
		}else if(currentAuctionScope===2){
			URL = apiRoot+'auction/past';
		}

		$("#auctions .pageUL").html('');
		auctionObjects = [];
		$.ajax({
	        url: URL,
	        type: 'GET',
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	if(data.status == "404"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		if(currentAuctionScope==0){
	        			noDataWrapper.innerHTML = "No live auctions currently. </br>Click the 'UP NEXT' tab above to see which auctions are coming up soon and when they start.</br></br>p.s. If you search around there, you might even find some bonus gratii laying around ;)";
	        		}else if(currentAuctionScope==1){
	        			noDataWrapper.innerHTML = "No upcoming auctions at this time. </br>Please check back later.";
	        		}else if(currentAuctionScope==2){
	        			noDataWrapper.innerHTML = "No past auctions yet.";
	        		}	
	        		$("#auctions .pageUL").append(noDataWrapper);
	        		window.setTimeout(function(){
        				$(".noDataWrapper").css({"background-color":"white"});
        			},100);
	        	}
	        	console.log("Error getting data: "+dataRequested+"#");
	            return true;
	        },
	        success: function(data){ 
	            console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}else if(dataRequested==="inbox"){
		
		if(loggedIn===false){
			var  getInboxURL = 'js/inbox.json';
		}else{
			var  getInboxURL = apiRoot+'user/inbox';
		}

		user.newMessages = 0;
		$("#inbox .pageUL").html('');
		inboxObjects = [];
		$.ajax({
	        url: getInboxURL,
	        type: 'GET',
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log("Error getting data: "+dataRequested+"#");
	        	if(data.status == "404"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		noDataWrapper.innerHTML = "No new messages yet";
	        		$("#inbox .pageUL").append(noDataWrapper);
	        	}else if(data.status == "401"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		noDataWrapper.innerHTML = "Only logged in users can receive messages.</br>Messages usually contain bonus gratii!";
	        		$("#inbox .pageUL").append(noDataWrapper);
	        	}
	            return true;
	        },
	        success: function(data){ 
	            console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}else if(dataRequested==="transactions"){
		if(loggedIn===true){
			$(".homeScreen").hide();
		}

		$("#profile .pageUL").html('');
		transactionObjects = [];
		$.ajax({
	        url: apiRoot+'user/transactions',
	        type: 'GET',
	        dataType: 'json',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	if(data.status == "404"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		noDataWrapper.innerHTML = "No transactions yet.</br>Check back once you've played around a bit.";
	        		$("#profile .pageUL").append(noDataWrapper);
	        	}else if(data.status == "401"){
	        		console.log(data.status);
	        		noDataWrapper = document.createElement('div');
	        		noDataWrapper.className = "noDataWrapper";
	        		noDataWrapper.innerHTML = "Only logged in users can view their transactions";
	        		$("#profile .pageUL").append(noDataWrapper);
	        	}
	            return true;
	        },
	        success: function(data){ 
	            console.log("Data gotten: "+dataRequested+"#");
	            createObjects(dataRequested, data['results']);
	        }
	    });

	}  
}
// end of UNIVERSAL DATA-------------------------



// Change page functions-------------------------------
function dimAllNavItems(){ //Dim non-selected navItems
	console.log("Dimming all navItems...");
	$(".navItem").removeClass('active');
	console.log("Dimmed navItems#");
}

function highlightSelectedNavItem(selectedPage){ //Highlight selected navItem
	console.log("Highlighting .navItem("+selectedPage+")...");
	$(".navItem:eq("+selectedPage+")").addClass('active');
	console.log(".navItem("+selectedPage+") highlighted#");
}

function displayPage(selectedPage){ //Scroll to the new page	
	console.log("Switching to page "+selectedPage+"...");
	$(".mainApp").clearQueue();

	if(selectedPage === 0){
		$(".mainApp").animate({"marginLeft":"0px"}, 500);
	}else if(selectedPage === 1){
		$(".mainApp").animate({"marginLeft":"-100%"}, 500);
	}else if(selectedPage === 2){
		$(".mainApp").animate({"marginLeft":"-200%"}, 500);
	}else if(selectedPage === 3){
		$(".mainApp").animate({"marginLeft":"-300%"}, 500);
	}
	
	currentPage = selectedPage;	
	console.log("On page "+selectedPage+"#");
}

function changePage(selectedPage){
	dimAllNavItems();
	highlightSelectedNavItem(selectedPage);
	displayPage(selectedPage);
	if(inboxUpdateRequested === true){
		inboxUpdateRequested = false;
		getData('inbox');
	}
	if(auctionUpdateRequested === true){
		auctionUpdateRequested = false;
		getData('auctions');
	}
}

$(".navItem").on('click', function(){ //Mobile touch on navItem
	var selectedPage = $(this).index();

	if(stopSignVisible===true){
		return;
		hideStopSign();
	}

	if(selectedPage===currentPage){
		verticaliScrolls[currentPage].scrollTo(0, 0, 200);
		console.log('Already on this page');
		return;
	}

	changePage(selectedPage);

});
// End of Change page functions-------------------------------


// Auction Nav Functions--------------------
function dimAllAuctionScopes(){ //Dim non-selected navItems
	console.log("Dimming auction scopes...");
	$("#auctions .scopeButton").removeClass('active');
	console.log("Dimmed auction scopes#");
}

function highlightSelectedAuctionScope(selectedAuctionScope){ //Highlight selected navItem
	console.log("Highlighting .auctionScopeButton("+selectedAuctionScope+")...");
	$("#auctions .scopeButton:eq("+selectedAuctionScope+")").addClass('active');
	console.log("#auctions .scopeButton("+selectedAuctionScope+") highlighted#");
}

function displayAuctionScope(selectedAuctionScope){ //Scroll to the new page	
	
	console.log("Switching to auction scope "+selectedAuctionScope+"...");

	//load new scope here
	console.log("Loading new auction scope: "+selectedAuctionScope+"...");
	
	currentAuctionScope = selectedAuctionScope;	
	console.log("On auction scope "+selectedAuctionScope+"#");
}

function changeAuctionScope(selectedAuctionScope){
	dimAllAuctionScopes();
	highlightSelectedAuctionScope(selectedAuctionScope);
	
	displayAuctionScope(selectedAuctionScope);
	auctionObjects = [];
	getData("auctions");
	
	if(auctionUpdateRequested === true){
		auctionUpdateRequested = false;
	}
}

$("#auctions .scopeButton").on('click', function(){ //Mobile touch on navItem
	var selectedAuctionScope = $(this).index();

	if(selectedAuctionScope===currentAuctionScope){
		console.log('Already on this page');
		return;
	}
	
	changeAuctionScope(selectedAuctionScope);

});

// End of Auction Nav Functions-------------


// Inbox Nav Functions--------------------
function dimAllInboxScopes(){ //Dim non-selected navItems
	console.log("Dimming inbox scopes...");
	$("#inbox .scopeButton").removeClass('active');
	console.log("Dimmed inbox scopes#");
}

function highlightSelectedInboxScope(selectedInboxScope){ //Highlight selected navItem
	console.log("Highlighting #inbox .scopeButton("+selectedInboxScope+")...");
	$("#inbox .scopeButton:eq("+selectedInboxScope+")").addClass('active');
	console.log("#inbox .scopeButton("+selectedInboxScope+") highlighted#");
}

function getInboxScope(selectedInboxScope){ //Scroll to the new page	
	
	console.log("Switching to inbox scope "+selectedInboxScope+"...");

	//load new scope here
	console.log("Loading new inbox scope: "+selectedInboxScope+"...");
	
	currentInboxScope = selectedInboxScope;	
	if(currentInboxScope===0){
		$(".send").hide();
		$(".messages").show();
		verticaliScrolls[2].refresh();
	}else{
		$(".messages").hide();
		$(".send").show();
		verticaliScrolls[2].refresh();
	}
	console.log("On inbox scope "+selectedInboxScope+"#");
}

function changeInboxScope(selectedInboxScope){
	dimAllInboxScopes();
	highlightSelectedInboxScope(selectedInboxScope);
	getInboxScope(selectedInboxScope);
	//getAndDrawProfile();
}

$("#inbox .scopeButton").on('click', function(){ //Mobile touch on navItem
	var selectedInboxScope = $(this).index();

	if(selectedInboxScope===currentInboxScope){
		console.log('Already on this page');
		return;
	}
	
	changeInboxScope(selectedInboxScope);
	if(inboxUpdateRequested === true){
		inboxUpdateRequested = false;
		getData('inbox');
	}

});
// End of Inbox Nav Functions-------------



// Profile Nav Functions--------------------
function dimAllProfileScopes(){ //Dim non-selected navItems
	console.log("Dimming profile scopes...");
	$("#profile .scopeButton").removeClass('active');
	console.log("Dimmed profile scopes#");
}

function highlightSelectedProfileScope(selectedProfileScope){ //Highlight selected navItem
	console.log("Highlighting .profileScopeButton("+selectedProfileScope+")...");
	$("#profile .scopeButton:eq("+selectedProfileScope+")").addClass('active');
	console.log(".profileScopeButton("+selectedProfileScope+") highlighted#");
}

function getProfileScope(selectedProfileScope){ //Scroll to the new page	
	
	console.log("Switching to profile scope "+selectedProfileScope+"...");

	//load new scope here
	console.log("Loading new profile scope: "+selectedProfileScope+"...");
	
	currentProfileScope = selectedProfileScope;
	if(selectedProfileScope===0){
		verticaliScrolls[3].scrollTo(0,0,0);
		$(".transactions").hide();
		$(".settings").show();
		verticaliScrolls[3].refresh();
	}else{
		verticaliScrolls[3].scrollTo(0,0,0);
		$(".settings").hide();
		transactionObjects = [];
		$(".transactions").html('');
		getData("transactions");		
		window.setTimeout(function(){
			$(".transactions").show();
			verticaliScrolls[3].refresh();
		} , 1000);
	}
	console.log("On profile scope "+selectedProfileScope+"#");
}

function changeProfileScope(selectedProfileScope){
	dimAllProfileScopes();
	highlightSelectedProfileScope(selectedProfileScope);
	getProfileScope(selectedProfileScope);
}

$("#profile .scopeButton").on('click', function(){ //Mobile touch on navItem
	var selectedProfileScope = $(this).index();

	if(selectedProfileScope===currentProfileScope){
		console.log('Already on this page');
		return;
	}
	
	changeProfileScope(selectedProfileScope);

});
// End of Profile Nav Functions-------------

// start STOP SIGN-----------------
function showStopSign(){
	$(".stopSignWrapper").show(function(){
		$("#dimmer").fadeIn();
		$(".stopSignWrapper").animate({bottom:"51px"}, 500);
		stopSignVisible = true;
	});
	
	
}

function hideStopSign(){
	$(".stopSignWrapper").animate({bottom:"-300px"}, 500, function(){
		$("#dimmer").fadeOut();
		$(".stopSignWrapper").html('');
		$(".stopSignWrapper").hide();
		stopSignVisible = false;
	});
	
}

function triggerUserInteractionPanel(userID, username){

	var thisUserID = userID;
	var thisUsername = username; 

	$(".stopSignWrapper").html('');

	var stopSignTitle = document.createElement('div');
	stopSignTitle.className = "stopSignTitle";
	stopSignTitle.innerHTML = "Interact with "+thisUsername+"</br></br>";
	$(".stopSignWrapper").append(stopSignTitle);

	var sendMessageButton = document.createElement('div');
	sendMessageButton.className = ('formButton');
	sendMessageButton.innerHTML = 'Send a message';
	sendMessageButton.addEventListener('click', function(event){
		event.stopPropagation();
		if(loggedIn===false){
			triggerErrorMessage("notLoggedIn");
			return;
		}
		hideStopSign();
		changePage(2);
		changeInboxScope(1);
		$("#inbox .formInputText#username").val(thisUsername);
	});
	$(".stopSignWrapper").append(sendMessageButton);

	var challengeButton = document.createElement('div');
	challengeButton.className = ('formButton');
	challengeButton.innerHTML = 'Issue a challenge';
	challengeButton.addEventListener('click', function(event){
		event.stopPropagation();
		if(loggedIn===false){
			triggerErrorMessage("notLoggedIn");
			return;
		}
		hideStopSign();
		changePage(0);
		triggerChallengePanel(null, null, thisUsername);
	});
	$(".stopSignWrapper").append(challengeButton);
	console.log('called!');
	showStopSign();
}

function triggerErrorMessage(type, text){
	var errorType = type;
	
	if(triggerMessageInProgress == true){
		return;
	}

	triggerMessageInProgress = true;

	$(".stopSignWrapper").html('');

	if(errorType == "default"){
		var stopSignTitle = document.createElement('div');
		stopSignTitle.className = "stopSignTitle";
		stopSignTitle.innerHTML = "Error</br></br>";
		$(".stopSignWrapper").append(stopSignTitle);

		var errorText = text || "Uh oh! Something went wrong.. try again.";
		
		var stopSignErrorMessage = document.createElement('div');
		stopSignErrorMessage.className = "stopSignErrorMessage";
		stopSignErrorMessage.innerHTML = errorText;
		$(".stopSignWrapper").append(stopSignErrorMessage);
	}else if(errorType == "notLoggedIn"){
		var stopSignTitle = document.createElement('div');
		stopSignTitle.className = "stopSignTitle";
		stopSignTitle.innerHTML = "Please log in</br></br>";
		$(".stopSignWrapper").append(stopSignTitle);

		var errorText = text || "Woah there, that's for Gratii members only! You need to be signed in to do that.</br></br>";
		
		var stopSignErrorMessage = document.createElement('div');
		stopSignErrorMessage.className = "stopSignErrorMessage";
		stopSignErrorMessage.innerHTML = errorText;
		$(".stopSignWrapper").append(stopSignErrorMessage);

		var backToHomeButton = document.createElement('div');
		backToHomeButton.className = ('formButton');
		backToHomeButton.innerHTML = 'Login/Sign up';
		backToHomeButton.addEventListener('click', function(event){
			event.stopPropagation();
			hideStopSign();
			$(".homeScreen").show();
		});
		$(".stopSignWrapper").append(backToHomeButton);
	}
	
	triggerMessageInProgress = false;
	showStopSign();	
	
}

function triggerChallengePanel(gameID, gameTitle, challengeeUsername){
	
	var thisGameID = gameID;
	var thisGameTitle = gameTitle;
	var thisChallengee = challengeeUsername;

	$(".stopSignWrapper").html("");

	if(stopSignVisible===true){
		setTimeout(function(){triggerChallengePanel(thisGameID, thisGameTitle, thisChallengee);}, 100);
		return;
	}

	var stopSignTitle = document.createElement('div');
	stopSignTitle.className = "stopSignTitle";
	stopSignTitle.innerHTML = "Create a Challenge";
	$(".stopSignWrapper").append(stopSignTitle);

	var stopSignSubTitle = document.createElement('div');
	stopSignSubTitle.className = "stopSignSubTitle";
	stopSignSubTitle.innerHTML = "<b>Rules:</b> Enter your oppenent's name.</br>Enter how much gratii you want to wager.</br>Try to get the highest score you can.</br>No do-overs. Winner takes all!";
	$(".stopSignWrapper").append(stopSignSubTitle);

	var formWrapper = document.createElement('div');
	formWrapper.className = ('formWrapper');
	$(".stopSignWrapper").append(formWrapper);

	var formInputText1 = document.createElement('input');
	formInputText1.type = ('text');
	formInputText1.placeholder = ('Opponent\'s username');
	formInputText1.className = ('formInputText top');
	formInputText1.id = ('challengee');
	if(thisChallengee){
		formInputText1.value = thisChallengee;
	}
	formInputText1.addEventListener('click', function(event){
		event.stopPropagation();
	});
	formWrapper.appendChild(formInputText1);

	var formInputText2 = document.createElement('input');
	formInputText2.type = ('number');
	formInputText2.placeholder = ('Enter your wager');
	formInputText2.className = ('formInputText bottom');
	formInputText2.id = ('wager');
	formInputText2.addEventListener('click', function(event){
		event.stopPropagation();
	});
	formWrapper.appendChild(formInputText2);

	var formInputSelect = document.createElement('select');
	formInputSelect.className = "challengeSelect";
	formWrapper.appendChild(formInputSelect);

	var selectOption = document.createElement('option');
	selectOption.value = '0';
	selectOption.innerHTML = "Select";
	formInputSelect.appendChild(selectOption);

	for(var i=0; i<gameObjects.length; i++){

		if(gameObjects[i].challengeable == "1"){
			var selectOption = document.createElement('option');
			selectOption.value = gameObjects[i].id;
			selectOption.innerHTML = gameObjects[i].title;
			if(gameObjects[i].id == thisGameID){
				selectOption.setAttribute("selected", "selected");
			}
			formInputSelect.appendChild(selectOption);
		}
	}

	var formButton = document.createElement('div');
	formButton.className = ('formButton');
	formButton.id = ('submitChallenge');
	formButton.innerHTML = 'Start the challenge!';
	formButton.addEventListener('click', function(event){
		event.stopPropagation();
		
		if(loggedIn===false){
			triggerErrorMessage("notLoggedIn");
			return;
		}

		formButton.innerHTML = "Please wait..";

		var thisGameID = $(formInputSelect).find(":selected").val();
		var challengeeUsername = $(formInputText1).val();
		var wager = $(formInputText2).val();

		if(thisGameID == ""){
			alert("Select a game");
			formButton.innerHTML = "Send";
			return;
		}else if(challengeeUsername == ""){
			alert("Enter a username to challenge");
			formButton.innerHTML = "Send";
			return;
		}else if(wager == "0" || wager == ""){
			alert("Please enter a wager");
			formButton.innerHTML = "Send";
			return;
		}else if(wager <= 0){
			alert("Please enter a valid wager amount");
			formButton.innerHTML = "Send";
			return;
		}else if(Math.floor(wager) > Math.floor(user.gratii)){
			alert("You do not have "+wager+" gratii to wager");
			formButton.innerHTML = "Send";
			return;
		}else if(challengeeUsername == user.username){
			alert("You can't send a message to yourself silly.");
			formButton.innerHTML = "Send";
			return;
		}

		$.ajax({
	        url: apiRoot+"challenge",
	        type: 'POST',
	        dataType: 'json',
	        data: { gratiiWager: wager, 
	        		arcadeID: thisGameID,
	        		opponentNickname: challengeeUsername },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log(data);
	        	var jsonResponse = data.responseJSON;
	        	if(jsonResponse['msg'].substring(0, 5) == "PRO##"){
	        		var proMessage = "Only PRO accounts can send challenges. You can upgrade to a PRO account from your profile tab.";
	        		alert(proMessage);
	        	}else{
					alert(jsonResponse['msg']);
	        	}
	        	
	        	formButton.innerHTML = "Try again";
	            return true;
	        },
	        success: function(data){ 
	        	
	        	console.log(data);

	        	formButton.innerHTML = "Success";
	        	hideStopSign();
	        	user.challengeIssueInProgress = true;
	        	user.challengeIDInProgress = data['results'];
	        	openGameiFrame(thisGameID);
	        	
	        }
	    });

	});
	formWrapper.appendChild(formButton);

	showStopSign();	
}
// end STOP SIGN----------------


// Input Checkers--------------------
function textCounter(){

	var field = document.getElementById('textMessage');
	if ( field.value.length > 150 ) {
  		// field.value = field.value.substring( 0, maxlimit );
  		// return false;
  		$('#textMessage').css({"border":"1px solid red"});
  		$('#inbox .sendButton').css({"color":"red"});
  		$('#inbox .sendButton').html('Too many characters');
  		return;
 	} else {
 		$('#'+field.id).css({"border":"none"});
  		$('#inbox .sendButton').css({"color":"white"});
  		$('#inbox .sendButton').html('Send');
 	}
}
// End of Input Checkers--------------------

