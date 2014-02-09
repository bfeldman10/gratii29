<?php

//SELECT QUERIES
function getAllLikers(){

	$getAllLikers = $GLOBALS['db']->prepare('SELECT likes.id AS id,
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
											FROM likes
											LEFT JOIN users ON users.id = likes.userID GROUP BY users.id');
	$getAllLikers -> execute();
	if($results = $getAllLikers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllLikes($startTime){

	$getAllLikes = $GLOBALS['db']->prepare('SELECT id, createdAt
											FROM likes WHERE createdAt>?');
	$getAllLikes -> execute(array($startTime));
	if($results = $getAllLikes -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllLikesForClientID($clientID, $startTime){

	$getAllLikes = $GLOBALS['db']->prepare('SELECT likes.id AS id,
												likes.createdAt AS createdAt		
											FROM likes
											LEFT JOIN auctions ON likes.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN clients ON promos.clientID = clients.id
											WHERE clients.id=? AND likes.createdAt>?');
	$getAllLikes -> execute(array($clientID, $startTime));
	if($results = $getAllLikes -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllLikersForPromoID($promoID){

	$getAllLikers = $GLOBALS['db']->prepare('SELECT likes.id AS id,
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
											FROM likes
											LEFT JOIN auctions ON likes.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN users ON users.id = likes.userID 
											WHERE promos.id=? GROUP BY users.id');
	$getAllLikers -> execute(array($promoID));
	if($results = $getAllLikers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllLikersForClientID($clientID){

	$getAllLikers = $GLOBALS['db']->prepare('SELECT likes.id AS id,
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
												FROM likes
												LEFT JOIN auctions ON likes.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = likes.userID 
												WHERE clients.id=? GROUP BY users.id');
	$getAllLikers -> execute(array($clientID));
	if($results = $getAllLikers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllLikersForPromoFacebookID($promoFacebookID){

	$getAllLikers = $GLOBALS['db']->prepare('SELECT likes.id AS id,
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
												FROM likes
												LEFT JOIN auctions ON likes.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = likes.userID 
												WHERE promos.promoFacebookID=? GROUP BY users.id');
	$getAllLikers -> execute(array($promoFacebookID));
	if($results = $getAllLikers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getLikesForUserID($userID){

	$getLikes = $GLOBALS['db']->prepare('SELECT promoFacebookID, promoFacebook 
												FROM likes
												LEFT JOIN auctions ON likes.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN users ON users.id = likes.userID 
												WHERE users.id=?');
	$getLikes -> execute(array($userID));
	if($results = $getLikes -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No likes found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

//-----------INSERT QUERIES-----------
function insertLike($inputs, $receiver=NULL){ 
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
	

	$insertLike = $GLOBALS['db'] -> prepare('INSERT INTO likes (userID, auctionID, createdAt)
								VALUES (?, ?, ?)');
	$insertLike -> execute(array($inputs['userID'], $inputs['auctionID'], $GLOBALS['NOW']));	
	if($id = $GLOBALS['db']->lastInsertId()){ // Success. Like inserted.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error inserting like
		return array('error'=>true,
				    'results'=>"Like not inserted");
	}
	
}

//-----------JOBS-----------------
function createLike_Job($receiver=NULL){

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

	$userLikes = getLikesForUserID($_SESSION['userID']);
	if($userLikes['error'] && $userLikes['msg']!="404"){
		return array("error"=>true,
					"msg"=>$userLikes['msg'],
					"requested"=>"Get user likes");
	}else if(!$userLikes['error']){
		$arrayOfLikes = array();
		foreach($userLikes['results'] as $facebookID){
			$arrayOfLikes[] = $facebookID['promoFacebookID'];
		}

		if(in_array($auctionData['results'][0]['promoFacebookID'], $arrayOfLikes)){
			return array("error"=>true,
					"msg"=>"You've already liked ".$auctionData['results'][0]['promoFacebook']." once before",
					"requested"=>"Get user likes");
		}
	}

	$insertLike = insertLike(array("userID"=>$_SESSION['userID'],
									"auctionID"=>$inputs['auctionID']));
	if($insertLike['error']){
		return array("error"=>true,
					"msg"=>$insertLike['msg'],
					"requested"=>"Insert like");
	}

	$gratiiReward = rand(10, 50);

	include_once("transactionFunctions.php"); //Include transactions functions
	$recordTransaction = createTransaction_Job(array("memo"=>"Liked ".$auctionData['results'][0]['promoFacebook'],
													"gratiiAmount"=>$gratiiReward,
													"referenceTable"=>"likes",
													"referenceTableID"=>$insertLike['results'],
													"meta"=>array("promoFacebook"=>$auctionData['results'][0]['promoFacebook'],
																"promoFacebookID"=>$auctionData['results'][0]['promoFacebookID'],
																"promoID"=>$auctionData['results'][0]['promoID'],
																"auctionID"=>$inputs['auctionID'])));

	return array("error"=>false,
				"results"=>array("likeID"=>$insertLike['results'],
								"gratiiEarned"=>$gratiiReward));
	

}

function getUsersWithFacebook(){
	$getUsersWithFacebook = $GLOBALS['db']->prepare('SELECT id FROM users WHERE fbTokenLong!=? AND fbUserID!=?');
	$getUsersWithFacebook -> execute(array("---","---"));
	if($results = $getUsersWithFacebook -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}
}

function getActivePromosWithFacebook(){
	$getPromosWithFacebook = $GLOBALS['db']->prepare('SELECT id, promoFacebookID FROM promos WHERE promoFacebookID!=? AND promoDeactivatesAt>? GROUP BY promoFacebookID');
	$getPromosWithFacebook -> execute(array("---", $GLOBALS['NOW']));
	if($results = $getPromosWithFacebook -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}

function payoutLikeBuckets_Job(){
	$paidOutUsers = array();
	$payoutForLikes = 2;
	$usersWithFacebook = getUsersWithFacebook();
	if($usersWithFacebook['error']){
		return array("error"=>true,
					"msg"=>$usersWithFacebook['msg'],
					"requested"=>"Get users with facebook");
	}

	$activePromosWithFacebook = getActivePromosWithFacebook();
	if($activePromosWithFacebook['error']){
		return array("error"=>true,
					"msg"=>$activePromosWithFacebook['msg'],
					"requested"=>"Get active promos with facebook");
	}

	$promoFacebookIDs = array();
	foreach ($activePromosWithFacebook['results'] as $promoWithFacebook) {
		$promoFacebookIDs[] = $promoWithFacebook['promoFacebookID'];
	}

	include_once("userFunctions.php");
	include_once("transactionFunctions.php");
	foreach ($usersWithFacebook['results'] as $user) {
		$facebookLikes = getFacebookLikes_Job($user['id'], "admin");
		if($facebookLikes['error']){
			return array("error"=>true,
						"msg"=>$facebookLikes['msg'],
						"requested"=>"Get user facebook likes");
		}
		$userPayoutCount = 0;
		$usersLikeIDs = array();
		foreach ($facebookLikes['results'] as $facebookLike) {
			$usersLikeIDs[] = $facebookLike['id'];
		}
		foreach ($promoFacebookIDs as $promoFacebookID) {
			if(in_array($promoFacebookID, $usersLikeIDs)){
				$userPayoutCount++;
			}
		}
		if($userPayoutCount>0){
			include_once("msgFunctions.php");
			$body = "Here's your nightly bonus for Liking ".$userPayoutCount." of our sponsor brands on Facebook :)";
			$payoutMsg = createMsg_Job(array("senderID"=>"0", //Send challenge msg
												"recipientIDs"=>array($user['id']),
												"senderEntity"=>"admin",
												"title"=>"A gift from our sponsors!",
												"body"=>$body,
												"template"=>"adminText",
												"gratiiReward"=>$userPayoutCount*$payoutForLikes,
												"groupID"=>"LIKEPAYOUT_1.0",
												"meta"=>array("userPayoutCount"=>$userPayoutCount,
															"payoutForLikes"=>$payoutForLikes)
												// "msgBackgroundPic"=>$messageData['msgBackgroundPic'],
												// "msgBackgroundColor"=>$messageData['msgBackgroundColor'],
												// "msgFontColor"=>$messageData['msgFontColor'],
												));
			if($payoutMsg['error']){
				return array("error"=>true,
							"msg"=>$payoutMsg['msg'],
							"requested"=>"Send like bucket payout msg");
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