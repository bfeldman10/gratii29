	app.Data.trackFacebookLike = function(auctionID){

		console.log( 'Responding to Facebook Like.' );

		var request = $.ajax({
			type: "POST",
			url: window.app.Settings.apiBaseURL + "like",
			dataType: 'json',
			data: {"auctionID":auctionID}
		});

		request.done(function(response, textStatus, jqXHR){

			console.log( 'Successfully Tracked Facebook Like' );

			//TODO gratii?

		});

		request.fail(function(response, textStatus, jqXHR){
			console.log( 'Failed to track Facebook Like.' );
		});

	};


	app.Data.trackTwitterFollow = function(auctionID){

		console.log( 'Responding to Twitter Follow.' );

		var request = $.ajax({
			type: "POST",
			url: window.app.Settings.apiBaseURL + "follow",
			dataType: 'json',
			data: {"auctionID":auctionID}
		});

		request.done(function(response, textStatus, jqXHR){

			console.log( 'Successfully Tracked Twitter Follow' );

			//TODO gratii?

		});

		request.fail(function(response, textStatus, jqXHR){
			console.log( 'Failed to track Twitter Follow.' );
		});

	};






	app.Facebook.init = function(){

		console.log( '$$$$$$$$$ Init facebook' );

		FB.init({
			appId      : '167560383437139', // App ID
			channelUrl : '//'+app.Settings.baseURL+'channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});


		// Additional init code here
		FB.Event.subscribe('auth.authResponseChange', function(response) {

			console.log( 'FB Auth Response Change' );
			console.log( response );

			// Here we specify what we do with the response anytime this event occurs.
			if (response.status === 'connected') {
				console.log( 'FBFBFBFB **** You are connected to FB and app' );
				// The response object is returned with a status field that lets the app know the current
				// login status of the person. In this case, we're handling the situation where they
				// have logged in to the app.
				// testAPI();
			} else if (response.status === 'not_authorized') {
				console.log( 'FBFBFBFB **** You are logged in to FB but not into the app' );
				// In this case, the person is logged into Facebook, but not into the app, so we call
				// FB.login() to prompt them to do so.
				// In real-life usage, you wouldn't want to immediately prompt someone to login
				// like this, for two reasons:
				// (1) JavaScript created popup windows are blocked by most browsers unless they
				// result from direct interaction from people using the app (such as a mouse click)
				// (2) it is a bad experience to be continually prompted to login upon page load.
				//FB.login();
			} else {
				console.log( 'FBFBFBFB **** You are not logged in to FB' );
				// In this case, the person is not logged into Facebook, so we call the login()
				// function to prompt them to do so. Note that at this stage there is no indication
				// of whether they are logged into the app. If they aren't then they'll see the Login
				// dialog right after they log in to Facebook.
				// The same caveats as above apply to the FB.login() call here.
				FB.login();
			}
		});

		FB.Event.subscribe('auth.statusChange', function(response) {
			//TODO verify the correct stats is being returned.
			console.log( 'FB Status Change.. ' );
			console.log( response );
			console.log( response.status );
			app.User.fbStatus = response.status;

			//SAVE the access token to the Gratii back-end - it will be turned in to a "long-lived" token and used there.
			// response.accessToken
			// alert(response.authResponse.accessToken);
			app.Facebook.saveUserAccessToken(response.authResponse.accessToken, response.authResponse.userID);

			// if (app.User.fbStatus === "connected") {
			// 	app.UI.renderLiveAuctionsSocialButtons();
			// }
		});







		//FB.getLoginStatus();

	};

	app.Facebook.saveUserAccessToken = function(fbToken, userID){

		var request = $.ajax({
			type: "PUT",
			url: app.Settings.apiBaseURL + "user/fbTokens",
			dataType: 'json',
			data: { fbTokenShort: fbToken, fbUserID: userID }
		});

		request.done(function(response, textStatus, jqXHR) {
			console.log( response.results );
			console.log( 'Saved FB access token. See Above.' );
		});

		request.fail(function(resp, textStatus, jqXHR) {
			console.log( 'Failed to Save FB Access Token.' );
		});

	};

	// FB.getLoginStatus(function(response) {
	// 	console.log( 'FB get Login Status' );
	// 	if (response.status === 'connected') {
	// 	// the user is logged in and has authenticated your
	// 	// app, and response.authResponse supplies
	// 	// the user's ID, a valid access token, a signed
	// 	// request, and the time the access token
	// 	// and signed request each expire
	// 	var uid = response.authResponse.userID;
	// 	var accessToken = response.authResponse.accessToken;
	// 	} else if (response.status === 'not_authorized') {
	// 	// the user is logged in to Facebook,
	// 	// but has not authenticated your app
	// 	} else {
	// 	// the user isn't logged in to Facebook.
	// 	}
	//  });

	app.Facebook.connectUser = function(){

		//ALT VERSION

		// var permissions = 'email,publish_stream';
		var permissions = 'user_likes';
		var m_appId = "167560383437139";
		var m_appUrl = app.Settings.baseURL + "facebook-login.php";
		var permissionUrl = "https://m.facebook.com/dialog/oauth?client_id=" + m_appId + "&response_type=code&redirect_uri=" + encodeURIComponent(m_appUrl) + "&scope=" + permissions;
		window.location = permissionUrl;
		//$('#profile-list #fb-login-frame').attr('src',permissionUrl);


		// FB.login(function(response) {
		//    if (response.authResponse) {
		//      console.log('Welcome!  Fetching your information.... ');
		//      FB.api('/me', function(response) {
		//       console.log('Good to see you, ' + response.name + '.');
		//        FB.logout(function(response) {
		//          console.log('Logged out.');
		//        });
		//      });
		//   } else {
		//     console.log('User cancelled login or did not fully authorize.');
		//   }
		// }, {scope: 'email,publish_stream' , redirect_uri: encodeURIComponent(m_appUrl) , display : 'touch'});

	};

	app.Twitter.connectUser = function(){
		window.location = app.Settings.baseURL + 'twitteroauth-master/redirect.php';
	}