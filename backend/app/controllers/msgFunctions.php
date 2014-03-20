<?php

//-----------GET QUERIES----------------
function getMsg($msgID,$receiver=NULL){
	if(!isset($msgID) || $msgID == ""){
		return array("error"=>true,
					"msg"=>"No msg ID provided");
	}

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getMsg = $GLOBALS['db'] -> prepare('SELECT * FROM msgs WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getMsg -> execute(array($msgID));
		if($results = $getMsg -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //User not found
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

function getWinnerMsg($auctionID, $receiver=NULL){
	if(!isset($auctionID) || $auctionID == ""){
		return array("error"=>true,
					"msg"=>"No auction ID provided");
	}
	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getWinnerMsg = $GLOBALS['db'] -> prepare('SELECT * FROM msgs
														WHERE template=? AND senderID=?');
		$getWinnerMsg -> execute(array("winAuction", $auctionID));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	if($results = $getWinnerMsg -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

function getSurveyGroupsForEntity($senderEntity, $receiver=NULL){
	if(!isset($senderEntity) or $senderEntity==""){ //No sender entity provided
		return array("error"=>true,
					"msg"=>"No senderEntity provided");
		die();
	}
	if(!isset($receiver) or $receiver==""){ //No receiver provided
		return array("error"=>true,
					"msg"=>"No receiver provided");
		die();
	}
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid receiver");
		die();
	}
	
	$getSurveys = $GLOBALS['db'] -> prepare('SELECT senderEntity, senderID, groupID, body,
												optionA, optionB, optionC, gratiiReward, createdAt 
												FROM msgs
												WHERE template=? GROUP BY groupID ORDER BY createdAt DESC');
	$getSurveys -> execute(array($senderEntity."Survey"));
	if($results = $getSurveys -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Surveys not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

	return array("error"=>false,
				"results"=>$results);
}

function getSurveyGroupsForSenderEntityAndID($senderEntity, $senderID){
	if(!isset($senderEntity) or $senderEntity==""){ //No sender entity provided
		return array("error"=>true,
					"msg"=>"No sender entity provided");
		die();
	}
	if(!isset($senderID) or $senderID==""){ //No receiver ID
		return array("error"=>true,
					"msg"=>"No sender ID provided");
		die();
	}
	
	$getSurveys = $GLOBALS['db'] -> prepare('SELECT senderEntity, senderID, groupID, body,
												optionA, optionB, optionC, gratiiReward, createdAt 
												FROM msgs
												WHERE template=? AND senderID=? GROUP BY groupID ORDER BY createdAt DESC');
	$getSurveys -> execute(array($senderEntity."Survey", $senderID));
	if($results = $getSurveys -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Surveys not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

	return array("error"=>false,
				"results"=>$results);
}

function getResponsesForSurveyGroup($groupID){
	if(!isset($groupID) || $groupID==""){
		return array("error"=>true,
					"msg"=>"No group ID provided");
	}

	$getSurveys = $GLOBALS['db'] -> prepare('SELECT response 
												FROM msgs
												WHERE groupID=?');
	$getSurveys -> execute(array($groupID));
	if($responses = $getSurveys -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		$respondedA = 0;
		$respondedB = 0;
		$respondedC = 0;
		$prending = 0;
		foreach ($responses as $response) {
			if($response['response']=="optionA"){
				$respondedA++;
			}else if($response['response']=="optionB"){
				$respondedB++;
			}
			else if($response['response']=="optionC"){
				$respondedC++;
			}else if($response['response']=="---"){
				$prending++;
			}
		}

		return array("error"=>false,
					"results"=>array("optionATotal"=>$respondedA,
									"optionBTotal"=>$respondedB,
									"optionCTotal"=>$respondedC,
									"pendingTotal"=>$prending));
	}else{ //Surveys not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

//-----------UPDATE QUERIES----------------
function respondToMsg($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	$updateMsg = $GLOBALS['db'] -> prepare('UPDATE msgs SET response=?, respondedAt=?, updatedAt=? WHERE id=?');
	$updateMsg -> execute(array($inputs['response'], $GLOBALS['NOW'], $GLOBALS['NOW'], $inputs['msgID']));	
	$numRows = $updateMsg -> rowCount();							
	if($numRows==0){ //Error updating msg
		return array('error'=>true,
				    'msg'=>"Msg not updated");
	}else{ //Success. Msg updated.
		return array('error'=>false,
				    'msg'=>"Msg updated");
	}
}

function openMsg($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	$updateMsg = $GLOBALS['db'] -> prepare('UPDATE msgs SET openedAt=?, updatedAt=? WHERE id=?');
	$updateMsg -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $inputs['msgID']));	
	$numRows = $updateMsg -> rowCount();							
	if($numRows==0){ //Error updating msg
		return array('error'=>true,
				    'msg'=>"Msg not updated");
	}else{ //Success. Msg updated.
		return array('error'=>false,
				    'msg'=>"Msg updated");
	}

}
//-----------INSERT QUERIES----------------
function createMsg($recipientID, $messageData){ //Insert the new user
	
	$createMessage = $GLOBALS['db'] -> prepare('INSERT INTO msgs (userID, groupID, senderEntity,
											senderID, template, title, body, footer, link, meta, 
											msgBackgroundPic, msgBackgroundColor, msgFontColor,
											optionA, optionB,
											optionC, gratiiReward, createdAt)
											VALUES (?, ?, ?,
												?, ?, ?, ?, ?, ?,
												?, ?, ?, ?,
												?, ?, ?, ?, ?)');
	$createMessage -> execute(array($recipientID, 
									$messageData['groupID'], 
									$messageData['senderEntity'],
									$messageData['senderID'], 
									$messageData['template'], 
									$messageData['title'], 
									$messageData['body'], 
									$messageData['footer'], 
									$messageData['link'],
									$messageData['meta'],
									$messageData['msgBackgroundPic'], 
									$messageData['msgBackgroundColor'], 
									$messageData['msgFontColor'], 
									$messageData['optionA'], 
									$messageData['optionB'],
									$messageData['optionC'], 
									$messageData['gratiiReward'], 
									$GLOBALS['NOW']));
	if($msgID = $GLOBALS['db']->lastInsertId()){ //Success. Return New msg ID
		return array("error"=>false,
					"results"=>$msgID);
	}else{ //Error inserting msg
		return array("error"=>true,
					"msg"=>"Msg not created");
	}	
}


//-----------JOBS----------------
function createMsg_Job($inputs=NULL, $receiver=NULL){
	
	if($inputs===NULL){ //No inputs found
		$inputData = Input::all(); //Grab json data
		if(!isset($inputData) or $inputData==""){ //No json data found
			return array("error"=>true,
						"msg"=>"No inputs provided");
			die();
		}
	}else{
		$inputData = $inputs; //Grab input data
	}
	
	if($receiver===NULL || $receiver=="admin"){ //Sent by admin or default to admin
		$senderEntity = "admin";
	}else if($receiver=="user"){ //Sent by user
		$senderEntity = "user";
	}else if($receiver=="client"){ //Sent by client
		$senderEntity = "client";
	}else{ //Invalid sender
		return array("error"=>true,
					"msg"=>"Invalid sender type");
		die();
	}
	if(!isset($inputData['senderEntity']) || $inputData['senderEntity']==""){ //No sender entity set
		if($senderEntity == "user"){ //If user msg
			$inputData['senderEntity'] = "user"; //Set sender entity to user
		}else if($senderEntity == "admin"){ //If admin msg
			$inputData['senderEntity'] = "admin"; //Set sender entity to admin
		}else if($senderEntity == "client"){ //If client msg
			$inputData['senderEntity'] = "client"; //Set sender entity to client
		}
	}
	
	if(!isset($inputData['senderID']) || $inputData['senderID']==""){ //No sender ID set
		if($senderEntity == "user"){ //If user msg
			$inputData['senderID'] = $_SESSION['userID']; //Set sender ID to match session user ID
		}else{ //Else sender ID is 0
			$inputData['senderID'] = "0";
		}
	}

	$inputData = checkRecipients($inputData); //Check recipients for nicknames or IDs
	if($inputData['error']){ //Error checking recipients
		return array("error"=>true,
					"msg"=>$inputData['msg']);
		die();
	}

	$checkContents = checkContents_Job($inputData['results']); //Check contents of msg
	if($checkContents['error']){ //Error checking contents
		return array("error"=>true,
					"msg"=>$checkContents['msg'],
					"requested"=>"Checks contents");
		die();
	}

	$inputData['results']['recipientIDs'] = array_unique($inputData['results']['recipientIDs']); //Remove recipient duplicates

	if($senderEntity=="user"){ //User sending msg
		$checkUserPermissions = checkUserPermissions($inputData['results']); //Check user permissions
		if($checkUserPermissions['error']){ //Error checking user permissions
			return array("error"=>true,
						"msg"=>$checkUserPermissions['msg'],
						"requested"=>"Check user permissions");
		}
	}

	$deliverMsg = deliverMsg_Job($inputData['results']); //Deliver msgs
	if($deliverMsg['error']){ //Error delivering msgs
		return array("error"=>true,
					"msg"=>$deliverMsg['msg'],
					"requested"=>"Deliver msg");
	}

	$CURLtoNode = CURLtoNode_Job($deliverMsg['results']);
	if($CURLtoNode['error']){
		return array("error"=>true,
					"msg"=>$CURLtoNode['msg'],
					"requested"=>"CURL to Node");
	}

	return array("error"=>false, //Success. Msgs sent. Job complete.
				"msg"=>"Success",
				"requested"=>"Deliver msg",
				"results"=>$deliverMsg['results']);

}

function deliverMsg_Job($messageData){
	if(!isset($messageData) || $messageData==""){
		return array("error"=>true,
					"msg"=>"No message data provided");
	}
	$overwrittenData = overwriteData($messageData); //Set defaults for fields not provided
	if($overwrittenData['error']){ //Error overwriting data
		return array("error"=>true,
					"msg"=>$overwrittenData['msg'],
					"requested"=>"Overwrite data");
	}
	
	foreach ($overwrittenData['results']['recipientIDs'] as $recipient) { //For each recipient
		$insertMsg = createMsg($recipient,$overwrittenData['results']); //Create msg
		if($insertMsg['error']){ //Error creating msg
			return array("error"=>true,
						"msg"=>$insertMsg['msg'],
						"requested"=>"Insert msg");
		}else{ //Add new msg ID to array
			$msgIDs[] = $insertMsg['results'];
		}
	}
	if($overwrittenData['results']['senderEntity']=="user"){
		$recordMsgTransaction = recordMsgTransaction($overwrittenData['results'], $msgIDs);
		if($recordMsgTransaction['error']){
			return array("error"=>true,
						"msg"=>$recordMsgTransaction['msg'],
						"requested"=>"Record msg transaction");
		}
	}
	return array("error"=>false, //Success. Msgs sent. Return new IDs. 
				"results"=>$msgIDs);
}

function openMsg_Job($inputs, $receiver=NULL){

	$inputs = Input::all(); //Grab json data
	if(!isset($inputs) or $inputs==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($receiver) or $receiver==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No receiver provided");
		die();
	}else if($receiver!="user"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid receiver");
		die();
	}

	if(!isset($inputs['msgID']) or $inputs['msgID']==""){ //No msg id provided
		return array("error"=>true,
					"msg"=>"No msgID provided");
		die();
	}

	$messageData = getMsg($inputs['msgID']);
	if($messageData['error']){
		return array("error"=>true,
					"msg"=>$messageData['msg'],
					"requested"=>"Get msg data");
	}

	if($messageData['results']['userID'] != $_SESSION['userID']){ //No msg id provided
		return array("error"=>true,
					"msg"=>"You do not have permission to open this msg");
		die();
	}else if($messageData['results']['openedAt'] != "0000-00-00 00:00:00"){ //No msg id provided
		return array("error"=>true,
					"msg"=>"You have already opened this msg");
		die();
	}

	$openMsg = openMsg($inputs);
	if($openMsg['error']){
		return array("error"=>true,
					"msg"=>$openMsg['msg'],
					"requested"=>"Respond to msg");
	}

	return array("error"=>false,
				"msg"=>"success",
				"results"=>"Msg opened");
		
}


function respondToMsg_Job($inputs, $receiver=NULL){

	$inputs = Input::all(); //Grab json data
	if(!isset($inputs) or $inputs==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($receiver) or $receiver==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No receiver provided");
		die();
	}else if($receiver!="user"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid receiver");
		die();
	}

	if(!isset($inputs['msgID']) or $inputs['msgID']==""){ //No msg id provided
		return array("error"=>true,
					"msg"=>"No msgID provided");
		die();
	}

	$messageData = getMsg($inputs['msgID']);
	if($messageData['error']){
		return array("error"=>true,
					"msg"=>$messageData['msg'],
					"requested"=>"Get msg data");
	}

	if($messageData['results']['userID'] != $_SESSION['userID']){ //No msg id provided
		return array("error"=>true,
					"msg"=>"You do not have permission to respond to this msg");
		die();
	}else if($messageData['results']['respondedAt'] != "0000-00-00 00:00:00"){ //No msg id provided
		return array("error"=>true,
					"msg"=>"You have already responded to this msg");
		die();
	}

	$responsiveTemplates = array("adminSurvey","clientSurvey","adminSurvey","adminQuestion","clientQuestion","userQuestion","issueChallenge");
	if(in_array($messageData['results']['template'], $responsiveTemplates)){ //No msg id provided
		if(!isset($inputs['response']) || $inputs['response']==""){
			return array("error"=>true,
						"msg"=>"No response provided");
			die();
		}
	}else{
		$inputs['response'] = "true";
	}

	$respondToMsg = respondToMsg($inputs);
	if($respondToMsg['error']){
		return array("error"=>true,
					"msg"=>$respondToMsg['msg'],
					"requested"=>"Respond to msg");
	}

	if($messageData['results']['gratiiReward']>0){
		if($messageData['results']['template']=="adminSurvey" || $messageData['results']['template']=="userSurvey"){
			$memo = "Responded to survey";
		}else if($messageData['results']['template']=="adminQuestion" || $messageData['results']['template']=="userQuestion"){
			$memo = "Responded to question";
		}else if($messageData['results']['template']=="loseAuction"){
			$memo = "Bid returned";
		}else if($messageData['results']['template']=="winChallenge"){
			$memo = "Won a challenge";
		}else{
			$memo = "Found in a message";
		}
		
		include_once("transactionFunctions.php"); //Inlcude transaction funcitons
		$recordTransaction = createTransaction_Job(array("memo"=>$memo,
														"gratiiAmount"=>$messageData['results']['gratiiReward'],
														"referenceTable"=>"msgs",
														"referenceTableID"=>$messageData['results']['id']));
		if($recordTransaction['error']){
			return array("error"=>true,
						"msg"=>$recordTransaction['msg'],
						"requested"=>"Record transaction");
		}
	}

	$results = array("msgID"=>$inputs['msgID'], //Create default response array
					"response"=>$inputs['response']);

	if($messageData['results']['template']=="issueChallenge"){ //If challenge response
		if($inputs['response']=="optionA"){ //Challenge accepted
			include_once("challengeFunctions.php"); //Include challenge functions
			$acceptChallenge = acceptChallenge_Job($messageData['results']); //Accept challenge
			if($acceptChallenge['error']){ //Error accepting challenge
				return array("error"=>true,
							"msg"=>$acceptChallenge['msg'],
							"requested"=>"Accept challenge");
			}else{
				$results['challengeID'] = $messageData['results']['senderID']; //Inject challenge ID into results
				$challengeData = getChallenge($messageData['results']['senderID']);
				if($challengeData['error']){ //Error declining challenge
				return array("error"=>true,
							"msg"=>$challengeData['msg'],
							"requested"=>"Get challenge data");
				}
				$results['arcadeID'] = $challengeData['results']['arcadeID']; //Inject challenge ID into results
			}
		}else if($inputs['response']=="optionB"){ //Challenge declined
			$returnChallengerWager = returnChallengerWager($messageData['results']); //Decline challenge
			if($returnChallengerWager['error']){ //Error declining challenge
				return array("error"=>true,
							"msg"=>$returnChallengerWager['msg'],
							"requested"=>"Return challenge wager");
			}
		}else{ //Invalid response
			return array("error"=>true,
						"msg"=>"Invalid challenge response");
		}
	}

	return array("error"=>false, //Success. Return results array.
				"msg"=>"success",
				"results"=>$results);
		
}

function CURLtoNode_Job($msgIDs){
	if(!isset($msgIDs) or $msgIDs==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No msg IDs provided");
		die();
	}
	
	foreach ($msgIDs as $msgID) { //For each msg id
		$msgData = getMsg($msgID); //Get msg data
		if($msgData['error']){ //Error getting msg data data
			return array("error"=>true,
						"msg"=>$msgData['msg'],
						"requested"=>"Get msg data");
		}
		include_once("userFunctions.php");
		$userData = getUser($msgData['results']['userID']); //Get user data
		if($userData['error']){ //Error getting user data data
			return array("error"=>true,
						"msg"=>$userData['msg'],
						"requested"=>"Get user data");
		}
		if($userData['results']['userNodeID']!="---"){ //If user node id exists
			if($msgData['results']['senderEntity']=="user"){ //If msg sent from user
				$senderData = getUser($msgData['results']['senderID']); //Get user data
				if($senderData['error']){ //Error getting user data data
					return array("error"=>true,
								"msg"=>$senderData['msg'],
								"requested"=>"Get user data");
				}
				$msgData['results']['senderNickname'] = $senderData['results']['userNickname']; //Inject sender nickname into msg data
			}

			$msgData['results']['userNodeID'] = $userData['results']['userNodeID']; //Inject user node id into msg data
			
			$ch = curl_init(); //Init curl
			$curlConfig = array( //Curl config
			    CURLOPT_URL            => $GLOBALS['nodeRoot']."/command/msg", //API endpoint
			    CURLOPT_POST           => true, //POST
			    CURLOPT_RETURNTRANSFER => true, //Return results
			    CURLOPT_POSTFIELDS     => $msgData['results'] //JSON data to post
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

	return array("error"=>false, //Return success
				"msg"=>"success");

}

function getSurveyResponses_Job($senderEntity, $receiver=NULL){
	if(!isset($senderEntity) or $senderEntity==""){ //No sender entity provided
		return array("error"=>true,
					"msg"=>"No senderEntity provided");
		die();
	}
	if(!isset($receiver) or $receiver==""){ //No receiver provided
		return array("error"=>true,
					"msg"=>"No receiver provided");
		die();
	}

	$surveyGroups = getSurveyGroupsForEntity($senderEntity, $receiver);
	if($surveyGroups['error']){ //Error getting msg data data
		return array("error"=>true,
						"msg"=>$surveyGroups['msg'],
						"requested"=>"Get list of surveys");
	}
	
	$surveys = array();
	foreach ($surveyGroups['results'] as $surveyGroup) { //For each msg id
		$responses = getResponsesForSurveyGroup($surveyGroup['groupID']);
		if($responses['error']){ //Error getting msg data data
			return array("error"=>true,
							"msg"=>$responses['msg'],
							"requested"=>"Get responses for survey group");
		}
		$surveys[] = array("groupID"=>$surveyGroup['groupID'],
							"senderEntity"=>$surveyGroup['senderEntity'],
							"senderID"=>$surveyGroup['senderID'],	
							"gratiiReward"=>$surveyGroup['gratiiReward'],		
							"createdAt"=>$surveyGroup['createdAt'],
							"body"=>$surveyGroup['body'],
							"optionA"=>$surveyGroup['optionA'],
							"optionB"=>$surveyGroup['optionB'],
							"optionC"=>$surveyGroup['optionC'], 
							"responses"=>$responses['results']);
	}

	return array("error"=>false,
				"results"=>$surveys);

}
//-----------TASKS----------------
function checkRecipients($contents){
	if(!isset($contents) || $contents==""){
		return array("error"=>true,
					"msg"=>"No contents provided");
	}

	if(!isset($contents['recipientIDs']) || $contents['recipientIDs']==""){ //No recipient IDs found
		if(!isset($contents['recipientNicknames']) || $contents['recipientNicknames']==""){
			return array("error"=>true,
						"msg"=>"No recipients provided");
		}else{
			include_once("userFunctions.php"); //Include user functions
			$recipientNicknames = $contents['recipientNicknames']; //Array of recipient nicknames
			if($recipientNicknames[0]=="sendToAll"){
				$contents['recipientIDs'] = array("sendToAll");
			}else{
				foreach ($recipientNicknames as $recipientNickname) { //For each nickname
					$nickname = getUserIDByUserNickname($recipientNickname); //Get user ID
					if($nickname['error']){ //Error getting user ID
						return array("error"=>true,
									"msg"=>"User ".$recipientNickname. " not found");
						die();
					}else{ //Add user ID to array of message contents
						$contents['recipientIDs'][] = $nickname['results'];
					}
				}
			}
		}
	}

	if($contents['recipientIDs'][0]=="sendToAll"){
		if($contents['senderEntity']=="admin" || $contents['senderEntity']=="client"){
			include_once("userFunctions.php");
			$allUserIDs = getAllUserIDs();
			if($allUserIDs['error']){
				return array("error"=>true,
							"msg"=>$allUserIDs['msg'],
							"requested"=>"Get all user IDs");
			}
			$allRecipientIDs = array();
			foreach ($allUserIDs['results'] as $userID) {
				$allRecipientIDs[] = $userID['id'];
			}
			$contents['recipientIDs'] = $allRecipientIDs;
		}else{
			return array("error"=>true,
							"msg"=>"You do not have permission to send this to all users");
		}
	}

	if(count($contents['recipientIDs'])>1 && !isset($contents['groupID'])){ //Sending msg to multiple users. Create group ID.
		$i=0;
		while($i<1){
			$groupID = strtoupper(substr(md5(rand()),0,7)); //Rand string
			$checkForRepeatGroupID = $GLOBALS['db'] -> prepare('SELECT id FROM msgs WHERE groupID=?');
			$checkForRepeatGroupID -> execute(array($groupID));
			$rowCount = $checkForRepeatGroupID -> rowCount();
			if($rowCount>0){ //Rand string already exists
				$i=$i;
			}else{ //Available group ID found
				$i++;
			}
		}
		$contents['groupID'] = $groupID; //Add group id to msg data array
	}

	return array("error"=>false,
				"results"=>$contents);
}

function checkContents_Job($contents){
	if(!isset($contents) || $contents==""){
		return array("error"=>true,
					"msg"=>"No contents provided");
	}

	if(!isset($contents['gratiiReward']) || $contents['gratiiReward']==""){ //No gratii reward found
		return array("error"=>true,
					"msg"=>"No gratii reward provided");
	}else if(!is_numeric($contents['gratiiReward']) || $contents['gratiiReward']<0 || 
			floor($contents['gratiiReward'])!=ceil($contents['gratiiReward'])){ //Invalid gratii amount
		return array('error' => true,
					'msg' => "Invalid gratii amount");	
		die();
	}
	if(!isset($contents['template']) || $contents['template']==""){ //No template found
		return array("error"=>true,
					"msg"=>"No template provided");
	}
	$templates = array("adminText","clientText","adminGift","clientGift","adminSurvey","adminQuestion",  //Allowed templates
					"clientQuestion", "issueChallenge", "clientSurvey",	"declineChallenge",	
					"forfeitChallenge",	"winChallenge","loseChallenge",	"drawChallenge",
					"adminClickthru","clientClickthru","userText","userGift","userSurvey", "loseAuction", "winAuction"); 
	if(!in_array($contents['template'], $templates)){ //Invalid template
		return array("error"=>true,
					"msg"=>"Invalid template");
	}

	if($contents['template']=="adminSurvey" || $contents['template']=="userSurvey" || $contents['template']=="clientSurvey"){ //If survey check for 2 options
		if(!isset($contents['optionA']) || $contents['optionA']==""){ //No option A provided
			return array("error"=>true,
					"msg"=>"No option A provided");
		}
		if(!isset($contents['optionB']) || $contents['optionB']==""){ //No option B provided
			return array("error"=>true,
					"msg"=>"No option B provided");
		}
	}


	return array("error"=>false,
				"msg"=>"Content OK");

}

function checkUserPermissions($messageData){
	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"User data");
	}

	$userTemplates = array("issueChallenge", "userText","userGift","userSurvey");  //Allowed user templates
	if(!in_array($messageData['template'], $userTemplates)){
		return array("error"=>true,
					"msg"=>"Invalid user template");
	}	

	
	$giftedToday = getGratiiGiftedIn24Hours_Job();
	if($giftedToday['error']){ //Error getting user gifted data
		return array("error"=>true,
					"msg"=>$giftedToday['msg'],
					"requested"=>"Get gratii gifted today");
	}
				

	if($userData['results']['PRO']>$GLOBALS['NOW']){ //User is PRO
		if(count($messageData['recipientIDs'])>2){ //Multiple recpients
			return array("error"=>true,
						"msg"=>"You can only send 1 message at a time.");
			die();
		}
		if(((count($messageData['recipientIDs'])*$messageData['gratiiReward'])+$giftedToday['results'])>500){ //Over 500 gratii sent today. 
			$giftsRemaining = 500-$giftedToday['results'];
			return array("error"=>true,
						"msg"=>"You can only send ".$giftsRemaining." more gratii today");
			die();
		}
	}else{ //User is not PRO
		if($messageData['template']=="issueChallenge"){ //Challenge not allowed
			return array("error"=>true,
						"msg"=>"PRO##Only PRO accounts can challenge friends");
			die();
		}
		if($messageData['template']=="userSurvey"){ //Survey not allowed
			return array("error"=>true,
						"msg"=>"PRO##Only PRO accounts can send surveys");
			die();
		}
		if(count($messageData['recipientIDs'])>1){ //Multiple recpients
			return array("error"=>true,
						"msg"=>"PRO##Only PRO accounts can send mass messages");
			die();
		}
		if(($messageData['gratiiReward']+$giftedToday['results'])>25){ //Over 25 gratii sent today 
			$giftsRemaining = 25-$giftedToday['results'];
			return array("error"=>true,
						"msg"=>"PRO##You can only send ".$giftsRemaining." more gratii today. PRO accounts can send more.");
			die();
		}
	}
	
	return array("error"=>false,
				"msg"=>"User permissions OK");	
	
}

function overwriteData($messageData){
	if(!isset($messageData) || $messageData==""){
		return array("error"=>true,
					"msg"=>"No message data provided");
	}
	//Set defaults below
	if(!isset($messageData['title']) || $messageData['title']==""){
		$messageData['title'] = "You have a new message";
	}
	if(!isset($messageData['body']) || $messageData['body']==""){
		$messageData['body'] = "---";
	}
	if(!isset($messageData['footer']) || $messageData['footer']==""){
		$messageData['footer'] = "---";
	}
	if(!isset($messageData['msgBackgroundPic']) || $messageData['msgBackgroundPic']==""){
		$messageData['msgBackgroundPic'] = "---";
	}
	if(!isset($messageData['msgBackgroundColor']) || $messageData['msgBackgroundColor']==""){
		$messageData['msgBackgroundColor'] = "---";
	}
	if(!isset($messageData['msgFontColor']) || $messageData['msgFontColor']==""){
		$messageData['msgFontColor'] = "---";
	}
	if(!isset($messageData['link']) || $messageData['link']==""){
		$messageData['link'] = "---";
	}
	if(!isset($messageData['groupID']) || $messageData['groupID']==""){
		$messageData['groupID'] = "---";
	}
	if(!isset($messageData['optionA']) || $messageData['optionA']==""){
		$messageData['optionA'] = "---";
	}
	if(!isset($messageData['optionB']) || $messageData['optionB']==""){
		$messageData['optionB'] = "---";
	}
	if(!isset($messageData['optionC']) || $messageData['optionC']==""){
		$messageData['optionC'] = "---";
	}
	if(!isset($messageData['meta']) || $messageData['meta']==""){
		$messageData['meta'] = "---";
	}else{
		$messageData['meta'] = serialize($messageData['meta']);
	}

	return array("error"=>false,
				"results"=>$messageData);

}

function recordMsgTransaction($messageData, $msgIDs){
	foreach ($msgIDs as $msgID) {
		if($messageData['gratiiReward']>0){ //User is sending gratii, prep transaction
			$recipientNickname = getUser($messageData['recipientIDs'][0]); //Recipient data
			if($recipientNickname['error']){ //Error getting recipient data
				return array("error"=>true,
							"msg"=>"Invalid recipient ID",
							"requested"=>"Recipient nickname");
				die();
			}
			
			if(count($msgIDs)>1){
				$etAl = "et al.";
			}else{
				$etAl = "";
			}
			if($messageData['template']=="userGift"){ //User text
				$memo = "Sent a gift to ".$recipientNickname['results']['userNickname']." ".$etAl; //Set memo
			}else if($messageData['template']=="userSurvey"){ //User survey
				$memo = "Sent a survey to ".$recipientNickname['results']['userNickname']." ".$etAl; //Set memo
			}else if($messageData['template']=="issueChallenge"){ //User challenge
				$memo = "Sent a challenge to ".$recipientNickname['results']['userNickname']." ".$etAl; //Set memo
			}
			include_once("transactionFunctions.php"); //Include transaction fucntions
			$recordTransaction = createTransaction_Job(array("memo"=>$memo,
														"gratiiAmount"=>-1*$messageData['gratiiReward'],
														"referenceTable"=>"msgs",
														"referenceTableID"=>$msgID));
			if($recordTransaction['error']){
				return array("error"=>true,
							"msg"=>$recordTransaction['msg'],
							"requested"=>"Create transaction job");
			}
		}
	}
	
	return array("error"=>false,
				"msg"=>"Transactions recorded");
	
}

function returnChallengerWager($messageData){
	if(!isset($messageData) || $messageData==""){
		return array("error"=>true,
					"msg"=>"No challenge ID provided");
	}

	include_once("challengeFunctions.php"); //Include challenge functions
	$challegeData = getChallenge($messageData['senderID']);
	if($challegeData['error']){
		return array("error"=>true,
					"msg"=>$challegeData['msg'],
					"requested"=>"Get challenge data");
	}

	$updateChallege = completeChallenge(array("challengeID"=>$challegeData['results']['id'],
											"score"=>"declined"));
	if($challegeData['error']){
		return array("error"=>true,
					"msg"=>$challegeData['msg'],
					"requested"=>"Get challenge data");
	}

	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user data");
	}

	$body = $userData['results']['userNickname']." declined your challenge";
	$returnWager = createMsg_Job(array("senderID"=>$messageData['id'], //Send challenge msg
										"recipientIDs"=>array($challegeData['results']['challengerID']),
										"senderEntity"=>"msg",
										"title"=>"Your challenge was declined",
										"body"=>$body,
										"template"=>"forfeitChallenge",
										"gratiiReward"=>$challegeData['results']['totalWagerAmount'],
										"msgBackgroundPic"=>$messageData['msgBackgroundPic'],
										"msgBackgroundColor"=>$messageData['msgBackgroundColor'],
										"msgFontColor"=>$messageData['msgFontColor'],
										"meta"=>array("forfeiterID"=>$_SESSION['userID'],
													"challengeID"=>$challegeData['results']['id'])));
	if($returnWager['error']){
		return array("error"=>true,
					"msg"=>$returnWager['msg'],
					"requested"=>"Return wager");
	}

	return array("error"=>false);
}

?>