<?php

//-----------GET QUERIES----------------
function getRandomQuestion(){

	$getRandomQuestion = $GLOBALS['db'] -> prepare('SELECT id, question, 
														optionRight AS option1, 
														optionWrong1 AS option2,
														optionWrong2 AS option3 FROM trivia ORDER BY RAND() LIMIT 1');
	$getRandomQuestion -> execute();
	if($results = $getRandomQuestion -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$results[0]);	
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getQuestion($triviaID){
	if(!isset($triviaID) || $triviaID==""){
		return array("error"=>true,
					"msg"=>"No trivia ID provided");
	}

	$getQuestion = $GLOBALS['db'] -> prepare('SELECT * FROM trivia WHERE id=?');
	$getQuestion -> execute(array($triviaID));
	if($results = $getQuestion -> fetch(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$results);	
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}


//-----------UPDATE QUERIES----------------
function submitResponse($inputs){
	if(!isset($inputs[0]) || $inputs[0]==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs[0]['responseMatch']) || $inputs[0]['responseMatch']==""){
		return array("error"=>true,
					"msg"=>"No response provided");
	}
	if(!isset($inputs[0]['triviaID']) || $inputs[0]['triviaID']==""){
		return array("error"=>true,
					"msg"=>"No trivia ID provided");
	}

	if(strtoupper($inputs[0]['responseMatch'])==strtoupper("responseRight")){
		$submitResponse = $GLOBALS['db'] -> prepare('UPDATE trivia SET responseRight = responseRight+1, 
																			updatedAt=? WHERE id=?');
	}else if(strtoupper($inputs[0]['responseMatch'])==strtoupper("responseWrong1")){
		$submitResponse = $GLOBALS['db'] -> prepare('UPDATE trivia SET responseWrong1 = responseWrong1+1, 
																			updatedAt=? WHERE id=?');
	}else if(strtoupper($inputs[0]['responseMatch'])==strtoupper("responseWrong2")){
		$submitResponse = $GLOBALS['db'] -> prepare('UPDATE trivia SET responseWrong2 = responseWrong2+1, 
																			updatedAt=? WHERE id=?');
	}else{
		return array("error"=>true,
					"msg"=>"Invalid response match");
	}
	
	$submitResponse -> execute(array($GLOBALS['NOW'], $inputs[0]['triviaID']));
	
	$numRows = $submitResponse -> rowCount();							

	if($numRows==0){	
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{		
		return array('error' => false,
					'results' => $inputs[0]['triviaID']);
	}

	
}

//-----------INSERT QUERIES----------------

//-----------JOBS----------------
function getRandomQuestion_Job(){

	$randomQuestion = getRandomQuestion();
	if($randomQuestion['error']){
		return array("error"=>true,
					"msg"=>$randomQuestion['msg'],
					"requested"=>"Get random question");
	}
	$options = array("option1","option2","option3");
	shuffle($options);
	$results = array("id"=>$randomQuestion['results']['id'],
					"question"=>$randomQuestion['results']['question'],
					"option1"=>$randomQuestion['results'][$options['0']],
					"option2"=>$randomQuestion['results'][$options['1']],
					"option3"=>$randomQuestion['results'][$options['2']]);
	return array("error"=>false,
					"msg"=>"success",
					"results"=>$results);	

}

function response_Job(){
	$inputs = Input::all();
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs['response']) || $inputs['response']==""){
		return array("error"=>true,
					"msg"=>"No response provided");
	}
	if(!isset($inputs['triviaID']) || $inputs['triviaID']==""){
		return array("error"=>true,
					"msg"=>"No trivia ID provided");
	}

	$questionData = getQuestion($inputs['triviaID']);
	if($questionData['error']){
		return array("error"=>true,
					"msg"=>$questionData['msg'],
					"requested"=>"Get question");
	}
	$inputs['response'] = str_replace("\\", "", $inputs['response']);
	if(strtoupper($questionData['results']['optionRight'])==strtoupper($inputs['response'])){
		$result = "correct";
		$inputs['responseMatch'] = "responseRight";
		
	}elseif(strtoupper($questionData['results']['optionWrong1'])==strtoupper($inputs['response'])){
		$result = "wrong";
		$inputs['responseMatch'] = "responseWrong1";
	}
	elseif(strtoupper($questionData['results']['optionWrong2'])==strtoupper($inputs['response'])){
		$result = "wrong";
		$inputs['responseMatch'] = "responseWrong2";
	}else{
		return array("error"=>true,
						"msg"=>"Something is broken with this question.. sorry :(");
	}

	$submitResponse = submitResponse(array($inputs));
	if($submitResponse['error']){
		return array("error"=>true,
					"msg"=>$submitResponse['msg'],
					"requested"=>"Submit response");
	}

	return array("error"=>false,
					"msg"=>"success",
					"results"=>array("result"=>$result,
									"correctAnswer"=>$questionData['results']['optionRight']));	

}
//-----------TASKS----------------


?>