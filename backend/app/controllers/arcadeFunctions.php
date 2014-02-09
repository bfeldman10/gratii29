<?php

//-----------GET QUERIES----------------
function getAllArcadeGames($receiver=NULL){

	try{

		if($receiver===NULL||$receiver=="admin"){ //Admin. Select all.
			$getAllArcade = $GLOBALS['db']->prepare('SELECT * FROM arcade ORDER BY displayRank');
		}else if($receiver=="user"||$receiver=="demo"){ //Internal. Default weak permissions.
			$getAllArcade = $GLOBALS['db']->prepare('SELECT * FROM arcade WHERE adminOnly=0 ORDER BY displayRank');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");		
		}

		$getAllArcade -> execute();
		if($results = $getAllArcade -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}


function getArcadeGame($arcadeID){
	if(!isset($arcadeID) || $arcadeID==""){
		return array("error"=>true,
					"msg"=>"No game ID provided");
	}

	$getArcadeGame = $GLOBALS['db'] -> prepare('SELECT * FROM arcade WHERE id = ?');
	$getArcadeGame -> execute(array($arcadeID));
	if($results = $getArcadeGame -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}


//-----------UPDATE QUERIES----------------

//-----------INSERT QUERIES----------------

//-----------JOBS----------------
function getArcade_Job($receiver=NULL){
	include_once("userFunctions.php");

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Full permissions.
		$demo = false;
		$PRO = true;
	}else if($receiver=="demo"){ //Demo. Weak permission.
		$demo = true;
		$PRO = false;
	}else if($receiver=="user"){ //User. Check permissions.
		$demo = false;

		$userData = getUser($_SESSION['userID']);
		if($userData['error']){ //Error finding using
			return array("error"=>true,
						"msg"=>$userData['msg']);
			die();
		}else{ //User found
			if($userData['results']['PRO']>$GLOBALS['NOW']){ //User is PRO 
				$PRO = true;
			}else{ //User not PRO
				$PRO = false;
			}
		}
	}
	
	$activatedUsers = countActivatedUsers();
	if($activatedUsers['error']){ //Error counting total activated users
		return array("error"=>true,
					"msg"=>$activatedUsers['msg']);
	}else{ //Total activated users
		$activatedUsers = $activatedUsers['results']['count'];
	}

	$arcadeList = getAllArcadeGames($receiver);
	if($arcadeList['error']){
		return array("error"=>true,
					"msg"=>$arcadeList['msg']);
		die();
	}

	foreach ($arcadeList['results'] as $arcadeGame) {
		if($arcadeGame['demo']==0){ //Blocked from demo
			if($demo){ //Demo entity. Lock engaged.
				$locked = array("locked"=>1,
							"reasonForLock"=>"Users only");
			}
		}else if($arcadeGame['usersToUnlock']>$activatedUsers){ //User count requirement not met.
			if(!$PRO){ //User not PRO. Lock engaged.
				$locked = array("locked"=>1,
							"reasonForLock"=>"Not enough users",
							"availableToPRO"=>1,
							"usersToUnlock"=>$arcadeGame['usersToUnlock']);
			}else{ //PRO account. Unlocked.
					$locked = array("locked"=>0);
			}
		}else{ //Available to demo
			$locked = array("locked"=>0);
		}

		include_once("gameEventFunctions.php"); //Include game events
		$equations = getGameEquations(array("gameID"=>$arcadeGame['gameID']));
		if($equations['error']){
			return array("error"=>true,
						"requested"=>"Get equations",
						"msg"=>$equations['msg']);
			die();
		}

		if($receiver=="user"){
			$highScore = getHighScore($arcadeGame['gameID']);
			if($highScore['error']){
				if($highScore['msg']=="404"){
					$highScore = NULL;
				}else{
					return array("error"=>true,
								"requested"=>"Get high scores",
								"msg"=>$highScore['msg']);
					die();
				}
			}
			$totalGratiiEarned = getTotalGratiiEarned($arcadeGame['arcadeGameName']);
			if($totalGratiiEarned['error']){
				if($totalGratiiEarned['msg']=="404"){
					$totalGratiiEarned = NULL;
				}else{
					return array("error"=>true,
								"requested"=>"Get total gratii earned",
								"msg"=>$totalGratiiEarned['msg']);
					die();
				}
			}
		}else{
			$highScore = NULL;
			$totalGratiiEarned = NULL;
		}

		$top10 = getTop10($arcadeGame['gameID']);
		if($top10['error']){
			if($top10['msg']=="404"){
				$top10 = NULL;
			}else{
				return array("error"=>true,
							"requested"=>"Get top 10",
							"msg"=>$top10['msg']);
				die();
			}
		}else{
			foreach ($top10['results'] as &$topScore) { //Process each live auction individually
				$userData = getUser($topScore['userID']); 
				if($userData['error']){ //Error getting max bid data
					return array("error"=>true,
								"msg"=>$userData['msg']);
				}else{ //Max bid data retrieved
					$topScore['userNickname'] = $userData['results']['userNickname']; //Injecting max bid amount
					$topScore['userAvatar'] = $userData['results']['userAvatar']; //Injecting max bid amount
				}
			}
		}


		
		$results[] = array("id"=>$arcadeGame['id'],
						 "gameName"=>$arcadeGame['arcadeGameName'],
						 "gameImage"=>$arcadeGame['arcadeGameImage'],
						 "gameBackgroundColor"=>$arcadeGame['arcadeGameBackgroundColor'],
						 "gameFontColor"=>$arcadeGame['arcadeGameFontColor'],
						 "category"=>$arcadeGame['category'],
						 "challengeable"=>$arcadeGame['challengeable'],
						 "demoable" => $arcadeGame['demo'],
						 "locked"=>$locked,
						 "equations"=>$equations['results'],
						 "highScore"=>$highScore['results'],
						 "top10"=>$top10['results'],
						 "totalGratiiEarned"=>$totalGratiiEarned['results']);
	}
	
	return array("error"=>false,
				"results"=>$results);

}

//-----------TASKS----------------

?>