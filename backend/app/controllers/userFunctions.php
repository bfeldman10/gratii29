<?php 

//-----------GET QUERIES----------------
function getAllUsers($receiver=NULL){

	try{
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllUsers = $GLOBALS['db']->prepare('SELECT * FROM users');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getAllUsers -> execute();
		if($results = $getAllUsers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No users found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getAllUserIDs(){

	$getAllUsers = $GLOBALS['db']->prepare('SELECT id FROM users');
	$getAllUsers -> execute();
	if($results = $getAllUsers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}

function getGratiiForAllUsers($receiver=NULL){


		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllUsers = $GLOBALS['db']->prepare('SELECT id, userGratii FROM users ORDER BY userGratii ASC');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getAllUsers -> execute();
		if($results = $getAllUsers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No users found
			return array("error"=>true, 
						"msg"=>"404");
		}		

}

function getUser($id,$receiver=NULL){

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getUser = $GLOBALS['db'] -> prepare('SELECT * FROM users WHERE id = ?');
		}else if($receiver=="user" && $_SESSION['userID']==$id){ //User is self
			$getUser = $GLOBALS['db'] -> prepare('SELECT userNickname, userGratii, userAgeMin, userAgeMax,
														userGender, userAvatar, userEmail, PRO, twitterOAuthToken, secondsAddedToAuction,
														userBirthYear, userBirthMonth, userBirthDate
													FROM users WHERE id = ?');
		}else if($receiver=="user" && $_SESSION['userID']!=$id){ //User is stranger
			$getUser = $GLOBALS['db'] -> prepare('SELECT userNickname, userAvatar 
													FROM users WHERE id = ?');
		}else if($receiver=="client"){ //Client request
			$getUser = $GLOBALS['db'] -> prepare('SELECT userNickname, userAgeMin, userAgeMax,
														userGender, userAvatar
													FROM users WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getUser -> execute(array($id)); 
		if($results = $getUser -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			if($receiver=="user" && $_SESSION['userID']==$id){
				$getUserRank = $GLOBALS['db'] -> prepare('SELECT users1.id, users1.userGratii, COUNT(*)+1 AS rank, users3.totalUsers
														FROM users users1
														INNER JOIN users users2 ON users1.userGratii < users2.userGratii
														INNER JOIN (SELECT COUNT(*) AS totalUsers FROM users users3 WHERE activatedAt!=?) users3
														WHERE users1.id = ?');
				$getUserRank -> execute(array("0000-00-00 00:00:00", $id)); 
				$rankResults = $getUserRank -> fetchAll(PDO::FETCH_ASSOC);
				$results[0]['userRank']=$rankResults[0]['rank'];
				$results[0]['totalUsers']=$rankResults[0]['totalUsers'];
			}
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

function getUserRank($inputs,$receiver=NULL){
	if(!isset($inputs['userID']) || $inputs['userID']==""){
		return array("error"=>true,
					"msg"=>"No user ID");
	}
}

function getOldUser($inputs,$receiver=NULL){

	if(!isset($inputs['userEmail']) || $inputs['userEmail']==""){
		return array("error"=>true,
					"msg"=>"No email provided");
	}
	if(!isset($inputs['userPassword']) || $inputs['userPassword']==""){
		return array("error"=>true,
					"msg"=>"No email provided");
	}

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getOldUser = $GLOBALS['db'] -> prepare('SELECT * FROM oldUsers WHERE email = ? AND password=?');
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}
	$getOldUser -> execute(array($inputs['userEmail'], md5($inputs['userPassword'])));
	if($results = $getOldUser -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{ //User not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

	
}

function getUserByUserNickname($userNickname){
	
	try{

		$getUser = $GLOBALS['db'] -> prepare('SELECT * FROM users WHERE userNickname = ?');
		$getUser -> execute(array($userNickname));
		if($results = $getUser -> fetchAll(PDO::FETCH_ASSOC)){
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

function getUserIDByUserNickname($userNickname){
	if(!isset($userNickname) || $userNickname==""){
		$userNickname = Input::get('userNickname');
		if(!isset($userNickname) || $userNickname==""){
			return array("error"=>true,
						"msg"=>"No nickname provided");
		}
	}
	try{

		$getUser = $GLOBALS['db'] -> prepare('SELECT id FROM users WHERE userNickname = ? LIMIT 1');
		$getUser -> execute(array($userNickname));
		if($results = $getUser -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]['id']);
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

function getUserByUserEmail($userEmail){

	try{

		$getUser = $GLOBALS['db'] -> prepare('SELECT * FROM users WHERE userEmail = ?');
		$getUser -> execute(array($userEmail));
		if($results = $getUser -> fetchAll(PDO::FETCH_ASSOC)){
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

function getUserByActivationCode($activationCode){
	
	try{

		$getUser = $GLOBALS['db'] -> prepare('SELECT id FROM users WHERE activationCode = ?');
		$getUser -> execute(array($activationCode));
		if($results = $getUser -> fetchAll(PDO::FETCH_ASSOC)){ //Code found. Return userID
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Code not found.
			return array("error"=>true,
						"msg"=>"404");	
		}

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}
	
}

function getUserGratiiByID($userID){
	try{
		$getUserGratii = $GLOBALS['db']->prepare('SELECT userGratii FROM users WHERE id = ?');
		$getUserGratii -> execute(array($userID));
		if($results = $getUserGratii -> fetch(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"results"=>$results['userGratii']);
		}else{
			return array("error"=>true,
						"msg"=>"404");
		}

	}catch(PDOException $error){
		
		$error = $error->getMessage();
		return array('error' => true,
				    'msg' => "MySQL Error: ".$error);

		die();
	}
}

function countActivatedUsers($receiver=NULL){

	try{
		
		if($receiver===NULL || $receiver){ //No restrictions
			$countActivatedUsers = $GLOBALS['db']->prepare('SELECT count(id) AS count FROM users WHERE activatedAt>?');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$countActivatedUsers -> execute(array($GLOBALS['NOW']));
		if($results = $countActivatedUsers -> fetch(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No users found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getTransactionsByUserID($userID, $entity){
	if(!isset($userID) || $userID==""){ //No userID provided
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}
	if(!isset($entity) || $entity==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($entity=="admin"){ //Admin request, select all data
		$getTransactionsForUser = $GLOBALS['db'] -> prepare('SELECT * FROM transactions 
															WHERE userID = ? ORDER BY id DESC');
	}else if($entity=="user"){ //User request, select specific data
		$getTransactionsForUser = $GLOBALS['db'] -> prepare('SELECT id, memo, gratiiAmount, newBalance, createdAt
															FROM transactions 
															WHERE userID = ? ORDER BY id DESC');
	}else{ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$getTransactionsForUser -> execute(array($userID));
	$numRows = $getTransactionsForUser -> rowCount();

	if($numRows==0){ //No transactions found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. Transaction found. Return list.
		$results = $getTransactionsForUser->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. Tranactions retrieved.",
						'results' => $results);
	}
}

function getInbox($userID, $receiver=NULL){
	if(!isset($userID) || $userID==""){
		return array("error"=>true,
					"msg"=>"No entity provided");
	}
	
	if($receiver=="admin"){ //Admin request, select all data
		$getMsgsForUser = $GLOBALS['db'] -> prepare('SELECT * FROM msgs 
															WHERE userID = ? ORDER BY createdAt DESC');
	}else if($receiver=="user"){ //User request, select specific data
		$getMsgsForUser = $GLOBALS['db'] -> prepare('SELECT id, senderEntity, senderID, template, title, body, footer, link,
															msgBackgroundPic, msgBackgroundColor, msgFontColor, 
															optionA, optionB, optionC, response,
															gratiiReward, openedAt, respondedAt, createdAt
															FROM msgs 
															WHERE userID = ? ORDER BY createdAt DESC LIMIT 50');
	}else{ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$getMsgsForUser -> execute(array($userID));
	$numRows = $getMsgsForUser -> rowCount();
	if($numRows==0){ //No msgs found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. Msgs found. Return list.
		$results = $getMsgsForUser->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. Msgs retrieved.",
						'results' => $results);
	}
}

function getOutbox($userID, $receiver=NULL){
	if(!isset($userID) || $userID==""){
		return array("error"=>true,
					"msg"=>"No entity provided");
	}
	
	if($receiver=="admin"){ //Admin request, select all data
		$getMsgsSent = $GLOBALS['db'] -> prepare('SELECT * FROM msgs 
															WHERE userID = ? ORDER BY createdAt DESC');
		$getMsgsSent -> execute(array($userID));
	}else if($receiver=="user"){ //User request, select specific data
		$getMsgsSent = $GLOBALS['db'] -> prepare('SELECT id, senderEntity, senderID, template, title, body, footer, link,
															msgBackgroundPic, msgBackgroundColor, msgFontColor, 
															optionA, optionB, optionC, response,
															gratiiReward, openedAt, respondedAt, createdAt
															FROM msgs 
															WHERE (template=? OR template=?) AND senderID=? 
															ORDER BY createdAt DESC LIMIT 50');
		$getMsgsSent -> execute(array("userGift", "userSurvey", $userID));
	}else{ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$numRows = $getMsgsSent -> rowCount();
	if($numRows==0){ //No msgs found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. Msgs found. Return list.
		$results = $getMsgsSent->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. Msgs retrieved.",
						'results' => $results);
	}
}

function getAccessTokenForUserID($userID, $receiver=NULL){

	
	$getAccessToken = $GLOBALS['db'] -> prepare('SELECT fbTokenLong FROM users WHERE id=?');
	$getAccessToken -> execute(array($userID));
	
	$numRows = $getAccessToken -> rowCount();
	if($numRows==0){ //No msgs found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. Msgs found. Return list.
		$results = $getAccessToken->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. Access token retrieved.",
						'results' => $results[0]);
	}
}

function getUserByFacebookID($fbUserID){
	$getUser = $GLOBALS['db'] -> prepare('SELECT id FROM users WHERE fbUserID=?');
	$getUser -> execute(array($fbUserID));
	
	$numRows = $getUser -> rowCount();
	if($numRows==0){ //No user found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. User found.
		$results = $getUser->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. User found.",
						'results' => $results[0]);
	}
}

function getUserByTwitterID($twitterUserID){
	$getUser = $GLOBALS['db'] -> prepare('SELECT id FROM users WHERE twitterUserID=?');
	$getUser -> execute(array($twitterUserID));
	
	$numRows = $getUser -> rowCount();
	if($numRows==0){ //No user found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. User found.
		$results = $getUser->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. User found.",
						'results' => $results[0]);
	}
}

function getUserByNodeID($nodeID){
	$getUser = $GLOBALS['db'] -> prepare('SELECT id, userNickname, userAvatar, lastLoginAt FROM users WHERE userNodeID=?');
	$getUser -> execute(array($nodeID));
	
	$numRows = $getUser -> rowCount();
	if($numRows==0){ //No user found
		return array('error' => true,
					'msg' => "404");	
		die();
	}else{ //Success. User found.
		$results = $getUser->fetchAll(PDO::FETCH_ASSOC);	
		return array('error' => false,
						'msg' => "Success. User found.",
						'results' => $results[0]);
	}
}

//-----------INSERT QUERIES----------------
function createUser($inputs){ //Insert the new user

		$createUser = $GLOBALS['db'] -> prepare('INSERT INTO users (userEmail, userNickname, 
									userPassword, userGender, userBirthYear, userBirthMonth, userBirthDate, activationCode, promoterUserID, createdAt)
									VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
		$createUser -> execute(array($inputs['userEmail'], $inputs['userNickname'], $inputs['userPassword'], 
									$inputs['userGender'], $inputs['userBirthYear'], $inputs['userBirthMonth'], $inputs['userBirthDate'],
									$inputs['activationCode'], $inputs['promoterUserID'], $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ // User created successfully. Returning the new user id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No purchase created");
		}

}

function startPurchase($inputs){ //Insert the new user
		
		if(!isset($inputs) || $inputs==""){
			return array("error"=>true,
						"msg"=>"No inputs provided");
		}
		if(!isset($inputs['userID']) || $inputs['userID']==""){
			return array("error"=>true,
						"msg"=>"No user ID provided");
		}
		if(!isset($inputs['packageID']) || $inputs['packageID']==""){
			return array("error"=>true,
						"msg"=>"No product ID provided");
		}
		
		$createPurchase = $GLOBALS['db'] -> prepare('INSERT INTO purchases (userID, packageID, 
									status, createdAt)
									VALUES (?, ?, ?, ?)');
		$createPurchase -> execute(array($inputs['userID'], $inputs['packageID'], 
									"pending", $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ // User created successfully. Returning the new user id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No purchase created");
		}

	
}


//-----------UPDATE QUERIES----------------
function updateUserProfile($userProfile, $id){
	try {
		$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET userNickname=?,
									userAgeMin=?, userAgeMax=?, userGender=?, 
									userBirthYear=?, userBirthMonth=?, userBirthDate=?,
									userAvatar=?, updatedAt=?
									WHERE id=?');
		$updateUser -> execute(array($userProfile['userNickname'], $userProfile['userAgeMin'], 
									$userProfile['userAgeMax'], $userProfile['userGender'], 
									$userProfile['userBirthYear'], $userProfile['userBirthMonth'], $userProfile['userBirthDate'],  
									$userProfile['userAvatar'], $GLOBALS['NOW'], $id));
		
		$numRows = $updateUser -> rowCount();							

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

function updateUserGratii($id, $newGratii){
	try {
		$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET userGratii=?, updatedAt=? WHERE id=?');
		$updateUser -> execute(array($newGratii, $GLOBALS['NOW'], $id));
		
		$numRows = $updateUser -> rowCount();							

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

function updateUserActivation($id){
	try {
		$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET activationCode=?, activatedAt=?, updatedAt=? 
													WHERE id=?');
		$updateUser -> execute(array("", $GLOBALS['NOW'], $GLOBALS['NOW'], $id));
		
		$numRows = $updateUser -> rowCount();							

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

function resetUserAvatar(){
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
		return array("error" => true,
				    "msg" => "No session found");

		die();
	}

	$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET userAvatar=?, updatedAt=? 
													WHERE id=?');
	$updateUser -> execute(array("0", $GLOBALS['NOW'], $_SESSION['userID']));
	
	$numRows = $updateUser -> rowCount();							

	if($numRows==0){
	
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		
		return array('error' => false,
					'results' => $_SESSION['userID']);
	}
}

function newUserNodeID($entity = NULL){
	if(!isset($entity) || $entity==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($entity!="user"){ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$inputs = Input::all();

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['userNodeID']) || $inputs['userNodeID'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No user node ID provided");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID'] == ""){ //No session found
		return array("error"=>true,
					"msg"=>"No session found");
		die();
	}

	
	$updateUserNodeID = $GLOBALS['db'] -> prepare('UPDATE users SET userNodeID=?, lastLoginAt=?, updatedAt=? WHERE id=?');
	$updateUserNodeID -> execute(array($inputs['userNodeID'], $GLOBALS['NOW'], $GLOBALS['NOW'], $_SESSION['userID']));
	$numRows = $updateUserNodeID -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => "User node ID updated");
	}	
}

function removeUserNodeID($entity = NULL){
	if(!isset($entity) || $entity==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($entity!="user"){ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$inputs = Input::all();

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['userNodeID']) || $inputs['userNodeID'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No user node ID provided");
		die();
	}
	
	$updateUserNodeID = $GLOBALS['db'] -> prepare('UPDATE users SET userNodeID=?, lastLogoutAt=?, updatedAt=? WHERE userNodeID=?');
	$updateUserNodeID -> execute(array("---", $GLOBALS['NOW'], $GLOBALS['NOW'], $inputs['userNodeID']));
	$numRows = $updateUserNodeID -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => "User node ID removed");
	}	
}

//FOR PRODUCTION!!
function completePurchase($inputs){

	if(!isset($inputs) || $inputs == ""){ 
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}

	if(!isset($inputs->request->purchaseID) || $inputs->request->purchaseID == ""){ //Missing purchase id
		return array("error"=>true,
					"msg"=>"No purchase ID provided");
		die();
	}
	if(!isset($inputs->response->orderId) || $inputs->response->orderId == ""){ //Missing google order id
		return array("error"=>true,
					"msg"=>"No google order ID provided");
		die();
	}

	$completePurchase = $GLOBALS['db'] -> prepare('UPDATE purchases SET status=?, googleOrderID=?, updatedAt=? WHERE id=?');
	$completePurchase -> execute(array("complete", $inputs->response->orderId, $GLOBALS['NOW'], $inputs->request->purchaseID));
	$numRows = $completePurchase -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No purchase updated");	
		die();
	}else{
		return array('error' => false,
					'results' => $inputs->request->purchaseID);
	}	
}


function cancelSubscription($googleOrderID){

	if(!isset($googleOrderID) || $googleOrderID == ""){ 
		return array("error"=>true,
					"msg"=>"No google order ID provided");
		die();
	}

	$cancelSubscription = $GLOBALS['db'] -> prepare('UPDATE purchases SET status=?, updatedAt=? WHERE googleOrderID=?');
	$cancelSubscription -> execute(array("CANCELED", $GLOBALS['NOW'], $googleOrderID));
	$numRows = $cancelSubscription -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No subscription canceled");	
		die();
	}else{
		return array('error' => false,
					'results' => $googleOrderID);
	}	
}

function failPurchase_Job(){

	$inputs = Input::all();

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['purchaseID']) || $inputs['purchaseID'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No purchase ID provided");
		die();
	}
	if(!isset($inputs['errorType']) || $inputs['errorType'] == ""){ //Missing error type
		$memo = "---";
	}else{
		$memo = $inputs['errorType'];
	}
	
	$completePurchase = $GLOBALS['db'] -> prepare('UPDATE purchases SET status=?, memo=?, updatedAt=? WHERE id=?');
	$completePurchase -> execute(array("failed", $memo, $GLOBALS['NOW'], $inputs['purchaseID']));
	$numRows = $completePurchase -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "Purchase not updated");	
		die();
	}else{
		return array('error' => false,
					'results' => $inputs['purchaseID']);
	}	
}

function increaseUserPRO($inputs){

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['packageID']) || $inputs['packageID'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No package ID provided");
		die();
	}
	if(!isset($inputs['userID']) || $inputs['userID'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No user ID provided");
		die();
	}
	if(!isset($inputs['secondsAddedToPRO']) || $inputs['secondsAddedToPRO'] == ""){ //Missing user node id
		return array("error"=>true,
					"msg"=>"No seconds added to PRO provided");
		die();
	}
	if(!isset($inputs['currentPRO']) || $inputs['currentPRO'] == ""){ //Missing current PRO
		return array("error"=>true,
					"msg"=>"No current PRO status provided");
		die();
	}else{
		if($inputs['currentPRO']>$GLOBALS['NOW']){
			$startIncreaseAt = $inputs['currentPRO'];
		}else{
			$startIncreaseAt = $GLOBALS['NOW'];
		}
	}

	
	$increaseUserPRO = $GLOBALS['db'] -> prepare('UPDATE users SET PRO=DATE_ADD(?,INTERVAL ? SECOND), updatedAt=? WHERE id=?');
	$increaseUserPRO -> execute(array($startIncreaseAt, $inputs['secondsAddedToPRO'], $GLOBALS['NOW'], $inputs['userID']));
	$numRows = $increaseUserPRO -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => $inputs['purchaseID']);	
		die();
	}else{
		return array('error' => false,
					'results' => "Purchase not updated");
	}	
}



function updateFacebookTokens($inputs, $entity = NULL){
	if(!isset($entity) || $entity==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($entity!="user"){ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if(!isset($inputs['fbTokenShort']) || $inputs['fbTokenShort'] == ""){ //Missing fb token short
		return array("error"=>true,
					"msg"=>"No FB Token Short provided");
		die();
	}
	if(!isset($inputs['fbTokenLong']) || $inputs['fbTokenLong'] == ""){ //Missing fb token long
		return array("error"=>true,
					"msg"=>"No FB Token Long provided");
		die();
	}
	if(!isset($inputs['fbUserID']) || $inputs['fbUserID'] == ""){ //Missing fb user ID
		return array("error"=>true,
					"msg"=>"No FB user ID provided");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID'] == ""){ //No session found
		return array("error"=>true,
					"msg"=>"No session found");
		die();
	}

	
	$updateFacebookTokens = $GLOBALS['db'] -> prepare('UPDATE users SET fbTokenShort=?, fbTokenLong=?, fbUserID=?, updatedAt=? WHERE id=?');
	$updateFacebookTokens -> execute(array($inputs['fbTokenShort'], $inputs['fbTokenLong'], 
											$inputs['fbUserID'], $GLOBALS['NOW'], $_SESSION['userID']));
	$numRows = $updateFacebookTokens -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => $inputs['fbTokenLong']);
	}	
}

function updateTwitterTokens(){

	$inputs = Input::all();

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['twitterOAuthToken']) || $inputs['twitterOAuthToken'] == ""){ //Missing twitter OAuth token
		return array("error"=>true,
					"msg"=>"No twitter OAuth token provided");
		die();
	}
	if(!isset($inputs['twitterOAuthTokenSecret']) || $inputs['twitterOAuthTokenSecret'] == ""){ //Missing twitter OAuth token secret
		return array("error"=>true,
					"msg"=>"No twitter OAuth token secret provided");
		die();
	}
	if(!isset($inputs['twitterUserID']) || $inputs['twitterUserID'] == ""){ //Missing twitter user ID secret
		return array("error"=>true,
					"msg"=>"No twitter user ID provided");
		die();
	}
	if(!isset($inputs['gratiiUserID']) || $inputs['gratiiUserID'] == ""){ //No session found
		return array("error"=>true,
					"msg"=>$inputs['gratiiUserID']);
		die();
	}

	$userData = getUserByTwitterID($inputs['twitterUserID']);

	if($userData['error']){
		if($userData['msg']!="404"){
			return array('error' => true,
						'msg' => $userData['msg'],
						'requested'=>"Get user by twitter ID");	
			die();
		}
	}else if($userData['results']['id']!=$inputs['gratiiUserID']){
		return array('error' => true,
						'msg' => "This twitter account has already been linked to different Gratii account");	
		die();
	}

	
	$updateTwitterTokens = $GLOBALS['db'] -> prepare('UPDATE users SET twitterOAuthToken=?, twitterOAuthTokenSecret=?, 
														twitterUserID=?, updatedAt=? WHERE id=?');
	$updateTwitterTokens -> execute(array($inputs['twitterOAuthToken'], $inputs['twitterOAuthTokenSecret'], 
											$inputs['twitterUserID'], $GLOBALS['NOW'], $inputs['gratiiUserID']));
	$numRows = $updateTwitterTokens -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => "User twitter tokens updated");
	}	
}

function updateUserLocationByIPAddress($userID){
	if(!isset($userID) || $userID==""){
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}	

 	//START GEO LOOKUP
    $ip=$_SERVER['REMOTE_ADDR'];
	$geoURL = "http://api.ipinfodb.com/v3/ip-city/?key=812d31717c6903ef81ebfc433059b657b231c03ab9f4ae760117b9fdc8a43066&ip=".$ip."&format=json";
	$ch = curl_init($geoURL);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	$contentsOfGeoURL = curl_exec($ch);
	curl_close($ch);

	$jsonDecodedContentsOfGeoURL = json_decode($contentsOfGeoURL);

	$IPcity = $jsonDecodedContentsOfGeoURL->{'cityName'};
	$IPregion = $jsonDecodedContentsOfGeoURL->{'regionName'};
	$IPcountry = $jsonDecodedContentsOfGeoURL->{'countryName'};
	$IPlat = $jsonDecodedContentsOfGeoURL->{'latitude'};
	$IPlong = $jsonDecodedContentsOfGeoURL->{'longitude'};
	//END GEO LOOKUP

	$updateLocation = $GLOBALS['db'] -> prepare('UPDATE users SET userCity=?, userState=?, 
														userCountry=?, userIP=?, userLat=?, userLong=?,
														 locationProvider=?, lastLoginAt=?, updatedAt=? WHERE id=?');
	$updateLocation -> execute(array($IPcity, $IPregion, $IPcountry, $ip, $IPlat, $IPlong, "IP", $GLOBALS['NOW'], $GLOBALS['NOW'], $userID));
	$numRows = $updateLocation -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => "User location updated");
	}	

}

function updateUserLocationByGoogle($userID, $receiver=NULL){
	if(!isset($userID) || $userID==""){
		return array("error"=>true,
					"msg"=>"No user ID provided");
	}
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if($receiver!="user"){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if($userID != $_SESSION['userID']){
		return array("error"=>true,
					"msg"=>"Invalid request");
	}

	$inputs = Input::all();
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}

	if(!isset($inputs['userLat']) || $inputs['userLat']==""){
		return array("error"=>true,
					"msg"=>"No lat provided");
	}
	if(!isset($inputs['userLong']) || $inputs['userLong']==""){
		return array("error"=>true,
					"msg"=>"No long provided");
	}
	if(!isset($inputs['userIP']) || $inputs['userIP']==""){
		$inputs['userIP'] = "---";
	}

	$googleGeo = file_get_contents("http://maps.googleapis.com/maps/api/geocode/json?latlng=".$inputs['userLat'].",".$inputs['userLong']."&sensor=false");	
	$output = json_decode($googleGeo, true);
	$addressComponents = $output['results'][0]['address_components'];
	// return array("error"=>true,
	// 				"msg"=>$addressComponents);

	$userCity = "---";
	$userState = "---";
	$userCountry = "---";
	$userZip = "---";

	foreach ($addressComponents as $addressComponent) {

		if(in_array('locality', $addressComponent['types']) && in_array('political', $addressComponent['types'])){
			$userCity = $addressComponent['long_name'];
		}

		if(in_array('administrative_area_level_1', $addressComponent['types'])){
			$userState = $addressComponent['short_name'];
		}

		if(in_array('country', $addressComponent['types']) && in_array('political', $addressComponent['types'])){
			$userCountry = $addressComponent['long_name'];
		}

		if(in_array('postal_code', $addressComponent['types'])){
			$userZip = $addressComponent['long_name'];	
		}
	}


	$updateLocation = $GLOBALS['db'] -> prepare('UPDATE users SET userCity=?, userState=?, 
														userCountry=?, userZip=?, userLat=?, userLong=?,
														 locationProvider=?, lastLoginAt=?, updatedAt=? WHERE id=?');
	$updateLocation -> execute(array($userCity, $userState, $userCountry, $userZip, $inputs['userLat'], 
									$inputs['userLong'], "google", 
									$GLOBALS['NOW'], $GLOBALS['NOW'], $userID));
	$numRows = $updateLocation -> rowCount();							
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}else{
		return array('error' => false,
					'results' => "User location updated");
	}	

}

function activateUserAccount(){

	$inputs = Input::all();
	
	if(!isset($inputs['activationCode']) || $inputs['activationCode']==""){
		return array('error' => true,
					'msg' => "No activation code provided.");	
		die();
	}

	$getUser = $GLOBALS['db'] -> prepare('SELECT id FROM users WHERE activationCode = ?');
	$getUser -> execute(array($inputs['activationCode']));
	$numRows = $getUser -> rowCount();
	if($numRows==0){		
		return array('error' => true,
					'msg' => "Invalid activation code. If this persists, please contact Gratii: info@gratii.com");	
		die();
	}

	$results = $getUser -> fetch(PDO::FETCH_ASSOC);
	$userID = $results['id'];
	$currentData = strtotime($GLOBALS['NOW']);
	$oneWeekLater = strtotime("+7 day", $currentData);
	$oneWeekLaterTimestamp = date('Y-m-d H:i:s', $oneWeekLater);

	$activateUserAccount = $GLOBALS['db'] -> prepare('UPDATE users SET activationCode=?,
															activatedAt=?, PRO=?, updatedAt=? 
														WHERE activationCode=?'); 
	$activateUserAccount -> execute(array("---", $GLOBALS['NOW'], $oneWeekLaterTimestamp, $GLOBALS['NOW'], $inputs['activationCode']));
	$numRows = $activateUserAccount -> rowCount();
	if($numRows==0){
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}

	include_once("msgFunctions.php");
	$body = "Welcome to Gratii! Click the blue button for a gift.";
	$welcomeMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
										"recipientIDs"=>array($results['id']),
										"senderEntity"=>"admin",
										"title"=>"Welcome to Gratii!",
										"body"=>$body,
										"template"=>"adminText",
										"gratiiReward"=>"250",
										"groupID"=>"WELCOME_1.0"
										));
	if($welcomeMsg['error']){
		return array("error"=>true,
					"msg"=>$welcomeMsg['msg'],
					"requested"=>"Send welcome msg");
	}

	$body = "We've hooked you up with a 1 week free trial of Gratii PRO. PRO users can challenge friends, send gifts, and win more prizes. See all the benefits and add more time in your profile.";
	$welcomeMsg2 = createMsg_Job(array("senderID"=>"0", //Send challenge msg
										"recipientIDs"=>array($results['id']),
										"senderEntity"=>"admin",
										"title"=>"---",
										"body"=>$body,
										"template"=>"adminText",
										"gratiiReward"=>"0",
										"groupID"=>"FREETRIAL_1.0"
										));
	if($welcomeMsg2['error']){
		return array("error"=>true,
					"msg"=>$welcomeMsg2['msg'],
					"requested"=>"Send trial msg");
	}
	
	return array('error' => false,
					'results' => "User account activated");
	
	
}

function requestPasswordReset(){

	$inputs = Input::all();
	if(!isset($inputs['userEmail']) || $inputs['userEmail']==""){
		return array('error' => true,
					'msg' => "No user email provided");	
		die();
	}

	$passwordCode = strtoupper(substr(md5(rand()),0,7));
	$passwordCodeExpiresAt = date("Y-m-d H:i:s", strtotime($GLOBALS['NOW']." + 24 hours"));

	$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET passwordCode=?, passwordCodeExpiresAt=?, updatedAt=? 
												WHERE userEmail = ?');
	$updateUser -> execute(array($passwordCode, $passwordCodeExpiresAt, $GLOBALS['NOW'], $inputs['userEmail']));
	$numRows = $updateUser -> rowCount();
	if($numRows==0){		
		return array('error' => true,
					'msg' => "Invalid email provided");	
		die();
	}

	$sendPasswordResetEmail = sendPasswordResetEmail(array("userEmail"=>$inputs['userEmail'], 
													"passwordCode"=>$passwordCode));
	if($sendPasswordResetEmail['error']){ // Error creating the new user
		return array("error"=>true,
					"msg"=>$sendPasswordResetEmail['msg']);
		die();
	}

	return array('error' => false,
				'results' => "Password reset requested");

	
}

function updateUserPassword(){
	
	$inputs = Input::all();
	if(!isset($inputs['passwordCode']) || $inputs['passwordCode']==""){
		return array('error' => true,
					'msg' => "No password code provided");	
		die();
	}
	if(!isset($inputs['userPassword']) || $inputs['userPassword']==""){
		return array('error' => true,
					'msg' => "Enter secret password");	
		die();
	}else{
		if(strlen($inputs['userPassword'])>30){ //Max char
			return array('error'=>true,
						'msg'=>"Password: Max 30 characters");	
			die();
		}else if(strlen($inputs['userPassword'])<5){ //Min char
			return array('error'=>true,
						'msg'=>"Password: Min 5 characters");	
			die();
		}else{ //Clean. Add to array.
			$encryptedPassword = encryptPassword($inputs['userPassword']); //Encrypt password
		}
	}

	$getUser = $GLOBALS['db'] -> prepare('SELECT id, passwordCodeExpiresAt FROM users WHERE passwordCode = ?');
	$getUser -> execute(array($inputs['passwordCode']));
	$numRows = $getUser -> rowCount();
	if($numRows==0){		
		return array('error' => true,
					'msg' => "Invalid password code. If this persists, please contact Gratii: info@gratii.com");	
		die();
	}

	$results = $getUser -> fetch(PDO::FETCH_ASSOC);
	if($results['passwordCodeExpiresAt']<$GLOBALS['NOW']){
		return array('error' => true,
					'msg' => "This password code has expired. Please request a password reset again.");	
		die();
	}

	$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET userPassword=?, passwordCode=?, 
															passwordCodeExpiresAt=?, updatedAt=? 
												WHERE passwordCode = ?');
	$updateUser -> execute(array($encryptedPassword, "---", "0000-00-00 00:00:00", 
								$GLOBALS['NOW'], $inputs['passwordCode']));
	$numRows = $updateUser -> rowCount();
	if($numRows==0){		
		return array('error' => true,
					'msg' => "Error updating password");	
		die();
	}

	return array('error' => false,
				'results' => "Password updated");

	
}

//-----------JOBS----------------
function createUser_Job($inputs=NULL){

	if($inputs===null){
		$inputs = Input::all(); //Get inputs
	}

	$cleanProfileInputs = cleanProfileInputs($inputs); //Validate inputs
	
	if($cleanProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanProfileInputs['msg']);	
		die();
	}else if(!isset($cleanProfileInputs['results']['userEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userNickname'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter nickname");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userGender'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter gender");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthMonth'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birth month");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthDate'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birth date");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthYear'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birth year");	
		die();
	}

	if(isset($inputs['userPassword'])){
		$userPassword=$inputs['userPassword'];
		if(strlen($userPassword)>30){ //Max char
			return array('error'=>true,
						'msg'=>"Password: Max 30 characters");	
			die();
		}else if(strlen($userPassword)<5){ //Min char
			return array('error'=>true,
						'msg'=>"Password: Min 5 characters");	
			die();
		}else{ //Clean. Add to array.
			$encryptedPassword = encryptPassword($userPassword); //Encrypt password
		}	
	}else{ // No password
		return array('error' => true,
					'msg' => "Enter secret password");	
		die();
	}

	if(!isset($inputs['promoterUserNickname']) || $inputs['promoterUserNickname']==""){
		$promoterUserID = "---";
	}else{
		$promoterData = getUserByUserNickname($inputs['promoterUserNickname']);
		if($promoterData['error']){
			if($promoterData['msg']=="404"){
				return array('error'=>true,
						'msg'=>"The username that referred you doesn't seem to exist",
						"requested"=>"Get user by nickname");	
				die();
			}else{
				return array('error'=>true,
						'msg'=>$promoterData['msg'],
						"requested"=>"Get user by nickname");	
				die();
			}
		}
		$promoterUserID = $promoterData['results']['id'];	
	}

	$emailAvailable = getUserByUserEmail($cleanProfileInputs['results']['userEmail']); //Check for used email
	if($emailAvailable['error']==false){ // Email found
		return array("error"=>true,
					"msg"=>"Email taken");
		die();
	}

	$nicknameAvailable = getUserByUserNickname($cleanProfileInputs['results']['userNickname']); //Check for used nickname
	if($nicknameAvailable['error']==false){ // Nickname found
		return array("error"=>true,
					"msg"=>"Nickname taken");
		die();
	}

	$activationCode = generateActivationCode(); // Generate unique activation code
	if(!$activationCode){ // Error generating code
		return array("error"=>true,
					"msg"=>"Error generating activation code");
		die();
	}else if($activationCode['error']){ //Mysql error 
		return array("error"=>true,
					"msg"=>$activationCode['msg']);
		die();
	}else{ //Code generated. Set the variable for use.
		$activationCode = $activationCode['results'];
	}

	
	$createUser = createUser(array("userEmail"=>$cleanProfileInputs['results']['userEmail'], 
								"userNickname"=>$cleanProfileInputs['results']['userNickname'],
								"userGender"=>$cleanProfileInputs['results']['userGender'],
								"userBirthYear"=>$cleanProfileInputs['results']['userBirthYear'],
								"userBirthMonth"=>$cleanProfileInputs['results']['userBirthMonth'],
								"userBirthDate"=>$cleanProfileInputs['results']['userBirthDate'],
								"userPassword"=>$encryptedPassword,
								"activationCode"=>$activationCode,
								"promoterUserID"=>$promoterUserID)); // Create the new user
	
	if($createUser['error']){ // Error creating the new user
		return array("error"=>true,
					"msg"=>$createUser['msg']);
		die();
	}

	$sendActivationEmail = sendActivationEmail(array("userEmail"=>$cleanProfileInputs['results']['userEmail'], 
													"activationCode"=>$activationCode));
	if($sendActivationEmail['error']){ // Error creating the new user
		return array("error"=>true,
					"msg"=>$sendActivationEmail['msg']);
		die();
	}

	return array("error"=>false, // New user created successfully. Returning the new user id.
				"results"=>$createUser['results']);
	die();
	
}

function updateUserProfile_Job($id, $receiver=NULL){

	if($receiver!="user" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	$getUser = getUser($id);

	if($getUser['error']){ //Error finding user
		return array("error"=>true,
					"msg"=>$getUser['msg']);
	}
	
	$inputs = Input::all();
	$overwriteProfileInputs = overwriteProfileInputs($getUser['results'], $inputs);
	$cleanProfileInputs = cleanProfileInputs($overwriteProfileInputs['results']);

	if($cleanProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanProfileInputs['msg']);	
		die();
	}else if(!isset($cleanProfileInputs['results']['userEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userNickname'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter nickname");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userGender'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter gender");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthMonth'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birthday");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthYear'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birthday");	
		die();
	}else if(!isset($cleanProfileInputs['results']['userBirthDate'])){ // No nickname
		return array('error' => true,
					'msg' => "Enter birthday");	
		die();
	}

	$nicknameAvailable = getUserByUserNickname($cleanProfileInputs['results']['userNickname']); //Check for used nickname
	if($nicknameAvailable['error']==false && $nicknameAvailable['results']['id']!=$id){ // Nickname found
		return array("error"=>true,
					"msg"=>"Nickname taken");
		die();
	}

	$updateUserProfile = updateUserProfile($cleanProfileInputs['results'], $id);

	if($updateUserProfile['error']){ // Error updating the users profile
		return array("error"=>true,
					"msg"=>$updateUserProfile['msg']);
		die();
	}else{ // User profile updated successfully. Returning the user id.
		return array("error"=>false,
					"results"=>$updateUserProfile['results']);
		die();
	}

}

function loginUser_Job(){
	$userEmail = Input::get('userEmail');
	$userPassword = Input::get('userPassword');
	
	if($userEmail==""){ //No email input
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}
	if($userPassword==""){ //No password input
		return array('error' => true,
					'msg' => "Enter password");
		die();
	}

	$userData = getUserByUserEmail($userEmail); //Get user data associated with email
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg']);
		die();
	}

	if (md5($userPassword) != $userData['results']['userPassword']) { //Password encryption check	    
 		return array('error' => true,
					'msg' => "401");
		die();
	}
	if($userData['results']['activatedAt']=="0000-00-00 00:00:00"){ //Account activated
		return array('error' => true,
					'msg' => "Account not activated");
		die();
	}
	if($userData['results']['userBanned']==1){ //Account banned
		return array('error' => true,
					'msg' => "Account banned");
		die();
	}
	if($userData['results']['lastLoginAt']=="0000-00-00 00:00:00" && $userData['results']['promoterUserID']!="---"){
		include_once("msgFunctions.php");
		$body = "Your friend ".$userData['results']['userNickname']." just signed up for Gratii. Thanks for referring them!";
		$thankYouMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
											"recipientIDs"=>array($userData['results']['promoterUserID']),
											"senderEntity"=>"admin",
											"title"=>"Thanks!",
											"body"=>$body,
											"template"=>"adminText",
											"gratiiReward"=>"100",
											"groupID"=>"PROMOTERTHANKYOU_1.0",
											// "msgBackgroundPic"=>$messageData['msgBackgroundPic'],
											// "msgBackgroundColor"=>$messageData['msgBackgroundColor'],
											// "msgFontColor"=>$messageData['msgFontColor'],
											"meta"=>array("referredUserID"=>$userData['results']['id'])));
		if($thankYouMsg['error']){
			return array("error"=>true,
						"msg"=>$thankYouMsg['msg'],
						"requested"=>"Send thank you msg");
		}
	}
	
	 
	if($userData['results']['locationProvider']!="google"){  
	    $updateLocation = updateUserLocationByIPAddress($userData['results']['id']);
	    if($updateLocation['error']){ //Error getting user data
			return array("error"=>true,
						"msg"=>$updateLocation['msg']);
			die();
		}
	}

	$_SESSION['userID'] = $userData['results']['id'];
	$_SESSION['entity'] = "user";

	return array("error"=>false,
				"results"=>array("entity"=>$_SESSION['entity'],
								"id"=>$_SESSION['userID'])); //Success

}

function getTransactionsByUserID_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No entity provided");
	}
	if($receiver=="admin"){ //Admin request
		$userID = Input::get('userID'); //Get user ID from json
	}else if($receiver=="user"){ //User request
		$userID = $_SESSION['userID']; //Get user ID from session
	}else{ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$userTransactions = getTransactionsByUserID($userID, $receiver); //Get transactions for user
	if($userTransactions['error']){ //Error getting transactions
		return array("error"=>true,
					"msg"=>$userTransactions['msg'],
					"requested"=>"Get transaction by user ID");
	}

	if($receiver=="admin"){ //If admin, return raw data. Success.
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$userTransactions['results']);
	}
	
	$cleanForUser = formatTransactionsList($userTransactions['results']); //Format transactions list
	if($cleanForUser['error']){ //Error formatting transactions list
		return array("error"=>true,
					"msg"=>$cleanForUser['msg'],
					"requested"=>"Format transactions list");
	}

	return array("error"=>false, //Success. Return formatted transactions list
					"msg"=>"success",
					"results"=>$cleanForUser['results']);
	
}

function getInbox_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No entity provided");
	}
	if($receiver=="admin"){ //Admin request
		$userID = Input::get('userID'); //Get user ID from json
	}else if($receiver=="user"){ //User request
		$userID = $_SESSION['userID']; //Get user ID from session
	}else{ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$inbox = getInbox($_SESSION['userID'], $receiver); //Get inbox
	if($inbox['error']){ //Error getting inbox
		return array("error"=>true,
					"msg"=>$inbox['msg'],
					"requested"=>"Get inbox");
	}

	$msgs = array(); //Initiate msgs array
	foreach ($inbox['results'] as $msg) { //For each msg
		if($msg['senderEntity']=="user"){ //If sent by user
			$senderData = getUser($msg['senderID']); //Get sender data
			if($senderData['error']){ //Error getting sender data
				return array('error' => true,
							'msg' => $senderData['msg'],
							"requested"=>"Get sender data");	
				die();
			}else{ //Inject sender nickname and avatar
				$msg['senderNickname'] = $senderData['results']['userNickname']; //Inject sender nickname
				$msg['senderAvatar'] = $senderData['results']['userAvatar']; //Inject sender avatar
				$msgs[] = $msg;
			}
		}else{ //Add raw msg to array
			$msgs[] = $msg;
		}
	}

	return array("error"=>false, //Success. Return msgs.
				"results"=>$msgs);
}

function externalGameEvent_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"No entity provided");
		die();
	}
	if($receiver!="user"){ //Not a user
		return array("error"=>true,
					"msg"=>"Invalid entity");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){ //No session
		return array("error"=>true,
					"msg"=>"No session found");
		die();
	}

	$inputs = Input::all(); //Get json data
	
	if(count($inputs) == 0){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}

	foreach ($inputs as $input) {
		
		if(!isset($input['gameToken']) || $input['gameToken'] == ""){
			return array("error"=>true,
						"msg"=>"No token provided");
			die();
		}
		if(!isset($input['eventName']) || $input['eventName'] == ""){
			return array("error"=>true,
						"msg"=>"No event name provided");
			die();
		}
		if(!isset($input['score']) || $input['score'] == ""){
			$input['score'] = 0;
		}
		
		include_once("gameEventFunctions.php");
		$gameData = getGameByToken($input['gameToken']);
		if($gameData['error']){
			return array("error"=>true,
						"msg"=>$gameData['msg'],
						"requested"=>"Get game");
		}
		$input['gameID'] = $gameData['results']['id'];

		$equations = getGameEquations(array("gameID"=>$gameData['results']['id']));
		if($equations['error']){
			return array("error"=>true,
						"msg"=>$equations['msg'],
						"requested"=>"Get game equations");
		}

		if(array_key_exists($input['eventName'], $equations['results'])){
			
			if($input['eventName']=="gameOver"){
				if(!isset($input['finalScore']) || $input['finalScore'] === ""){
					return array("error"=>true,
								"msg"=>"No final score provided");
					die();
				}

				$saveFinalScore = saveFinalScore(array("gameID"=>$gameData['results']['id'],
														"finalScore"=>$input['finalScore']));
				if($saveFinalScore['error']){
					return array("error"=>true,
								"msg"=>$saveFinalScore['msg'],
								"requested"=>"Save final score");
				}

				$results[] = array("finalScore"=>$input['finalScore'],
							"final score id"=>$saveFinalScore['results']);

				if(!$input['score']){
					$input['score'] = $input['finalScore'];
				}

			}
		}else{
			return array("error"=>true,
						"msg"=>"Invalid game event");
		}

		

		$gratiiEarned = floor($equations['results'][$input['eventName']]*$input['score']);
		if($gratiiEarned>0){
			
			include_once("transactionFunctions.php");
			$createTransaction = createTransaction_Job(array("memo"=>"From playing ".$gameData['results']['gameName'],
															"gratiiAmount"=>$gratiiEarned,
															"referenceTable"=>"games",
															"referenceTableID"=>$gameData['results']['id'],
															"meta"=>array("eventName"=>$input['eventName'],
																		"score"=>$input['score'],
																		"equation"=>$equations['results'])));
			if($createTransaction['error']){
				return array("error"=>true,
							"msg"=>$createTransaction['msg'],
							"requested"=>"Create transaction");
			}

			$results[] = array("gratiiEarned"=>$gratiiEarned,
							"transactions"=>$createTransaction['results']);
		}else if($gratiiEarned<0){
			$userData = getUser($_SESSION['userID']);
			if($userData['error']){
				return array("error"=>true,
							"msg"=>$userData['msg'],
							"requested"=>"Get use");
			}

			if($userData['results']['PRO']<$GLOBALS['NOW']){ //Not PRO
				if($gratiiEarned<-25){
					return array("error"=>true,
							"msg"=>"PRO##Max bet is 25. PRO accounts can bet way more.");
				}	
			}else if($gratiiEarned<-500){
				return array("error"=>true,
							"msg"=>"Max bet is 500.");
			}

			include_once("transactionFunctions.php");
			$createTransaction = createTransaction_Job(array("memo"=>"From playing ".$gameData['results']['gameName'],
															"gratiiAmount"=>$gratiiEarned,
															"referenceTable"=>"games",
															"referenceTableID"=>$gameData['results']['id'],
															"meta"=>array("eventName"=>$input['eventName'],
																		"score"=>$input['score'],
																		"equation"=>$equations['results'])));
			if($createTransaction['error']){
				return array("error"=>true,
							"msg"=>$createTransaction['msg'],
							"requested"=>"Create transaction");
			}

			$results[] = array("gratiiEarned"=>$gratiiEarned,
							"transactions"=>$createTransaction['results']);
		}else{
			$results[] = array("gratiiEarned"=>$gratiiEarned,
							"transactions"=>"no transaction created");
		}
		
		

	}

	return array("error"=>false,
				"requested"=>"Earned gratii",
				"results"=>$results);
}

function importUserAccount_Job($receiver=NULL){
	
	$inputs = Input::all(); //Get json data

	if(count($inputs) == 0){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['userEmail']) || $inputs['userEmail']==""){
		return array("error"=>true,
					"msg"=>"No email provided");
		die();
	}
	if(!isset($inputs['userPassword']) || $inputs['userPassword']==""){
		return array("error"=>true,
					"msg"=>"No password provided");
		die();
	}
	if(!isset($inputs['userNickname']) || $inputs['userNickname']==""){
		return array("error"=>true,
					"msg"=>"No nickname provided");
		die();
	}

	$oldUserData = getOldUser($inputs);
	if($oldUserData['error']){
		if($oldUserData['msg']=="404"){
			return array("error"=>true,
						"msg"=>"We couldn't find an account that matched the email and password you provided.",
						"requested"=>"Create user");
		}else{
			return array("error"=>true,
						"msg"=>$oldUserData['msg'],
						"requested"=>"Create user");
		}
	}

	$createUser = createUser_Job($inputs);
	if($createUser['error']){
		if($createUser['msg']=="Nickname taken"){
			return array("error"=>true,
						"msg"=>"We found your old account, but someone else has taken this nickname. Enter a new nickname and we will sync your old account with it.",
						"requested"=>"Create user");
		}else{
			return array("error"=>true,
					"msg"=>$createUser['msg'],
					"requested"=>"Create user");
		}
	}

	$updateUser = $GLOBALS['db'] -> prepare('UPDATE users SET activatedAt=?, userGratii=?, updatedAt=?
												WHERE id=?');
	$updateUser -> execute(array($GLOBALS['NOW'], $oldUserData['results']['gratii'], 
								$GLOBALS['NOW'], $createUser['results']));
	
	$numRows = $updateUser -> rowCount();							

	if($numRows==0){
	
		return array('error' => true,
					'msg' => "No updates made.");	
		die();
	}

	return array("error"=>false,
				"msg"=>"User imported",
				"results"=>$createUser['results']);

}

function startPurchase_Job($receiver=NULL){
	$inputs = Input::all(); //Get json data

	if(count($inputs) == 0){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['userID']) || $inputs['userID']==""){
		return array("error"=>true,
					"msg"=>"No user id provided");
		die();
	}
	if(!isset($inputs['packageID']) || $inputs['packageID']==""){
		return array("error"=>true,
					"msg"=>"No package ID provided");
		die();
	}

	include_once("packageFunctions.php");
	$packageData = getPackage($inputs['packageID']);
	if($packageData['error']){
		return array("error"=>true,
					"msg"=>$packageData['msg'],
					"requested"=>"Get package");
		die();
	}

	$startPurchase = startPurchase($inputs);
	if($startPurchase['error']){
		return array("error"=>true,
					"msg"=>$startPurchase['msg'],
					"requested"=>"Start purchase");
		die();
	}

	$inputs['packageName'] = $packageData['results']['packageName'];
	$inputs['packageDescription'] = $packageData['results']['packageDescription'];
	$inputs['packageCost'] = $packageData['results']['packageCost'];
	$inputs['secondsAddedToPRO'] = $packageData['results']['secondsAddedToPRO'];
	$inputs['paymentModel'] = $packageData['results']['paymentModel'];
	$inputs['purchaseID'] = $startPurchase['results'];

	include_once("googlePayments/generate_token.php");
	$JWTData = createJWT($inputs);
	if($JWTData['error']){
		return array("error"=>true,
					"msg"=>$JWTData['msg'],
					"requested"=>"Create JWT");
		die();
	}

	return array("error"=>false,
				"results"=>$JWTData['results']);
}

function completePurchase_Job($receiver=NULL){
	$inputs = Input::all(); //Get json data

	if(count($inputs) == 0){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['jwt']) || $inputs['jwt']==""){
		return array("error"=>true,
					"msg"=>"No jwt provided");
		die();
	}
	
	include_once("googlePayments/JWT.php");
	include_once("googlePayments/seller_info.php");
	$sellerSecretKey = SellerInfo::$secretKey;
	$JWT = new JWT;
	$decodedJWT = $JWT->decode($inputs['jwt'], $sellerSecretKey, true); 

	if(isset($decodedJWT->response->statusCode) && $decodedJWT->response->statusCode=="SUBSCRIPTION_CANCELED"){
		$cancelSubscription = cancelSubscription($decodedJWT->response->orderId);
		if($cancelSubscription['error']){
			return array("error"=>true,
						"msg"=>"Subscription not canceled",
						"requested"=>"Cancel subscription");
			die();
		}else{
			return array("error"=>false,
						"results"=>$decodedJWT->response->orderId);
		}
	}

	$completePurchase = completePurchase($decodedJWT);
	if($completePurchase['error']){
		return array("error"=>true,
					"msg"=>$completePurchase['msg'],
					"requested"=>"Complete purchase");
		die();
	}

	$userData = getUser($decodedJWT->request->userID);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user");
		die();
	}

	$increaseUserPRO = increaseUserPRO(array("packageID"=>$decodedJWT->request->packageID,
											"secondsAddedToPRO"=>$decodedJWT->request->secondsAddedToPRO,
											"userID"=>$decodedJWT->request->userID,
											"currentPRO"=>$userData['results']['PRO']));
	if($increaseUserPRO['error']){
		return array("error"=>true,
					"msg"=>$increaseUserPRO['msg'],
					"requested"=>"Increase user PRO");
		die();
	}

	include_once("msgFunctions.php");
	if($userData['results']['promoterUserID']!="---"){
		$body = "Your friend ".$userData['results']['userNickname']." just upgraded to a PRO account. Here's a bonus since you referred them to Gratii!";
		$bonusMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
											"recipientIDs"=>array($userData['results']['promoterUserID']),
											"senderEntity"=>"admin",
											"title"=>"Thanks!",
											"body"=>$body,
											"template"=>"adminText",
											"gratiiReward"=>"150",
											"groupID"=>"PROMOTERUPGRADETHANKYOU_1.0",
											// "msgBackgroundPic"=>$messageData['msgBackgroundPic'],
											// "msgBackgroundColor"=>$messageData['msgBackgroundColor'],
											// "msgFontColor"=>$messageData['msgFontColor'],
											"meta"=>array("packageID"=>$decodedJWT->request->packageID,
														"upgradersUserID"=>$decodedJWT->request->userID,
														"googleOrderID"=>$decodedJWT->response->orderId)));
		if($bonusMsg['error']){
			return array("error"=>true,
						"msg"=>$bonusMsg['msg'],
						"requested"=>"Send bonus msg");
		}
	}

	$body = "Now that you're a PRO user you can win more prizes, challenge friends, send gifts, and bet more. Take advantage while it lasts!";
	$PROMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
										"recipientIDs"=>array($decodedJWT->request->userID),
										"senderEntity"=>"admin",
										"title"=>"You're a PRO!",
										"body"=>$body,
										"template"=>"adminText",
										"gratiiReward"=>"250",
										"groupID"=>"YOUREAPRO_1.0",
										// "msgBackgroundPic"=>$messageData['msgBackgroundPic'],
										// "msgBackgroundColor"=>$messageData['msgBackgroundColor'],
										// "msgFontColor"=>$messageData['msgFontColor'],
										"meta"=>array("packageID"=>$decodedJWT->request->packageID,
													"googleOrderID"=>$decodedJWT->response->orderId)));
	if($PROMsg['error']){
		return array("error"=>true,
					"msg"=>$PROMsg['msg'],
					"requested"=>"Send PRO msg");
	}
	

	return array("error"=>false,
				"results"=>$decodedJWT->response->orderId);
	
}

function getBidsInPlay_Job($receiver=NULL){

	include_once("auctionFunctions.php");
	$liveAuctions = getLiveAuctions_Job("user");
	if($liveAuctions['error']){
		if($liveAuctions['msg']=="404"){
			return array("error"=>false,
				"results"=>0);
		}else{
			return array("error"=>true,
					"msg"=>$liveAuctions['msg'],
					"requested"=>"Get live auctions");
			die();
		}
	}

	$bidsInPlay=0;
	foreach ($liveAuctions['results'] as $liveAuction) {
		if($liveAuction['leaderID']==$_SESSION['userID']){
			$bidsInPlay++;
		}
	}

	return array("error"=>false,
				"results"=>$bidsInPlay);

}

function getAuctionsWonIn24Hours_Job($receiver=NULL){

	include_once("auctionFunctions.php");
	$pastAuctions = getPastAuctions_Job($receiver);
	if($pastAuctions['error']){
		if($pastAuctions['msg']=="404"){
			return array("error"=>false,
				"results"=>0);
		}else{
			return array("error"=>true,
						"msg"=>$pastAuctions['msg'],
						"requested"=>"Get live auctions");
			die();
		}
	}

	$wins=0;
	$unixTimestamp = strtotime($GLOBALS['NOW']);
	$_24HoursAgo = $unixTimestamp-86400;

	foreach ($pastAuctions['results'] as $pastAuction) {
		if($pastAuction['leaderID']==$_SESSION['userID']){
			$endsAtUnix = strtotime($pastAuction['endsAt']);
			if($endsAtUnix>=$_24HoursAgo){
				$wins++;
			}
		}
	}

	return array("error"=>false,
				"results"=>$wins);

}

function getGratiiGiftedIn24Hours_Job(){

	$outbox = getOutbox($_SESSION['userID'], "user");
	if($outbox['error']){
		if($outbox['msg']=="404"){
			return array("error"=>false,
				"results"=>0);
		}else{
			return array("error"=>true,
						"msg"=>$outbox['msg'],
						"requested"=>"Get outbox");
			die();
		}
	}

	$gratiiGifted=0;
	$unixTimestamp = strtotime($GLOBALS['NOW']);
	$_24HoursAgo = $unixTimestamp-86400;

	foreach ($outbox['results'] as $msgSent) {
		$sentAtUnix = strtotime($msgSent['createdAt']);
		if($sentAtUnix>=$_24HoursAgo){
			$gratiiGifted+=$msgSent['gratiiReward'];
		}	
	}

	return array("error"=>false,
				"results"=>$gratiiGifted);

}

function updateFacebookTokens_Job($entity = NULL){
	require_once("fbSDK/facebook.php"); //Require FB SDK
	$facebook = new Facebook(array(
		'appId'  => '460797110647944',
		'secret' => '713e2afb97e280c194a04054a45fe59e',
	));


	if(!isset($entity) || $entity==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($entity!="user"){ //Invalid entity
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$inputs = Input::all();

	if(!isset($inputs) || $inputs == ""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['fbTokenShort']) || $inputs['fbTokenShort'] == ""){ //Missing FB Token Short
		return array("error"=>true,
					"msg"=>"No FB Token Short provided");
		die();
	}
	if(!isset($inputs['fbUserID']) || $inputs['fbUserID'] == ""){ //Missing FB Token Short
		return array("error"=>true,
					"msg"=>"No Facebook user ID provided");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID'] == ""){ //No session found
		return array("error"=>true,
					"msg"=>"No session found");
		die();
	}

	$fbTokenShort = $inputs['fbTokenShort'];

	$ch = curl_init(); //Init curl
	$curlConfig = array( //Curl config
	    CURLOPT_URL            => "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=460797110647944&client_secret=713e2afb97e280c194a04054a45fe59e&fb_exchange_token=".$fbTokenShort."", //API endpoint
	    CURLOPT_RETURNTRANSFER => true, //Return results
	);
	curl_setopt_array($ch, $curlConfig); //Finish config
	$fbTokenLong = curl_exec($ch); //Results returned from API
	curl_close($ch); //Close curl. Success
	parse_str($fbTokenLong, $fbTokenLongArray); //Convert token string results into array
	$setToken = $facebook->setAccessToken($fbTokenLongArray['access_token']);

	$userData = getUserByFacebookID($inputs['fbUserID']);
	if($userData['error']){
		if($userData['msg']!="404"){
			return array('error' => true,
						'msg' => $userData['msg'],
						'requested'=>"Get user by FB ID");	
			die();
		}
	}else if($userData['results']['id']!=$_SESSION['userID']){
		return array('error' => true,
						'msg' => "This Facebook account has already been linked to different Gratii account");	
		die();
	}

	$updateFacebookTokens = updateFacebookTokens(array("fbTokenShort"=>$fbTokenShort,
														"fbTokenLong"=>$fbTokenLongArray['access_token'],
														"fbUserID"=>$inputs['fbUserID']),"user");
	if($updateFacebookTokens['error']){
		return array('error' => true,
					'msg' => $updateFacebookTokens['msg'],
					'requested'=>"Update FB Token Long");	
		die();
	}
		
	return array('error' => false,
				'results' => $updateFacebookTokens['results']);	
	die();
	
}


function checkIfTokenIsValid($userID, $fbTokenLong){
	
	$baseUrl = "https://graph.facebook.com/me?access_token=";
	$url = $baseUrl.$fbTokenLong;
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	// Set so curl_exec returns the result instead of outputting it.
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	// Get the response and close the channel.
	$response = curl_exec($ch);
	curl_close($ch);

	$decodedResponse = json_decode($response, TRUE);
	if(array_key_exists("id", $decodedResponse)){	
		return true;
	}else{
		
		return false;
	}

}

function getFacebookLikes_Job($userID, $receiver=NULL){
	if(!isset($receiver) || $receiver==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($receiver=="user"){
		if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
			return array("error"=>true,
					"msg"=>"No session found");
		}else{
			$userID = $_SESSION['userID'];
		}
	}else if($receiver=="admin"){ //Invalid entity
		if(!isset($userID) || $userID==""){
			return array("error"=>true,
					"msg"=>"No user ID provided");
		}else{
			$userID = $userID;
		}
	}else{
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$userData = getUser($userID);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg']);
	}

	require_once("fbSDK/facebook.php"); //Require FB SDK
	$facebook = new Facebook(array(
		'appId'  => '460797110647944',
		'secret' => '713e2afb97e280c194a04054a45fe59e',
	));


	$tokenIsValid = checkIfTokenIsValid($userID, $userData['results']['fbTokenLong']);
	if(!$tokenIsValid){

		return array("error"=>false,
				"results"=>array());
	}

	$fbLikes = $facebook->api($userData['results']['fbUserID'], array(
		'fields'=>'likes.limit(5000)',
		'access_token'=>$userData['results']['fbTokenLong']
	));

	if(array_key_exists('likes', $fbLikes)){
		return array("error"=>false,
				"results"=>$fbLikes['likes']['data']);
	}else{
		return array("error"=>false,
				"results"=>array());
	}

}


function getTwitterFollows_Job($userID, $receiver=NULL){
	if(!isset($receiver) || $receiver==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($receiver=="user"){
		if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
			return array("error"=>true,
					"msg"=>"No session found");
		}else{
			$userID = $_SESSION['userID'];
		}
	}else if($receiver=="admin"){ //Invalid entity
		if(!isset($userID) || $userID==""){
			return array("error"=>true,
					"msg"=>"No user ID provided");
		}else{
			$userID = $userID;
		}
	}else{
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$userData = getUser($userID);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg']);
	}

	require_once('twitterSDK/config.php');
	require_once('twitterSDK/twitteroauth/twitteroauth.php');
	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, 
										$userData['results']['twitterOAuthToken'], 
										$userData['results']['twitterOAuthTokenSecret']);

	// $content = $connection1->get('account/verify_credentials');
	$twitterFollows = $connection->get('friends/ids');

	$jsonResponse = get_object_vars($twitterFollows);
	if(isset($jsonResponse['errors'])){
		return array("error"=>true,
				"msg"=>$jsonResponse['errors']);
		
	}else{
		return array("error"=>false,
			"results"=>$twitterFollows);
		
	}


}

function getCurrentNodeConnections_Job($receiver=NULL){
	if(!isset($receiver) || $receiver==""){ //No entity provided
		return array("error"=>true,
					"msg"=>"No entity provided");
	}else if($receiver!="user" && $receiver!="admin"){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	$CURL = $GLOBALS['nodeRoot']."/currentlyOnline";
	$ch = curl_init($CURL);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	$contentsOfCURL = curl_exec($ch);
	curl_close($ch);
	$decodedContentsOfCURL = json_decode($contentsOfCURL, true);
	//echo $contentsOfCURL; die();
	$onlineUsers = array();
	foreach($decodedContentsOfCURL AS $user) {
		$userData = getUserByNodeID($user['nodeID']); 
		if($userData['error']){
			if($userData['msg']=="404"){

			}else{
				return array("error"=>true,
							"msg"=>$userData['msg'],
							"requested"=>"Get user by nodeID");
			}
		}else if($_SESSION['entity']=="user"){
			if($userData['results']['id']!=$_SESSION['userID']){
				$onlineUsers[] = $userData['results'];
			}
		}else{
			$onlineUsers[] = $userData['results'];
		}			
	}

	return array("error"=>false,
				"results"=>$onlineUsers);
}

function takeTaxes_Job(){
	$allUsers = getGratiiForAllUsers();
	if($allUsers['error']){
		return array("error"=>true,
					"msg"=>$allUsers['msg'],
					"requested"=>"Get all users gratii");
	}

	$results = array();
	include_once("transactionFunctions.php");
	foreach ($allUsers['results'] as $user) {
		$taxRate = .02;
		$userOwes = ceil($taxRate*$user['userGratii']);
		if($userOwes>0){
			$createTransaction = createTransaction_Job(array("memo"=>"Taxes",
															"gratiiAmount"=>$userOwes*-1,
															"referenceTable"=>"taxes",
															"referenceTableID"=>1,
															"userID"=>$user['id'],
															"meta"=>array("taxRate"=>$taxRate)));
			if($createTransaction['error']){
				return array("error"=>true,
							"msg"=>$createTransaction['msg'],
							"requested"=>"Create transaction");
			}

			$results[] = array("gratiiEarned"=>$userOwes*-1,
							"transactions"=>$createTransaction['results']);
		}

	}

	return array("error"=>false,
				"results"=>$results);
}
//-----------TASKS----------------
function cleanProfileInputs($inputs){
	
	$cleanProfileInputs = array(); // Initiate array to be returned.
	if(isset($inputs['userNickname'])){
		$userNickname=$inputs['userNickname'];
		if(strlen($userNickname)>16){ //Max char
			return array('error' => true,
						'msg' => "Nickname: Max 16 characters");	
			die();
		}else if(!preg_match('/^[a-zA-Z\d]+$/', $userNickname)){
			return array('error' => true,
						'msg' => "Nickname invalid. Remove special characters.");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userNickname'] = $userNickname;
		}
	}
	if(isset($inputs['userEmail'])){
		$userEmail=$inputs['userEmail'];
		if(strlen($userEmail)>40){ //Max char
			return array('error' => true,
						'msg' => "Email: Max 40 characters");	
			die();
		}else if(!filter_var($userEmail, FILTER_VALIDATE_EMAIL)){ //Email validation
			return array('error' => true,
						'msg' => "Email invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userEmail'] = $userEmail;
		}
	}
	if(isset($inputs['userAgeMin'])){
		$userAgeMin=$inputs['userAgeMin'];
		if(!is_numeric($userAgeMin) || $userAgeMin<0 || $userAgeMin>65 || floor($userAgeMin)!=ceil($userAgeMin)){ //Valid min age
			return array('error' => true,
						'msg' => "Min age invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userAgeMin'] = $userAgeMin;
		}
	}
	if(isset($inputs['userAgeMax'])){
		$userAgeMax=$inputs['userAgeMax'];
		if(!is_numeric($userAgeMax) || $userAgeMax<12 || $userAgeMax>99 || floor($userAgeMax)!=ceil($userAgeMax)){ //Valid max age
			return array('error' => true,
						'msg' => "Max age invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userAgeMax'] = $userAgeMax;
		}
	}
	if(isset($inputs['userGender'])){
		$userGender=$inputs['userGender'];
		if($userGender!="m" && $userGender!="f" && $userGender!="---"){ //Valid genders
			return array('error' => true,
						'msg' => "Gender invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userGender'] = $userGender;
		}
	}
	if(isset($inputs['userBirthMonth']) && isset($inputs['userBirthDate']) && isset($inputs['userBirthYear'])){
		
		if(!is_numeric($inputs['userBirthMonth']) || $inputs['userBirthMonth']<0 || floor($inputs['userBirthMonth'])!=ceil($inputs['userBirthMonth'])){ 
			return array('error' => true,
						'msg' => "Invalid birth month");	
			die();
		}
		if(!is_numeric($inputs['userBirthDate']) || $inputs['userBirthDate']<0 || floor($inputs['userBirthDate'])!=ceil($inputs['userBirthDate'])){ 
			return array('error' => true,
						'msg' => "Invalid birth date");	
			die();
		}
		if(!is_numeric($inputs['userBirthYear']) || $inputs['userBirthYear']<0 || floor($inputs['userBirthYear'])!=ceil($inputs['userBirthYear'])){ 
			return array('error' => true,
						'msg' => "Invalid birth year");	
			die();
		}

		$dob = $inputs['userBirthYear']."-".$inputs['userBirthMonth']."-".$inputs['userBirthDate'];
		   
		$minAgeUnix=strtotime("-13 YEAR");
		$userAgeUnix= strtotime($dob);
			
		if($userAgeUnix > $minAgeUnix){
			return array('error' => true,
						'msg' => "Sorry, you must be at least 13 to user Gratii.");	
			die();
		}
		
		$cleanProfileInputs['userBirthMonth'] = $inputs['userBirthMonth'];
		$cleanProfileInputs['userBirthDate'] = $inputs['userBirthDate'];
		$cleanProfileInputs['userBirthYear'] = $inputs['userBirthYear'];
	}

	if(isset($inputs['userAvatar'])){
		$userAvatar=$inputs['userAvatar'];
		if(!is_numeric($userAvatar) || $userAvatar<0 || floor($userAvatar)!=ceil($userAvatar)){ //Valid avatars
			return array('error' => true,
						'msg' => "Avatar invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanProfileInputs['userAvatar'] = $userAvatar;
		}
	}

	return array("error"=>false,
				"results"=>$cleanProfileInputs);

}

function overwriteProfileInputs($userProfile, $inputs){

	$overwriteProfileInputs = array(); // Initiate array to be returned.

	if(isset($inputs['userNickname'])&&$inputs['userNickname']!=""){
		$userNickname = $inputs['userNickname'];
		$overwriteProfileInputs['userNickname'] = $userNickname;
	}else if(isset($userProfile['userNickname'])){
		$userNickname = $userProfile['userNickname'];
		$overwriteProfileInputs['userNickname'] = $userNickname;
	}
	if(isset($inputs['userEmail'])&&$inputs['userEmail']!=""){
		$userEmail = $inputs['userEmail'];
		$overwriteProfileInputs['userEmail'] = $userEmail;
	}else if(isset($userProfile['userEmail'])){
		$userEmail = $userProfile['userEmail'];
		$overwriteProfileInputs['userEmail'] = $userEmail;
	}
	if(isset($inputs['userAgeMin'])){
		$userAgeMin = $inputs['userAgeMin'];
		$overwriteProfileInputs['userAgeMin'] = $userAgeMin;
	}else if(isset($userProfile['userAgeMin'])){
		$userAgeMin = $userProfile['userAgeMin'];
		$overwriteProfileInputs['userAgeMin'] = $userAgeMin;
	}
	if(isset($inputs['userAgeMax'])){
		$userAgeMax = $inputs['userAgeMax'];
		$overwriteProfileInputs['userAgeMax'] = $userAgeMax;
	}else if(isset($userProfile['userAgeMax'])){
		$userAgeMax = $userProfile['userAgeMax'];
		$overwriteProfileInputs['userAgeMax'] = $userAgeMax;
	}
	if(isset($inputs['userGender'])){
		$userGender = $inputs['userGender'];
		$overwriteProfileInputs['userGender'] = $userGender;
	}else if(isset($userProfile['userGender'])){
		$userGender = $userProfile['userGender'];
		$overwriteProfileInputs['userGender'] = $userGender;
	}
	if(isset($inputs['userBirthYear'])){
		$userBirthYear = $inputs['userBirthYear'];
		$overwriteProfileInputs['userBirthYear'] = $userBirthYear;
	}else if(isset($userProfile['userBirthYear'])){
		$userBirthYear = $userProfile['userBirthYear'];
		$overwriteProfileInputs['userBirthYear'] = $userBirthYear;
	}
	if(isset($inputs['userBirthMonth'])){
		$userBirthMonth = $inputs['userBirthMonth'];
		$overwriteProfileInputs['userBirthMonth'] = $userBirthMonth;
	}else if(isset($userProfile['userBirthMonth'])){
		$userBirthMonth = $userProfile['userBirthMonth'];
		$overwriteProfileInputs['userBirthMonth'] = $userBirthMonth;
	}
	if(isset($inputs['userBirthDate'])){
		$userBirthDate = $inputs['userBirthDate'];
		$overwriteProfileInputs['userBirthDate'] = $userBirthDate;
	}else if(isset($userProfile['userBirthDate'])){
		$userBirthDate = $userProfile['userBirthDate'];
		$overwriteProfileInputs['userBirthDate'] = $userBirthDate;
	}
	if(isset($inputs['userAvatar'])){
		$userAvatar = $inputs['userAvatar'];
		$overwriteProfileInputs['userAvatar'] = $userAvatar;
	}else if(isset($userProfile['userAvatar'])){
		$userAvatar = $userProfile['userAvatar'];
		$overwriteProfileInputs['userAvatar'] = $userAvatar;
	}
	
	return array("error"=>false,
				"results"=>$overwriteProfileInputs);

}

function generateActivationCode(){	
	
	$i=0;
		while($i<1){ // Loop until available code found
			
			$activationCode = strtoupper(substr(md5(rand()),0,7)); //Generate random string
			$getUserByActivationCode = getUserByActivationCode($activationCode);
			if($getUserByActivationCode['msg']=="404"){ //Code not found. Uniqueness verified.
				$results = array("error"=>false,
								"results"=>$activationCode);
				$i++;
			}else if($getUserByActivationCode['error']){ //Mysql error
				$results = array("error"=>true,
								"msg"=>$getUserByActivationCode['msg']);
				$i++;
			}else{ //Code already exists
				$i=$i;
			}
		}
	return $results; //Activation code

}

function encryptPassword($input){
	
 	//$options = array('cost' => 4);
 	//$encryptedPassword = password_hash($input, PASSWORD_BCRYPT, $options); //BCrypt function
 	$encryptedPassword = md5($input);
 	return $encryptedPassword; //Return encrypter password alone

}

function logoutUser(){
	session_destroy();

	return array("error"=>false,
				"results"=>"success");
}

function checkSession(){
	$session = getSession();

	if($session['error'] || $session['results']['entity']!="user"){
		$_SESSION['entity'] = "demo";
		$session['results']['entity'] = "demo";
		$session['results']['id'] = NULL;
	}

	return array("error"=>false,
				"msg"=>"success",
				"results"=>$session['results']);
}

function formatTransactionsList($transactionsData){
	if(!isset($transactionsData) || $transactionsData==""){
		return array("error"=>true,
					"msg"=>"No transactions list provided");
	}

	$memoArray = array("id"=>"", //Set up memo array
						"memo"=>"",
						"count"=>"",
						"gratiiAmount"=>"",
						"newBalance"=>"",
						"createdAt"=>"");
	$transListCount = 0; //List counter
	$formattedTransactionsArray = array(); //Inititate formatted list array
	foreach ($transactionsData as $transaction) { //For each transaction in the list
		if($memoArray['memo']==""){ //If the memo array is empty, establish the contents
			$memoArray['id'] = $transaction['id'];
			$memoArray['memo'] = $transaction['memo'];
			$memoArray['count'] = 1; //Start the counter for this memo
			$memoArray['gratiiAmount'] = "".$transaction['gratiiAmount']."";
			$memoArray['newBalance'] = $transaction['newBalance'];
			$memoArray['createdAt'] = $transaction['createdAt'];
		}else if($transaction['memo']==$memoArray['memo']){ //If the memo matches what is in the array
			$memoArray['count']++; //Inc the counter
			$memoArray['gratiiAmount'] = "".$memoArray['gratiiAmount']+$transaction['gratiiAmount'].""; //SUM the gratii amount
		}else{ //If it is a new memo
			if($memoArray['count']>1){ //If the memo in the array above has multiple
				$memoArray['memo'] = $memoArray['memo']." (x".$memoArray['count'].")"; //Format the text so the receiver knows
			}
			$formattedTransactionsArray[] = $memoArray; //Dump the temp memo array into the formatted list array
			$transListCount++; //Inc the list counter
			if($transListCount==100){ //If the list reaches 100 units, stop the cycle
				break;
			}
			$memoArray['id'] = $transaction['id']; //Reestablish memo array with new data
			$memoArray['memo'] = $transaction['memo'];
			$memoArray['count'] = 1; //Reset memo array counter
			$memoArray['gratiiAmount'] = "".$transaction['gratiiAmount']."";
			$memoArray['newBalance'] = $transaction['newBalance'];
			$memoArray['createdAt'] = $transaction['createdAt'];
			
			
		}
	}
	
	if($memoArray['memo']!=""){ //No more transactions, but one is stuck in the memo array
		if($memoArray['count']>1){ //If the memo in the array above has multiple
			$memoArray['memo'] = $memoArray['memo']." (x".$memoArray['count'].")"; //Format the text so the receiver knows
		}
		$formattedTransactionsArray[] = $memoArray; //Dump the temp memo array into the formatted list array
	}
	
	return array("error"=>false, //Success. Transactions list formatted. Return the array.
				"msg"=>"success",
				"results"=>$formattedTransactionsArray);
}

function sendActivationEmail($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs['userEmail']) || $inputs['userEmail']==""){
		return array("error"=>true,
					"msg"=>"No user email provided");
	}
	if(!isset($inputs['activationCode']) || $inputs['activationCode']==""){
		return array("error"=>true,
					"msg"=>"No activation code provided");
	}
	
	$to = $inputs['userEmail'];
	$subject = "Activate Your Gratii Account";

	$headers = "From: info@gratii.com\r\n";
    $headers .= "Reply-To: info@gratii.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    $activationLink = "gratii.com/gratii29/app/activateaccount.html?id=".$inputs['activationCode'];
    $message = '<html>
	<body style="background-color:#f6f6f6;">

		<table width="100%"><tr><td align="center">

			<table bgcolor="#fff" width="613" style="font-family:arial;color:#FFF;">
				<tr>
					<td align="center">
						<br>
						<img src="http://gratii.com/gratii29/app/images/gratiiColorShadow.png" alt="Gratii" width="168">
						<br><br>
					</td>
				</tr>
				<tr>
					<td style="padding-left:10px;color:#000;">
						<h3 style="font-size:22px;">ACTIVATE YOUR ACCOUNT</h3>
						<p style="font-size:15px;">To activate your Gratii account, follow this link: '.$activationLink.'
						    </br></br>If you did not create an account with Gratii, please ignore this email.
						    </br></br>Thanks,
						    </br></br>Gratii Team</p>
						<br>
						<br>
						<p style="font-size:12px;text-align:center;padding-right:10px;">2013 Gratii Inc.  | <a href="http://gratii.com" style="color:#0f67ff;">www.gratii.com</a></p>
					</td>
				</tr>
			</table>

		</td></tr></table>

	</body>
	</html>';
	//////
	
	if(mail($to, $subject, $message, $headers)){
		return array("error"=>false);
	}else{
		return array("error"=>true,
					"msg"=>"Error sending email");
	}
}

function sendPasswordResetEmail($inputs){
	if(!isset($inputs) || $inputs==""){
		return array("error"=>true,
					"msg"=>"No inputs provided");
	}
	if(!isset($inputs['userEmail']) || $inputs['userEmail']==""){
		return array("error"=>true,
					"msg"=>"No user email provided");
	}
	if(!isset($inputs['passwordCode']) || $inputs['passwordCode']==""){
		return array("error"=>true,
					"msg"=>"No password code provided");
	}

	$to = $inputs['userEmail'];
	$subject = "Reset Your Gratii Password";

	$headers = "From: info@gratii.com\r\n";
    $headers .= "Reply-To: info@gratii.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    $resetLink = "gratii.com/gratii29/app/passwordreset.html?id=".$inputs['passwordCode'];
    //////
    $message = '<html>
	<body style="background-color:#f6f6f6;">

		<table width="100%"><tr><td align="center">

			<table bgcolor="#fff" width="613" style="font-family:arial;color:#FFF;">
				<tr>
					<td align="center">
						<br>
						<img src="http://gratii.com/gratii29/app/images/gratiiColorShadow.png" alt="Gratii" width="168">
						<br><br>
					</td>
				</tr>
				<tr>
					<td style="padding-left:10px;color:#000;">
						<h3 style="font-size:22px;">PASSWORD RESET</h3>
						<p style="font-size:15px;">To reset your Gratii password, follow this link: '.$resetLink.'
						    </br></br>If you did not request a password reset, please ignore this email.
						    </br></br>Thanks,
						    </br></br>Gratii Team</p>
						<br>
						<br>
						<p style="font-size:12px;text-align:center;padding-right:10px;">2013 Gratii Inc.  | <a href="http://gratii.com" style="color:#0f67ff;">www.gratii.com</a></p>
					</td>
				</tr>
			</table>

		</td></tr></table>

	</body>
	</html>';
	//////

	if(mail($to, $subject, $message, $headers)){
		return array("error"=>false);
	}else{
		return array("error"=>true,
					"msg"=>"Error sending email");
	}
}


?>