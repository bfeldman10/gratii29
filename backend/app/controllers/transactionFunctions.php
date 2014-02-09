<?php
//-----------------INSERT STATEMENTS----------------
function createTransaction($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	
	$createTransaction = $GLOBALS['db'] -> prepare('INSERT INTO transactions (userID, referenceTable, referenceTableID,
								meta, memo, gratiiAmount, newBalance, createdAt)
								VALUES (?,  ?, ?, ?, ?, ?, ?, ?)');
	$createTransaction -> execute(array($inputs['userID'], 
										$inputs['referenceTable'], 
										$inputs['referenceTableID'], 
										$inputs['meta'], 
										$inputs['memo'], 
										$inputs['gratiiAmount'], 
										$inputs['newBalance'], 
										$GLOBALS['NOW']));

	if($id = $GLOBALS['db']->lastInsertId()){ // Transaction created successfully. Returning the new id.
		return array('error'=>false,
				    'results'=>$id);
	}else{
		return array("error"=>true,
					"msg"=>"No transaction created");
	}
	
}


//----------------------JOBS--------------------
function createTransaction_Job($inputs, $receiver=NULL){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	$checkInputs = checkInputs($inputs); //Check inputs
	if($checkInputs['error']){ //Error checking inputs
		return array("error"=>true,
					"msg"=>$checkInputs['msg'],
					"requested"=>"Check inputs");
	}
	$inputs = $checkInputs['results']; //Update inputs with results from check
	include_once("userFunctions.php"); //Include user functions
	
	if(!isset($inputs['userID']) ||  $inputs['userID']==""){
		$inputs['userID'] = $_SESSION['userID'];
	}

	$userGratii = getUserGratiiByID($inputs['userID']); //Get user current gratii
	if($userGratii['error']){ //Error getting user gratii
		return array("error"=>true,
					"msg"=>$userGratii['msg'],
					"requested"=>"Get user gratii");
	}
	if($inputs['gratiiAmount']<0){
		if($userGratii['results']+$inputs['gratiiAmount']<0){
			return array("error"=>true,
					"msg"=>"You do not have enough gratii",
					"requested"=>"Get user gratii");
		}
	}

	$inputs['newBalance'] = ($userGratii['results']+$inputs['gratiiAmount']); //Calc user new balance. Add it to inputs.
	$updateUserGratii = updateUserGratii($inputs['userID'], $inputs['newBalance']);
	if($updateUserGratii['error']){ //Error creating transactions
		return array("error"=>true,
					"msg"=>$updateUserGratii['msg'],
					"requested"=>"Update user gratii");
	}

	$createTransaction = createTransaction($inputs); //Create transcation
	if($createTransaction['error']){ //Error creating transactions
		return array("error"=>true,
					"msg"=>$createTransaction['msg'],
					"requested"=>"Create transaction");
	}

	$userData = getUser($inputs['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user");
	}
	
	if($inputs['referenceTable']!="games"){
		if($userData['results']['userNodeID']!="---"){
			$dataForNode = array("userID"=>$inputs['userID'],
							"newBalance"=>$inputs['newBalance'],
							"changeInGratii"=>$inputs['gratiiAmount'],
							"userNodeID"=>$userData['results']['userNodeID']);
			$ch = curl_init(); //Init curl
			$curlConfig = array( //Curl config
			    CURLOPT_URL            => $GLOBALS['nodeRoot']."/command/transaction", //API endpoint
			    CURLOPT_POST           => true, //POST
			    CURLOPT_RETURNTRANSFER => true, //Return results
			    CURLOPT_POSTFIELDS     => $dataForNode //JSON data to post
			);
			curl_setopt_array($ch, $curlConfig); //Finish config
			$result = curl_exec($ch); //Results returned from API
			if($result!="success"){ //Not success
				curl_close($ch); //Close curl
				return array("error"=>true, //Return error
							"msg"=>"CURL Error: ".$result,
							"requested"=>"CURL to node");
				die();
			}
			curl_close($ch); //Close curl. Success
		}
	}

	return array("error"=>false, //Success. Transaction created. Return transaction ID.
				"results"=>$createTransaction['results']);

}

//----------------TASKS-----------------
function checkInputs($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs['memo']) || $inputs['memo']==""){ //No memo provided
		return array("error"=>true,
					"msg"=>"No memo provided");
	}
	if(!isset($inputs['gratiiAmount']) || $inputs['gratiiAmount']==""){ //No gratii amount provided
		return array("error"=>true,
					"msg"=>"No gratii amount provided");
	}
	if(!isset($inputs['meta']) || $inputs['meta']==""){ //No meta provided, set default
		$inputs['meta'] = "---";
	}else{ //Meta provided, convert array to string
		$inputs['meta'] = serialize($inputs['meta']);
	}

	return array("error"=>false, //Return reformatted inputs
				"results"=>$inputs);

}

?>