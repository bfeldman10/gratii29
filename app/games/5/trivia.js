$(function(){

	window.trivia = {

		$lastSelect:null,
		loadingQuestion:false,
		score:0,
		gameToken: "X5X5X5X",
		triviaID: null,
		score:0,

		loadQuestion: function(data){

			window.trivia.loadingQuestion = false;

			console.log( 'Recieved Question' );
			console.log( data );

			$('.answer').css('backgroundColor','#eee');

			$('.question p').text(data.question);

			$('.answer-a p').text(data.option1);
			$('.answer-b p').text(data.option2);
			$('.answer-c p').text(data.option3);

		},

		showResponse: function(data){

			if (data.result === "wrong") {

				window.trivia.score = 0;

				$lastSelect.css('backgroundColor','red');

				if ($('.answer-a p').text() === data.correctAnswer) {
					$('.answer-a').css('backgroundColor','green');
				}
				if ($('.answer-b p').text() === data.correctAnswer) {
					$('.answer-b').css('backgroundColor','green');
				}
				if ($('.answer-c p').text() === data.correctAnswer) {
					$('.answer-c').css('backgroundColor','green');
				}

			}else{
				window.trivia.score++;
				$lastSelect.css('backgroundColor','green');
			}

			$('.score p span').text(window.trivia.score);

			window.setTimeout(function(){
				window.trivia.loadingQuestion = true;
				loadQuestion();
			}, 400);


		},

		init: function(){
			$('.answer').bind('click',function(e){
				if (window.trivia.loadingQuestion) return;
				$lastSelect = $(this);
				answerQuestion($(this).find('p').text());
			});
		}

	};

	window.trivia.init();
	window.trivia.loadingQuestion = true;
	loadQuestion();

	function loadQuestion(){
		$.ajax({
	        url: "../../"+parent.apiRoot+'game/trivia/random',
	        type: 'GET',
	        dataType: 'json',
	        async: false,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log( 'Failed Getting Question' );
	        	parent.triggerErrorMessage("default");
	            return true;
	        },
	        success: function(data){ 
	        	console.log(data.results.id);
	        	window.trivia.triviaID = data.results.id;
	        	window.trivia.loadQuestion(data.results);
	        }
	    });
	}

	function answerQuestion(answer){
		console.log("YOUR ANSWER IS: ");
		console.log(answer);
		$.ajax({
	        url: "../../"+parent.apiRoot+'game/trivia/response',
	        type: 'POST',
	        dataType: 'json',
	        data: { triviaID : window.trivia.triviaID, 
	        		response : answer },
	        async: true,
	        cache: false,
	        timeout: 30000,
	        error: function(data){
	        	console.log( 'Failed Answering Question' );
	        	console.log( data.responseText );
	        	console.log( data );
	        	parent.triggerErrorMessage("default", data.response['msg']);
	            return true;
	        },
	        success: function(data){ 
	        	if (data.results.result === "wrong") {
					console.log('WRONG!!!');
					var thisGameID = parent.user.gameInProgress['gameID'];
					var thisGameEvent = "gameOver";
					var finalScore = window.trivia.score;
					console.log(finalScore);
					parent.user.arcadeEvents.push({"gameToken":window.trivia.gameToken, "finalScore":finalScore, "eventName":thisGameEvent, "gameID":thisGameID});
					parent.user.postGameEvents();
					
				}else{
					console.log("RIGHT!!!");

					var thisGameID = parent.user.gameInProgress['gameID'];
					var equations = parent.user.gameInProgress['equations'];
					var thisGameEvent = "correctAnswer";
					var equationForThisEvent = equations[thisGameEvent];
					var scoreForThisEvent = 1;
					var gratiiEarned = Math.floor(scoreForThisEvent*equationForThisEvent);
					console.log(gratiiEarned);
					parent.user.changeGratii(gratiiEarned);
					parent.user.arcadeEvents.push({"gameToken":window.trivia.gameToken, "score":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
				}

				window.trivia.showResponse(data.results);
	        }
	    });
	}

});