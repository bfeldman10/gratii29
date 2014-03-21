<?php

//-----------GET QUERIES----------------
function getJackpot(){

	$getJackpot = $GLOBALS['db'] -> prepare('SELECT * FROM slotsOutcomes WHERE outcomeName=?');
	$getJackpot -> execute(array("jackpot"));
	if($results = $getJackpot -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$results[0]);	
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getOutcomes(){

	$getOutcomes = $GLOBALS['db'] -> prepare('SELECT * FROM slotsOutcomes');
	$getOutcomes -> execute();
	if($results = $getOutcomes -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$results);	
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}


//-----------UPDATE QUERIES----------------
function increaseJackpot($gratiiBet){
	if(!isset($gratiiBet) || $gratiiBet==""){
		return array("error"=>true,
					"msg"=>"No bet provided");
	}
	$increaseAmount = ceil($gratiiBet*.1);
	$updateJackpot = $GLOBALS['db'] -> prepare('UPDATE slotsOutcomes SET outcomePayout=(outcomePayout+?), updatedAt=?
												 WHERE outcomeName=?');
	$updateJackpot -> execute(array($increaseAmount, $GLOBALS['NOW'], "jackpot"));	
	$numRows = $updateJackpot -> rowCount();							
	if($numRows==0){ //Error updating jackpot
		return array('error'=>true,
				    'msg'=>"Jackpot not updated");
	}else{ //Success. Jackpot updated.
		return array('error'=>false,
				    'msg'=>"Jackpot updated");
	}
}

function resetJackpot($previousPayout){
	if(!isset($previousPayout) || $previousPayout==""){
		return array("error"=>true,
					"msg"=>"No previous payout provided");
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
		return array("error"=>true,
					"msg"=>"No session found");
	}
	$updateJackpot = $GLOBALS['db'] -> prepare('UPDATE slotsOutcomes 
												SET outcomePayout=0, previousWinnerID=?, previousPayout=?, updatedAt=?
												WHERE outcomeName=?');
	$updateJackpot -> execute(array($_SESSION['userID'], $previousPayout, $GLOBALS['NOW'], "jackpot"));	
	$numRows = $updateJackpot -> rowCount();							
	if($numRows==0){ //Error updating jackpot
		return array('error'=>true,
				    'msg'=>"Jackpot not updated.");
	}else{ //Success. Jackpot updated.
		return array('error'=>false,
				    'msg'=>"Jackpot updated");
	}
}

//-----------INSERT QUERIES----------------

//-----------JOBS----------------
function spinWheels(){
	$gratiiBet = Input::get('gratiiBet');
	if(!isset($gratiiBet) || $gratiiBet==""){
		return array("error"=>true,
					"msg"=>"No bet provided");
	}
	$outcomes = getOutcomes();
	if($outcomes['error']){
		return array("error"=>true,
					"msg"=>$outcomes['msg'],
					"requested"=>"Get outcomes");	
	}
	foreach ($outcomes['results'] as $outcome) {
		$i = 0;
		while($i < $outcome['outcomeChance']){
			$outcomesArray[] = array("outcomeName"=>$outcome['outcomeName'],
									"outcomePayout"=>$outcome['outcomePayout']) ;
			$i++;
		}
	}
	$randomize = array_rand($outcomesArray);
	$randomOutcome = $outcomesArray[$randomize];
	if($randomOutcome['outcomeName']=="jackpot"){
		$result = array("outcomeName"=>$randomOutcome['outcomeName'],
					"gratiiResult"=>$gratiiBet+$randomOutcome['outcomePayout']);
		$resetJackpot = resetJackpot($randomOutcome['outcomePayout']);
		if($resetJackpot['error']){
			return array("error"=>true,
						"msg"=>$resetJackpot['msg'],
						"requested"=>"Reset jackpot");	
		}
	}else if($randomOutcome['outcomeName']=="lose"){
		$result = array("outcomeName"=>$randomOutcome['outcomeName'],
					"gratiiResult"=>0);
		$increaseJackpot = increaseJackpot($gratiiBet);
		if($increaseJackpot['error']){
			return array("error"=>true,
						"msg"=>$increaseJackpot['msg'],
						"requested"=>"Increase jackpot");	
		}
	}else{
		$result = array("outcomeName"=>$randomOutcome['outcomeName'],
					"gratiiResult"=>$gratiiBet*$randomOutcome['outcomePayout']);
	}

	$jackpotData = getJackpot_Job();
	if($jackpotData['error']){
		return array("error"=>true,
					"msg"=>$jackpotData['msg'],
					"requested"=>"Get jackpot");	
	}

	$result['currentJackpot'] = $jackpotData['results']['currentJackpot'];
	$result['previousJackpot'] = $jackpotData['results']['previousJackpot'];
	$result['previousWinnerID'] = $jackpotData['results']['previousWinnerID'];
	$result['previousWinnerNickname'] = $jackpotData['results']['previousWinnerNickname'];
	$result['previousWinnerAvatar'] = $jackpotData['results']['previousWinnerAvatar'];

	
	return array("error"=>false,
				"results"=>$result);
}

function getJackpot_Job(){
	$jackpotData = getJackpot();
	if($jackpotData['error']){
		return array("error"=>true,
					"msg"=>$jackpotData['msg'],
					"requested"=>"Get jackpot");	
	}


	include_once("userFunctions.php");
	if($jackpotData['results']['previousWinnerID']){
		
		$userData = getUser($jackpotData['results']['previousWinnerID']);
		if($userData['error']){
			return array("error"=>true,
						"msg"=>$userData['msg'],
						"requested"=>"Get user");	
		}
		$results = array("currentJackpot"=>$jackpotData['results']['outcomePayout'],
					"previousJackpot"=>$jackpotData['results']['previousPayout'],
					"previousWinnerID"=>$jackpotData['results']['previousWinnerID'],
					"previousWinnerNickname"=>$userData['results']['userNickname'],
					"previousWinnerAvatar"=>$userData['results']['userAvatar']);
	}else{
		$results = array("currentJackpot"=>$jackpotData['results']['outcomePayout'],
					"previousJackpot"=>"0",
					"previousWinnerID"=>"---",
					"previousWinnerNickname"=>"---",
					"previousWinnerAvatar"=>"---");
	}
	
	
	return array("error"=>false,
				"results"=>$results);
}

//-----------TASKS----------------
function start(){

	$jackpotData = getJackpot_Job();
	if($jackpotData['error']){
		return array("error"=>true,
					"msg"=>$jackpotData['msg'],
					"requested"=>"Get jackpot");	
	}
	
	return array("error"=>false,
				"results"=>$jackpotData['results']);
}




?>