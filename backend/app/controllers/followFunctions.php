<?php

//SELECT QUERIES
function getAllFollowers(){

	$getAllFollowers = $GLOBALS['db']->prepare('SELECT follows.id AS id,
													users.id AS userID,
													userNickname,
													userAvatar,
													userAgeMin,
													userAgeMax,
													userGender,
													userCity,
													userState,
													userCountry,
													userLat,
													userLong	
											FROM follows
											LEFT JOIN users ON users.id = follows.userID GROUP BY users.id');
	$getAllFollowers -> execute();
	if($results = $getAllFollowers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllFollows($startTime){

	$getAllFollows = $GLOBALS['db']->prepare('SELECT id, createdAt
											FROM follows WHERE createdAt>?');
	$getAllFollows -> execute(array($startTime));
	if($results = $getAllFollows -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllFollowsForClientID($clientID, $startTime){

	$getAllFollows = $GLOBALS['db']->prepare('SELECT follows.id AS id,
												follows.createdAt AS createdAt		
											FROM follows
											LEFT JOIN auctions ON follows.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN clients ON promos.clientID = clients.id
											WHERE clients.id=? AND follows.createdAt>?');
	$getAllFollows -> execute(array($clientID, $startTime));
	if($results = $getAllFollows -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllFollowersForPromoID($promoID){

	$getAllFollowers = $GLOBALS['db']->prepare('SELECT follows.id AS id,
													users.id AS userID,
													userNickname,
													userAvatar,
													userAgeMin,
													userAgeMax,
													userGender,
													userCity,
													userState,
													userCountry,
													userLat,
													userLong	
											FROM follows
											LEFT JOIN auctions ON follows.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN users ON users.id = follows.userID 
											WHERE promos.id=? GROUP BY users.id');
	$getAllFollowers -> execute(array($promoID));
	if($results = $getAllFollowers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllFollowersForClientID($clientID){

	$getAllFollowers = $GLOBALS['db']->prepare('SELECT follows.id AS id,
														users.id AS userID,
														userNickname,
														userAvatar,
														userAgeMin,
														userAgeMax,
														userGender,
														userCity,
														userState,
														userCountry,
														userLat,
														userLong	
												FROM follows
												LEFT JOIN auctions ON follows.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = follows.userID 
												WHERE clients.id=? GROUP BY users.id');
	$getAllFollowers -> execute(array($clientID));
	if($results = $getAllFollowers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllFollowersForPromoTwitterID($promoTwitterID){

	$getAllFollowers = $GLOBALS['db']->prepare('SELECT follows.id AS id,
														users.id AS userID,
														userNickname,
														userAvatar,
														userAgeMin,
														userAgeMax,
														userGender,
														userCity,
														userState,
														userCountry,
														userLat,
														userLong	
												FROM follows
												LEFT JOIN auctions ON follows.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = follows.userID 
												WHERE promos.promoTwitterID=? GROUP BY users.id');
	$getAllFollowers -> execute(array($promoTwitterID));
	if($results = $getAllFollowers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getFollowsForUserID($userID){

	$getFollows = $GLOBALS['db']->prepare('SELECT promoTwitterID, promoTwitter 
												FROM follows
												LEFT JOIN auctions ON follows.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN users ON users.id = follows.userID 
												WHERE users.id=?');
	$getFollows -> execute(array($userID));
	if($results = $getFollows -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

//-----------INSERT QUERIES-----------
function insertFollow($inputs, $receiver=NULL){ 
	if(!isset($inputs['userID']) || $inputs['userID']==""){ //Missing user ID
		return array("error"=>true,
					"msg"=>"No user ID provided");
		die();
	}
	if(!isset($inputs['auctionID']) || $inputs['auctionID']==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	

	$insertFollow = $GLOBALS['db'] -> prepare('INSERT INTO follows (userID, auctionID, createdAt)
								VALUES (?, ?, ?)');
	$insertFollow -> execute(array($inputs['userID'], $inputs['auctionID'], $GLOBALS['NOW']));	
	if($id = $GLOBALS['db']->lastInsertId()){ // Success. Follow inserted.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error inserting follow
		return array('error'=>true,
				    'results'=>"Follow not inserted");
	}
	
}

//-----------JOBS-----------------
function createFollow_Job($receiver=NULL){

	if(!$receiver || $receiver!="user"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
		die();
	}
	$inputs = Input::all(); //Grab json data
	if(!isset($inputs['auctionID']) || $inputs['auctionID']==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){ //Missing user ID
		return array("error"=>true,
					"msg"=>"No user ID found");
		die();
	}

	include_once("auctionFunctions.php");
	$auctionData = getAuctionComplex($inputs['auctionID']);
	if($auctionData['error']){
		return array("error"=>true,
					"msg"=>$auctionData['msg'],
					"requested"=>"Get auction data");
	}

	$userFollows = getFollowsForUserID($_SESSION['userID']);
	if($userFollows['error'] && $userFollows['msg']!="404"){
		return array("error"=>true,
					"msg"=>$userFollows['msg'],
					"requested"=>"Get user follows");
	}else if(!$userFollows['error']){
		$arrayOfFollows = array();
		foreach($userFollows['results'] as $twitterID){
			$arrayOfFollows[] = $twitterID['promoTwitterID'];
		}

		if(in_array($auctionData['results'][0]['promoTwitterID'], $arrayOfFollows)){
			return array("error"=>true,
					"msg"=>"You've already followed ".$auctionData['results'][0]['promoTwitter']." once before",
					"requested"=>"Get user follows");
		}
	}

	$insertFollow = insertFollow(array("userID"=>$_SESSION['userID'],
									"auctionID"=>$inputs['auctionID']));
	if($insertFollow['error']){
		return array("error"=>true,
					"msg"=>$insertFollow['msg'],
					"requested"=>"Insert follow");
	}

	$gratiiReward = rand(10, 50);

	include_once("transactionFunctions.php"); //Include transactions functions
	$recordTransaction = createTransaction_Job(array("memo"=>"Followed ".$auctionData['results'][0]['promoTwitter'],
													"gratiiAmount"=>$gratiiReward,
													"referenceTable"=>"follows",
													"referenceTableID"=>$insertFollow['results'],
													"meta"=>array("promoTwitter"=>$auctionData['results'][0]['promoTwitter'],
																"promoTwitterID"=>$auctionData['results'][0]['promoTwitterID'],
																"promoID"=>$auctionData['results'][0]['promoID'],
																"auctionID"=>$inputs['auctionID'])));

	return array("error"=>false,
				"results"=>array("followID"=>$insertFollow['results'],
								"gratiiEarned"=>$gratiiReward));
	

}


function getUsersWithTwitter(){
	$getUsersWithTwitter = $GLOBALS['db']->prepare('SELECT id FROM users WHERE twitterOAuthToken!=? AND twitterUserID!=?');
	$getUsersWithTwitter -> execute(array("---","---"));
	if($results = $getUsersWithTwitter -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}
}

function getActivePromosWithTwitter(){
	$getActivePromosWithTwitter = $GLOBALS['db']->prepare('SELECT id, promoTwitterID FROM promos WHERE promoTwitterID!=? AND promoDeactivatesAt>? GROUP BY promoTwitterID');
	$getActivePromosWithTwitter -> execute(array("---", $GLOBALS['NOW']));
	if($results = $getActivePromosWithTwitter -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}

function payoutFollowBuckets_Job(){
	$paidOutUsers = array();
	$payoutForFollows = 2;
	$usersWithTwitter = getUsersWithTwitter();
	if($usersWithTwitter['error']){
		return array("error"=>true,
					"msg"=>$usersWithTwitter['msg'],
					"requested"=>"Get users with twitter");
	}

	$activePromosWithTwitter = getActivePromosWithTwitter();
	if($activePromosWithTwitter['error']){
		return array("error"=>true,
					"msg"=>$activePromosWithTwitter['msg'],
					"requested"=>"Get active promos with twitter");
	}

	$promoTwitterIDs = array();
	foreach ($activePromosWithTwitter['results'] as $promoTwitterID) {
		$promoTwitterIDs[] = $promoTwitterID['promoTwitterID'];
	}

	include_once("userFunctions.php");
	include_once("transactionFunctions.php");
	foreach ($usersWithTwitter['results'] as $user) {
		$twitterFollows = getTwitterFollows_Job($user['id'], "admin");
		if($twitterFollows['error']){
			// Should add an admin notification system in here. Something went wrong with verifying a twitter account and/or getting their friends ("follows") list
			continue;
			// return array("error"=>true,
			// 			"msg"=>$twitterFollows['msg'],
			// 			"requested"=>"Get user twitter follows");
		}

		$userPayoutCount = 0;
		$usersLikeIDs = array();
		foreach ($twitterFollows['results']->ids as $twitterFollow) {
			$usersTwitterIDs[] = $twitterFollow;
		}
		foreach ($promoTwitterIDs as $promoTwitterID) {
			if(in_array($promoTwitterID, $usersTwitterIDs)){
				$userPayoutCount++;
			}
		}
		if($userPayoutCount>0){
			include_once("msgFunctions.php");
			$body = "Here's your nightly bonus for Following ".$userPayoutCount." of our sponsor brands on twitter :)";
			$payoutMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
												"recipientIDs"=>array($user['id']),
												"senderEntity"=>"admin",
												"title"=>"A gift from our sponsors!",
												"body"=>$body,
												"template"=>"adminText",
												"gratiiReward"=>$userPayoutCount*$payoutForFollows,
												"groupID"=>"FOLLOWPAYOUT_1.0",
												"meta"=>array("userPayoutCount"=>$userPayoutCount,
															"payoutForLikes"=>$payoutForFollows)
												// "msgBackgroundPic"=>$messageData['msgBackgroundPic'],
												// "msgBackgroundColor"=>$messageData['msgBackgroundColor'],
												// "msgFontColor"=>$messageData['msgFontColor'],
												));
			if($payoutMsg['error']){
				return array("error"=>true,
							"msg"=>$payoutMsg['msg'],
							"requested"=>"Send follow bucket payout msg");
			}
			$paidOutUsers[] = array("userID"=>$user['id'],
									"msgID"=>$payoutMsg['results']);
		}
	}

	return array("error"=>false,
				"results"=>$paidOutUsers);
}

//-----------TASKS----------------




?>