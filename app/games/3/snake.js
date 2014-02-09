(function(){

    var canvas = document.getElementById('snakeCanvas'),
        ctx = canvas.getContext('2d'),
        score = 0,
		gratii = 0,
        hiScore = 0,
		controlPadHeight = 200,
        input = { left: false, right: false, up: false, down: false },
		splashScreen = true,
		difficultyLevel = 1,
		touchDevice = false,
		topUIHeight = 35,
		gameToken = "X3X3X3X";

    canvas.width = 320;
    canvas.height = 430; //was 350

    // check for keypress and set input properties
    window.addEventListener('keyup', function(e) {
       switch (e.keyCode) {
            case 37: input.right = true; break;
            case 39: input.left = true; break;
			case 38: input.up = true; break;
			case 40: input.down = true; break;
       }
    }, false);

	function checkButtonRectCollision(clickX, clickY, x1, y1, width, height) {
	//x1, y1, height, width
	//draw.rect(firstBetButtonX, canvas.height-82, 25, 30, 'red'); //1
	var y2 = y1 + height;
	var x2 = x1 + width;
		if (clickX > x1 && clickX < x2 && clickY > y1 && clickY < y2) {
		return true;
		} else { return false; }
	}
    // a collection of methods for making our mark on the canvas
	//using literal object notation, we can easily create instances of an object

    var draw = {
        clear: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
		line: function (x1, y1, x2, y2, linewidth, col) {
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);
			ctx.closePath();
			ctx.lineWidth = linewidth;
			ctx.strokeStyle = col;
			ctx.stroke();
		},

        rect: function (x, y, w, h, col) {
            ctx.fillStyle = col;
            ctx.fillRect(x, y, w, h);
        },

      circle: function (x, y, radius, col) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI*2, true);
          ctx.closePath();
          ctx.fill();
      },
      circleoutline: function (x, y, radius, col, linewidth) {
          //ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI*2, true);
          ctx.closePath();
          //ctx.fill();
		  ctx.lineWidth = linewidth;
		  ctx.strokeStyle = col;
		  ctx.stroke();
      },

        text: function (str, x, y, size, col) {
            ctx.font = 'bold ' + size + 'px verdana';
            ctx.fillStyle = col;
            ctx.fillText(str, x, y);
        }
    };

	//main snake class
	var Snake = function() {
		//init: sets all PROPERTIES for the snake
		this.init = function() {


			this.dead = false;
			this.len = 0; // length of the snake (number of segments)
			//this.speed = 2; // amount of pixels moved per frame
			//determine speed of snake:
			if (difficultyLevel == 1)
				this.speed = 2;
			if (difficultyLevel == 2)
				this.speed = 4;
			if (difficultyLevel == 3)
				this.speed = 6;

			this.history = []; // we'll need to keep track of where we've been
			//this.dir: an array which contains four arrays, corresponding to up, left, right, down. this.currentDir points to an entry in this.dir.
			this.dir = [ //the four directions that the snake moves
				[0, -1], //up
				[1, 0], //right
				[0, 1], //down
				[-1, 0] //left
			];

			this.x = canvas.width/2;
			this.y = canvas.height*.9-controlPadHeight;
			this.w = this.h = 16;
			this.currentDir = 0; // direction number, for example: this.dir[2] = down
			this.col = 'darkgreen';
		};

		this.move = function() {

			//exit function if snake is dead
			if(this.dead) {
				return;
			}

			//check if a KEYBOARD button has been pressed

			//4 arrows turning start
			if (input.left) {
				if (this.currentDir != 3)
					this.currentDir = 1;
			} else if (input.right) {
				if (this.currentDir != 1)
					this.currentDir = 3;
			} else if (input.up) {
				if (this.currentDir != 2)
					this.currentDir = 0;
			} else if (input.down) {
				if (this.currentDir != 0)
					this.currentDir = 2;
			}
			//4 arrows turning end
			//END KEYBOARD CONTROLS

			//check if out of bounds
			if (this.x < 0 || this.x > (canvas.width - this.w) || this.y < topui.height || this.y > (canvas.height -  controlPadHeight - this.h)) {
				this.dead = true;
			}

			//update position:
			//1. add our first coordinate in this.dir to the x value [0]
			//2. add our second coordinate in this.dir to the y value [1]
			//3. then multiply coordinates times speed to move the snake

			//this.x += (this.dir[this.currentDir][0] * this.speed);
			//this.y += (this.dir[this.currentDir][1] * this.speed);
			this.x += (this.dir[this.currentDir][0] * this.speed);
			this.y += (this.dir[this.currentDir][1] * this.speed);

			//store this position in the history array
			this.history.push({x: this.x, y: this.y, dir: this.currentDir});

		};

		this.draw = function() {

			var i, offset, segPos, col;

			//loop through each segment of the snake,
			//drawing & checking for collisions

			for(i = 1; i <= this.len; i += 1){

				//offset calculates the location in the history array

				offset = i * Math.floor(this.w / this.speed);
				offset = this.history.length - offset;
				segPos = this.history[offset];

				col = this.col;

				//reduce the area we check for collision, to be a bit
				// more forgiving with small overlaps
				segPos.w = segPos.h = (this.w - this.speed);

				if (i > 2 && i !== this.len && this.collides(segPos)) {
					this.dead = true;
					col = 'darkred'; // highlight hit segments
				}

				draw.rect(segPos.x, segPos.y, this.w, this.h, col);
			}

			draw.rect(this.x, this.y, this.w, this.h, this.col); //draw head
			draw.rect(this.x + 4, this.y + 1, 3, 3, 'white'); //draw eye 1
			draw.rect(this.x + 12, this.y + 1, 3, 3, 'white'); //draw eye 2
		};
		this.collides = function(obj) {
				//the sprite's rectangle
				this.left = this.x;
				this.right = this.x + this.w;
				this.top = this.y;
				this.bottom = this.y + this.h;

				//other object's rectangle
				//note: we assume that obj has w, h, w & y properties
				obj.left = obj.x;
				obj.right = obj.x + obj.w;
				obj.top = obj.y;
				obj.bottom = obj.y + obj.h;

				//determine if not intersecting
				if (this.bottom < obj.top) { return false; }
				if (this.top > obj.bottom) { return false; }

				if (this.right < obj.left) { return false; }
				if (this.left > obj.right) { return false; }

				//otherwise, it's a hit
				return true;
		};

	};
	var Apple = function() {
		this.x = 0;
		this.y = 0;
		this.w = 25;
		this.h = 25;
		//this.col = 'red';
		this.replace = 0; //game turns until we move the apple elsewhere
		appleImage = new Image();
		//appleImage.src = "snake-images/apple.png";
		appleImage.src = "snake-images/apple.png";

		this.draw = function(){

			if (this.replace === 0) { //time to move the apple elsewhere
				this.relocate();
			}
			canvas.getContext("2d").drawImage(appleImage, this.x, this.y);
			//draw.rect(this.x, this.y, this.w, this.h, this.col);
			this.replace -= 1;
		};

		this.relocate = function() {
			//alert("apple relocate");
			if(score!=0 && score%2!=0){
				this.x = -50;
				this.y = -50;
			}else{

				this.x = Math.floor(Math.random() * (canvas.width - this.w));
				this.y = Math.floor(Math.random() * (canvas.height - controlPadHeight - this.h - topui.height) + topui.height);

				this.replace = Math.floor(Math.random() * 200) + 200;
			}
		};

	};
	var topUI = function() {
		this.init = function() {
			this.x = 0;
			this.y = 0;
			this.height = 36;
			this.topUIimage = new Image();
			this.topUIimage.src = 'snake-images/top-ui.png?c=3';
		}
		this.draw = function() {
			ctx.drawImage(this.topUIimage, this.x, this.y); //top UI image

			//draw.text('Score: ' + score, 20, 20, 12, 'black');
			//draw.text('Gratii: ' + gratii, 20, 40, 12, 'black');
			//draw.text('Hi: ' + hiScore, 260, 20, 12, 'black');

			//draw.text(hiScore, 50, 15, 12, '#ffba00'); //Draw High Score
			//draw.text(score, 50, 30, 12, '#84e802'); //Draw My Score
			//draw.text(score, 60, 24, 18, '#FEFEFE'); //Draw My Score

			this.gratiiDistance = 230;
			this.fontSize = 18;

			//Draw My Gratii
			if (score < 10) {
				draw.text("score: "+score, this.gratiiDistance, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			} else if (score >= 10 && gratii < 100) {
				draw.text("score: "+score, this.gratiiDistance-10, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			}  else if (score >= 100 && gratii < 1000) {
				draw.text("score: "+score, this.gratiiDistance-20, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			} else if (score >= 1000 && gratii < 10000) {
				draw.text("score: "+score, this.gratiiDistance-30, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			} else if (score >= 10000) {
				draw.text("score: "+score, this.gratiiDistance-40, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			}
		};
	};
	//Initialize Game Objects
	var topui = new topUI();
	topui.init();

	var GratiiCoin = function() {
		this.x = 0;
		this.y = 0;
		this.w = 25;
		this.h = 25;
		//this.col = 'red';
		this.replace = 0; //game turns until we move the apple elsewhere
		gratiiImage = new Image();
		//appleImage.src = "snake-images/apple.png";
		gratiiImage.src = "snake-images/gratiicoin25b.png";

		this.draw = function(){

			if (this.replace === 0) { //time to move the apple elsewhere
				this.relocate();
			}
			canvas.getContext("2d").drawImage(gratiiImage, this.x, this.y);
			//draw.rect(this.x, this.y, this.w, this.h, this.col);
			this.replace -= 1;
		};

		this.relocate = function() {
			//alert("coin relocate");
			this.relocate = function() {
			//alert("apple relocate");
			if(score!=0 && score%2==0){
				this.x = -50;
				this.y = -50;
			}else{

				this.x = Math.floor(Math.random() * (canvas.width - this.w));
				this.y = Math.floor(Math.random() * (canvas.height - controlPadHeight - this.h - topui.height) + topui.height);

				this.replace = Math.floor(Math.random() * 200) + 200;
			}
		};

		};

	};
	/*var GratiiCoin = function() {
		this.x = 0;
		this.y = 0;
		this.w = 25;
		this.h = 25;
		//this.col = '#00FFFF';
		this.replace = 0; //game turns until we move the apple elsewhere

		coinImage = new Image();
		coinImage.src = "snake-images/gratiicoin25b.png";



		this.draw = function(){

			if (this.replace === 0) { //time to move the apple elsewhere
				this.relocate();
			}

			//draw.rect(this.x, this.y, this.w, this.h, this.col);
			canvas.getContext("2d").drawImage(coinImage, this.x, this.y);
			this.replace -= 1;
		};

		this.relocate = function() {
			this.x = Math.floor(Math.random() * (canvas.width - this.w));
			this.y = Math.floor(Math.random() * (canvas.height - controlPadHeight - this.h));
			this.replace = Math.floor(Math.random() * 200) + 200;
		};

	};*/

	function loseGame() {

		console.log( 'Space is calling game over with token: ' + gameToken );
		//parent.arcade.spaceCrabs.gameOver(gameToken, score);

		var scoreForThisEvent = score;

		if(parent.user.challengeIssueInProgress===true){
			// Deliver challenge issue, return var to false
			parent.user.deliverChallenge(scoreForThisEvent);
		}else if(parent.user.challengeResponseInProgress===true){
			// Deliver challenge response, return var to false
			parent.user.deliverChallengeResponse(scoreForThisEvent);
		}else{
			//Offer Play Again option
			var thisGameID = parent.user.gameInProgress['gameID'];
			var thisGameEvent = "gameOver";
			var scoreForThisEvent = scoreForThisEvent;

			parent.user.arcadeEvents.push({"gameToken":gameToken, "finalScore":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
			parent.user.postGameEvents();

			window.setTimeout(function(){
				var playAgainAlert = confirm("Game over :(\nPlay again?"); 
				if (playAgainAlert==true){
			 		location.reload();
				}else{
			  		parent.closeGameiFrame();
				}
			}, 1500);
		}
	}


	function gameOverScreen() {
		draw.rect(0,0,canvas.width,canvas.height,"#000000");
		topui.draw();
	}
	function gameStartScreen() {
			//draw.rect(0,0,canvas.width,canvas.height,"#eee8aa");
			canvas.getContext("2d").drawImage(backgroundImage, 0, 0);

			//DIFFICULTY LEVEL TOUCH RECTANGLES
			//draw.rect(30,200,80,60,"#000000"); //1
			//draw.rect(120,200,80,60,"#000000"); //2
			//draw.rect(210,200,80,60,"#000000"); //3

			//draw.text('Select a Difficulty Level to Play', 24, 195, 16, '#444444');
			//draw.text('easy', 50, 240, 14, '#FFFFFF');
			//draw.text('medium', 130, 240, 14, '#FFFFFF');
			//draw.text('turbo', 230, 240, 14, '#FFFFFF');

			//var htpStart = 360;
			//draw.text('How to Play:', 18, htpStart, 16, '#444444');
			//draw.text('Use the control pad at the bottom of', 18, htpStart+15, 14, '#444444');
			//draw.text('the screen to control the snake.', 18, htpStart+30, 14, '#444444');

			//draw.text('Collect Gratii, and try not to', 18, htpStart+45, 14, '#444444');
			//draw.text('bump into anything!', 18, htpStart+60, 14, '#444444');


			//draw.text('Welcome to Snake!', 50, 100, 24, 'black');
			//draw.text('Touch the screen to begin', 50, 150, 16, 'black');
			//START GAME function
				//snakeSplashsmall.png
			//register touch events to start the game

	}
	var startTheGame = function (e) {
		//to do: re-implement touch

		//START NEW SNAKE TOUCH COUNTROLS

		//touch controls for start screen:
		if (touchDevice == true) {
			var click = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				};
		}

		//click controls for start screen:
		if (touchDevice == false) {
			var offsets = canvas.getBoundingClientRect();
			var click = {
				x: e.clientX - offsets.left,
				y: e.clientY - offsets.top
			};
		}
		//alert(click.x + " " + click.y);
		//draw.rect(30,200,80,60,"#000000"); //EASY
		if (click.x <= 115) {
			difficultyLevel = 1;
		} else if (click.x >= 116 && click.x <= 215) {
			difficultyLevel = 2;
		} else if (click.x >= 216) {
			difficultyLevel = 3;
		}
		//alert(difficultyLevel);
		//draw.rect(120,200,80,60,"#000000"); //MEDIUM

		//draw.rect(210,200,80,60,"#000000"); //HARD



	 document.removeEventListener(startEvent, startTheGame, true);
	 clearInterval(gameStartInterval);
	 //alert(gameStartInterval);
	 splashScreen = false;
	loopInterval = setInterval(loop, 30);


		p1.init();
		score = 0;
		return;
	};

	function controlPad() {
	if (p1.currentDir == 0){

		canvas.getContext("2d").drawImage(controllerUpImage, 0, 230, 320, canvas.height-230);
		//draw.rect(133, canvas.height-controlPadHeight, 55, 90, 'red');
	}
	if (p1.currentDir == 1){

		canvas.getContext("2d").drawImage(controllerRightImage, 0, 230, 320, canvas.height-230);
		//draw.rect(190, canvas.height-(controlPadHeight/2)-50, 70, 100, 'red');
	}
	if (p1.currentDir == 2){

		canvas.getContext("2d").drawImage(controllerDownImage, 0, 230, 320, canvas.height-230);
		//draw.rect(133, canvas.height-(controlPadHeight/2)+10, 55, 90, 'red');
	}
	if (p1.currentDir == 3){

		canvas.getContext("2d").drawImage(controllerLeftImage, 0, 230, 320, canvas.height-230);
		//draw.rect(60, canvas.height-(controlPadHeight/2)-50, 70, 100, 'red');
	}
	//TOUCH RECTANGLES
	//top
	//draw.rect(135, canvas.height-controlPadHeight, 55, 55, 'red');
	//bottom
	//draw.rect(135, canvas.height-controlPadHeight+100, 55, 55, 'red');
	//draw.rect(140, canvas.height-controlPadHeight, 50, 50, 'red');
	//left
	//draw.rect(80, canvas.height-controlPadHeight+50, 55, 55, 'green');
	//right
	//draw.rect(190, canvas.height-controlPadHeight+50, 55, 55, 'green');

	}

	var p1 = new Snake();
	p1.init();
	var apple = new Apple();
	var coin = new GratiiCoin();
	//coin.x = 500;
	//coin.y = 500;
	function quitGame() {
		//alert("Peace!");
		exitGame();
	}


	function loop() {

		draw.clear(); //clear the canvas every time this loops
		p1.move();
		p1.draw();
		topui.draw();
		//bug test to see what the direction is:
		//draw.text('Dir: ' + score, 20, 50, 12, 'red');
		//if (score==0){
		//	apple.draw();
		//}


		if (score==0 || score%2==0){
			apple.draw();
		}

		if (score%2!=0 && score!=0){
			coin.draw();
		}



		if (p1.collides(apple)) {
			score += 1;
			p1.len += 1;
			//gratii += 1;

		//	coin.draw();
			apple.relocate();
			coin.relocate();
		}

		if (p1.collides(coin)) {
			score += 1;
			p1.len += 1;
			gratii += 1;

			if(parent.user.challengeIssueInProgress===false && parent.user.challengeResponseInProgress===false){
				
				var thisGameID = parent.user.gameInProgress['gameID'];
				var thisGameEvent = "coinGrab";
				var scoreForThisEvent = 1;
				var gratiiEarnedInThisEvent = Math.floor(scoreForThisEvent*parent.user.gameInProgress['equations'].coinGrab);

				parent.user.arcadeEvents.push({"gameToken":gameToken, "score":scoreForThisEvent, "eventName":"coinGrab", "gameID":thisGameID});
			
				parent.user.changeGratii(gratiiEarnedInThisEvent);
			}

		//	apple.draw();
			coin.relocate();
			apple.relocate();
		}

		if (score > hiScore) {
			hiScore = score;
		}

		//coin.draw();
		/*
		draw.text('Score: ' + score, 20, 20, 12, 'black');
		draw.text('Gratii: ' + gratii, 20, 40, 12, 'black');
		draw.text('Hi: ' + hiScore, 260, 20, 12, 'black');
		*/
		controlPad();

		//draw.text(p1.currentDir, 50, 150, 36, '#FFFFFF');
		//draw.text('Dir: ' + p1.currentDir, 260, 40, 12, 'black');

		//end game if snake is dead.
		if(p1.dead === true) {
			//draw.text('Game Over', 100, 100, 12, 'black');
			setInterval(gameOverScreen, 30);
			clearInterval(loopInterval);
			loseGame();
			//START GAME?

			return;
			//if user presses right or left again, restart game.
			/*
			if (input.right || input.left) {
				p1.init();
				score = 0;
			}
			*/
		}

		//we need to reset right and left or else the snake keeps turning
		input.right = input.left = input.up = input.down = false;

	};



	// ** START NEW SNAKE INPUT CONTROLS **

		//START NEW SNAKE TOUCH COUNTROLS

		var startEvent = 'click';
		try {
			document.createEvent('TouchEvent');
			startEvent = 'touchstart';
			touchDevice = true;
		} catch(e) {}
		if (touchDevice == true) {
			canvas.addEventListener(startEvent, touchHandler, true);
			function touchHandler(e) {

			//alert("Touch @ X: " + e.changedTouches[0].clientX + " Y: " + e.changedTouches[0].clientY);
				var touch = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				};
					moveTheSnake(touch.x, touch.y);
			}
		}

		//END NEW SNAKE TOUCH CONTROLS

		//START CLICK LISTENERS/CONTROLS
		if (touchDevice == false) {
			function clickHandler(e) {
			//alert("Click @ X: " + e.clientX + " Y: " + e.clientY);
			var offsets = canvas.getBoundingClientRect();
				var click = {
					x: e.clientX - offsets.left,
					y: e.clientY - offsets.top
				};
				moveTheSnake(click.x, click.y);
			}
			canvas.addEventListener('click', clickHandler, true);
		}
		//console.log(touchDevice);
	// ** END NEW SNAKE INPUT CONTROLS **


	function moveTheSnake(clickX, clickY) {


	//top
	//draw.rect(135, canvas.height-controlPadHeight, 55, 55, 'red');
	//bottom
	//draw.rect(135, canvas.height-controlPadHeight+100, 55, 55, 'red');
	//draw.rect(140, canvas.height-controlPadHeight, 50, 50, 'red');
	//left
	//draw.rect(80, canvas.height-controlPadHeight+50, 55, 55, 'green');
	//right
	//draw.rect(190, canvas.height-controlPadHeight+50, 55, 55, 'green');
		if (checkButtonRectCollision(clickX, clickY, 0, 0, 72, topUIHeight) == true) {
			//alert("Peace!");
			quitGame();
		}

	if (clickX > 60 && clickX < 130 && clickY > canvas.height-(controlPadHeight/2)-50 && clickY < canvas.height-(controlPadHeight/2)+50) { //left
				if (p1.currentDir != 1)
					p1.currentDir = 3;
					//alert("hey " + click.x + click.y);
			} else if (clickX > 190 && clickX < 260 && clickY > canvas.height-(controlPadHeight/2)-50 && clickY < canvas.height-(controlPadHeight/2)+50) { //right
				if (p1.currentDir != 3)
					p1.currentDir = 1;
					//alert("hey " + click.x + click.y);
			} else if (clickX > 133 && clickX < 188 && clickY > canvas.height-controlPadHeight && clickY < canvas.height-controlPadHeight + 90) { //up
				if (p1.currentDir != 2)
					p1.currentDir = 0;
					//alert("hey " + click.x + click.y);
			} else if (clickX > 133 && clickX < 188 && clickY > canvas.height-(controlPadHeight/2)+10 && clickY < canvas.height-(controlPadHeight/2)+100) { //down
				if (p1.currentDir != 0)
					p1.currentDir = 2;
					//alert("hey " + click.x + click.y);
			}
	}


	window.scrollTo(0,0);

	controllerImage = new Image();
	controllerImage.src = "snake-images/snakecontrol_up.jpg";

	controllerUpImage = new Image();
	controllerUpImage.src = "snake-images/snakecontrol_up.jpg";

	controllerDownImage = new Image();
	controllerDownImage.src = "snake-images/snakecontrol_down.jpg";

	controllerLeftImage = new Image();
	controllerLeftImage.src = "snake-images/snakecontrol_left.jpg";

	controllerRightImage = new Image();
	controllerRightImage.src = "snake-images/snakecontrol_right.jpg";

	backgroundImage = new Image();
	backgroundImage.src = "snake-images/snakeSplashsmall.jpg";

	document.addEventListener(startEvent, startTheGame, true);
	var gameStartInterval = setInterval(gameStartScreen, 30);

	var loopInterval;



}());