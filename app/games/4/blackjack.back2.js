(function(){

	// startGratiiSession("Blackjack");
	//canvas and basic drawing functionality
    var canvas = document.getElementById('Canvas'),
        ctx = canvas.getContext('2d');

	canvas.width = 320; //320, innerWidth
    canvas.height = 430; //430, innerHeight

	var touchDevice = false;
	var instructionScreen = false;
	var splashScreen = true;
	var maxBet = 500;

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
            ctx.font = 'bold ' + size + 'px ' + 'verdana';
            ctx.fillStyle = col;
            ctx.fillText(str, x, y);
        }
    };

	//Load images
	//backgroundImage = new Image();
	//backgroundImage.src = "images/blackjackBG.png"; //moved to html
	splashImage = new Image();
	splashImage.src = "images/splash-page.png";

	instructionsImage = new Image();
	instructionsImage.src = "images/instructions-page.png";

	coinImage = new Image();
	coinImage.src = "images/gratiicoin25b.png";

	gImage = new Image();
	gImage.src = "images/g.png";

	gPlusImage = new Image();
	gPlusImage.src = "images/g-plus.png";

	gMinusImage = new Image();
	gMinusImage.src = "images/g-minus.png";

	arrowImage = new Image();
	arrowImage.src = "images/arrow-split.png";

	buttonBackImage = new Image();
	buttonBackImage.src = "images/button3.png"; //78px X 54px

	chipsImage = new Image();
	chipsImage.src = "images/chips.png"; //155px X 42px
	//end load images

	//START GRATII COIN POST LOGIC
	var gratiiWinnings = 0;

	//events : blackjack
	//wager : betTotal
	//winnings : gratiiWinnings



	function getUserGratii() {
		// $.get('../../users/php/getUserGratii.php', function(data){
		// 	//alert(data);
		// 	if (data != null) {
		// 		//console.log("User Gratii: " + data);
		// 		myGratii = data;
		// 	}
		// });
		myGratii = parent.arcade.util.getUserGratii();
	}
	function postBetGratii(betType) {

		var theBet = (betTotal*-1);
		// alert('post bet gratii ' + theBet + ' betType is: ' + betType);
		parent.arcade.blackjack.submitBet(theBet, betType);
		return;

		var online = navigator.onLine;
		if(online==false){
			alert("Oh no! You lost internet connection.");
			window.location = "../../users/html/arcade.html";
			return;
		}
		if(myGratii=="wait.."){
			alert("Please wait for your chips to update. Internet connection is slow.");
			return;
		}
		$.post('../api/gameOver.php', {score: (betTotal*-1)}, "json");
	}
	function postGratiiWon() {
		// alert('post gratii won' + gratiiWinnings + " winner state is: " + winnerState + " game state is: " + gameState);
		// winnerstate = "player" or "dealer" or "tie" or "playerblackjack"
		// game state normal is: "game_over"
		// game state on a split is "split_game_over"
		parent.arcade.blackjack.submitWinLose(gratiiWinnings, winnerState, gameState, true);

	}
	function postGratiiWonDeckOne(temporaryWon) {
		// alert('post gratii won' + temporaryWon + " winner state is: " + winnerState + " game state is: " + gameState);
		// winnerstate = "player" or "dealer" or "tie" or "playerblackjack"
		// game state normal is: "game_over"
		// game state on a split is "split_game_over"
		parent.arcade.blackjack.submitWinLose(temporaryWon, winnerState, gameState, false);
		return;
	}

	//END GRATII COIN POST LOGIC

	//SUBTRACT GRATII
	//var postBetTotal = $.post('http://www.graticity.com/gratiimobile/controllers/casinoWagerGratii.php', {casinoRoomSessionNum : 0, casinoGameID : 0, gratiiWagered : betTotal});

	//end SUB GRATII

// *************** START BLACKJACK GAME LOGIC *************************
	// Card and Deck objects
	function Card(num,suit) {
		this.num = num;
		this.suit = suit;
		//this.fname = fname;

		this.image = new Image();

		this.image.src = "images/" + this.num + "_" + this.suit + ".png";
	}
	function CardBack() {
		this.image = new Image();
		this.image.src = "images/cardback.png";

	}
	function Deck() {
		this.cards = new Array(52);
		this.next_card = 0;
		// fill the deck (in order, for now)
		for (i=1; i<14; i++) {
			this.cards[i-1] = new Card(i,"c");
			this.cards[i+12] = new Card(i,"h");
			this.cards[i+25] = new Card(i,"s");
			this.cards[i+38] = new Card(i,"d");
		}
			this.shuffle = 	function() {
				//FAKE
				// return;
				// END FAKE
				for (i=1; i<1000; i++) {
				// switch two randomly selected cards
				card1 = Math.floor( 52*Math.random() );
				card2 = Math.floor( 52*Math.random() );
				temp = this.cards[card2];
				this.cards[card2] = this.cards[card1];
				this.cards[card1] = temp;
			   }
			   this.next_card = 0;

			};
			this.dealCard = function() {

				console.log( 'Dealing Card' );
				console.log( this.next_card );
				console.log( this.cards[ this.next_card++ ] );

				return this.cards[ this.next_card++ ];
			};
			//FAKE
			/*this.dealExactCard = function (num){
				return this.cards[ num ];
			};*/
			//END FAKE
	}
	//Betting Functions
	function addBet(amt) {
		player_split_hand = new Array(); //clear split hand
		if (myGratii >= amt) {

			myGratii -= amt;
			betTotal += amt;
			previousBet += amt;
			if(betTotal>maxBet){
				alert("Max bet is "+maxBet+" Gratii");
				betTotal -= amt;
				myGratii += amt;
				previousBet = betTotal;
				//return;
			}
			//$.post('http://www.graticity.com/gratiimobile/controllers/casinoWagerGratii.php', {casinoRoomSessionNum : 0, casinoGameID : 0, gratiiWagered : betTotal});
			//alert("POSTED");
		} else if(myGratii=="wait.."){

			alert("Please wait for your chips to update. Internet connection is slow.");
		} else {
			alert("Not enough Gratii bro");
		}
	}
	function clearBet(amt) {
		if(betTotal>0){
			myGratii += amt;
			betTotal = 0;
			previousBet = 0;
		}
	}
	function nextBet() {
		previousBet = betTotal;
		betTotal = 0;
	}
	function setPreviousBet() {
		previousBet = betTotal;
	}
	//end betting functions
	//misc blackjack functions
	function newGame() {
		//DEAL CARDS
		if (gameState == 'deal') {
			//createNewGame = 0;
			//alert("EHEREHR");
			if ( deck.next_card > 39 ) {  // shuffle the deck if 75% of
				deck.shuffle();            // the cards have been used.
			}
			dealer_hand = new Array();
			player_hand = new Array();
			player_split_hand = new Array();

			//DEAL CARDS (EXECUTE ONCE ONLY)
			//DEAL DEALER HAND
			dealer_hand[ 0 ] = deck.dealCard();// alert(dealer_hand[ 0 ].num);

			//MIGHT NEED THIS??!?!?!?!?!?
			//dealer_hand[ 0 ].image.src = "images/back.gif";

			dealer_hand[ 1 ] = deck.dealCard();

			//DEAL PLAYER HAND
			player_hand[ 0 ] = deck.dealCard();
			player_hand[ 1 ] = deck.dealCard();

			//FAKE DEAL HAND
			// player_hand[ 0 ] = deck.dealExactCard(10);
			// player_hand[ 1 ] = deck.dealExactCard(13);
			// END FAKE

			//playerHandScore = score(player_hand);
			//alert(playerHandScore);
			//getUserGratii();
		}

	} // end function newGame()
	function checkIfBlackjack() {
		playerHandScore = score(player_hand);
		//check if 21, if 21 then game_over
		if ( playerHandScore == 21 && player_hand.length == 2 && gameState == 'play') { //PLAYER BLACKJACK == TRUE!
				stand();
				//winnerState = winner();
				//payWinnings(winnerState);
				//alert("Blackjack!");
				return;
			}
		//alert(playerHandScore);
	}

	function score(hand) {
	if (hand != null) {
	   var total = 0;
	   var soft = 0; // This variable counts the number of aces in the hand.
	   var pips = 0; // The trump pictures on a card used to be called pips.
	   for ( i=0; i<hand.length; i++ ) {
		  pips = hand[i].num;
		  if ( pips == 1 ) {
			 soft = soft + 1;
			 total = total + 11;
		  } else {
			 if ( pips == 11 || pips == 12 || pips == 13 ) {
				total = total + 10;
			 } else {
				total = total + pips;
			 }
		  }
	   }
	   while ( soft > 0 && total > 21 ) {  // Count the aces as 1 instead
		  total = total - 10;              // of 11 if the total is over 21
		  soft = soft - 1;
	   }
	   return total;
	}
}  // end function score()
	function scoreCard(card) {
		   var total = 0;
		   var soft = 0; // This variable counts the number of aces in the hand.
		   var pips = 0; // The trump pictures on a card used to be called pips.

			  pips = card.num;
			  if ( pips == 1 ) {
				 soft = soft + 1;
				 total = total + 11;
			  } else {
				 if ( pips == 11 || pips == 12 || pips == 13 ) {
					total = total + 10;
				 } else {
					total = total + pips;
				 }
			  }

		   while ( soft > 0 && total > 21 ) {  // Count the aces as 1 instead
			  total = total - 10;              // of 11 if the total is over 21
			  soft = soft - 1;
		   }
		   return total;
	}  // end function score()
	function winner() { //check to see who won.

		if (gameState != 'split') {
		   var player_total = score( player_hand );
		   var dealer_total = score( dealer_hand );
		   if ( player_total == 21 && player_hand.length == 2 ) {//Player Blackjack
				return 'playerblackjack';
			}

		   if ( player_total == 21 && player_hand.length == 2 && dealer_total == 21) { //Player and Dealer Blackjack
				return 'tie';
			}
		   if ( player_total > 21 ) {  // Player Busted
			  return 'dealer';
		   } else if ( dealer_total > 21 ) { // Dealer Busted
				 return 'player';
			  } else if ( player_total  == dealer_total ) {
					return 'tie';
				 } else if ( player_total  > dealer_total ) {
					   return 'player';
					} else {
					   return 'dealer';
					}

		}
		else if (gameState == 'split' && splitCurrentHand == 1) {
			var player_total = score( player_hand );
		    var dealer_total = score( dealer_hand );
		   if ( player_total == 21 && player_hand.length == 2 ) {//Player Blackjack
				return 'playerblackjack';
			}

		   if ( player_total == 21 && player_hand.length == 2 && dealer_total == 21) { //Player and Dealer Blackjack
				return 'tie';
			}
		   if ( player_total > 21 ) {  // Player Busted
			  return 'dealer';
		   } else if ( dealer_total > 21 ) { // Dealer Busted
				 return 'player';
			  } else if ( player_total  == dealer_total ) {
					return 'tie';
				 } else if ( player_total  > dealer_total ) {
					   return 'player';
					} else {
					   return 'dealer';
					}
		} else if (gameState == 'split' && splitCurrentHand == 2) {
			var player_split_total = score( player_split_hand );
			var dealer_total = score( dealer_hand );
			if ( player_split_total == 21 && player_split_hand.length == 2 ) {//Player Blackjack
				return 'playerblackjack';
			}

			if ( player_split_total == 21 && player_split_hand.length == 2 && dealer_total == 21) { //Player and Dealer Blackjack
				return 'tie';
			}
			if ( player_split_total > 21 ) {  // Player Busted
			  return 'dealer';
			} else if ( dealer_total > 21 ) { // Dealer Busted
				 return 'player';
			  } else if ( player_split_total  == dealer_total ) {
					return 'tie';
				 } else if ( player_split_total  > dealer_total ) {
					   return 'player';
					} else {
					   return 'dealer';
					}
		}
	}
function payWinnings(winstate) {

	//NORMAL GAME, NOT SPLITTING
	if (gameState != 'split') {
		if (winstate == "dealer") {

			//declare total won
			totalWon -= betTotal;
			//reset previous bet and betTotal
			//previousBet = betTotal;
			//update game and win states
			gameState = 'game_over';
			//alert("Dealer wins. You lost " + betTotal + " Gratii");
			winState = "none";
			gratiiWinnings = 0;
			postGratiiWon(gratiiWinnings);
		}
		if (winstate == "player") {
			gratiiWinnings += betTotal*2;
			myGratii += betTotal*2;
			totalWon += betTotal;
			//reset previous bet and betTotal
			//previousBet = betTotal;
			//update game and win states
			gameState = 'game_over';
			//alert("Player wins. You won " + betTotal + " Gratii");
			winState = "none";
			postGratiiWon(gratiiWinnings);
		}
		if (winstate == "tie") {
			gratiiWinnings += betTotal;
			myGratii += betTotal;
			//reset previous bet and betTotal
			//previousBet = betTotal;
			//update game and win states
			gameState = 'game_over';
			//alert("Tie Game.");
			winState = "none";
			postGratiiWon(gratiiWinnings);
		}
		if (winstate == "playerblackjack") {
			gratiiWinnings += Math.round(((5/2) * betTotal));
			myGratii += Math.round(((5/2) * betTotal) + betTotal);
			totalWon += Math.round((5/2) * betTotal);
			//previousBet = betTotal;
			//betTotal = 0;
			gameState = 'game_over';
			//alert("BLACKJACK!!");
			winState = "none";
			postGratiiWon(gratiiWinnings);
		}

	} else if (gameState == 'split' && splitCurrentHand == 1) {//SPLIT HAND 1

		temporaryWon = 0;

		if (winstate == "dealer") {

			temporaryWon -= Math.round(betTotal/2);
			totalWon -= betTotal/2;
			splitCurrentHand = 2;
			gratiiWinnings = 0;
			postGratiiWonDeckOne(gratiiWinnings);
		}
		if (winstate == "player") {

			totalWon += betTotal;
			temporaryWon += Math.round(betTotal);
			splitCurrentHand = 2;
			postGratiiWonDeckOne(temporaryWon);
		}
		if (winstate == "tie") {

			temporaryWon += Math.round(betTotal/2);
			splitCurrentHand = 2;
			postGratiiWonDeckOne(temporaryWon);
		}
		if (winstate == "playerblackjack") {

			totalWon += betTotal/2;
			temporaryWon += Math.round(betTotal);
			splitCurrentHand = 2;
			postGratiiWonDeckOne(temporaryWon);
		}



	} else if (gameState == 'split' && splitCurrentHand == 2) { //SPLIT HAND 2

		// Do not add temporary won - we will be reporting it now on deck 1
		/*
		if (temporaryWon > 0) {

			gratiiWinnings += temporaryWon;
			myGratii += temporaryWon;

		} else if (temporaryWon < 0) {

		} else if (temporaryWon == 0) {

		}
		*/

		if (winstate == "dealer") {

			totalWon -= Math.round(betTotal/2);
			gameState = 'split_game_over';
			winState = "none";//no affect
			gratiiWinnings += 0;
			alert(gratiiWinnings);
			postGratiiWon(gratiiWinnings);

		}
		if (winstate == "player") {

			gratiiWinnings += Math.round(betTotal);
			myGratii += Math.round(betTotal);
			totalWon += Math.round(betTotal/2);
			gameState = 'split_game_over';
			winState = "none";//no affect
			alert(gratiiWinnings);
			postGratiiWon(gratiiWinnings);
		}
		if (winstate == "tie") {

			gratiiWinnings += Math.round(betTotal/2);
			myGratii += Math.round(betTotal/2);
			gameState = 'split_game_over';
			winState = "none";//no affect
			alert(gratiiWinnings);
			postGratiiWon(gratiiWinnings);
		}
		if (winstate == "playerblackjack") {

			gratiiWinnings += Math.round(betTotal);
			myGratii += Math.round(betTotal);
			totalWon += Math.round(betTotal/2);
			gameState = 'split_game_over';
			winState = "none";//no affect
			alert(gratiiWinnings);
			postGratiiWon(gratiiWinnings);
		}
	}


}

	//Gameplay functions
	function deal() {
		gameState = 'deal';
		winnerState = 'none';
		gratiiWinnings = 0;
		//deck.shuffle();
		cardShowState=true;
		if (cardShowState==true && betTotal==0) {
			cardShowState=false;
				gameState = 'bet';
				winnerState = 'none';
			alert("You must place a bet to play at this table bro");
		} else if (cardShowState == true && betTotal >= 1) {
			postBetGratii("placeBet");
			//myGratii -= betTotal;
			//getUserGratii();
		}

	}
	function hit() {
	   //var total = 0;
	   //if (gameState == 'split' && splitCurrentHand == 1)


	   if (gameState != 'split') {
		   var new_card = 0;  // index for the new card position
		   if ( gameState == 'game_over' ) {
			  alert("Game over.  Click the Deal button to start a new hand.");
		   } else {
			  new_card = player_hand.length;

			  player_hand[ new_card ] = deck.dealCard();
			  //FAKE
			  // player_hand[ new_card ] = deck.dealExactCard(1);
			  // END FAKE

			  //document.images[ new_card + 6 ].src = player_hand[ new_card ].fname();
			  playerHandScore = score( player_hand );
			  if (DoublingUp == true) {
				DoublingUp = false;
				if ( playerHandScore > 21 ) {  // Busted on doubleUp, game over.
					//alert(playerHandScore + ": BUSTED!");
					//stand();
					winnerState = winner();
					payWinnings(winnerState);
					return;
				} else {
					stand();
					return;
				}
				//winnerState = winner();
				//payWinnings(winnerState);
				//return;
			  }
				//winnerState = winner();
				//payWinnings(winnerState);
				//return;
			  //}
			  if ( playerHandScore > 21 ) {  // Busted, game over.
				 //alert(playerHandScore + ": BUSTED!");
				 winnerState = winner();
				 payWinnings(winnerState);


				 //this.image.src = "images/" + this.num + "_" + this.suit + ".gif";

			  } else if (playerHandScore == 21) {
				//gameState = '21';
				stand();
			  } else {
				//HIT OK, KEEP PLAYING
				 //document.form1.player.value = total; //add up player score total
			  }
			}
		} else if (gameState == 'split' && splitCurrentHand == 1) { //else if (gameState == 'split' && splitCurrentHand == 1) {
			var new_card = 0;  // index for the new card position
		   if ( gameState == 'game_over' ) {
			  alert("Game over.  Click the Deal button to start a new hand.");
		   } else {
			  new_card = player_hand.length;

			  player_hand[ new_card ] = deck.dealCard();
			  // FAKE
			  // player_hand[ new_card ] = deck.dealExactCard(2);
			  // END FAKE

			  //document.images[ new_card + 6 ].src = player_hand[ new_card ].fname();
			  playerHandScore = score( player_hand );
			  if ( playerHandScore > 21 ) {  // Busted, game over.
				 //alert(playerHandScore + ": BUSTED!");
				 winnerState = winner();
				 payWinnings(winnerState);


				 //this.image.src = "images/" + this.num + "_" + this.suit + ".gif";

			  } else if (playerHandScore == 21) {
				//gameState = '21';
				stand();
			  } else {
				//HIT OK, KEEP PLAYING
				 //document.form1.player.value = total; //add up player score total
			  }
			}

		} else if (gameState == 'split' && splitCurrentHand == 2) {
			var new_card = 0;  // index for the new card position
		   if ( gameState == 'game_over' ) {
			  alert("Game over.  Click the Deal button to start a new hand.");
		   } else {
			  new_card = player_split_hand.length;

			  player_split_hand[ new_card ] = deck.dealCard();
			  // FAKE
			  // player_split_hand[ new_card ] = deck.dealExactCard(1);
			  // END FAKE

			  playerSplitHandScore = score( player_split_hand );
			  if ( playerSplitHandScore > 21 ) {  // Busted, game over.
				 //alert(playerSplitHandScore + ": BUSTED!");
				 winnerState = winner();
				 payWinnings(winnerState);


				 //this.image.src = "images/" + this.num + "_" + this.suit + ".gif";

			  } else if (playerSplitHandScore == 21) {
				//gameState = '21';
				stand();
			  } else {
				//HIT OK, KEEP PLAYING
				 //document.form1.player.value = total; //add up player score total
			  }
			}

		}
} // end function hit()
	function stand() {
		//alert("stand");
	   //var total = 0;
	   //if (gameState != 'split') {
		   var new_card = 0;  // index for the new card position
		   if ( gameState == 'game_over' ) {
				//alert("stand() game over");

		   } else {

			  while ( score( dealer_hand ) < 17 ) {  // Dealer stands on soft 17
				 new_card = dealer_hand.length;
				 dealer_hand[ new_card ] = deck.dealCard();
			  }
			  dealerHandScore = score( dealer_hand );
				winnerState = winner();
				payWinnings(winnerState);
				return;
		   }


		/*} else if (gameState == 'split' && splitCurrentHand == 1) {

		} else if (gameState == 'split' && splitCurrentHand == 2) {

		}*/
		//if (gameState == 'split' &&

	} // end function stand()
	function reBet() {

		player_split_hand = new Array(); //clear split hand
		if (myGratii >= previousBet) {
			myGratii -= previousBet;
			betTotal = previousBet;
			deal();
		} else if(myGratii=="wait.."){

			alert("Please wait for your chips to update. Internet connection is slow.");
		}else {
			alert("Not enough gratii bro");
		}
	}
	var DoublingUp = false;
	function doubleUp() {

		if (gameState != 'split') {
			if (player_hand.length == 2) {
			//alert("Doubling Down!");
				//betTotal *= 2;
				if (myGratii >= betTotal) {
					postBetGratii("doubleDown");
					//getUserGratii();
					//TO DO: Set myGratii to the bettotal (DONE)
					myGratii -= betTotal;
					betTotal *= 2;
					DoublingUp = true;
					hit();
					//DoublingUp = false;
					//winnerState = winner();
					//payWinnings(winnerState);
					//return;
				} else {
					//betTotal /= 2;
					alert("Not enough gratii bro");
				}
			} else {
				//betTotal /= 2;
				alert("You have too many cards to double down.");
			}
		} else if (gameState == 'split') {

		}
		//if doubling, you get one more card ONLY, and this is your last card.
	}
	function split() {
		//alert("Split");
		if (player_hand[ 0 ].num == player_hand[ 1 ].num) {
			if (myGratii >= betTotal) { //do the split
				postBetGratii("split");
				//getUserGratii();
				myGratii -= betTotal
				betTotal *= 2;
				console.log("betTotal doubled for Split");
				player_split_hand[ 0 ] = player_hand[ 1 ]; //put player's 2nd card into first split hand slot

				player_hand[ 1 ] = deck.dealCard();
				player_split_hand[ 1 ] = deck.dealCard();
				// FAKE
				// player_hand[ 1 ] = deck.dealExactCard(1);
				// player_split_hand[ 1 ] = deck.dealExactCard(1);
				// END FAKE

				splitCurrentHand = 1;
				gameState = 'split';

			} else { //don't do the split
				alert("Not enough gratii bro");
			}
		} else {
			alert("Your cards must match to split.");
		}
		//gameState = 'bet';
		//winnerState = 'none';
	}

	function finishSplit(){

	}

	function clearTable() {
		player_split_hand = new Array(); //clear split hand
		betTotal = 0;
		previousBet = 0;
		cardShowState=false;
		gameState = 'bet';
		winnerState = 'none';
	}
	//End Gameplay functions
// *************** END BLACKJACK GAME LOGIC *************************

// *************** START USER INTERFACE LOGIC *************************
	//Start StatusBar buttons
	function quitGame() {
		exitGame();
	}
	function help() {
		alert("Try to get 21.");
	}
	//End StatusBar buttons
	function gameplayButton(X, Y, WIDTH, HEIGHT, TEXT, TEXTX, TEXTY) {
		//click variables
		this.x = X;
		this.y = Y;
		this.width = WIDTH;
		this.height = HEIGHT;

		//draw variables
		this.text = TEXT;
		this.textx = TEXTX;
		this.texty = TEXTY;
		this.textcolor = "#777777";
		this.fontSize = 16;

		this.clicked = function(clickx, clicky) {
			if (checkButtonRectCollision(clickx, clicky, this.x, this.y, this.width, this.height) == true)
				return true;//if this returns true, the button has been clicked.
		};
		this.draw = function() {
			canvas.getContext("2d").drawImage(buttonBackImage, this.x, this.y+12);
			draw.text(this.text, this.textx, this.texty-10, this.fontSize, this.textcolor);
		};
		this.showCollisionOutline = function() {
			ctx.globalAlpha = 0.5;
			draw.rect(this.x, this.y, this.width, this.height, 'red');
			ctx.globalAlpha = 1;
		}
	}
	function checkButtonRectCollision(clickX, clickY, x1, y1, width, height) {
	//x1, y1, height, width
	//draw.rect(firstBetButtonX, canvas.height-82, 25, 30, 'red'); //1
	var y2 = y1 + height;
	var x2 = x1 + width;
		if (clickX > x1 && clickX < x2 && clickY > y1 && clickY < y2) {
		return true;
		} else { return false; }
	}
	function clickButtons(clickX, clickY) {

	if (splashScreen == true) {
		if (instructionScreen == true) {
			splashScreen = false;
			instructionScreen = false;
			//alert("instruction Screen");
		}
		if (checkButtonRectCollision(clickX, clickY, 0, 360, canvas.width, 70) == true) {
			instructionScreen = true;
		} else {
			splashScreen = false;
			instructionScreen = false;
		}

	} else if (splashScreen == false) {
			//STATUS BAR
			/*
			var helpLeft = 60;
			draw.line(helpLeft, 0, helpLeft, 34, 1, '#444444'); //222
			draw.text('?', helpLeft+14, 18, 18, '#f4e450'); //236
			draw.text('Help', helpLeft+7, 30, 10, '#cbcbcb'); //229
			var cashOutLeft = 0;
			//draw.line(cashOutLeft, 0, cashOutLeft, 34, 1, '#444444'); //260
			draw.text('X', cashOutLeft+24, 18, 18, '#f0603e'); //284
			draw.text('Cash Out', cashOutLeft+5, 30, 10, '#cbcbcb'); //265
			*/
			if (checkButtonRectCollision(clickX, clickY, 0, 0, 59, 34) == true)
					quitGame();
			//END STATUS BAR
			if (checkButtonRectCollision(clickX, clickY, 60, 0, 44, 34) == true)
					help();

			//GAMEPLAY BUTTONS
			if (gameState == 'bet') {
				//STATE 1: BET/DEAL
				if (dealButton.clicked(clickX, clickY) == true)
					deal();
			} else if (gameState == 'game_over' || gameState == 'split_game_over') {
				if (clearButton.clicked(clickX, clickY) == true)
					clearTable();
				if (rebetButton.clicked(clickX, clickY) == true)
					reBet();
			} else if (gameState == 'play') {
				//STATE 2: HIT, STAND, DOUBLE, SPLIT
				if (hitButton.clicked(clickX, clickY) == true)
					hit();
				if (standButton.clicked(clickX, clickY) == true)
					stand();
				if (doubleButton.clicked(clickX, clickY) == true)
					doubleUp();
				if (splitButton.clicked(clickX, clickY) == true)
					split();
			} else if (gameState == 'split') {
				if (splitHitButton.clicked(clickX, clickY) == true)
					hit();
				if (splitStandButton.clicked(clickX, clickY) == true)
					stand();
			}
			//BET BUTTONS
			if (gameState == 'bet') {
			//draw.rect(firstBetButtonX, canvas.height-140, 49, 60, 'green'); //5
			//draw.rect(firstBetButtonX+50, canvas.height-142, 51, 60, 'red'); //25
			//draw.rect(firstBetButtonX+102, canvas.height-144, 57, 60, 'green'); //100

				if (checkButtonRectCollision(clickX, clickY, firstBetButtonX, canvas.height-140, 49, 60) == true)
					addBet(5);//alert("+1");
				if (checkButtonRectCollision(clickX, clickY, firstBetButtonX+50, canvas.height-142, 51, 60) == true)
					addBet(25);//alert("+5");
				if (checkButtonRectCollision(clickX, clickY, firstBetButtonX+102, canvas.height-144, 57, 60) == true)
					addBet(100);//alert("+25");

				//CLEAR click area

				//draw.rect(112, canvas.height/2-72, iconsXValue()-60, 80, '#CC3300');
				if (checkButtonRectCollision(clickX, clickY, 112, canvas.height/2-72, iconsXValue()-60, 80) == true)
					clearBet(betTotal);//alert("Cleared");
			}
		}
	}
	function drawButtons() {
		var fontSize = 16;
		if (gameState == 'bet') {
			//draw.text('Place Your Bet:', 15, 320, fontSize, '#333333');
			canvas.getContext("2d").drawImage(chipsImage, 160, canvas.height-138); //chips image
			dealButton.draw(); //deal
			//dealButton.showCollisionOutline();
		} else if (gameState == 'game_over' || gameState == 'split_game_over') {
			clearButton.draw(); //clear
			rebetButton.draw();	//re-bet
		} else if (gameState == 'play') {
			hitButton.draw(); //Hit
			standButton.draw(); //Stand
			doubleButton.draw(); //Double
			splitButton.draw(); //Split
		} else if (gameState == 'split') {
			splitHitButton.draw(); //Hit
			splitStandButton.draw(); //Stand
		}
	}
	/*
	var dealTrack = 0;
	function animateDeal() {

		this.x = canvas.width + 100;
		if (dealTrack < 100) {
			dealTrack++;
			return dealTrack;
		}

	}
	*/
	function drawCards() {
		if (gameState == 'play' || gameState == 'game_over' || gameState == 'split' || gameState == 'split_game_over') {
			for (var i = 0; i < dealer_hand.length; i++) {
				if (i==0 && gameState == 'play') { //if first dealer card, and play is live, draw the back of the dealer's card the first time they are dealt
					canvas.getContext("2d").drawImage(cardback.image, 120, 50);
				} else if (i==0 && gameState == 'split') {
					canvas.getContext("2d").drawImage(cardback.image, 120, 44);
				} else if (i==0 && gameState == 'game_over') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 50+i*4);
				} else if (i==0 && gameState == 'split_game_over') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 44+i*2);
				}
				if (i != 0 && gameState == 'play') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 50+i*4);
				} else if (i != 0 && gameState == 'game_over') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 50+i*4);
				} else if (i != 0 && gameState == 'split_game_over') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 44+i*2);
				} else if (i == 1 && gameState == 'split') {
					canvas.getContext("2d").drawImage(dealer_hand[ i ].image, 120+i*22, 44+i*2);
				}
			}
			//DRAW PLAYER CARDS
			if (gameState != 'split' && gameState != 'split_game_over') {
				for (var i = 0; i < player_hand.length; i++) {
					canvas.getContext("2d").drawImage(player_hand[ i ].image, 120+i*22, 225+i*4);
				}
			} else if (gameState == 'split' || gameState == 'split_game_over'){

				//draw player hand 1
				for (var i = 0; i < player_hand.length; i++) {
					//player_hand[ i ].image.height *= .5;
					//player_hand[ i ].image.width *= .5;
					//alert(player_hand[ i ].image.width);
					canvas.getContext("2d").drawImage(player_hand[ i ].image, 50+i*22, 142+i*2);
				}

				//draw player hand 2
				for (var i = 0; i < player_split_hand.length; i++) {//player_split_hand
				//player_split_hand[ i ].image.height *= .5;
				//player_split_hand[ i ].image.width *= .5;
				canvas.getContext("2d").drawImage(player_split_hand[ i ].image, 50+i*22, 240+i*2);
				}
				//draw split arrow
				if (gameState == 'split') {
					if (splitCurrentHand == 1) {
						canvas.getContext("2d").drawImage(arrowImage, 4, 164);
					} else if (splitCurrentHand == 2) {
						canvas.getContext("2d").drawImage(arrowImage, 4, 264);
					}
				}
			}


		}

	}
	function drawScore() {
		if (gameState == 'play') {
			if (score(dealer_hand) != null & score(player_hand) != null) {
				dealerHandScore = (score(dealer_hand));
				playerHandScore = (score(player_hand));
			draw.text(playerHandScore, canvas.width/2-8, canvas.height-90, 12, '#CCCCCC');
			}
		} else if (gameState == 'game_over') {
			if (score(dealer_hand) != null & score(player_hand) != null) {
				dealerHandScore = (score(dealer_hand));
				playerHandScore = (score(player_hand));
			draw.text('Dealer:' + dealerHandScore, 25, canvas.height-290, 12, '#CCCCCC');
			draw.text(playerHandScore, canvas.width/2-8, canvas.height-90, 12, '#CCCCCC');
			}
		} else if (gameState == 'split') {
			if (score(dealer_hand) != null & score(player_hand) != null) {
					dealerHandScore = (score(dealer_hand));
					playerHandScore = (score(player_hand));
					playerSplitHandScore = (score(player_split_hand));
				//draw.text('Dealer:' + dealerHandScore, 15, canvas.height-310, 12, '#444444');
				draw.text(playerHandScore, 18, 224, 12, '#CCCCCC');
				draw.text(playerSplitHandScore, 18, 314, 12, '#CCCCCC');
				//canvas.getContext("2d").drawImage(arrowImage, 4, 164);
			}
		} else if (gameState == 'split_game_over') {
			if (score(dealer_hand) != null & score(player_hand) != null) {
				dealerHandScore = (score(dealer_hand));
				playerHandScore = (score(player_hand));
				playerSplitHandScore = (score(player_split_hand));
			draw.text('Dealer:' + dealerHandScore, 25, canvas.height-290, 12, '#CCCCCC');
			draw.text(playerHandScore, 18, 224, 12, '#CCCCCC');
			draw.text(playerSplitHandScore, 18, 314, 12, '#CCCCCC');
			}
		}
	}
	function drawStatusBar() {

		// var myGratiiLeft = 250;
		// if (myGratii < 10)
		// 	myGratiiLeft = 272;
		// if (myGratii >= 10 && myGratii < 100)
		// 	myGratiiLeft = 261;
		// if (myGratii >= 100 && myGratii < 1000)
		// 	myGratiiLeft = 250;
		// if (myGratii >= 1000 && myGratii < 10000)
		// 	myGratiiLeft = 239;
		// if (myGratii >= 10000 && myGratii < 100000)
		// 	myGratiiLeft = 228;
		// draw.text(myGratii, myGratiiLeft, 24, 16, '#FFFFFF'); //6
		// canvas.getContext("2d").drawImage(coinImage, 288, 5); //64

		var betIndicatorsLeft = 105;
		var betIndicatorsDisplayLeft = 198;
		draw.text('Current Bet:', betIndicatorsLeft, 25, 12, '#cbcbcb');
			draw.text(previousBet, betIndicatorsDisplayLeft, 25, 12, '#cbcbcb');

		/*draw.text('Total Won:', betIndicatorsLeft, 14, 12, '#FFFFFF');
			if (totalWon > 0) {
				draw.text('+', betIndicatorsDisplayLeft-13, 14, 12, '#67F16A');
				draw.text(totalWon, betIndicatorsDisplayLeft, 14, 12, '#67F16A');
			} else if (totalWon < 0) {
				draw.text(totalWon, betIndicatorsDisplayLeft-6, 14, 12, '#FFFFFF');
			} else {
				draw.text(totalWon, betIndicatorsDisplayLeft, 14, 12, '#FFFFFF');
			}*/

		//X Cashout #f0603e
		//? Help #f4e450
		// words #cbcbcb
		var helpLeft = 0;
		draw.line(helpLeft, 0, helpLeft, 34, 1, '#444444'); //222
		draw.text('?', helpLeft+14, 18, 18, '#f4e450'); //236
		draw.text('Help', helpLeft+7, 30, 10, '#cbcbcb'); //229

		//var cashOutLeft = 0;
		//draw.line(cashOutLeft, 0, cashOutLeft, 34, 1, '#444444'); //260
		// draw.text('X', cashOutLeft+24, 18, 18, '#f0603e'); //284
		// draw.text('Cash Out', cashOutLeft+5, 30, 10, '#cbcbcb'); //265

	}
	// *************** END USER INTERFACE LOGIC *************************
	//START MAIN VARIABLES
	var deck = new Deck();
	deck.shuffle();

	var cardback = new CardBack();
	var currentCard = 0;

	//variable to place bet buttons
	var firstBetButtonX = 160;

	//total current bet
	var betTotal = 0;
	var previousBet = 0;
	var totalWon = 0;
	var temporaryWon = 0;
	//player coins
	var myGratii = 0;
	getUserGratii();

	var gameState = 'bet'; // gameStates: bet, deal, play, game_over, split, split_game_over
	var winnerState = 'none'; // none, dealer, player, playerblackjack
	//var game_over = false; //old game_over variable, moved to gameState

	var cardShowState = false; // cardStates: false = dont draw, true = draw.

	var dealer_hand; //array to hold dealer cards
	var player_hand; //array to hold player cards
	//split stuff
	var player_split_hand; //array to hold split player cards
	var splitCurrentHand = 0; //split hand that you are playing

	var playerHandScore = 0;
	var playerSplitHandScore = 0;
	var dealerHandScore = 0;
	//END MAIN VARIABLES

	//START NEW BUTTONS
		// var ________ = new gameplayButton(X, Y, WIDTH, HEIGHT, TEXT, TEXTX, TEXTY)
		//bet
		var dealButton = new gameplayButton(120, canvas.height-75, 78, 74, "Deal", 140, canvas.height-19);
		//play
		var hitButton = new gameplayButton(4, canvas.height-75, 78, 74, "Hit", 31, canvas.height-19);
		var standButton = new gameplayButton(82, canvas.height-75, 78, 74, 'Stand', 97, canvas.height-19);
		var doubleButton = new gameplayButton(160, canvas.height-75, 78, 74, "Double", 168, canvas.height-19);
		var splitButton = new gameplayButton(238, canvas.height-75, 78, 74, "Split", 257, canvas.height-19);
		//game_over or split_game_over
		var clearButton = new gameplayButton(82, canvas.height-75, 78, 74, "Clear", 97, canvas.height-19);
		var rebetButton = new gameplayButton(160, canvas.height-75, 78, 74, "Re-Bet", 168, canvas.height-19);
		//split
		var splitHitButton = new gameplayButton(82, canvas.height-75, 78, 74, "Hit", 108, canvas.height-19);
		var splitStandButton = new gameplayButton(160, canvas.height-75, 78, 74, "Stand", 173, canvas.height-19);
		//21
		//really there should be no buttons drawn for the '21' state, because it should automatically declare the winner.

		//then do the same for the 'bet' buttons.

		//then do the same for the StatusBar buttons.
	//END NEW BUTTONS
	function iconsXValue() {
	//X value for the Clear 'x' and the gratii coin, dependent on how many digits in the bet.
		var clearLeft = 142;

		if (betTotal < 10) {
			// console.log('bettotal is less than 10');
			clearLeft += 16;
			return clearLeft;
		} else if (betTotal < 100) {
			// console.log('bettotal is less than 100');
			clearLeft += 16*2;
			return clearLeft;
		} else if (betTotal >= 100 && betTotal < 1000) {
			clearLeft += 16*3;
			return clearLeft;
		} else if (betTotal >= 1000 && betTotal < 10000) {
			clearLeft += 16*4;
			return clearLeft;
		} else if (betTotal >= 10000 && betTotal < 100000) {
			clearLeft += 16*5;
			return clearLeft;
		} else if (betTotal >= 100000) {
			clearLeft += 16*6;
			return clearLeft;
		}
	//canvas.getContext("2d").drawImage(coinImage, clearLeft, canvas.height/2-36);
	}
	function displayGameResults() {
	//drawTableCoin();
	var resultX = 110;
	var iconsX = iconsXValue();
	//if (betTotal > 0 && gameState == 'bet') {
		//ctx.globalAlpha = .9;
		//canvas.getContext("2d").drawImage(gImage, iconsX-10, canvas.height/2-40);
		//ctx.globalAlpha = 1;
		//}
		if (gameState != 'split' && gameState != 'split_game_over') {
			if (winnerState == 'player') {

				draw.text('+' + betTotal, resultX, canvas.height/2-20, 24, '#02e807');
				canvas.getContext("2d").drawImage(gPlusImage, iconsX-10, canvas.height/2-40);
				//canvas.getContext("2d").drawImage(coinImage, 170, canvas.height/2-50);
			} else if (winnerState == 'dealer'){
				draw.text(' -' + betTotal, resultX, canvas.height/2-20, 24, '#f0603e');
				canvas.getContext("2d").drawImage(gMinusImage, iconsX-10, canvas.height/2-40);
			} else if (winnerState == 'tie'){
				draw.text('Push', resultX+4, canvas.height/2-20, 24, '#CCCCCC');

			} else if (winnerState == 'none' && betTotal > 0 && gameState != 'split'){//bet:
				//ctx.globalAlpha = .1;
				//draw.circleoutline(160, canvas.height/2-20, 40, '#f4e450', 5);
				//ctx.globalAlpha = 1;
				if (gameState == 'bet') {
					//DRAW CLEAR BUTTON:

					ctx.globalAlpha = .6;
					draw.circle(iconsX+16, canvas.height/2-50, 8, '#F4E450');
					ctx.globalAlpha = .8;
					draw.text('x', iconsX+13, canvas.height/2-45, 12, '#cccccc');
					draw.text('x', iconsX+12, canvas.height/2-46, 12, '#222222');
					ctx.globalAlpha = 1;


					//CLEAR BUTTON click area
					//ctx.globalAlpha = .5;
					//draw.rect(112, canvas.height/2-72, iconsXValue()-60, 80, '#CC3300');
					//ctx.globalAlpha = 1;

				}
				draw.text(betTotal, resultX+20, canvas.height/2-20, 24, '#f4e450');
				canvas.getContext("2d").drawImage(gImage, iconsX-10, canvas.height/2-40);

			}  else if (winnerState == 'playerblackjack'){
				draw.text('+' + Math.round((5/2)*betTotal), resultX, canvas.height/2-20, 24, '#02e807');
				canvas.getContext("2d").drawImage(gPlusImage, iconsX-10, canvas.height/2-40);
			}


		} else if (gameState == 'split') {
			//if (winnerState == 'none'){ //move bet: if splitting
				draw.text('Your Bet:' + betTotal, 8, canvas.height/2-75, 14, '#f4e450');
				//betTotal /= 2;
			//}

		}  else if (gameState == 'split_game_over') {
			if (temporaryWon < 0 ) {
				draw.text(temporaryWon, canvas.width-84, 220, 16, '#f0603e');
			} else if (temporaryWon == 0) {
				draw.text('Push', canvas.width-90, 220, 16, '#CCCCCC');
			} else if (temporaryWon > 0) {
				draw.text('+' + temporaryWon, canvas.width-90, 220, 16, '#02e807');
			}
			//draw.text(playerHandScore, 18, 224, 12, '#CCCCCC');
			//draw.text(playerSplitHandScore, 18, 314, 12, '#CCCCCC');
			if (winnerState == 'player') {
				draw.text('+' + betTotal, canvas.width-90, 310, 16, '#02e807');
			} else if (winnerState == 'dealer'){
				draw.text(' -' + betTotal/2, canvas.width-90, 310, 16, '#f0603e');
			} else if (winnerState == 'tie'){
				draw.text('Push', canvas.width-90, 310, 16, '#CCCCCC');
			}
		}
	}


	function splashLoop() {
		if (instructionScreen == true) {
			canvas.getContext("2d").drawImage(instructionsImage, 0, 0);
		} else if (instructionScreen == false) {
			canvas.getContext("2d").drawImage(splashImage, 0, 0);
		}
	}
	function gameLoop() {
		if (splashScreen == true) {
			splashLoop();
		}else if (splashScreen == false) {
			draw.clear(); //clear the canvas every time this loops
			//draw background image
			//canvas.getContext("2d").drawImage(backgroundImage, 0, 0);

			//new deal
			if(cardShowState==true && betTotal > 0 && gameState == 'deal') {
				newGame();
				//createNewGame = 1;
				gameState = 'play';
			} else if (cardShowState==true && betTotal==0 && gameState == 'bet') {
				cardShowState=false;
				alert("You must place a bet to play at this table bro");
			}

			//Draw game state for TESTING
			//draw.text('Game State:' + gameState, 20, 50, 12, '#444444');
			//draw.text('Win State:' + winnerState, 20, 70, 12, '#444444');

			//DRAW CARDS
			drawCards();



			//DRAW BUTTONS, dependent on gameState (bet, play)
			drawButtons();

			//Show Bet Amount (if gameState is bet or play)
			//if (gameState == 'bet' || gameState == 'play')
			//IF GAMESTATE


			//Draw bottom status bar (my gratii, current bet, total won)
			drawStatusBar();

			drawScore();

			//draw split hand for testing
			//draw.text('Split Hand:' + splitCurrentHand, 4, 130, 16, '#FFFFFF');
			//CHECK IF NATURAL BLACKJACK
			displayGameResults();
			checkIfBlackjack(); //note: anything that comes after this will not draw

			//DRAW BET BUTTON OUTLINES
			//canvas.getContext("2d").drawImage(chipsImage, 160, canvas.height-138);
			//ctx.globalAlpha = 0.5;
			//draw.rect(firstBetButtonX, canvas.height-140, 49, 60, 'green'); //5
			//draw.rect(firstBetButtonX+50, canvas.height-142, 51, 60, 'red'); //25
			//draw.rect(firstBetButtonX+102, canvas.height-144, 57, 60, 'green'); //100

			//draw play button outline
			//draw.rect(82, canvas.height-75, 78, 74, 'green'); //100
		}
	}
	//gameLoop();

	var loopInterval = setInterval(gameLoop, 30);

	// ** START INPUT CONTROLS **

		//START TOUCH COUNTROLS

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
					clickButtons(touch.x, touch.y);
			}
		}

		//END TOUCH CONTROLS

		//START CLICK LISTENERS/CONTROLS
		if (touchDevice == false) {
			function clickHandler(e) {
			//alert("Click @ X: " + e.clientX + " Y: " + e.clientY);
			var offsets = canvas.getBoundingClientRect();
				var click = {
					x: e.clientX - offsets.left,
					y: e.clientY - offsets.top
				};
				clickButtons(click.x, click.y);
			}
			canvas.addEventListener('click', clickHandler, true);
		}
		console.log(touchDevice);
	// ** END INPUT CONTROLS **
}());