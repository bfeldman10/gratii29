(function () {

    var canvas = document.getElementById('spaceCanvas'),
        ctx = canvas.getContext('2d'),
        score = 0,
        hiScore = 20,
		gratii = 0,
		health = 3,
		level = 1,
		rightKey = false,
		leftKey = false,
		upKey = false,
		downKey = false,
        input = { left: false, right: false },
		touchDevice = false,
		gameOver = false,
		splashScreen = true,
		instructionScreen = false,
		splashScreenNumber = 1,
		coinStartX = 50,
		coinStartY = 100,
		coinNewY = "",
		//allowRelocate = true;
		topUIHeight = 35,  //closebutton 72 pixels wide
		gameToken = "X2X2X3X";

    canvas.width = 320;
    canvas.height = 430;

	// START SHIP CONTROLS

	/* MOBILE INPUT */
	function checkButtonRectCollision(clickX, clickY, x1, y1, width, height) {
	//x1, y1, height, width
	//draw.rect(firstBetButtonX, canvas.height-82, 25, 30, 'red'); //1
	var y2 = y1 + height;
	var x2 = x1 + width;
		if (clickX > x1 && clickX < x2 && clickY > y1 && clickY < y2) {
		return true;
		} else { return false; }
	}
	function startMoving(clickX, clickY) {
		// if (checkButtonRectCollision(clickX, clickY, 0, 0, 72, topUIHeight) == true)
		// 			quitGame();
		if (checkButtonRectCollision(clickX, clickY, 0, topUIHeight, canvas.width/2-10, canvas.height) == true)
					leftTouch = true;
		if (checkButtonRectCollision(clickX, clickY, canvas.width/2+10, topUIHeight, canvas.width/2-10, canvas.height) == true)
					rightTouch = true;

	}
	// function quitGame() {
	// 	exitGame();
	// }
	function stopMoving(clickX, clickY) {
				leftTouch = false;
				rightTouch = false;
	}
	function startGame(clickX, clickY) {

		if (clickX == 9999 && clickY == 9999) {
			if (splashScreenNumber == 2) {
					instructionScreen = false;
					splashScreen = false;
					splashScreenNumber == 0;
			}
			if (splashScreenNumber == 1) {
					instructionScreen = true;
					splashScreenNumber++;
			}
		}

		if (clickX != 9999 && clickY != 9999) {
			if (instructionScreen == false) {
				if ((clickX >= canvas.width/2) && (clickY >= 370)) {
					instructionScreen = true;
					splashScreenNumber++;
				} else {
					instructionScreen = false;
					splashScreen = false;
					splashScreenNumber == 0;
				}
			} else if (instructionScreen == true) {
				instructionScreen = false;
				splashScreen = false;
				splashScreenNumber == 0;
			}
		}
		/*
		if (instructionScreen == true && splashScreen == true) {
			instructionScreen = false;
			splashScreen = false;
		}
		*/
	}
	//START TOUCH CONTROLS
	canvas.addEventListener('touchstart', startHandler, true);
	function startHandler(e) {
	touchDevice = true;
	//var offsets = canvas.getBoundingClientRect();
		var click = {
			x: e.changedTouches[0].clientX,
			y: e.changedTouches[0].clientY
		};
		if (splashScreen == true) {
			startGame(click.x, click.y);
		} else if (splashScreen == false) {
			startMoving(click.x, click.y);
		}

	}

	canvas.addEventListener('touchend', endHandler, true);
	function endHandler(e) {
		stopMoving();
	}

	//END TOUCH CONTROLS
	/* END MOBILE INPUT */


	document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

	function keyDown(e) {
	if (splashScreen == true) {

		//if (instructionScreen == true)
		//	startGame(99999, 99999);
		//if (instructionScreen == false)
			startGame(9999, 9999);
		} else if (splashScreen == false) {
			if (e.keyCode == 39) rightKey = true;
			else if (e.keyCode == 37) leftKey = true;
			else if (e.keyCode == 38) upKey = true;
		}

	}
	function keyUp(e) {
	//if (splashScreen == true) {
	//		startGame();
	//	} else if (splashScreen == false) {
			if (e.keyCode == 39) rightKey = false;
			else if (e.keyCode == 37) leftKey = false;
			else if (e.keyCode == 38) upKey = false;
	//	}
	}
	// END SHIP CONTROLS

    //START DRAWING FUNCTIONS
    var draw = {
        clear: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        text: function (str, x, y, size, col) {
            ctx.font = 'bold ' + size + 'px ' + 'verdana';
            ctx.fillStyle = col;
            ctx.fillText(str, x, y);
        }
    };
	//END DRAWING FUNCTIONS



	//main Ship class
	var Ship = function() {
		//init: sets all PROPERTIES
		this.init = function() {
			this.dead = false;
			this.speed = 5; // amount of pixels moved per frame
			this.history = []; // we'll need to keep track of where we've been

			//starting location and size
			this.x = (canvas.width/2)-8;
			this.y = canvas.height*.8;

			this.w = 60;
			this.h = 46;

			this.sprite = new Image();
			this.sprite.src = 'images-space/ship-large.png';

			this.hitSprite = new Image();
			this.hitSprite.src = 'images-space/ship-large-hit.png';


			this.srcX = 0;
			this.srcY = 0;

			this.isHit = false;
			this.hitFrameCount = 0;
		};

		this.move = function() {

			//update the sprite's rectangle
			this.left = this.x;
			this.right = this.x + this.w;
			this.top = this.y;
			this.bottom = this.y + this.h;

			//exit function if ship is dead
			if(this.dead) {
				return;
			}

			//check if a TOUCHSCREEN button has been pressed
			//assuming we're not using a touch capable device, it still works

			//KB CONTROLS NEW
			if (touchDevice == false) {
				if (rightKey) {
					this.x += this.speed; //move ship right
					this.srcX = 120; //move spritesheet to 83 pixel
					b1.bulletOffset += 4;
				} else if (leftKey) {
					this.x -= this.speed; //move ship left
					this.srcX = 0; //move spritesheet to 156 pixel
					b1.bulletOffset -= 4;
				}
				if (rightKey == false && leftKey == false) {
					this.srcX = 60;
				}
			}

			if (touchDevice == true) {
				//TOUCH CONTROLS NEW
				if (rightTouch == false && leftTouch == false) {
					this.srcX = 60;
				}
				if (leftTouch == true) {
					this.x -= this.speed; //move ship left
					this.srcX = 0; //move spritesheet to 156 pixel
					b1.bulletOffset -= 4;
				}
				if (rightTouch == true) {
					this.x += this.speed; //move ship right
					this.srcX = 120; //move spritesheet to 83 pixel
					b1.bulletOffset += 4;
				}


			}

			if (this.x < 0) {
					this.x = 0;
				} else if (this.x > (canvas.width - this.w)) {
					this.x = (canvas.width - this.w);
				}
		};

		this.draw = function() {
					if(this.dead) {
						return;
					}
			var i, offset, segPos, col;
			//draw new ship

			if (this.isHit == false) {
				ctx.drawImage(this.sprite,this.srcX,this.srcY,this.w,this.h,this.x,this.y,this.w,this.h);
			} else if (this.isHit == true) {
				ctx.drawImage(this.hitSprite,this.srcX,this.srcY,this.w,this.h,this.x,this.y,this.w,this.h);
				this.hitFrameCount += 1;
					if (this.hitFrameCount >= 6) {
						this.isHit = false;
						this.hitFrameCount = 0;
					}
			}
		};
		this.collides = function(obj) { //collision for GratiiCoin.
				this.Cbottom = this.bottom;
				this.Ctop = this.top;
				this.Cright = this.right + 10;
				this.Cleft = this.left - 10;
				//other object's rectangle
				//note: we assume that obj has w, h, w & y properties
				obj.left = obj.x;
				obj.right = obj.x + obj.w;
				obj.top = obj.y;
				obj.bottom = obj.y + obj.h;

				//determine if not intersecting
				if (this.Cbottom < obj.top) { return false; }
				if (this.Ctop > obj.bottom) { return false; }

				if (this.Cright < obj.left) { return false; }
				if (this.Cleft > obj.right) { return false; }

				//otherwise, it's a hit

				return true;
		};
		this.levelUp = function() {
			if (level == 1) {
					this.speed = 5;

				} else if (level == 2) {
					this.speed = 5.5;
				} else if (level == 3) {
					this.speed = 6;
				} else if (level == 4) {
					this.speed = 6.5;
				} else if (level >= 5) {
					this.speed = 7;
				}
		};
	}; //end of main Ship class


	var GratiiCoin = function() {
		this.x = coinStartX;
		this.y = coinStartY;
		this.x = 0;
		this.y = 0;
		this.w = 25;
		this.h = 26;
		this.replace = 0; //game turns until we move the coin elsewhere
		this.speed = 1.2;

		coinImage = new Image();
		//coinImage.src = "gratii_coin.png";
		coinImage.src = "images-space/gratiicoin25b.png";

		this.draw = function(){

			if (this.replace === 0) { //time to move the coin elsewhere
				this.relocate();
				//allowRelocate = true;
				//this.x = -10;
			}
			if (this.y > canvas.height) {
				this.relocate();
				//allowRelocate = true;
				//this.x = -10;
			}
			coinNewY = coinStartY;
			//this.x = coinStartX;
			//this.y = coinStartY;
			//coinNewY += this.speed;
			this.y += this.speed;
			//ctx.drawImage(coinImage, coinStartX, coinNewY);
			ctx.drawImage(coinImage, this.x, this.y);

			this.replace -= 1;
		};

		this.respawn = function() {

				this.x = coinStartX;
				//this.x = Math.floor(Math.random() * (canvas.width - this.w));

				//TO DO: should eventually change -400 to make more sense
				//this.y = coinNewY;
				//this.y = Math.floor(Math.random() * (-100 - this.h));
				this.y = coinStartY;

				this.replace = Math.floor(Math.random() * 200) + 1200;
				//allowRelocate = false;
				//return;
		};

		this.relocate = function() {

				this.x = -100;
				//this.x = Math.floor(Math.random() * (canvas.width - this.w));

				//TO DO: should eventually change -400 to make more sense
				//this.y = coinNewY;
				//this.y = Math.floor(Math.random() * (-100 - this.h));
				this.y = -100;

				this.replace = Math.floor(Math.random() * 200) + 1200;
				//allowRelocate = false;
				//return;
		};
		this.levelUp = function() {
			if (level == 1) {
				this.speed = 3.0;
			} else if (level == 2) {
				this.speed = 3.0;
			} else if (level == 3) {
				this.speed = 4.0;
			} else if (level == 4) {
				this.speed = 5.0;
			} else if (level >= 5) {
				this.speed = 6.0;
			}
		};
		//gratiicoins move down

	}; //end of Gratii Coin Class

	var ScrollingBackground = function() {
		this.w = 320;
		this.h = 860;
		this.x = 0;
		this.y = 0;
		this.speed = .6;

		this.init = function(){
			this.image = new Image();
			this.image.src = "images-space/scrolling-background.png";
		};
		this.draw = function() {
			if (this.y < 860) {
				this.y += this.speed;
				ctx.drawImage(this.image, this.x, this.y-860); //top image
				ctx.drawImage(this.image, this.x, this.y); //bottom image
			//} else if (this.y >=850 && this.y < 860{
			//	ctx.drawImage(this.image, this.x, this.y-860); //top image
			//	ctx.drawImage(this.image, this.x, this.y); //bottom image
			} else if (this.y >= 860) {
				ctx.drawImage(this.image, this.x, this.y-860); //top image
				this.y = 0;
			}
		};

	};
	var Stars = function() {
		this.yPositions = [];	//empty square brackets means new empty array
		this.xPositions = [];
		this.globalAlphas = [];
		this.starSizes = [];
		this.image;
		this.speed = .2;

		this.init = function(){
			this.image = new Image();
			this.image.src = "images-space/star.png";

			for (i=0; i < 10; i++) {
				this.currentStarSize = (Math.floor((Math.random()*2)+1));
				this.yPositions.push(Math.random() * 400);
				this.xPositions.push(Math.random() * 320);
				this.starSizes.push(Math.floor((Math.random()*2)+1));
				if (this.currentStarSize <= 1) {
					this.globalAlphas.push(Math.floor((Math.random()*33))/100);
				} else if (this.currentStarSize > 1 && this.currentStarSize <= 2) {
					this.globalAlphas.push((Math.floor((Math.random()*33))+33)/100);
				} else if (this.currentStarSize > 2) {
					this.globalAlphas.push((Math.floor((Math.random()*34))+66)/100);
				}
				//console.log((Math.floor((Math.random()*33))+33)/100);
			}
		};

		this.draw = function() {

			this.currentStarNumber = 0;
			this.numberOfStars = this.xPositions.length;
			this.starDensity = 2*this.speed; //number from 0 to 20, how often to draw stars

			if (Math.random() < this.starDensity/40)
			{
				this.currentStarSize = (Math.floor((Math.random()*2)+1));
				this.yPositions.push(0);
				this.xPositions.push(Math.random() * 320);
				this.starSizes.push(Math.floor((Math.random()*2)+1));
				if (this.currentStarSize <= 1) {
					this.globalAlphas.push(Math.floor((Math.random()*33))/100);
				} else if (this.currentStarSize > 1 && this.currentStarSize <= 2) {
					this.globalAlphas.push((Math.floor((Math.random()*33))+33)/100);
				} else if (this.currentStarSize > 2) {
					this.globalAlphas.push((Math.floor((Math.random()*34))+66)/100);
				}
				//console.log((Math.floor((Math.random()*33))+33)/100);
			}

			//move the stars
			while (this.currentStarNumber < this.numberOfStars) {
				this.yPositions[this.currentStarNumber] = this.yPositions[this.currentStarNumber] + this.speed;
				this.currentStarNumber += 1;
			}

			this.currentStarNumber = 0;



			while (this.currentStarNumber < this.numberOfStars) {
				//ctxctx.drawImage(this.image, this.xPositions[this.currentStarNumber], this.yPositions[this.currentStarNumber]);
				ctx.globalAlpha = this.globalAlphas[this.currentStarNumber];

				draw.circle(this.xPositions[this.currentStarNumber], this.yPositions[this.currentStarNumber], this.starSizes[this.currentStarNumber], "#eeeeee");
				ctx.globalAlpha = 1;


				this.currentStarNumber = this.currentStarNumber + 1;
			}

			this.currentStarNumber = 0;

			while (this.currentStarNumber < this.numberOfStars) {
				this.currentStarNumber = this.currentStarNumber + 1;
			}
		};
	};//**************** End of Stars Class

	var Enemies = function() {
		this.yPositions = [];	//empty square brackets means new empty array
		this.xPositions = [];
		//set "jiggle"
		this.xDirections = [];
		this.image;
		this.speed = 3;
		this.xSpeed = 3;
		this.enemyDensity = 1; //number from 0 to 20, how often to draw enemies
		this.init = function(){
			this.image = new Image();
			this.image.src = "images-space/enemycrab1.png";

			this.image2 = new Image();
			this.image2.src = "images-space/enemycrab2.png";

			this.image3 = new Image();
			this.image3.src = "images-space/enemycrab3.png";

			this.image4 = new Image();
			this.image4.src = "images-space/enemycrab4.png";

			this.image5 = new Image();
			this.image5.src = "images-space/enemycrab5.png";

			this.currentImage = this.image;

			this.bulletNumber = 0;

		};

		this.draw = function() {
			this.enemyNumber = 0;
			this.totalEnemies = this.xPositions.length;

			//alert(this.enemyDensity);
			if (Math.random() < this.enemyDensity/40)
			{
				this.yPositions.push(-50);
				this.xPositions.push(Math.random() * 400);
				this.xDirections.push((Math.random()*2)-1);
				//alert(Math.floor((Math.random()*40)-20));
				//this.xDirections.push((Math.random() - .5)* this.enemyNumber);
			}

			//move the enemies
			while (this.enemyNumber < this.totalEnemies) {
				this.yPositions[this.enemyNumber] = this.yPositions[this.enemyNumber] + this.speed;

				this.xPositions[this.enemyNumber] = this.xPositions[this.enemyNumber] + this.xSpeed*this.xDirections[this.enemyNumber];
				// + this.xDirections[this.enemyNumber]
				//this.xPositions[this.enemyNumber] = this.xPositions[this.enemyNumber];
				ctx.drawImage(this.currentImage, this.xPositions[this.enemyNumber], this.yPositions[this.enemyNumber]);
				this.enemyNumber = this.enemyNumber + 1;
			}

			this.enemyNumber = 0;

			this.collisionDetection();
		};

		this.collisionDetection = function() {
			//COLLISION DETECTION
			if (p1.dead == false) {
				while (this.enemyNumber < this.totalEnemies) {
					this.x = this.xPositions[this.enemyNumber];
					this.y = this.yPositions[this.enemyNumber];

					this.w = 30;
					this.h = 20;

					this.left = this.x;
					this.right = this.x + this.w;
					this.top = this.y;
					this.bottom = this.y + this.h;

					//hit detect: Enemy Hits Player **WORKING** (checks if player is alive first)
					if  (
						( (p1.left < this.left && this.left < p1.right) || (this.left < p1.left && p1.left < this.right) )
						&&
						( (p1.top < this.top && this.top < p1.bottom) || (this.top < p1.top && p1.top < this.bottom) ) )
					 {
						this.xPositions.splice(this.enemyNumber,1);//remove from array
						this.yPositions.splice(this.enemyNumber,1);//remove from array
						this.xDirections.splice(this.enemyNumber,1);

						health -= 1;
						p1.isHit = true;

					}

						//hit detect: Enemy Hits bottom wall, so remove it from the array.
						if ( this.y > canvas.height) {
							this.xPositions.splice(this.enemyNumber,1);//remove from array
							this.yPositions.splice(this.enemyNumber,1);//remove from array
							this.xDirections.splice(this.enemyNumber,1);
						}

						this.enemyNumber += 1;
						//this.bulletNumber += 1;
				}
			}
		};
		this.levelUp = function() {
			if (level == 1) {
				this.speed = 3.5;
				this.xSpeed = .2;
				this.enemyDensity = 1;
				if (this.currentImage.src != this.image) {
						this.currentImage = this.image;
					}

			} else if (level == 2) {
				this.speed = 4.0;
				this.xSpeed = 1;
				this.enemyDensity = 1.5;
				if (this.currentImage.src != this.image2) {
						this.currentImage = this.image2;
					}
			} else if (level == 3) {
				this.speed = 4.5;
				this.xSpeed = 2;
				this.enemyDensity = 2;
				if (this.currentImage.src != this.image3) {
						this.currentImage = this.image3;
					}
			} else if (level == 4) {
				this.speed = 3.0;
				this.xSpeed = 3;
				this.enemyDensity = 2.5;
				if (this.currentImage.src != this.image4) {
						this.currentImage = this.image4;
					}
			} else if (level >= 5) {
				this.speed = 5.5;
				this.xSpeed = 4;
				this.enemyDensity = 3;
				if (this.currentImage.src != this.image5) {
						this.currentImage = this.image5;
					}
			}
		};
	}; //end of Enemies Class

	var Bullets = function() {
		this.yPositions = [];	//empty square brackets means new empty array
		this.xPositions = [];
		//set "jiggle"
		this.xDirections = [];
		this.w = 6;
		this.h = 6;
		this.velocity = 10;
		this.firingInterval = 6; //once every X frames
		this.bulletFrame = 0;
		this.firing = true;
		this.init = function(){
			this.image = new Image();
			this.image.src = "images-space/bullet1.png";

			this.image2 = new Image();
			this.image2.src = "images-space/bullet2.png";

			this.image3 = new Image();
			this.image3.src = "images-space/bullet3.png";

			this.image4 = new Image();
			this.image4.src = "images-space/bullet4.png";

			this.image5 = new Image();
			this.image5.src = "images-space/bullet5.png";

			this.currentImage = this.image;
		};
		this.reset = function() {
			this.yPositions = [];
			this.xPositions = [];
			b1.firing = true;
		};
		this.kill = function() {
			this.yPositions = []; //reset yPositions
			this.xPositions = []; //reset xPositions
			this.firing = false;
		}
		this.draw = function() {

			if (this.firing == true) {
				this.bulletNumber = 0;
				this.totalBullets = this.xPositions.length;

				this.bulletFrame += 1;
				if (this.bulletFrame > this.firingInterval)
				{
					this.yPositions.push(p1.y - 4);
					this.xPositions.push(p1.x + (p1.w-20)/2 + this.bulletOffset);
					this.bulletFrame = 0;
					//this.xDirections.push((Math.random() - .5)* this.enemyNumber);
				}
			}
		};
		this.move = function() {
			if (this.firing == true) {
				//move the enemies
				while (this.bulletNumber < this.totalBullets) {
					this.yPositions[this.bulletNumber] = this.yPositions[this.bulletNumber] - this.velocity;
					this.xPositions[this.bulletNumber] = this.xPositions[this.bulletNumber]
					this.bulletNumber = this.bulletNumber + 1;
				}

				this.bulletNumber = 0;
				while (this.bulletNumber < this.totalBullets) {
					ctx.drawImage(this.currentImage, this.xPositions[this.bulletNumber], this.yPositions[this.bulletNumber]);
					this.bulletNumber = this.bulletNumber + 1;
				}

				this.bulletNumber = 0;
			}

			this.collides(); //call collision detection function
		};
		this.collides = function() {
			//START NEW HIT DETECT
			this.enemyNumber = 0;
			while (this.enemyNumber < e1.totalEnemies) {
				this.x = e1.xPositions[this.enemyNumber];
				this.y = e1.yPositions[this.enemyNumber];

				//BULLET TO ENEMY COLLISONS
				this.bulletNumber = 0;
				while (this.bulletNumber < this.totalBullets) {
					if (
						( (this.xPositions[this.bulletNumber] < this.x && this.x < this.xPositions[this.bulletNumber] + this.w) || (this.x < this.xPositions[this.bulletNumber] && this.xPositions[this.bulletNumber] < this.x + 30) )
						&&
						( (this.yPositions[this.bulletNumber] < this.y && this.y < this.yPositions[this.bulletNumber] + 33) || (this.y < this.yPositions[this.bulletNumber] && this.yPositions[this.bulletNumber] < this.y + 30) )
					) {
						if(((score+1)%5)==0&&score!=0){
							coinStartX = this.x;
							coinStartY = this.y;
							//gratiicoin.relocate();
							gratiicoin.respawn();
						}
						this.xPositions.splice(this.bulletNumber,1);//remove from array
						this.yPositions.splice(this.bulletNumber,1);//remove from array

						e1.xPositions.splice(this.enemyNumber,1);//remove from array
						e1.yPositions.splice(this.enemyNumber,1);//remove from array
						score += 1;

						if(score==100){
							health += 1;
						}
					}
					this.bulletNumber += 1;
				}
				this.enemyNumber += 1;
			}
			//END NEW HIT DETECT
			//hit detect: Enemy Hits bottom wall, so remove it from the array.
			this.bulletNumber = 0;
			while (this.bulletNumber < this.totalBullets) {
				if ( this.yPositions[this.bulletNumber] < 0) {
					this.xPositions.splice(this.bulletNumber,1);//remove from array
					this.yPositions.splice(this.bulletNumber,1);//remove from array
				}
			this.bulletNumber += 1;
			}
			this.currentEnemyNumber = this.currentEnemyNumber + 1;
		};
		this.levelUp = function() {

			if (level == 1) {
				this.w = 6;
				this.h = 6;
				this.bulletOffset = 5;
				this.velocity = 6;
				this.firingInterval = 18;
				if (this.currentImage.src != this.image) {
						this.currentImage = this.image;
					}
			} else if (level == 2) {
				this.w = 10;
				this.h = 10;
				this.bulletOffset = 0;
				this.velocity = 10;
				this.firingInterval = 14;

				if (this.currentImage.src != this.image2) {
						this.currentImage = this.image2;
					}
			} else if (level == 3) {
				this.w = 20;
				this.h = 20;
				this.bulletOffset = 0;
				this.velocity = 16;
				this.firingInterval = 10;
				if (this.currentImage.src != this.image3) {
						this.currentImage = this.image3;
					}
			} else if (level == 4) {
				this.w = 20;
				this.h = 20;
				this.bulletOffset = 0;
				this.velocity = 22;
				this.firingInterval = 9;
				if (this.currentImage.src != this.image4) {
						this.currentImage = this.image4;
					}
			} else if (level >= 5) {
				this.w = 20;
				this.h = 20;
				this.bulletOffset = 0;
				this.velocity = 24;
				this.firingInterval = 8;
				if (this.currentImage.src != this.image5) {
						this.currentImage = this.image5;
					}
			}
		};
	};

	var Grenade = function() {
		//create arrays for x and y positions
		this.yPositions = [];
		this.xPositions = [];

		//init: sets all PROPERTIES
		this.init = function() {
			this.firing = false;
			this.firedonce = false;
			//this.dead = false;

			this.speed = .2; // amount of pixels moved per frame (LEVEL 1)
			this.color = "#FFFFFF"; // color LEVEL 1
			this.w = 4; //LEVELS 1 and 2
			this.h = 4;

			this.x = p1.x + p1.w/2 - this.w/2;
			this.y = p1.y-this.h/4;

			this.live = false;
			this.throwDistance = Math.floor((Math.random()*200)+50);
		};
		this.reset = function() {
			this.x = p1.x + p1.w/2 - this.w/2;
			this.y = p1.y-3;
			level = 1;
			this.live = false;
			this.exploded = false;
			this.firing = false;
			//this.explosionFrame = 0;
			this.throwDistance = Math.floor((Math.random()*200)+50);
		};
		this.resetXY = function() {

			this.x = p1.x + p1.w/2 - this.w/2;
			this.y = p1.y-this.h/4;
		}
		this.reloadGrenade = function() {
			this.firing = false;
			this.firedonce = false;
			this.live = false;
			this.throwDistance = Math.floor((Math.random()*120)+50);
			this.resetXY();
		};
		this.draw = function(lvl) {
			//else if (grenade1.y <= grenade1.throwDistance && grenade1.firedonce == true && grenade1.live = false && this.exploding == true) {
			//	;
			if (this.y <= this.throwDistance && this.firedonce == true && this.live == false && this.exploding == true) {
			//alert(this.explosionFrame);
						//DRAW EXPLOSION

				//GRENADE TO ENEMY COLLISIONS
				//draw.rect(this.x-this.w*1.7, this.y-this.h*1.7, this.w*3.4, this.h*3.4, '#FF00FF'); //collision rect
				this.enemyNumber = 0;
				this.currentX = this.x-this.w*1.7;
				this.currentY = this.y-this.h*1.7;
				this.currentW = this.w*3.4;
				this.currentH = this.h*3.4;
				while (this.enemyNumber < e1.totalEnemies) {

					if (
						( (this.currentX < e1.xPositions[this.enemyNumber] && e1.xPositions[this.enemyNumber] < this.currentX + this.currentW) || (e1.xPositions[this.enemyNumber] < this.currentX && this.currentX < e1.xPositions[this.enemyNumber] + 30) )
						&&
						( (this.currentY < e1.yPositions[this.enemyNumber] && e1.yPositions[this.enemyNumber] < this.currentY + this.currentW) || (e1.yPositions[this.enemyNumber] < this.currentY && this.currentY < e1.yPositions[this.enemyNumber] + 30) )
					) {
					//alert("You hit an enemy!");
						//draw.rect(p1.x, p1.y, p1.x+4, p1.y+4, "#333333"); //cover up image

						e1.xPositions.splice(this.enemyNumber,1);//remove from array
						e1.yPositions.splice(this.enemyNumber,1);//remove from array
						score += 1;
					}
					this.enemyNumber += 1;
				}
				//END GRENADE TO ENEMY COLLISIONS
				draw.circle(this.x, this.y, this.w*2, this.color);
				draw.rect(this.x-this.w*1.7, this.y-this.h*1.7, this.w*3.4, this.h*3.4, this.color); //collision rect
				this.reloadGrenade();
			}

			//GRENADE TRAIL
			if (this.live == true) {

				if (lvl==1) {
					ctx.globalAlpha = .4;
					draw.rect(this.x, this.y, this.w, this.h, this.color); //LEVELS 1 and 2
					ctx.globalAlpha = 1;
				} else if (lvl>=2) {
					ctx.globalAlpha = .4;
					draw.circle(this.x+this.w/2, this.y, this.w/2, this.color); // LEVEL 3
					ctx.globalAlpha = 1;
				}
			}
		};
		this.move = function() {
			if (this.live == false) {
				this.resetXY();
			}
			if (this.live == true) {
				if (this.y > this.throwDistance) {
					this.y -= this.speed;
				}
			}
		};
		this.explode = function() {
			//draw.rect(this.x, this.y, this.w, this.h, this.color); //LEVELS 1
			this.exploding = true;

			//alert("EXPLODE");
		};
		this.levelUp = function() {
			if (level == 1) {
				this.speed = 4; // amount of pixels moved per frame (LEVEL 1)
				this.color = "#FF9933";
				this.w = 20;
				this.h = 20;
			} else if (level == 2) {
				this.speed = 5;
				this.color = "#FFFF00";
				this.w = 30;
				this.h = 30;
			} else if (level == 3) {
				this.speed = 6;
				this.color = "#00FF00";
				this.w = 40;
				this.h = 40;
			} else if (level == 4) {
				this.speed = 6;
				this.color = "#FF4719";
				this.w = 45;
				this.h = 45;
			} else if (level >= 5) {
				this.speed = 6;
				this.color = "#FFD119";
				this.w = 50;
				this.h = 50;
			}
		};

		this.fire = function() {
			if (upKey) {
				grenade1.firing = true;
				grenade1.firedonce = true;
			} else if (upKey == false) {
				grenade1.firing = false;
			}
			if (grenade1.firing == true && grenade1.y < 0)
				grenade1.reset();
			if (grenade1.y > grenade1.throwDistance && grenade1.firedonce == true) {
				grenade1.live = true;
				grenade1.draw(level);
			} else if (grenade1.y <= grenade1.throwDistance && grenade1.firedonce == true) {
				grenade1.live = false;
				grenade1.explode();
				grenade1.draw(level);
			}  else if (grenade1.y <= grenade1.throwDistance && grenade1.firedonce == true && grenade.exploding == false) {

			}
			//} else if (this.y <= this.throwDistance) {
			//		//this.live = false;
			//		this.explode();
		};

	};

	function levelUpGame() {
		//100, 200, 400, 800, 1600+
		if(score < 10) {
			level = 1;
			grenade1.levelUp();
			b1.levelUp();
			e1.levelUp();
			gratiicoin.levelUp();
			p1.levelUp();
		} else if (score >= 10 && score < 50) {
			level = 2;
			grenade1.levelUp();
			b1.levelUp();
			e1.levelUp();
			gratiicoin.levelUp();
			p1.levelUp();
		} else if (score >= 50 && score < 100) {
			level = 3;
			grenade1.levelUp();
			b1.levelUp();
			e1.levelUp();
			gratiicoin.levelUp();
			p1.levelUp();
		} else if (score >= 100 && score < 150) {
			level = 4;
			grenade1.levelUp();
			b1.levelUp();
			e1.levelUp();
			gratiicoin.levelUp();
			p1.levelUp();
		} else if (score >= 150) {
			level = 5;
			grenade1.levelUp();
			b1.levelUp();
			e1.levelUp();
			gratiicoin.levelUp();
			p1.levelUp();
		}
	}
	var UI = function() {
		this.init = function() {
			this.x = 0;
			this.y = 0;
			this.topUIimage = new Image();
			this.topUIimage.src = 'images-space/UI-topbar.png?C=5';

			this.heartImage = new Image();
			this.heartImage.src = "images-space/heart.png";
		}
		this.drawTopUI = function() {
			ctx.drawImage(this.topUIimage, this.x, this.y); //top UI image

			draw.text(level, 270, 24, 18, '#b5d9fe'); //Draw Level

			//draw.text(hiScore, 250, 15, 12, '#ffba00'); //Draw High Score
			//draw.text(score, 40, 31, 12, '#FEFEFE'); //Draw My Score 84e802
			draw.text(score, 170, 24, 18, '#b5d9fe'); //Draw My Score 84e802 d31a00

			this.gratiiDistance = 272;
			this.fontSize = 18;

			//Draw My Gratii
			// if (gratii < 10) {
			// 	draw.text(gratii, this.gratiiDistance, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			// } else if (gratii >= 10 && gratii < 100) {
			// 	draw.text(gratii, this.gratiiDistance-10, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			// }  else if (gratii >= 100 && gratii < 1000) {
			// 	draw.text(gratii, this.gratiiDistance-20, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			// } else if (gratii >= 1000 && gratii < 10000) {
			// 	draw.text(gratii, this.gratiiDistance-30, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			// } else if (gratii >= 10000) {
			// 	draw.text(gratii, this.gratiiDistance-40, 24, this.fontSize, '#FEFEFE'); //moved to TopUI
			// }
		};
		this.drawBottomUI = function() {
			//draw.text('Health: ' + health, 5, 420, 12, '#CCCCCC');
			this.heartStartX = 246;
			this.heartStartY = 395;
			this.heartWidth = 24;
			if (health == 1) {
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY); //top UI image
			} else if (health == 2) {
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY); //top UI image
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth, this.heartStartY); //top UI image
			} else if (health == 3) {
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY); //top UI image
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth, this.heartStartY); //top UI image
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth*2, this.heartStartY); //top UI image
			} else if (health == 4) {
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth*2, this.heartStartY);
			} else if (health == 5) {
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth*2, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth*2, this.heartStartY);
			} else if (health == 6) {
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth*3, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth*2, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX-this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth, this.heartStartY);
				ctx.drawImage(this.heartImage, this.heartStartX+this.heartWidth*2, this.heartStartY);
			}
		};
	};
	function gameStartScreen() {
	if (instructionScreen == false)
		ctx.drawImage(splashPageImage, 0, 0);
	if (instructionScreen == true)
		ctx.drawImage(instructionPageImage, 0, 0);
	/*		draw.rect(0,0,canvas.width,canvas.height,"#000000");
			draw.text('Mutant', canvas.width/2-30, 120, 16, '#CCCCCC');
			draw.text('Space', canvas.width/2-30, 140, 16, '#CCCCCC');
			draw.text('Crabs', canvas.width/2-30, 160, 16, '#CCCCCC');

			draw.text('Touch the screen to begin.', canvas.width/2-70, 220, 12, '#CCCCCC');
			draw.text('(Or hit the left or right arrows on your keyboard)', canvas.width/2-90, 240, 9, '#CCCCCC');
			//canvas.getContext("2d").drawImage(backgroundImage, 0, 0);
	*/
	}
	function loseGame() {
		gameOver = true;
		console.log( 'Space is calling game over with token: ' + gameToken );
		
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
	//Initialize Game Objects
	var ui = new UI();
	ui.init();

	var p1 = new Ship();
	p1.init();

	var gratiicoin = new GratiiCoin();

	var grenade1 = new Grenade(); //initialize our first bullet
	grenade1.init();

	var e1 = new Enemies();
	e1.init();

	var b1 = new Bullets();
	b1.init();

	var stars = new Stars();
	stars.init();

	var scrollingBackground = new ScrollingBackground();
	scrollingBackground.init();

	function loop() {

		if (splashScreen == true) {
			gameStartScreen();
		} else if (splashScreen == false) {

			//Draw game elements to page
			draw.clear(); //clear the canvas every time this loops

			scrollingBackground.draw(); //draw clouds

			stars.draw(); //draw stars

			e1.draw(); //draw enemies

			//START NOT DRAWING ON FIRST TOUCH
			//ui.drawTopUI();
			//ui.drawBottomUI();
			//p1.draw();
			//END NOT DRAWING ON FIRST TOUCH

			p1.move();
			p1.draw();

			b1.draw();
			b1.move();




			//ship/gratiicoin hit detection (only works if player is ALIVE)
			if (p1.dead == false && p1.collides(gratiicoin)) {

				if(parent.user.challengeIssueInProgress===false && parent.user.challengeResponseInProgress===false){
	
					var thisGameID = parent.user.gameInProgress['gameID'];
					var thisGameEvent = "coinGrab";
					var scoreForThisEvent = 1;
					var gratiiEarnedInThisEvent = Math.floor(scoreForThisEvent*parent.user.gameInProgress['equations'].coinGrab);

					parent.user.arcadeEvents.push({"gameToken":gameToken, "score":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
					parent.user.changeGratii(gratiiEarnedInThisEvent);
				}

				gratii += 1;
				//score += 25;
				gratiicoin.relocate();

			}
			gratiicoin.draw();



			//update score
			if (score > hiScore) {
				hiScore = score;
			}

			ui.drawTopUI();
			ui.drawBottomUI();
			//Display scoreboard, health, etc (most items moved to: topUI.draw();

			//draw.text('Health: ' + health, 5, 420, 12, '#CCCCCC');

			if(health<=0) {
				p1.dead = true; //if no health, you're dead!

			}
			if (p1.dead == false) {
				grenade1.move();
				grenade1.fire(); //event listeners for Grenade
				//Change level dependent on score
				levelUpGame();
			}
			if(p1.dead === true) {
				b1.kill();
				if (gameOver == false) {
					gameOver = true;
					loseGame();
				}

				//draw.text('Game Over :(', 100, 100, 12, 'red');
				//draw.text('Press Left and Right Keys to Restart', 40, 120, 12, '#cccccc');
			}
		}
	};
	//init splash page
	console.log( '*** Init SPlash Page' );
	splashPageImage = new Image();
	splashPageImage.src = "images-space/splash-page.png";

	instructionPageImage = new Image();
	instructionPageImage.src = "images-space/instructions-page.png";

	window.scrollTo(0,0);
	//animation
	window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  window.oRequestAnimationFrame      ||
                  window.msRequestAnimationFrame     ||
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
    })();
	(function animloop(){
      requestAnimFrame(animloop);
      loop();
    })();


}());