<?php 

//-----------GET QUERIES----------------
function getAllClients($receiver=NULL){

	try{
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllClients = $GLOBALS['db']->prepare('SELECT * FROM clients');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getAllClients -> execute();
		if($results = $getAllClients -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No clients found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getClient($id,$receiver=NULL){

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getClient = $GLOBALS['db'] -> prepare('SELECT * FROM clients WHERE id = ?');
		}else if($receiver=="client" && $_SESSION['clientID']==$id){ //Client is self
			$getClient = $GLOBALS['db'] -> prepare('SELECT * FROM clients WHERE id = ?');
		}else if($receiver=="user"){ //User is stranger
			$getClient = $GLOBALS['db'] -> prepare('SELECT id, clientName, clientDetails, clientLogo 
													FROM clients WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getClient -> execute(array($id));
		if($results = $getClient -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Client not found
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

function getClientByClientName($clientName){
	
	try{

		$getClient = $GLOBALS['db'] -> prepare('SELECT * FROM clients WHERE clientName = ?');
		$getClient -> execute(array($clientName));
		if($results = $getClient -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
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

function getClientByClientEmail($clientEmail){

	try{

		$getClient = $GLOBALS['db'] -> prepare('SELECT * FROM clients WHERE clientEmail = ?');
		$getClient -> execute(array($clientEmail));
		if($results = $getClient -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
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

function getAllFacebooksForClientID($clientID){
	if(!isset($clientID) || $clientID==""){
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}

	$getFacebooks = $GLOBALS['db'] -> prepare('SELECT promos.id AS promoID, promoFacebook, promoFacebookID
													FROM promos 
													LEFT JOIN clients ON promos.clientID=clients.id
													WHERE clients.id = ? AND promos.promoFacebookID!=? GROUP BY promoFacebookID');
	$getFacebooks -> execute(array($clientID, "---"));
	if($results = $getFacebooks -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getAllTwittersForClientID($clientID){
	if(!isset($clientID) || $clientID==""){
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}

	$getTwitters = $GLOBALS['db'] -> prepare('SELECT promos.id AS promoID, promoTwitter, promoTwitterID
													FROM promos 
													LEFT JOIN clients ON promos.clientID=clients.id
													WHERE clients.id = ? AND promos.promoTwitterID!=? GROUP BY promoTwitterID');
	$getTwitters -> execute(array($clientID, "---"));
	if($results = $getTwitters -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getAllWebsitesForClientID($clientID){
	if(!isset($clientID) || $clientID==""){
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}

	$getWebsites = $GLOBALS['db'] -> prepare('SELECT promos.id AS promoID, promoWebsite, promoWebsiteID
													FROM promos 
													LEFT JOIN clients ON promos.clientID=clients.id
													WHERE clients.id = ? AND promos.promoWebsiteID!=? GROUP BY promoWebsiteID');
	$getWebsites -> execute(array($clientID, "---"));
	if($results = $getWebsites -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

function getSurveysForClientID($clientID, $receiver){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}else if($receiver!="admin" && $receiver!="client"){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}else if($receiver=="client" && $_SESSION['clientID']!=$clientID){
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	include_once("msgFunctions.php");
	$surveyGroups = getSurveyGroupsForSenderEntityAndID("client", $clientID);
	if($surveyGroups['error']){
		return array("error"=>true,
					"msg"=>$surveyGroups['msg']);
	}

	return array("error"=>false,
					"results"=>$surveyGroups['results']);
}

function getSurveyResponsesForClientID_Job($clientID, $receiver){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No receiver provided");
	}else if($receiver!="admin" && $receiver!="client"){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}else if($receiver=="client" && $_SESSION['clientID']!=$clientID){
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	$surveyGroups = getSurveysForClientID($clientID, $receiver);
	if($surveyGroups['error']){
		return array("error"=>true,
					"msg"=>$surveyGroups['msg']);
	}

	$surveyResponses = array();
	foreach ($surveyGroups['results'] as $surveyGroup) {
		$responses = getResponsesForSurveyGroup($surveyGroup['groupID']);
		if($responses['error']){
			return array("error"=>true,
						"msg"=>$responses['msg']);
		}
		$surveyResponses[] = array("groupID"=>$surveyGroup['groupID'],
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
					"results"=>$surveyResponses);
}


//-----------INSERT QUERIES----------------
function createClient($clientEmail, $clientName, $clientPassword){ //Insert the new client

		$createClient = $GLOBALS['db'] -> prepare('INSERT INTO clients (clientEmail, clientName, 
									clientPassword, createdAt)
									VALUES (?, ?, ?, ?)');
		$createClient -> execute(array($clientEmail, $clientName, 
									$clientPassword, $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ // Client created successfully. Returning the new client id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No client created");
		}

}


//-----------UPDATE QUERIES----------------
function updateClientProfile($clientProfile, $id){
	try {
		$updateClientProfile = $GLOBALS['db'] -> prepare('UPDATE clients SET clientName=?,
									clientDetails=?, clientLogo=?, clientAddress1=?, clientAddress2=?, 
									clientCity=?, clientState=?, clientZip=?,
									clientFirstName=?, clientLastName=?, clientPhone=?, updatedAt=?
									WHERE id=?');
		$updateClientProfile -> execute(array($clientProfile['clientName'], $clientProfile['clientDetails'], 
									$clientProfile['clientLogo'], $clientProfile['clientAddress1'], 
									$clientProfile['clientAddress2'], $clientProfile['clientCity'], 
									$clientProfile['clientState'], $clientProfile['clientZip'],
									$clientProfile['clientFirstName'], $clientProfile['clientLastName'], 
									$clientProfile['clientPhone'], $GLOBALS['NOW'], $id));
		
		$numRows = $updateClientProfile -> rowCount();							

		if($numRows==0){
		
			return array('error' => true,
						'msg' => "No updates made.");	
			die();
		}else{
			
			return array('error' => false,
						'results' => $id);
		}

	}catch(PDOException $error){
		
		$error = $error->getMessage();
		return array('error' => true,
				    'msg' => "MySQL Error: ".$error);

		die();
	}
}

//-----------JOBS----------------
function createClient_Job($inputs=NULL){

	if($inputs===null){
		$inputs = Input::all(); //Get inputs
	}

	$cleanClientProfileInputs = cleanClientProfileInputs($inputs); //Validate inputs
	
	if($cleanClientProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanClientProfileInputs['msg']);	
		die();
	}else if(!isset($cleanClientProfileInputs['results']['clientEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanClientProfileInputs['results']['clientName'])){ // No name
		return array('error' => true,
					'msg' => "Enter name");	
		die();
	}

	if(isset($inputs['clientPassword'])){
		$clientPassword=$inputs['clientPassword'];
		if(strlen($clientPassword)>30){ //Max char
			return array('error'=>true,
						'msg'=>"Password: Max 30 characters");	
			die();
		}else if(strlen($clientPassword)<5){ //Min char
			return array('error'=>true,
						'msg'=>"Password: Min 5 characters");	
			die();
		}else{ //Clean. Add to array.
			$encryptedPassword = encryptClientPassword($clientPassword); //Encrypt password
		}	
	}else{ // No password
		return array('error' => true,
					'msg' => "Enter secret password");	
		die();
	}

	$emailAvailable = getClientByClientEmail($cleanClientProfileInputs['results']['clientEmail']); //Check for used email
	if($emailAvailable['error']==false){ // Email found
		return array("error"=>true,
					"msg"=>"Email taken");
		die();
	}

	$nameAvailable = getClientByClientName($cleanClientProfileInputs['results']['clientName']); //Check for used name
	if($nameAvailable['error']==false){ // Name found
		return array("error"=>true,
					"msg"=>"Name taken");
		die();
	}
	
	$createClient = createClient($cleanClientProfileInputs['results']['clientEmail'], $cleanClientProfileInputs['results']['clientName'],
								$encryptedPassword); // Create the new client	
	if($createClient['error']){ // Error creating the new client
		return array("error"=>true,
					"msg"=>$createClient['msg']);
		die();
	}else{ // New client created successfully. Returning the new client id.
		return array("error"=>false,
					"results"=>$createClient['results']);
		die();
	}
	
}

function updateClientProfile_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	$getClient = getClient($id);

	if($getClient['error']){ //Error finding client
		return array("error"=>true,
					"msg"=>$getClient['msg']);
	}

	$inputs = Input::all();
	$overwriteClientProfileInputs = overwriteClientProfileInputs($getClient['results'], $inputs);
	$cleanClientProfileInputs = cleanClientProfileInputs($overwriteClientProfileInputs['results']);

	if($cleanClientProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanClientProfileInputs['msg']);	
		die();
	}else if(!isset($cleanClientProfileInputs['results']['clientEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanClientProfileInputs['results']['clientName'])){ // No name
		return array('error' => true,
					'msg' => "Enter name");	
		die();
	}

	$nameAvailable = getClientByClientName($cleanClientProfileInputs['results']['clientName']); //Check for used name
	if($nameAvailable['error']==false && $nameAvailable['results']['id']!=$id){ // Name found
		return array("error"=>true,
					"msg"=>"Name taken");
		die();
	}

	$updateClientProfile = updateClientProfile($cleanClientProfileInputs['results'], $id);

	if($updateClientProfile['error']){ // Error updating the clients profile
		return array("error"=>true,
					"msg"=>$updateClientProfile['msg']);
		die();
	}else{ // Client profile updated successfully. Returning the client id.
		return array("error"=>false,
					"results"=>$updateClientProfile['results']);
		die();
	}

}

function loginClient_Job(){
	$clientEmail = Input::get('clientEmail');
	$clientPassword = Input::get('clientPassword');

	if($clientEmail==""){ //No email input
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}
	if($clientPassword==""){ //No password input
		return array('error' => true,
					'msg' => "Enter password");
		die();
	}

	$clientData = getClientByClientEmail($clientEmail); //Get client data associated with email
	if($clientData['error']){ //Error getting client data
		return array("error"=>true,
					"msg"=>$clientData['msg']);
		die();
	}

	// if(!password_verify($clientPassword, $clientData['results']['clientPassword'])) { //Password encryption check	    
 // 		return array('error' => true,
	// 				'msg' => "401");
	// 	die();
	// }

	if (md5($clientPassword) != $clientData['results']['clientPassword']) { //Password encryption check	    
 		return array('error' => true,
					'msg' => "401");
		die();
	}

	if($clientData['results']['clientPRO']<$GLOBALS['NOW']){ //Account not PRO
		return array('error' => true,
					'msg' => "Only PRO clients can access the analytics portal");
		die();
	}

	$_SESSION['clientID'] = $clientData['results']['id'];
	$_SESSION['entity'] = "client";

	return array("error"=>false,
				"results"=>array("entity"=>$_SESSION['entity'],
								"id"=>$_SESSION['clientID'],
								"clientName"=>$clientData['results']['clientName'])); //Success

}

function getPromosForClient_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){
		if($getPromosForClient['error']){
			return array("error"=>true,
					"msg"=>"No client ID provided");
		}
	}

	include_once("promoFunctions.php");
	$getPromosForClient = getPromosForClientID($id, $receiver);
	if($getPromosForClient['error']){
		return array("error"=>true,
				"msg"=>$getPromosForClient['msg']);
	}

	return array("error"=>false,
				"results"=>$getPromosForClient['results']);

}

function getAuctionsBasicForClient_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){
		if($getPromosForClient['error']){
			return array("error"=>true,
					"msg"=>"No client ID provided");
		}
	}

	include_once("auctionFunctions.php");
	$getAuctionsBasic = getAuctionsBasicForClientID($id, $receiver);
	if($getAuctionsBasic['error']){
		return array("error"=>true,
				"msg"=>$getAuctionsBasic['msg']);
	}

	return array("error"=>false,
				"results"=>$getAuctionsBasic['results']);

}

function getAuctionsComplexForClient_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){
		if($getPromosForClient['error']){
			return array("error"=>true,
					"msg"=>"No client ID provided");
		}
	}

	include_once("auctionFunctions.php");
	$getAuctionsBasic = getAuctionsBasicForClientID($id, $receiver);
	if($getAuctionsBasic['error']){
		return array("error"=>true,
				"msg"=>$getAuctionsBasic['msg']);
	}

	$auctionsComplexArray = array();
	foreach ($getAuctionsBasic['results'] as $auctionBasic) {
		$auctionData = getAuction_Job($auctionBasic['id'], $receiver);
		if($auctionData['error']){
			return array("error"=>true,
					"msg"=>$auctionData['msg']);
		}
		$auctionsComplexArray[] = $auctionData['results'][0];
	}

	return array("error"=>false,
				"results"=>$auctionsComplexArray);

}

function getAllBiddersForClient_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client" && $_SESSION['clientID']!=$id){ //Client ID doesn't match current client logged in
		return array("error"=>true,
					"msg"=>"Invalid request.");
	}

	include_once("bidFunctions.php"); //Include bid functions
	$biddersData = getAllBiddersForClientID($id); //Get bidders for this client id
	if($biddersData['error']){ //Error finding bidders data
		return array("error"=>true,
						"msg"=>$biddersData['msg']);
	}

	return array("error"=>false,
				"results"=>$biddersData['results']);

}

function getAllLikersForClient_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client" && $_SESSION['clientID']!=$id){ //Client ID doesn't match current client logged in
		return array("error"=>true,
					"msg"=>"Invalid request.");
	}

	include_once("likeFunctions.php"); //Include like functions
	$likersData = getAllLikersForClientID($id); //Get likers for this client id
	if($likersData['error']){ //Error finding likers data
		return array("error"=>true,
						"msg"=>$likersData['msg']);
	}
	
	return array("error"=>false,
				"results"=>$likersData['results']);

}

function getAllFollowersForClient_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client" && $_SESSION['clientID']!=$id){ //Client ID doesn't match current client logged in
		return array("error"=>true,
					"msg"=>"Invalid request.");
	}

	include_once("followFunctions.php"); //Include follow functions
	$followersData = getAllFollowersForClientID($id); //Get followers for this client id
	if($followersData['error']){ //Error finding followers data
		return array("error"=>true,
						"msg"=>$followersData['msg']);
	}
	
	return array("error"=>false,
				"results"=>$followersData['results']);

}

function getAllClickersForClient_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client" && $_SESSION['clientID']!=$id){ //Client ID doesn't match current client logged in
		return array("error"=>true,
					"msg"=>"Invalid request.");
	}

	include_once("clickthruFunctions.php"); //Include clickthru functions
	$clickersData = getAllClickersForClientID($id); //Get clickers for this client id
	if($clickersData['error']){ //Error finding clickers data
		return array("error"=>true,
						"msg"=>$clickersData['msg']);
	}
	
	return array("error"=>false,
				"results"=>$clickersData['results']);

}

function getInventoryForClientID_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client" && $_SESSION['clientID']!=$id){ //Client ID doesn't match current client logged in
		return array("error"=>true,
					"msg"=>"Invalid request.");
	}

	include_once("promoFunctions.php"); //Include promo functions
	$promosList = getAllPromosForClientID($id, $receiver); //Get promos for this client id
	if($promosList['error']){ //Error finding promos
		return array("error"=>true,
						"msg"=>$promosList['msg']);
	}

	$inventory = array();
	include_once("auctionFunctions.php"); //Include auction functions
	foreach ($promosList['results'] as $promo) { //For each promo
		$auctionsDistributed = array(); //Set empty array for auctions delivered related to this promo
		$auctionsPending = array(); //Set empty array for auctions pending related to this promo
		$auctionsForPromoID = getAuctionsForPromoID($promo['id']);
		if($auctionsForPromoID['error']){ //Error getting auctions
			if($auctionsForPromoID['msg']=="404"){ //No auctions found for this promo ID
				//DO NOTHING, no inventory to add to array
			}else{ //Error finding auctions
				return array("error"=>true,
							"msg"=>$auctionsForPromoID['msg']);
			}
		}else{ //Auctions found
			foreach ($auctionsForPromoID['results'] as $auction) { //For each auctions
				if($auction['endsAt']<$GLOBALS['NOW']){ //If it already ended
					$auctionsDistributed[] = $auction['id']; //Enter it into the distributed array
				}else{ //Else enter it into the pending array
					$auctionsPending[] = $auction['id'];
				}
			}
		}

		$inventory[] = array("promoID"=>$promo['id'], //Add promo info and array to inventory array
							"promoName"=>$promo['promoName'],
							"promoDetails"=>$promo['promoDetails'],
							"promoPic"=>$promo['promoPic'],
							"distributed"=>$auctionsDistributed,
							"pending"=>$auctionsPending);
	}
	
	return array("error"=>false,
				"results"=>$inventory);

}

function getBidsDailyForClient_Job($id, $receiver=NULL){
	if($receiver!="admin" && $receiver!="client"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if(!isset($id) || $id==""){ //No client ID provided
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}
	if($receiver=="client" && $_SESSION['clientID']!=$id){ //Invalid request
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	parse_str($_SERVER['QUERY_STRING']);
	if(!isset($days)){
		$startTime = "2013-09-01";
		$startUnix = strtotime($startTime);
	}else{
		$startTime = date('Y-m-d', time($GLOBALS['NOW']) - 60*60*24*$days);
		$startUnix = strtotime($startTime);
	}

	$currentDate = date('Y-m-d');
	$dailyBids = array();
	while($startUnix<strtotime($currentDate)+86400){
		$dailyBids[] = array("unixTimestamp"=>$startUnix,
								"count"=>0);
		$startUnix = $startUnix+60*60*24;
	}

	include_once("bidFunctions.php");
	$allBids = getAllBidsForClientID($id, $startTime);
	if($allBids['error']){ //Error getting all bids
		if($allBids['msg']=="404"){
			return array("error"=>false,
						"results"=>$dailyBids);
		}else{
			return array("error"=>true,
						"msg"=>$allBids['msg']);
			die();
		}
	}

	foreach ($allBids['results'] as $bid) {
		$dateCreatedAt = date('Y-m-d', strtotime($bid['createdAt']));
		$unixCreatedAt = strtotime($dateCreatedAt);
		foreach ($dailyBids as &$dailyBid) {
			if(date('Y-m-d', $dailyBid['unixTimestamp'])==date('Y-m-d', $unixCreatedAt)){
				$dailyBid['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyBids);
}

function getLikesDailyForClient_Job($id, $receiver=NULL){
	if($receiver!="admin" && $receiver!="client"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if(!isset($id) || $id==""){ //No client ID provided
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}
	if($receiver=="client" && $_SESSION['clientID']!=$id){ //Invalid request
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	parse_str($_SERVER['QUERY_STRING']);
	if(!isset($days)){
		$startTime = "2013-09-01";
		$startUnix = strtotime($startTime);
	}else{
		$startTime = date('Y-m-d', time($GLOBALS['NOW']) - 60*60*24*$days);
		$startUnix = strtotime($startTime);
	}

	$currentDate = date('Y-m-d');
	$dailyLikes = array();
	while($startUnix<strtotime($currentDate)+86400){
		$dailyLikes[] = array("unixTimestamp"=>$startUnix,
								"count"=>0);
		$startUnix = $startUnix+60*60*24;
	}

	include_once("likeFunctions.php");
	$allLikes = getAllLikesForClientID($id, $startTime);
	if($allLikes['error']){ //Error getting all likes
		if($allLikes['msg']=="404"){
			return array("error"=>false,
						"results"=>$dailyLikes);
		}else{
			return array("error"=>true,
						"msg"=>$allLikes['msg']);
			die();
		}
	}

	foreach ($allLikes['results'] as $like) {
		$dateCreatedAt = date('Y-m-d', strtotime($like['createdAt']));
		$unixCreatedAt = strtotime($dateCreatedAt);
		foreach ($dailyLikes as &$dailyLike) {
			if(date('Y-m-d', $dailyLike['unixTimestamp'])==date('Y-m-d', $unixCreatedAt)){
				$dailyLike['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyLikes);
}

function getFollowsDailyForClient_Job($id, $receiver=NULL){
	if($receiver!="admin" && $receiver!="client"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if(!isset($id) || $id==""){ //No client ID provided
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}
	if($receiver=="client" && $_SESSION['clientID']!=$id){ //Invalid request
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	parse_str($_SERVER['QUERY_STRING']);
	if(!isset($days)){
		$startTime = "2013-09-01";
		$startUnix = strtotime($startTime);
	}else{
		$startTime = date('Y-m-d', time($GLOBALS['NOW']) - 60*60*24*$days);
		$startUnix = strtotime($startTime);
	}

	$currentDate = date('Y-m-d');
	$dailyFollows = array();
	while($startUnix<strtotime($currentDate)+86400){
		$dailyFollows[] = array("unixTimestamp"=>$startUnix,
								"count"=>0);
		$startUnix = $startUnix+60*60*24;
	}

	include_once("followFunctions.php");
	$allFollows = getAllFollowsForClientID($id, $startTime);
	if($allFollows['error']){ //Error getting all follows
		if($allFollows['msg']){
			return array("error"=>false,
						"results"=>$dailyFollows);
		}else{
			return array("error"=>true,
						"msg"=>$allFollows['msg']);
			die();
		}
	}

	foreach ($allFollows['results'] as $follow) {
		$dateCreatedAt = date('Y-m-d', strtotime($follow['createdAt']));
		$unixCreatedAt = strtotime($dateCreatedAt);
		foreach ($dailyFollows as &$dailyFollow) {
			if(date('Y-m-d', $dailyFollow['unixTimestamp'])==date('Y-m-d', $unixCreatedAt)){
				$dailyFollow['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyFollows);
}

function getClickthrusDailyForClient_Job($id, $receiver=NULL){
	if($receiver!="admin" && $receiver!="client"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if(!isset($id) || $id==""){ //No client ID provided
		return array("error"=>true,
					"msg"=>"No client ID provided");
	}
	if($receiver=="client" && $_SESSION['clientID']!=$id){ //Invalid request
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	parse_str($_SERVER['QUERY_STRING']);
	if(!isset($days)){
		$startTime = "2013-09-01";
		$startUnix = strtotime($startTime);
	}else{
		$startTime = date('Y-m-d', time($GLOBALS['NOW']) - 60*60*24*$days);
		$startUnix = strtotime($startTime);
	}

	$currentDate = date('Y-m-d');
	$dailyClickthrus = array();
	while($startUnix<strtotime($currentDate)+86400){
		$dailyClickthrus[] = array("unixTimestamp"=>$startUnix,
									"count"=>0);
		$startUnix = $startUnix+60*60*24;
	}

	include_once("clickthruFunctions.php");
	$allClickthrus = getAllClickthrusForClientID($id, $startTime);
	if($allClickthrus['error']){ //Error getting all clickthrus
		if($allClickthrus['msg']=="404"){
			return array("error"=>false,
						"results"=>$dailyClickthrus);
		}else{
			return array("error"=>true,
						"msg"=>$allClickthrus['msg']);
			die();
		}
	}

	foreach ($allClickthrus['results'] as $clickthru) {
		$dateCreatedAt = date('Y-m-d', strtotime($clickthru['createdAt']));
		$unixCreatedAt = strtotime($dateCreatedAt);
		foreach ($dailyClickthrus as &$dailyClickthru) {
			if(date('Y-m-d', $dailyClickthru['unixTimestamp'])==date('Y-m-d', $unixCreatedAt)){
				$dailyClickthru['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyClickthrus);
}


//-----------TASKS----------------
function cleanClientProfileInputs($inputs){
	
	$cleanClientProfileInputs = array(); // Initiate array to be returned.
	if(isset($inputs['clientName'])){
		$clientName=$inputs['clientName'];
		if(strlen($clientName)>25){ //Max char
			return array('error' => true,
						'msg' => "Name: Max 25 characters");	
			die();
		}else{ //Clean. Add to array.
			$cleanClientProfileInputs['clientName'] = $clientName;
		}
	}
	if(isset($inputs['clientEmail'])){
		$clientEmail=$inputs['clientEmail'];
		if(strlen($clientEmail)>40){ //Max char
			return array('error' => true,
						'msg' => "Email: Max 40 characters");	
			die();
		}else if(!filter_var($clientEmail, FILTER_VALIDATE_EMAIL)){ //Email validation
			return array('error' => true,
						'msg' => "Email invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanClientProfileInputs['clientEmail'] = $clientEmail;
		}
	}
	if(isset($inputs['clientDetails'])){
		$clientDetails=$inputs['clientDetails'];
		if(strlen($clientDetails)>255){ //Max char
			return array('error' => true,
						'msg' => "Details: Max 255 characters");	
			die();
		}else{ //Clean. Add to array.
			$cleanClientProfileInputs['clientDetails'] = $clientDetails;
		}
	}

	if(isset($inputs['clientLogo'])){
		$cleanClientProfileInputs['clientLogo']=$inputs['clientLogo'];
	}
	if(isset($inputs['clientAddress1'])){
		$cleanClientProfileInputs['clientAddress1']=$inputs['clientAddress1'];
	}
	if(isset($inputs['clientAddress2'])){
		$cleanClientProfileInputs['clientAddress2']=$inputs['clientAddress2'];
	}
	if(isset($inputs['clientCity'])){
		$cleanClientProfileInputs['clientCity']=$inputs['clientCity'];
	}
	if(isset($inputs['clientState'])){
		$cleanClientProfileInputs['clientState']=$inputs['clientState'];
	}
	if(isset($inputs['clientZip'])){
		$cleanClientProfileInputs['clientZip']=$inputs['clientZip'];
	}
	if(isset($inputs['clientFirstName'])){
		$cleanClientProfileInputs['clientFirstName']=$inputs['clientFirstName'];
	}
	if(isset($inputs['clientLastName'])){
		$cleanClientProfileInputs['clientLastName']=$inputs['clientLastName'];
	}
	if(isset($inputs['clientPhone'])){
		$cleanClientProfileInputs['clientPhone']=$inputs['clientPhone'];
	}
	

	return array("error"=>false,
				"results"=>$cleanClientProfileInputs);

}

function overwriteClientProfileInputs($clientProfile, $inputs){

	$overwriteClientProfileInputs = array(); // Initiate array to be returned.

	if(isset($inputs['clientName'])&&$inputs['clientName']!=""){
		$clientName = $inputs['clientName'];
		$overwriteClientProfileInputs['clientName'] = $clientName;
	}else if(isset($clientProfile['clientName'])){
		$clientName = $clientProfile['clientName'];
		$overwriteClientProfileInputs['clientName'] = $clientName;
	}
	if(isset($inputs['clientEmail'])&&$inputs['clientEmail']!=""){
		$clientEmail = $inputs['clientEmail'];
		$overwriteClientProfileInputs['clientEmail'] = $clientEmail;
	}else if(isset($clientProfile['clientEmail'])){
		$clientEmail = $clientProfile['clientEmail'];
		$overwriteClientProfileInputs['clientEmail'] = $clientEmail;
	}
	if(isset($inputs['clientDetails'])){
		$clientDetails = $inputs['clientDetails'];
		$overwriteClientProfileInputs['clientDetails'] = $clientDetails;
	}else if(isset($clientProfile['clientDetails'])){
		$clientDetails = $clientProfile['clientDetails'];
		$overwriteClientProfileInputs['clientDetails'] = $clientDetails;
	}
	if(isset($inputs['clientLogo'])){
		$clientLogo = $inputs['clientLogo'];
		$overwriteClientProfileInputs['clientLogo'] = $clientLogo;
	}else if(isset($clientProfile['clientLogo'])){
		$clientLogo = $clientProfile['clientLogo'];
		$overwriteClientProfileInputs['clientLogo'] = $clientLogo;
	}
	if(isset($inputs['clientAddress1'])){
		$clientAddress1 = $inputs['clientAddress1'];
		$overwriteClientProfileInputs['clientAddress1'] = $clientAddress1;
	}else if(isset($clientProfile['clientAddress1'])){
		$clientAddress1 = $clientProfile['clientAddress1'];
		$overwriteClientProfileInputs['clientAddress1'] = $clientAddress1;
	}
	if(isset($inputs['clientAddress2'])){
		$clientAddress2 = $inputs['clientAddress2'];
		$overwriteClientProfileInputs['clientAddress2'] = $clientAddress2;
	}else if(isset($clientProfile['clientAddress2'])){
		$clientAddress2 = $clientProfile['clientAddress2'];
		$overwriteClientProfileInputs['clientAddress2'] = $clientAddress2;
	}
	if(isset($inputs['clientCity'])){
		$clientCity = $inputs['clientCity'];
		$overwriteClientProfileInputs['clientCity'] = $clientCity;
	}else if(isset($clientProfile['clientCity'])){
		$clientCity = $clientProfile['clientCity'];
		$overwriteClientProfileInputs['clientCity'] = $clientCity;
	}
	if(isset($inputs['clientState'])){
		$clientState = $inputs['clientState'];
		$overwriteClientProfileInputs['clientState'] = $clientState;
	}else if(isset($clientProfile['clientState'])){
		$clientState = $clientProfile['clientState'];
		$overwriteClientProfileInputs['clientState'] = $clientState;
	}
	if(isset($inputs['clientZip'])){
		$clientZip = $inputs['clientZip'];
		$overwriteClientProfileInputs['clientZip'] = $clientZip;
	}else if(isset($clientProfile['clientZip'])){
		$clientZip = $clientProfile['clientZip'];
		$overwriteClientProfileInputs['clientZip'] = $clientZip;
	}
	if(isset($inputs['clientFirstName'])){
		$clientFirstName = $inputs['clientFirstName'];
		$overwriteClientProfileInputs['clientFirstName'] = $clientFirstName;
	}else if(isset($clientProfile['clientFirstName'])){
		$clientFirstName = $clientProfile['clientFirstName'];
		$overwriteClientProfileInputs['clientFirstName'] = $clientFirstName;
	}
	if(isset($inputs['clientLastName'])){
		$clientLastName = $inputs['clientLastName'];
		$overwriteClientProfileInputs['clientLastName'] = $clientLastName;
	}else if(isset($clientProfile['clientLastName'])){
		$clientLastName = $clientProfile['clientLastName'];
		$overwriteClientProfileInputs['clientLastName'] = $clientLastName;
	}
	if(isset($inputs['clientPhone'])){
		$clientPhone = $inputs['clientPhone'];
		$overwriteClientProfileInputs['clientPhone'] = $clientPhone;
	}else if(isset($clientProfile['clientPhone'])){
		$clientPhone = $clientProfile['clientPhone'];
		$overwriteClientProfileInputs['clientPhone'] = $clientPhone;
	}
	
	return array("error"=>false,
				"results"=>$overwriteClientProfileInputs);

}

function encryptClientPassword($input){
	//$encryptedPassword = password_hash($input, PASSWORD_BCRYPT, array("cost" => 12)); //BCrypy function
	
	$encryptedPassword = md5($input);
	return $encryptedPassword; //Return encrypter password alone
}

function logoutClient(){
	session_destroy();

	return array("error"=>false,
				"results"=>"success");
}

function checkClientSession(){
	$session = getSession();
	if($session['error'] || $session['results']['entity']!="client"){
		$_SESSION['entity'] = "demo";
		$session['results']['entity'] = "demo";
		$session['results']['id'] = NULL;
	}

	return array("error"=>false,
				"msg"=>"success",
				"results"=>$session['results']);
}


?>