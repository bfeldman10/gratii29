<?php
//-----------------SELECT STATEMENTS----------------
function getChallenge($challengeID,$receiver=NULL){
	if(!isset($challengeID) || $challengeID == ""){
		return array("error"=>true,
					"msg"=>"No challenge ID provided");
	}

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getChallenge = $GLOBALS['db'] -> prepare('SELECT * FROM challenges WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getChallenge -> execute(array($challengeID));
		if($results = $getChallenge -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Challenge not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}
	
}

//----------------UPDATE QUERIES------------------
function updateChallengerScore($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No score provided");
	}

	$updateChallenge = $GLOBALS['db'] -> prepare('UPDATE challenges SET challengerScore=?, challengerPlayedAt=?, updatedAt=?
												 WHERE id=?');
	$updateChallenge -> execute(array($inputs['score'], $GLOBALS['NOW'], $GLOBALS['NOW'], $inputs['challengeID']));	
	$numRows = $updateChallenge -> rowCount();							
	if($numRows==0){ //Error updating challenge
		return array('error'=>true,
				    'msg'=>"Challenge not updated");
	}else{ //Success. Challenge updated.
		return array('error'=>false,
				    'msg'=>"Challenge updated");
	}
}


function completeChallenge($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No score provided");
	}

	$updateChallenge = $GLOBALS['db'] -> prepare('UPDATE challenges SET opponentScore=?, opponentPlayedAt=?, updatedAt=?
												 WHERE id=?');
	$updateChallenge -> execute(array($inputs['score'], $GLOBALS['NOW'], $GLOBALS['NOW'], $inputs['challengeID']));	
	$numRows = $updateChallenge -> rowCount();							
	if($numRows==0){ //Error updating challenge
		return array('error'=>true,
				    'msg'=>"Challenge not updated");
	}else{ //Success. Challenge updated.
		return array('error'=>false,
				    'msg'=>"Challenge updated");
	}
}

function acceptChallenge($challengeID){
	if(!isset($challengeID) || $challengeID==""){
		return array("error"=>true,
					"msg"=>"No challenge ID provided");
	}

	$updateChallenge = $GLOBALS['db'] -> prepare('UPDATE challenges SET totalWagerAmount=totalWagerAmount*2,
																		 updatedAt=?
												 					WHERE id=?');
	$updateChallenge -> execute(array($GLOBALS['NOW'], $challengeID));	
	$numRows = $updateChallenge -> rowCount();							
	if($numRows==0){ //Error updating challenge
		return array('error'=>true,
				    'msg'=>"Challenge not updated");
	}else{ //Success. Challenge updated.
		return array('error'=>false,
				    'msg'=>"Challenge updated");
	}
}

//-----------------INSERT STATEMENTS----------------
function createChallenge($inputs){ 
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	
	$createChallenge = $GLOBALS['db'] -> prepare('INSERT INTO challenges (challengerID, 
								arcadeID, opponentID, totalWagerAmount, createdAt)
								VALUES (?, ?, ?, ?, ?)');
	$createChallenge -> execute(array($_SESSION['userID'], 
								$inputs['arcadeID'], $inputs['opponentID'], $inputs['gratiiWager'], $GLOBALS['NOW']));
	
	if($id = $GLOBALS['db']->lastInsertId()){ //Success. Challenge created. Return new id.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error creating challenge
		return array('error'=>true,
				    'msg'=>"Challenge not created");
	}

	
}

//----------------------JOBS--------------------
function createChallenge_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}else if($receiver!="user"){
		return array("error"=>true,
					"msg"=>"Invalid receiver");
	}

	$inputs = Input::all(); //Get inputs from json

	if(!isset($inputs) || $inputs==""){ //No json found
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	if(!isset($inputs['gratiiWager']) || $inputs['gratiiWager']==""){ //No gratii wager provided
		return array("error"=>true,
					"msg"=>"No gratii wager provided");
	}
	if(!isset($inputs['arcadeID']) || $inputs['arcadeID']==""){ //No arcade id provided
		return array("error"=>true,
					"msg"=>"No arcade ID provided");
	}
	if(!isset($inputs['opponentNickname']) || $inputs['opponentNickname']==""){ //No opponenent nickname provided
		return array("error"=>true,
					"msg"=>"No opponent nickname provided");
	}
	if(!isset($_SESSION['userID'])){ //No user id found in session
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}

	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user data");
	}

	if($userData['results']['PRO']<$GLOBALS['NOW']){
		return array("error"=>true,
					"msg"=>"PRO##Only PRO accounts can send challenges");
	}
	if($inputs['gratiiWager']>500){
		return array("error"=>true,
					"msg"=>"Max wager is 500");
	}
	
	$opponentData = getUserIDByUserNickname($inputs['opponentNickname']); //Get opponent id from nickname
	if($opponentData['error']){ //Error getting opponent id
		return array("error"=>true,
					"msg"=>$opponentData['msg'],
					"requested"=>"Get user ID by nickname");
	}

	$inputs['opponentID'] = $opponentData['results']; //Inject opponent nickname into inputs

	$createChallenge = createChallenge($inputs); //Create challenge
	if($createChallenge['error']){ //Error creating challenge
		return array("error"=>true,
					"msg"=>$createChallenge['msg'],
					"requested"=>"Create challenge");
	}

	include_once("transactionFunctions.php"); //Include transaction functions
	$memo = "Challenged ".$inputs['opponentNickname'];
	$recordTransaction = createTransaction_Job(array("memo"=>$memo,
													"gratiiAmount"=>-1*$inputs['gratiiWager'],
													"referenceTable"=>"challenges",
													"referenceTableID"=>$createChallenge['results']));
	if($recordTransaction['error']){
		return array("error"=>true,
					"msg"=>$recordTransaction['msg'],
					"requested"=>"Create transaction job");
	}

	return array("error"=>false, //Success. Challenge issued.
				"msg"=>"success",
				"results"=>$createChallenge['results']);
}

function issueChallenge_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}else if($receiver!="user"){
		return array("error"=>true,
					"msg"=>"Invalid receiver");
	}

	$inputs = Input::all(); //Get inputs from json

	if(!isset($inputs) || $inputs==""){ //No json found
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	if(!isset($inputs['score']) || $inputs['score']==""){ //No score provided
		return array("error"=>true,
					"msg"=>"No score provided");
	}
	if(!isset($inputs['challengeID']) || $inputs['challengeID']==""){ //No opponenent nickname provided
		return array("error"=>true,
					"msg"=>"No challenge ID provided");
	}
	if(!isset($_SESSION['userID'])){ //No user id found in session
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}

	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user data");
	}

	$challengeData = getChallenge($inputs['challengeID']); //Get challenge data
	if($challengeData['error']){ //Error getting challenge data
		return array("error"=>true,
					"msg"=>$challengeData['msg'],
					"requested"=>"Get challenge data");
	}

	include_once("arcadeFunctions.php"); //Include arcade functions
	$arcadeGameData = getArcadeGame($challengeData['results']['arcadeID']); //Get arcade data
	if($arcadeGameData['error']){ //Error getting arcade data
		return array("error"=>true,
					"msg"=>$arcadeGameData['msg'],
					"requested"=>"Get arcade game data");
	}
	
	if($challengeData['results']['challengerScore']!="---"){
		return array("error"=>true,
					"msg"=>"You've already played this challenge");
	}

	$recordScore = updateChallengerScore($inputs);
	if($recordScore['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$recordScore['msg'],
					"requested"=>"Update challenger score");
	}

	include_once("msgFunctions.php"); //Include msg functions
	$body = $userData['results']['userNickname']." challenged you to ".$arcadeGameData['results']['arcadeGameName']." for ".
			$challengeData['results']['totalWagerAmount']." gratii."; //Format msg body
	$sendChallenge = createMsg_Job(array("senderID"=>$inputs['challengeID'], //Send challenge msg
										"recipientIDs"=>array($challengeData['results']['opponentID']),
										"senderEntity"=>"challenge",
										"title"=>"You have a new challenge",
										"body"=>$body,
										"template"=>"issueChallenge",
										"optionA"=>"Let's do it",
										"optionB"=>"I'll pass",
										"gratiiReward"=>"0",
										"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
										"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
										"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
										"meta"=>array("challengerID"=>$_SESSION['userID'])));
	if($sendChallenge['error']){ //Error sending challenge msg
		return array("error"=>true,
					"msg"=>$sendChallenge['msg'],
					"requested"=>"Send challenge");
	}

	return array("error"=>false, //Success. Challenge issued.
				"msg"=>"success",
				"results"=>"Challenge issued");
}


function completeChallenge_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}else if($receiver!="user"){
		return array("error"=>true,
					"msg"=>"Invalid receiver");
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
		return array("error"=>true,
					"msg"=>"User session not found");
	}
	
	$inputs = Input::all(); //Get inputs from json

	if(!isset($inputs) || $inputs==""){ //No json found
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}else if(!isset($inputs['score']) || $inputs['score']==""){
		return array("error"=>true,
					"msg"=>"No score provided");
	}else if(!isset($inputs['challengeID']) || $inputs['challengeID']==""){
		return array("error"=>true,
					"msg"=>"No challenge id provided");
	}

	$challengeData = getChallenge($inputs['challengeID']); //Get challenge data before submitting score
	if($challengeData['error']){ //Error getting challenge data
		return array("error"=>true,
					"msg"=>$challengeData['msg'],
					"requested"=>"Get challenge data");
	}

	if($challengeData['results']['opponentScore']!="---"){ //If score already exists, error
		return array("error"=>true,
					"msg"=>"You've already played this challenge");
	}

	$completeChallenge = completeChallenge($inputs); //Complete challenge, submit score
	if($completeChallenge['error']){ //Error completeing challenge
		return array("error"=>true,
					"msg"=>$completeChallenge['msg'],
					"requested"=>"Complete challenge");
	}

	$challengeData['results']['opponentScore'] = $inputs['score']; //Inject score into challenge data

	include_once("arcadeFunctions.php"); //Inlcude arcade functions
	$arcadeGameData = getArcadeGame($challengeData['results']['arcadeID']); //Get arcade game data
	if($arcadeGameData['error']){ //Error getting arcade game data
		return array("error"=>true,
					"msg"=>$arcadeGameData['msg'],
					"requested"=>"Get arcade game data");
	}

	include_once("userFunctions.php"); //Inlcude user functions
	$challengerData = getUser($challengeData['results']['challengerID']); //Get user data for challenger
	if($challengerData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$challengerData['msg'],
					"requested"=>"Get user data");
	}

	$opponentData = getUser($_SESSION['userID']); //Get user data for opponent
	if($opponentData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$opponentData['msg'],
					"requested"=>"Get user data");
	}

	include_once("msgFunctions.php"); //Inlcude msg functions
	if($challengeData['results']['opponentScore']=="forfeit"){
		$body = $opponentData['results']['userNickname']." forfeited your challenge";
		$returnWager = createMsg_Job(array("senderID"=>$challengeData['results']['id'], //Send challenge msg
											"recipientIDs"=>array($challengeData['results']['challengerID']),
											"senderEntity"=>"challenge",
											"title"=>"Your challenge was forfeited",
											"body"=>$body,
											"template"=>"forfeitChallenge",
											"gratiiReward"=>$challengeData['results']['totalWagerAmount'],
											"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
											"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
											"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
											"meta"=>array("opponentID"=>$challengeData['results']['challengerID'])));
	}else if($challengeData['results']['challengerScore']==$challengeData['results']['opponentScore']){ //If scores are equal
		$body = "You tied ".$opponentData['results']['userNickname']; //Draw body 1
		$finalScore = $challengeData['results']['challengerScore']." - ".$challengeData['results']['opponentScore'];
		$sendDrawMessage = createMsg_Job(array("senderID"=>$challengeData['results']['id'], //Send challenge msg
										"recipientIDs"=>array($challengeData['results']['challengerID']),
										"senderEntity"=>"challenge",
										"title"=>"Challenge results",
										"body"=>$body,
										"footer"=>$finalScore,
										"template"=>"drawChallenge",
										"gratiiReward"=>($challengeData['results']['totalWagerAmount']/2),
										"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
										"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
										"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
										"meta"=>array("opponentID"=>$challengeData['results']['opponentID'])));
		if($sendDrawMessage['error']){ //Error sending msg
			return array("error"=>true,
						"msg"=>$sendDrawMessage['msg'],
						"requested"=>"Create message");
		}

		$body = "You tied ".$challengerData['results']['userNickname']; //Draw msg 2
		$sendDrawMessage = createMsg_Job(array("senderID"=>$challengeData['results']['id'], //Send challenge msg
										"recipientIDs"=>array($challengeData['results']['opponentID']),
										"senderEntity"=>"challenge",
										"title"=>"Challenge results",
										"body"=>$body,
										"footer"=>$finalScore,
										"template"=>"drawChallenge",
										"gratiiReward"=>($challengeData['results']['totalWagerAmount']/2),
										"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
										"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
										"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
										"meta"=>array("challengerID"=>$challengeData['results']['challengerID'])));
		if($sendDrawMessage['error']){ //Error sending msg
			return array("error"=>true,
						"msg"=>$sendDrawMessage['msg'],
						"requested"=>"Create message");
		}
	}else{ 
		if($challengeData['results']['challengerScore']>$challengeData['results']['opponentScore']){ //Challenger won
			$winnerID = $challengeData['results']['challengerID'];
			$winnerNickname = $challengerData['results']['userNickname'];
			$loserID = $challengeData['results']['opponentID'];
			$loserNickname = $opponentData['results']['userNickname'];
			$finalScore = $challengeData['results']['challengerScore']." - ".$challengeData['results']['opponentScore'];
		}else{ //Opponent won
			$winnerID = $challengeData['results']['opponentID'];
			$winnerNickname = $opponentData['results']['userNickname'];
			$loserID = $challengeData['results']['challengerID'];
			$loserNickname = $challengerData['results']['userNickname'];
			$finalScore = $challengeData['results']['opponentScore']." - ".$challengeData['results']['challengerScore'];
		}

		$body = "You beat ".$loserNickname."!"; //Winner body
		$sendWinMessage = createMsg_Job(array("senderID"=>$challengeData['results']['id'], //Send challenge msg
										"recipientIDs"=>array($winnerID),
										"senderEntity"=>"challenge",
										"title"=>"Challenge results",
										"body"=>$body,
										"footer"=>$finalScore,
										"template"=>"winChallenge",
										"gratiiReward"=>$challengeData['results']['totalWagerAmount'],
										"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
										"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
										"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
										"meta"=>array("loserID"=>$loserID)));
		if($sendWinMessage['error']){ //Error sending winner msg
			return array("error"=>true,
						"msg"=>$sendWinMessage['msg'],
						"requested"=>"Create message");
		}

		$body = "You lost to ".$winnerNickname." :("; //Loser body
		$sendLoseMessage = createMsg_Job(array("senderID"=>$challengeData['results']['id'], //Send challenge msg
										"recipientIDs"=>array($loserID),
										"senderEntity"=>"challenge",
										"title"=>"Challenge results",
										"body"=>$body,
										"footer"=>$finalScore,
										"template"=>"loseChallenge",
										"gratiiReward"=>"0",
										"msgBackgroundPic"=>$arcadeGameData['results']['arcadeGameImage'],
										"msgBackgroundColor"=>$arcadeGameData['results']['arcadeGameBackgroundColor'],
										"msgFontColor"=>$arcadeGameData['results']['arcadeGameFontColor'],
										"meta"=>array("winnerID"=>$winnerID)));
		if($sendLoseMessage['error']){ //Error sending loser msg
			return array("error"=>true,
						"msg"=>$sendLoseMessage['msg'],
						"requested"=>"Create message");
		}
	}

	return array("error"=>false, //Success
				"results"=>"Challenge complete");


}

function acceptChallenge_Job($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}
	if(!isset($inputs['senderID']) || $inputs['senderID']==""){
		return array("error"=>true,
					"msg"=>"No challenge ID provided");
	}

	$challengeData = getChallenge($inputs['senderID']);
	if($challengeData['error']){
		return array("error"=>true,
					"msg"=>$challengeData['msg'],
					"requested"=>"Create transaction job");
	}

	include_once("userFunctions.php");
	$userData = getUser($_SESSION['userID']);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user data");
	}

	$acceptChallenge = acceptChallenge($inputs['senderID']);
	if($acceptChallenge['error']){
		return array("error"=>true,
					"msg"=>$acceptChallenge['msg'],
					"requested"=>"Accept challenge");
	}

	include_once("transactionFunctions.php"); //Include transaction functions
	$memo = "Accepted challenge";
	$recordTransaction = createTransaction_Job(array("memo"=>$memo,
														"gratiiAmount"=>-1*$challengeData['results']['totalWagerAmount'],
														"referenceTable"=>"challenges",
														"referenceTableID"=>$challengeData['results']['id']));
	if($recordTransaction['error']){
		return array("error"=>true,
					"msg"=>$recordTransaction['msg'],
					"requested"=>"Create transaction job");
	}
	

	return array("error"=>false,
				"results"=>"Challenge accepted");


}
//----------------TASKS-----------------
function checkContents($contents){
	if(!isset($contents) || $contents==""){
		return array("error"=>true,
					"msg"=>"No contents provided");
	}
	if(!isset($contents['score']) || $contents['score']==""){ //No score provided
		return array("error"=>true,
					"msg"=>"No score provided");
	}
	if(!isset($contents['gratiiWager']) || $contents['gratiiWager']==""){ //No gratii wager provided
		return array("error"=>true,
					"msg"=>"No gratii wager provided");
	}
	if(!isset($contents['arcadeID']) || $contents['arcadeID']==""){ //No arcade id provided
		return array("error"=>true,
					"msg"=>"No arcade ID provided");
	}
	if(!isset($contents['opponentNickname']) || $contents['opponentNickname']==""){ //No opponenent nickname provided
		return array("error"=>true,
					"msg"=>"No opponent nickname provided");
	}
	if(!isset($_SESSION['userID'])){ //No user id found in session
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}
	
	return array("error"=>false); //Contents OK
}

?>