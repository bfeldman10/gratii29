<?php

//-----------GET QUERIES----------------
function getGameByToken($token){
	if(!isset($token) || $token==""){
		return array("error"=>true,
					"msg"=>"No token");
	}

	$getGame = $GLOBALS['db'] -> prepare('SELECT * FROM games WHERE gameToken = ? AND gameActiveUntil>?');
	$getGame -> execute(array($token, $GLOBALS['NOW']));
	if($results = $getGame -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getGameEvent($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs");
	}
	if(!isset($inputs['gameID']) || $inputs['gameID']==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}
	if(!isset($inputs['eventName']) || $inputs['eventName']==""){
		return array("error"=>true,
					"msg"=>"No event name provided");
	}

	$getGameEvent = $GLOBALS['db'] -> prepare('SELECT * FROM gameEvents WHERE gameID=? AND eventName=?');
	$getGameEvent -> execute(array($inputs['gameID'], $inputs['eventName']));
	if($results = $getGameEvent -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getHighScore($gameID, $userID=NULL){

	if(!isset($gameID) || $gameID==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}
	if($userID===NULL){
		if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
			return array("error"=>true,
						"msg"=>"No session found");
		}else{
			$userID = $_SESSION['userID'];
		}
	}else{
		$userID = $userID;
	}

	$getHighScore = $GLOBALS['db'] -> prepare('SELECT finalScore FROM finalScores WHERE gameID=? AND userID=?
																ORDER BY finalScore DESC LIMIT 1');
	$getHighScore -> execute(array($gameID, $userID));
	if($results = $getHighScore -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]['finalScore']);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getTop10($gameID){

	if(!isset($gameID) || $gameID==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}

	$getTop10 = $GLOBALS['db'] -> prepare('SELECT userID, max(finalScore) AS finalScore, userNickname, userAvatar
											FROM finalScores
											LEFT JOIN users ON users.id = finalScores.userID
											WHERE gameID = ?
											GROUP BY userID
											ORDER BY finalScore DESC LIMIT 10');
	$getTop10 -> execute(array($gameID));
	if($results = $getTop10 -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getTotalGratiiEarned($gameName, $userID=NULL){

	if(!isset($gameName) || $gameName==""){
		return array("error"=>true,
					"msg"=>"No game name provided");
	}
	if($userID===NULL){
		if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
			return array("error"=>true,
						"msg"=>"No session found");
		}else{
			$userID = $_SESSION['userID'];
		}
	}else{
		$userID = $userID;
	}

	$memo = "From playing ".$gameName;

	$getHighScore = $GLOBALS['db'] -> prepare('SELECT SUM(gratiiAmount) AS totalGratiiEarned
													FROM transactions WHERE memo=? AND userID=?');
	$getHighScore -> execute(array($memo, $userID));
	if($results = $getHighScore -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results['0']['totalGratiiEarned']);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}


//-----------UPDATE QUERIES----------------

//-----------INSERT QUERIES----------------
function saveFinalScore($inputs){ 
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs['gameID']) || $inputs['gameID']==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}
	if(!isset($inputs['finalScore']) || $inputs['finalScore']===""){
		return array("error"=>true,
					"msg"=>"No final score provided");
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
		return array("error"=>true,
					"msg"=>"No session found");
	}
	
	$createFinalScore = $GLOBALS['db'] -> prepare('INSERT INTO finalScores (userID, 
								gameID, finalScore, createdAt)
								VALUES (?, ?, ?, ?)');
	$createFinalScore -> execute(array($_SESSION['userID'], $inputs['gameID'], $inputs['finalScore'], $GLOBALS['NOW']));
	
	if($id = $GLOBALS['db']->lastInsertId()){ //Success. Final score created. Return new id.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error creating final score
		return array('error'=>true,
				    'msg'=>"Final score not created");
	}

	
}

//-----------JOBS----------------

//-----------TASKS----------------
function getGameEquations($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs");
	}
	if(!isset($inputs['gameID']) || $inputs['gameID']==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}

	if($inputs['gameID'] == "1"){ //Game ID 1 (Falling)
		$equations = array("gameOver"=>".005");
	}else if($inputs['gameID'] == "2"){ //Game ID 2 (Mutant Space Crabs)
		$equations = array("gameOver"=>"0",
							"coinGrab"=>"1");
	}else if($inputs['gameID'] == "3"){ //Game ID 3 (Snake)
		$equations = array("gameOver"=>"0",
							"coinGrab"=>"1");
	}else if($inputs['gameID'] == "4"){ //Game ID 4 (Blackjack)
		$equations = array("placeBet"=>"1",
							"lose"=>"1",
							"push"=>"1",
							"split"=>"1",
							"doubleDown"=>"1",
							"win"=>"1",
							"blackjack"=>"1");
	}else if($inputs['gameID'] == "5"){ //Game ID 5 (Pregame Trivia)
		$equations = array("gameOver"=>"0",
							"correctAnswer"=>"1");
	}else if($inputs['gameID'] == "6"){ //Game ID 6 (Lotterii)
		$equations = array("gameOver"=>"0");
	}else if($inputs['gameID'] == "7"){ //Game ID 7 (XXIV)
		$equations = array("gameOver"=>"1");
	}else if($inputs['gameID'] == "8"){ //Game ID 8 (Simon Says)
		$equations = array("gameOver"=>"1");
	}else if($inputs['gameID'] == "9"){ //Game ID 9 (Digga)
		$equations = array("gameOver"=>"0",
							"coinGrab"=>"1",
							"levelComplete"=>"5");
	}else if($inputs['gameID'] == "10"){ //Game ID 10 (Slots)
		$equations = array("placeBet"=>"1",
							"lose"=>"1",
							"double"=>"1",
							"triple"=>"1",
							"jackpot"=>"1");
	}else{
		return array("error"=>true,
						"msg"=>"Invalid game ID");
		die();
	}

	return array("error"=>false,
				"results"=>$equations);
}

?>