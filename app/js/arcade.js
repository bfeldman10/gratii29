$(function(){

	// $.ajaxSetup({
	// 	xhrFields: {
	// 		withCredentials: true
	// 	}
	// });

	console.log( 'Arcade API initiated.' );

	window.arcade = {
		settings: {
			apiTimeout: 900,
			apiRetry: 0,
			apiMaxRetry: 2,
			activeGameID: null,
		},
		falling:{

			active:false,

			gameOver: function(gameToken, finalScore){

				// score and final score are the same numbers

				if (app.UIState.challengeInProgress) {
					arcade.challenges.issue(finalScore);
					return;
				}
				if (app.UIState.challengeResponseInProgress) {
					arcade.challenges.respond(finalScore);
					return;
				}

				console.log( 'Falling game over. ' + finalScore );

				// Add Event to Queue
				/*var gameOverEvent = {
					'gameID': 1,
					'event': 'gameOver',
					'finalScore': finalScore
				};*/

				/* ---- */
				var activeGame				= app.Data.arcadeGames.findWhere({id: "1"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var gameOverAlgorithm		= activeGameAlgorithms.gameOver;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (finalScore * eval(gameOverAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );
				/* ---- */

				var gameOverEvent = {
					'gameToken': gameToken,
					'eventName': 'gameOver',
					'score': finalScore,
					'finalScore': finalScore
				};

				arcade.eventStorage.storeArcadeEvent(gameOverEvent, 'ArcadeEvents');

				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

				arcade.util.gameOver();

			}
		},
		spaceCrabs:{
			gameOver: function(gameToken, currentScore){

				if (app.UIState.challengeInProgress){
					arcade.challenges.issue(currentScore);
					return;
				}
				if (app.UIState.challengeResponseInProgress) {
					arcade.challenges.respond(currentScore);
					return;
				}

				console.log( 'Space Crabs Game Over. ' + currentScore );

				// Add Event to Queue
				var gameOverEvent = {
					'gameToken': gameToken,
					'eventName': 'gameOver',
					'score': 0,
					'finalScore': currentScore
				};

				arcade.eventStorage.storeArcadeEvent(gameOverEvent, 'ArcadeEvents');

				// Send all Events to API

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

				arcade.util.gameOver();

			},
			coinGrab: function(gameToken, score){

				console.log( 'Game Token reported from game: ' + gameToken );

				score = 1;

				if (app.UIState.challengeInProgress || app.UIState.challengeResponseInProgress) {
					return;
				}

				console.log( 'Space Crabs Coin Grab. ' + score );

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "2"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var coinGrabAlgorithm		= activeGameAlgorithms.coinGrab;

				console.log( 'The Algo for handling coin grabs in Space Crabs is: ' + coinGrabAlgorithm );
				//console.log( eval(coinGrabAlgorithm) );

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(coinGrabAlgorithm) ));

				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': gameToken,
					'eventName': 'coinGrab',
					'score': score
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

			}
		},
		snake:{
			gameOver: function(gameToken, currentScore){

				if (app.UIState.challengeInProgress){
					arcade.challenges.issue(currentScore);
					return;
				}
				if (app.UIState.challengeResponseInProgress) {
					arcade.challenges.respond(currentScore);
					return;
				}

				console.log( 'Snake Game Over. ' + currentScore );

				// Add Event to Queue
				var gameOverEvent = {
					'gameToken': gameToken,
					'eventName': 'gameOver',
					'score': 0,
					'finalScore': currentScore
				};

				arcade.eventStorage.storeArcadeEvent(gameOverEvent, 'ArcadeEvents');

				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

				arcade.util.gameOver();

			},
			coinGrab: function(gameToken, score){

				score = 1;

				if (app.UIState.challengeInProgress || app.UIState.challengeResponseInProgress){
					return;
				}

				console.log( 'Snake Coin Grab. ' + score );

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "3"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var coinGrabAlgorithm		= activeGameAlgorithms.coinGrab;

				// console.log( 'The Algo for handling coin grabs in Space Crabs is: ' + coinGrabAlgorithm );
				// console.log( eval(coinGrabAlgorithm) );

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(coinGrabAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': gameToken,
					'eventName': 'coinGrab',
					'score': score
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');
			}
		},
		digga:{

			cumulativeCoinGrabs:0,
			gameToken:"X9X9X9X",

			gameOver: function(){

				var currentScore = arcade.digga.cumulativeCoinGrabs;
				arcade.digga.cumulativeCoinGrabs = 0;

				if (app.UIState.challengeInProgress){
					arcade.challenges.issue(currentScore);
					return;
				}
				if (app.UIState.challengeResponseInProgress) {
					arcade.challenges.respond(currentScore);
					return;
				}

				console.log( 'Digga Game Over.');

				// Add Event to Queue
				var gameOverEvent = {
					'gameToken': arcade.digga.gameToken,
					'eventName': 'gameOver',
					'score': 0,
					'finalScore': currentScore
				};

				arcade.eventStorage.storeArcadeEvent(gameOverEvent, 'ArcadeEvents');

				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

				// arcade.util.gameOver();

			},
			coinGrab: function(){

				var score = 1;
				arcade.digga.cumulativeCoinGrabs++;

				if (app.UIState.challengeInProgress || app.UIState.challengeResponseInProgress){
					return;
				}

				console.log( 'Digga Coin Grab.');

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "9"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var coinGrabAlgorithm		= activeGameAlgorithms.coinGrab;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(coinGrabAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': arcade.digga.gameToken,
					'eventName': 'coinGrab',
					'score': score
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

			},
			levelComplete: function(){

				var score = 1;

				if (app.UIState.challengeInProgress || app.UIState.challengeResponseInProgress){
					return;
				}

				console.log( 'Digga Level Complete.');

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "9"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var levelCompleteAlgorithm	= activeGameAlgorithms.levelComplete;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(levelCompleteAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': arcade.digga.gameToken,
					'eventName': 'levelComplete',
					'score': score
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

			}
		},
		simonSays:{

			gameToken: "X8X8X8X",

			gameOver: function(currentScore){

				if (app.UIState.challengeInProgress){
					arcade.challenges.issue(currentScore);
					return;
				}
				if (app.UIState.challengeResponseInProgress) {
					arcade.challenges.respond(currentScore);
					return;
				}

				console.log( 'Simon Says Game Over.');

				// Add Event to Queue
				var gameOverEvent = {
					'gameToken': arcade.simonSays.gameToken,
					'eventName': 'gameOver',
					'score': currentScore,
					'finalScore': currentScore
				};

				arcade.eventStorage.storeArcadeEvent(gameOverEvent, 'ArcadeEvents');

				/* ---- */
				var activeGame				= app.Data.arcadeGames.findWhere({id: "8"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var gameOverAlgorithm		= activeGameAlgorithms.gameOver;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (currentScore * eval(gameOverAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );
				/* ---- */


				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

			},

		},
		twentyFour:{

			gameToken: "X7X7X7X",
			//cummilativeAnswers:0,

			/*reset: function(){
				arcade.twentyFour.cummilativeAnswers = 0;
			},*/

			//score should be percent of time remaingin (0.5) + a 0.1 percent per hint left
			gameOver: function(score){

				score = parseFloat(score);
				var finalScore = (score*100).toFixed(2);
				finalScore = parseFloat(finalScore);

				console.log( 'score is: ' + score );

				// arcade.twentyFour.cummilativeAnswers++;

				console.log( '24 - Correct Answer / Game Over');

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "7"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var gameOverAlgorithm		= activeGameAlgorithms.gameOver;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(gameOverAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': arcade.twentyFour.gameToken,
					'eventName': 'gameOver',
					'score': score,
					'finalScore': finalScore
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);

			}

		},
		trivia:{

			gameToken: "X5X5X5X",
			triviaID: null,
			score:0,

			loadQuestion: function(){

				var request = $.ajax({
					type: "GET",
					url: window.app.Settings.apiBaseURL + "game/trivia/random",
					dataType: 'json',
				});

				request.done(function(response, textStatus, jqXHR){

					console.log( 'Got Question' );

					console.log( response );

					arcade.trivia.triviaID = response.results.id;

					console.log( 'Trivia ID is: ' + arcade.trivia.triviaID );

					document.getElementById('gameplay-iframe').contentWindow.trivia.loadQuestion(response.results);

				});

				request.fail(function(response, textStatus, jqXHR){
					console.log( 'Failed Getting Question' );
				});

			},

			answerQuestion:function(data){

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "game/trivia/response",
					dataType: 'json',
					data: {"triviaID":arcade.trivia.triviaID, "response": data}
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'Submitted Answer' );
					console.log( response );

					if (response.results.result === "wrong") {
						arcade.trivia.wrongAnswer();
					}
					else{
						arcade.trivia.correctAnswer();
					}

					document.getElementById('gameplay-iframe').contentWindow.trivia.showResponse(response.results);


				});
				request.fail(function(response, textStatus, jqXHR){
					console.log( 'Failed to send response' );
					console.log( response );
				});

			},

			correctAnswer: function(){

				var score = 1;
				arcade.trivia.score++;

				console.log( 'Trivia Correct Answer.');

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "5"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var correctAnswerAlgorithm	= activeGameAlgorithms.correctAnswer;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (score * eval(correctAnswerAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': arcade.trivia.gameToken,
					'eventName': 'correctAnswer',
					'score': score
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

			},

			wrongAnswer: function(){

				var finalScore = arcade.trivia.score;
				arcade.trivia.score = 0;

				// Calculate and Show Gratii Earned based on algorithm stored in arcade List.
				var activeGame				= app.Data.arcadeGames.findWhere({id: "5"});
				var activeGameAlgorithms	= activeGame.get('equations');
				var gameOverAlgorithm		= activeGameAlgorithms.gameOver;

				var newGratii = Math.floor(parseInt(app.User.gratii) + (finalScore * eval(gameOverAlgorithm) ));
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var coinGrabEvent = {
					'gameToken': arcade.trivia.gameToken,
					'eventName': 'gameOver',
					'score': 0,
					'finalScore': finalScore
				};

				arcade.eventStorage.storeArcadeEvent(coinGrabEvent, 'ArcadeEvents');

				// Send all Events to API
				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(arcade.requests.requestDone);
				request.fail(arcade.requests.requestFail);
			}
		},

		blackjack:{

			gameToken: "X4X4X4X",

			submitBet: function(bet, betType){

				console.log( 'Bet recieved from BlackJack. ' + bet );

				//Add Event to Queue
				var placeBetEvent = {
					'gameToken': arcade.blackjack.gameToken,
					'eventName': betType,
					'score': bet
				};

				arcade.eventStorage.storeArcadeEvent(placeBetEvent, 'ArcadeEvents');

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
				});

				request.done(function(response, textStatus, jqXHR){
					arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
					// wipe everything
					localStorage.clear();

					var newGratii = Math.floor(parseInt(app.User.gratii) + (bet) );
					window.app.User.changeGratii( parseInt(newGratii) );

					switch(betType){
						case"placeBet":
							document.getElementById('gameplay-iframe').contentWindow.finishDeal();
						break;
						case"split":
							document.getElementById('gameplay-iframe').contentWindow.finishSplit();
						break;
						case"doubleDown":
							document.getElementById('gameplay-iframe').contentWindow.finishDoubleDown();
						break;
					}
				});

				request.fail(function(response, textStatus, jqXHR){
					console.log( 'ERROR submitting Bid in balck jack' );
					console.log( response );

					var errorMsg = response.responseJSON.msg;
					var proError = errorMsg.indexOf("PRO##");

					if ( proError >= 0 ) {

						errorMsg = errorMsg.substring(5);

						console.log( 'This is a PRO error' );

						app.Animation.showMessagePanel("generic", errorMsg);

						return;
					}


					alert(response.responseJSON.msg);
					arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
					// wipe everything
					localStorage.clear();
				});

			},

			/*doubleDown: function(){
				console.log( 'Bet recieved from BlackJack. ' + bet );
			},*/

			submitWinLose: function(amount, winnerState, gameState, finalHand){

				var resultEvent = "win";

				if (amount === 0) {
					resultEvent = "lose";
				}
				if (winnerState === "tie") {
					resultEvent = "push";
				}
				if (winnerState === "playerblackjack") {
					resultEvent = "blackjack";
				}

				var newGratii = Math.floor(parseInt(app.User.gratii) + (amount) );
				window.app.User.changeGratii( parseInt(newGratii) );

				// Add Event to Queue
				var winLoseEvent = {
					'gameToken': arcade.blackjack.gameToken,
					'eventName': resultEvent,
					'score': amount
				};

				arcade.eventStorage.storeArcadeEvent(winLoseEvent, 'ArcadeEvents');

				if (finalHand) {
					// Send all Events to API
					var request = $.ajax({
						type: "POST",
						url: window.app.Settings.apiBaseURL + "user/game/event",
						dataType: 'json',
						contentType: 'application/json',
						data: arcade.eventStorage.getAllArcadeEvents('ArcadeEvents')
					});

					request.done(arcade.requests.requestDone);
					request.fail(arcade.requests.requestFail);
				}

			}
		},

		slots:{

			gameToken: "X0X0X0X",
			lastSpinGratiiResult: 0,

			init: function(){

				var request = $.ajax({
					type: "GET",
					url: window.app.Settings.apiBaseURL + "game/slots/start",
					dataType: 'json',
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'Started Slots Game' );
					console.log( response );

					document.getElementById('gameplay-iframe').contentWindow.ig.game.gratiiStart(response);

				});

				request.fail(function(response, textStatus, jqXHR){
					console.log( 'Failed to Load Slots Game' );
					console.log( response );
				});

			},
			spin: function(wager){

				//alert('spinning with ' + wager);



				//make bet call
				var placeBetEvent = {
					'gameToken': arcade.slots.gameToken,
					'eventName': 'placeBet',
					'score': "-"+wager,
				};

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: "["+JSON.stringify(placeBetEvent)+"]"
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'placed bet successfully' );
					//TODO add more validation of success

					arcade.slots.spinPhaseTwo(wager);
				});
				request.fail(function(response, textStatus, jqXHR){

					var errorMsg = response.responseJSON.msg;
					var proError = errorMsg.indexOf("PRO##");

					if ( proError >= 0 ) {

						errorMsg = errorMsg.substring(5);

						console.log( 'This is a PRO error' );

						app.Animation.showMessagePanel("generic", errorMsg);

						return;
					}


					alert(response.responseJSON.msg);
					arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
					// wipe everything
					localStorage.clear();

				});

				//return results

			},
			spinPhaseTwo: function(wager){

				var newGratii = ( parseInt(app.User.gratii) - parseInt(wager) );
				window.app.User.changeGratii( parseInt(newGratii) );

				var spinEvent = {
					'gratiiBet': wager
				};

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "game/slots/spin",
					dataType: 'json',
					contentType: 'application/json',
					data: JSON.stringify(spinEvent)
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'spun successfully' );

					arcade.slots.lastSpinGratiiResult = response.results.gratiiResult;

					//UPDATE jackpot and previous jackpot
					document.getElementById('gameplay-iframe').contentWindow.ig.game.gratiiStart(response);

					document.getElementById('gameplay-iframe').contentWindow.ig.game.start(response.results);

					arcade.slots.spinPhaseThree(response.results.gratiiResult, response.results.outcomeName);

				});

				request.fail(function(response, textStatus, jqXHR){
					console.log( 'failed to spin.' );
					//TODO handle error
				});

			},

			spinPhaseThree: function(gratiiResult, outcomeName){

				//make bet call
				var resultEvent = {
					'gameToken': arcade.slots.gameToken,
					'eventName': outcomeName,
					'score': gratiiResult,
				};

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "user/game/event",
					dataType: 'json',
					contentType: 'application/json',
					data: "["+JSON.stringify(resultEvent)+"]"
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'placed result event successfully' );
				});
				request.fail(function(response, textStatus, jqXHR){
					//TODO handle erros
					console.log( 'failed to place result event.' );
				});

			},

			win: function(){
				if (arcade.slots.lastSpinGratiiResult > 0) {
					var newGratii = ( parseInt(app.User.gratii) + parseInt(arcade.slots.lastSpinGratiiResult) );
					window.app.User.changeGratii( parseInt(newGratii) );
				}
			},

			getJackPot: function(){

			}
		},
		challenges:{
			/*
			clearChallenge: function(){
				app.UIState.challengeInProgress = false;
			},

			clearChallengeResponse: function(){
				app.UIState.challengeResponseInProgress = false;
				localStorage.removeItem('challengeResponseInProgress');
			},
			*/
			issue: function(finalScore){

				// var challengeID = app.User.challenge.challengeID;

				var request = $.ajax({
					type: "POST",
					url: window.app.Settings.apiBaseURL + "challenge/issue",
					dataType: 'json',
					//contentType: 'application/json',
					data: {score: finalScore, challengeID: app.User.challenge.challengeID}
				});

				request.done(function(response, textStatus, jqXHR){
					console.log( 'Challnge Complete. Final Score Issued.' );
					arcade.util.gameOver(); // must be called before challenge flag is reste
					app.UIState.challengeInProgress = false;
				});
				//TODO handle fail
				request.fail(arcade.requests.requestFail);

			},
			respond: function(finalScore){

				var challengeID = localStorage.getItem('challengeResponseInProgress');

				if (challengeID === "" || challengeID === null) {
					console.log('error getting challenge ID');
				}
				else{

					var request = $.ajax({
						type: "POST",
						url: window.app.Settings.apiBaseURL + "challenge/complete",
						dataType: 'json',
						//contentType: 'application/json',
						data: {'score': finalScore, 'challengeID': challengeID}
					});

					request.done(function(response, textStatus, jqXHR){
						console.log( 'Challnge Response Complete. Final Score Issued.' );
						arcade.util.gameOver(); // must be called before challenge flag is reste
						app.UIState.challengeResponseInProgress = false;
						localStorage.removeItem('challengeResponseInProgress');

					});
					request.fail(arcade.requests.requestFail);
				}

			},


			forfeitChallenge: function(){
				//arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
				app.UIState.challengeInProgress = false;
			},

			forfeitChallengeResponse: function(){

				var challengeID = localStorage.getItem('challengeResponseInProgress');

				if (challengeID === "" || challengeID === null) {
					console.log('error getting challenge ID on forfeit');
				}
				else{
					var request = $.ajax({
						type: "POST",
						url: window.app.Settings.apiBaseURL + "challenge/complete",
						dataType: 'json',
						//contentType: 'application/json',
						data: {'score': 'forfeit', 'challengeID': challengeID}
					});

					request.done(function(response, textStatus, jqXHR){
						console.log( 'Forfeit Challenge Response' );
						app.UIState.challengeResponseInProgress = false;
						localStorage.removeItem('challengeResponseInProgress');
					});
					request.fail(arcade.requests.requestFail);
				}



			}
		},
		eventStorage:{
			storeArcadeEvent: function(event, key){

				// console.log( 'storing arcade event ' );
				// console.log( event );
				// console.log( key );

				var currentArcadeEvents;

				// Get current events (if any)
				if (localStorage.getItem(key)) {
					currentArcadeEvents = JSON.parse( localStorage.getItem(key) );
				}
				else{
					currentArcadeEvents = [];
				}

				// append event
				currentArcadeEvents.push(event);

				// store event(s)
				localStorage.setItem(key, JSON.stringify(currentArcadeEvents) );

			},
			getAllArcadeEvents: function(key){

				var allArcadeEvents;

				// Get current events (if any)
				if (localStorage.getItem(key)) {
					allArcadeEvents = localStorage.getItem(key);
				}
				else{
					allArcadeEvents = "";
				}

				return allArcadeEvents;
			},
			clearAllArcadeEvents: function(key){
				localStorage.removeItem(key);
			},
			submitAndClearAll: function(key){

				// check if we have events in storage
				var currentArcadeEvents = null;

				if (localStorage.getItem(key)) {
					currentArcadeEvents = JSON.parse( localStorage.getItem(key) );
				}

				// if we do submit to the appropriate gamevent api endpoint based on game ID
				if(currentArcadeEvents){

					console.log( 'There are events in the Q' );
					//console.log( currentArcadeEvents[0].gameID );

					//var currentGameID = currentArcadeEvents[0].gameID;

					//TODO Verify all events are of the sme game type. SHould not happen. Might be worth validating.

					// Send all Events to API
					var request = $.ajax({
						type: "POST",
						url: window.app.Settings.apiBaseURL + "user/game/event",
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify(currentArcadeEvents)
					});

					request.done(arcade.requests.requestDone);
					request.fail(arcade.requests.requestFail);

					// Note that events will be cleared when the ajax call is successful.
					// arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
				}
			}
		},
		requests: {
			requestDone: function(response, textStatus, jqXHR){

				console.log( 'Arcade Request Successfull' );
				console.log( 'Clearing Arcade Events' );

				arcade.settings.apiRetry = 0;
				arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
				// wipe everything
				localStorage.clear();
				//console.log( 'response: ' + response.results );
				//window.app.User.changeGratii( parseInt(response.results) );

			},
			requestFail: function(response, textStatus, jqXHR){

				console.log( 'Arcade Request Failed' );

				//alert('Arcade Request Failed. Attempting Again.');

				if(arcade.settings.apiRetry < arcade.settings.apiMaxRetry){
					arcade.settings.apiRetry++;
					var that = this;
					window.setTimeout(function(){
						var request = $.ajax(that);
						request.done(arcade.requests.requestDone);
						request.fail(arcade.requests.requestFail);
					}, arcade.settings.apiTimeout);
				}else{
					//alert('Arcade Request Failed. Giving Up.');
					arcade.settings.apiRetry = 0;
				}

				//TODO retry - put up notification - do not allow game play
			}
		},
		util:{
			gameHasLoaded: function(){

				window.setTimeout(function(){
					$('#gameplay #gameplay-loading').css('display','none');
				}, 900);

				//parent.arcade.util.gameHasLoaded();
			},

			leaveGame: function(){
				window.app.Animation.closeCurrentGame();
			},
			getUserGratii: function(){
				return parseInt(window.app.User.gratii);
			},
			gameOver: function(){

				if (app.UIState.challengeInProgress || app.UIState.challengeResponseInProgress){
					/*alert('challenge complete');
					app.Animation.closeCurrentGame();
					return;*/

					window.app.UI.showAppOverlay('Challenge Complete!','','ok',
					function(e){
						e.preventDefault();
						e.stopPropagation();
						window.app.UI.hideAppOverlay();
						window.app.Animation.closeCurrentGame();
					},
					function(e){
						e.preventDefault();
						e.stopPropagation();
						window.app.UI.hideAppOverlay();
						window.app.Animation.closeCurrentGame();
					});
					return;
				}

				/*
				if (window.confirm("Want to play again?")) {
					document.getElementById('gameplay-iframe').contentWindow.location.reload();
				}
				else{
					app.Animation.closeCurrentGame();
				}
				*/

				window.app.UI.showAppOverlay('Want to play again?','No','Yes',
				function(e){
					e.preventDefault();
					e.stopPropagation();
					window.app.UI.hideAppOverlay();
					window.app.Animation.closeCurrentGame();
				},
				function(e){
					e.preventDefault();
					e.stopPropagation();
					window.app.UI.hideAppOverlay();
					document.getElementById('gameplay-iframe').contentWindow.location.reload();
				});
			}
		},
		init: function(){
			console.log( 'Init Arcade API' );
			//check if a challenge response was interrupted and if so forfeit it.
			var challengeID = localStorage.getItem('challengeResponseInProgress');
			if (challengeID !== "" && challengeID != null) {
				// console.log( challengeID );
				// alert("challnge response in progress - cacncelling");
				arcade.challenges.forfeitChallengeResponse();
			}

			// Check the Qeue for any unsaved events and submit them.
			arcade.eventStorage.submitAndClearAll('ArcadeEvents');
		}

	};

});