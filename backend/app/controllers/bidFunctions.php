<?php

//SELECT QUERIES
function getAllBidders(){

	$getAllBidders = $GLOBALS['db']->prepare('SELECT bids.id AS id,
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
											FROM bids
											LEFT JOIN users ON users.id = bids.userID GROUP BY users.id');
	$getAllBidders -> execute();
	if($results = $getAllBidders -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllBids($startTime){

	$getAllBids = $GLOBALS['db']->prepare('SELECT id, createdAt
											FROM bids WHERE createdAt>?');
	$getAllBids -> execute(array($startTime));
	if($results = $getAllBids -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllBidsForClientID($clientID, $startTime){

	$getAllBids = $GLOBALS['db']->prepare('SELECT bids.id AS id,
												bids.createdAt AS createdAt		
											FROM bids
											LEFT JOIN auctions ON bids.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN clients ON promos.clientID = clients.id
											WHERE clients.id=? AND bids.createdAt>?');
	$getAllBids -> execute(array($clientID, $startTime));
	if($results = $getAllBids -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllBiddersForPromoID($promoID){

	$getAllBidders = $GLOBALS['db']->prepare('SELECT bids.id AS id,
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
													userLong,
													auctions.id as auctionID	
											FROM bids
											LEFT JOIN auctions ON bids.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN users ON users.id = bids.userID 
											WHERE promos.id=? GROUP BY users.id');
	$getAllBidders -> execute(array($promoID));
	if($results = $getAllBidders -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllBiddersForClientID($clientID){

	$getAllBidders = $GLOBALS['db']->prepare('SELECT bids.id AS id,
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
														userLong,
														auctions.id as auctionID	
												FROM bids
												LEFT JOIN auctions ON bids.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = bids.userID 
												WHERE clients.id=? GROUP BY users.id');
	$getAllBidders -> execute(array($clientID));
	if($results = $getAllBidders -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllBidsForPromoID($promoID){

	$getAllBids = $GLOBALS['db']->prepare('SELECT bids.id AS id	
												FROM bids
												LEFT JOIN auctions ON bids.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												WHERE promos.id=?');
	$getAllBids -> execute(array($promoID));
	if($results = $getAllBids -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No bids found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getTotalBidsForAuctionID($auctionID){
	if(!$auctionID){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"Missing auction ID");
		die();
	}
	$auction = getAuctionBasic($auctionID); //Find auction row
	if($auction['error']){ //Invalid auction ID
		return array("error"=>true,
					"msg"=>"Invalid auction ID");
		die();
	}

	$getTotalBids = $GLOBALS['db'] -> prepare('SELECT count(id) AS totalBids FROM bids WHERE auctionID=?');
	$getTotalBids -> execute(array($auctionID));
	if($results = $getTotalBids -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{ //Error
		return array("error"=>false,
					"results"=>array("totalBids"=>NULL));	
		die();
	}

}

function getMaxBid($auctionID){
	if(!$auctionID){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"Missing auction ID");
		die();
	}
	$auction = getAuctionBasic($auctionID); //Find auction row
	if($auction['error']){ //Invalid auction ID
		return array("error"=>true,
					"msg"=>"Invalid auction ID");
		die();
	}



	$getMaxBid = $GLOBALS['db'] -> prepare('SELECT bids.id AS bidID, bidAmount, userNickname, userAvatar, userID,
												userEmail, userAgeMin, userAgeMax, userGender, userCity, userState,
												userCountry, userLat, userLong
												FROM bids
												LEFT JOIN users ON users.id = bids.userID
												WHERE auctionID=? ORDER BY bidAmount DESC LIMIT 1');
	$getMaxBid -> execute(array($auctionID));
	if($results = $getMaxBid -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{ //No bids exist yet
		return array("error"=>false,
					"results"=>array("bidID"=>NULL,
									"bidAmount"=>NULL,
									"userNickname"=>NULL,
									"userAvatar"=>NULL,
									"userID"=>NULL,
									"userEmail"=>NULL,
									"userAgeMin"=>NULL,
									"userAgeMax"=>NULL,
									"userGender"=>NULL,
									"userCity"=>NULL,
									"userState"=>NULL,
									"userCountry"=>NULL,
									"userLat"=>NULL,
									"userLong"=>NULL,));	
		die();
	}

	

}

//-----------INSERT QUERIES-----------
function insertBid($auctionID, $bidAmount, $receiver=NULL){ 
	if(!isset($auctionID) || $auctionID==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($bidAmount) || $bidAmount==""){ //Missing bid amount
		return array("error"=>true,
					"msg"=>"No bid amount provided");
		die();
	}

	$createBid = $GLOBALS['db'] -> prepare('INSERT INTO bids (auctionID, bidAmount, 
								userID, createdAt)
								VALUES (?, ?, ?, ?)');
	$createBid -> execute(array($auctionID, $bidAmount, $_SESSION['userID'], $GLOBALS['NOW']));	
	if($id = $GLOBALS['db']->lastInsertId()){ // Success. Bid inserted.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error inserting bid.
		return array('error'=>true,
				    'results'=>"Bid not inserted");
	}
	
}

//-----------JOBS-----------------
function placeBid_Job($receiver=NULL){

	if(!$receiver || $receiver!="user"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
		die();
	}
	$jsonData = Input::all(); //Grab json data
	if(!isset($jsonData['auctionID']) || $jsonData['auctionID']==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($jsonData['bidAmount']) || $jsonData['bidAmount']==""){ //Missing bid amount
		return array("error"=>true,
					"msg"=>"No bid amount");
		die();
	}
	if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){ //Missing user ID
		return array("error"=>true,
					"msg"=>"No user ID found");
		die();
	}

	$validBid = validateBid_Job($jsonData['auctionID'], $jsonData['bidAmount'],$_SESSION['userID']); //Validate bid is OK
	if($validBid['error']){ //Bid is not OK
		return array("error"=>true,
					"msg"=>$validBid['msg']);
		die();
	}

	$recordBid = recordBid_Job($jsonData['auctionID'], $jsonData['bidAmount'],$_SESSION['userID']); //Create bid, record transaction
	if($recordBid['error']){ //Error recording bid or transaction
		return array("error"=>true,
						"msg"=>$recordBid['msg']);
		die();
	}

	$bidToNode = bidToNode_Job($jsonData['auctionID']);
	if($bidToNode['error']){
		return array("error"=>true,
					"msg"=>$bidToNode['msg'],
					"requested"=>"Send bid to node");
	}

	return array("error"=>false,
				"results"=>$recordBid['msg']);
	

}

function validateBid_Job($auctionID, $bidAmount, $receiver=NULL){

	if(!isset($auctionID) || $auctionID==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($bidAmount) || $bidAmount==""){ //Missing bid amount
		return array("error"=>true,
					"msg"=>"No bid amount");
		die();
	}

	$cleanBid = cleanBidAmount($bidAmount); //Clean bid amount.
	if($cleanBid['error']){ //Invalid bid amount
		return array("error"=>true,
				"msg"=>$cleanBid['msg']);
		die();
	}

	include_once("auctionFunctions.php");
	$auctionData = getAuctionBasic($auctionID); //Get auction data.
	if($auctionData['error']){ //Invalid auction ID
		return array("error"=>true,
				"msg"=>$auctionData['msg']);
		die();
	}else if($auctionData['results']['startsAt']>$GLOBALS['NOW']){
		return array("error"=>true,
				"msg"=>"This auction has not started yet");
		die();
	}else if($auctionData['results']['endsAt']<$GLOBALS['NOW']){
		return array("error"=>true,
				"msg"=>"This auction has already ended");
		die();
	}

	$maxBidData = getMaxBid($auctionID); //Get leading bid
	if($maxBidData['error']){ //Error getting leading bid
		return array("error"=>true,
				"msg"=>$cleanBid['msg']);
		die();
	}else if($maxBidData['results']['bidAmount']>=$bidAmount){ //Bid is not high enough
		return array("error"=>true,
				"msg"=>"Current bid is ".$maxBidData['results']['bidAmount']);
		die();
	}else if($maxBidData['results']['userID']==$_SESSION['userID']){
		return array("error"=>true,
				"msg"=>"You are already the leader of this auction");
		die();
	}

	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
				"msg"=>$userData['msg']);
		die();
	}

	$winsToday = getAuctionsWonIn24Hours_Job("user");
	if($winsToday['error']){ //Error getting user data
		return array("error"=>true,
				"msg"=>$winsToday['msg']);
		die();
	}


	$bidsInPlay = getBidsInPlay_Job();
	if($bidsInPlay['error']){ //Error getting user data
		return array("error"=>true,
				"msg"=>$bidsInPlay['msg']);
		die();
	}

	if($userData['results']['PRO']>$GLOBALS['NOW']){ //User is PRO
		$maxBidsInPlay = 2; //Max bids in play allowed for PRO
		$maxPrizesPerDay = 2; //Max prizes per day allowed for PRO
		$maxBidsErrorMsg = "You can only have ".$maxBidsInPlay." bids in play at a time";
		$maxPrizesErrorMsg = "You can only win ".$maxPrizesPerDay." prizes per day";
	}else{ //User is not PRO
		$maxBidsInPlay = 1; //Max bids in play allowed for reg
		$maxPrizesPerDay = 1; //Max prizes per day allowed for reg
		$maxBidsErrorMsg = "PRO##You already have a bid in play. PRO accounts can have multiple.";
		$maxPrizesErrorMsg = "PRO##You already won an auction today. PRO accounts can win multiple.";
	}
	

	if($winsToday['results']>=$maxPrizesPerDay){ //User has too many prizes today
		return array("error"=>true,
				"msg"=>$maxPrizesErrorMsg);
		die();
	}else if($bidsInPlay['results']>=$maxBidsInPlay){ //User has too many bids in play
		return array("error"=>true,
				"msg"=>$maxBidsErrorMsg);
		die();
	}

	return array("error"=>false,
				"msg"=>"Success",
				"Request"=>"Validate bid",
				"results"=>array("auctionID"=>$auctionID,
								"bidAmount"=>$bidAmount,
								"userID"=>$_SESSION['userID']));
}

function recordBid_Job($auctionID, $bidAmount, $receiver=NULL){
	if(!isset($auctionID) || $auctionID==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($bidAmount) || $bidAmount==""){ //Missing bid amount
		return array("error"=>true,
					"msg"=>"No bid amount");
		die();
	}

	$auctionData = getAuction_Job($auctionID, "node"); //Get complex auction data
	if($auctionData['error']){ //Error getting auction data
		return array("error"=>true,
					"msg"=>$auctionData['msg']);
	}

	if($auctionData['results'][0]['leaderID']!=NULL){ //If bid already exists

		$userData = getUser($_SESSION['userID']); //Get user data
		if($userData['error']){ //Error getting user data
			return array("error"=>true,
						"msg"=>$userData['msg']);
			die();
		} 

		$body = $userData['results']['userNickname']." outbid you on this ".$auctionData['results'][0]['promoName'];//Body
		include_once("msgFunctions.php"); //Include message functions
		$returnGratiiToLeader = createMsg_Job(array("recipientIDs"=>array($auctionData['results'][0]['leaderID']),
														"template"=>"loseAuction",
		 												"gratiiReward"=>$auctionData['results'][0]['maxBid'],
		 												"title"=>"You've been outbid :(",
		 												"body"=>$body,
		 												"msgBackgroundPic"=>$auctionData['results'][0]['promoPic'],
		 												"msgBackgroundColor"=>$auctionData['results'][0]['promoBackgroundColor'],
		 												"msgFontColor"=>$auctionData['results'][0]['promoFontColor'],
														"meta"=>array("bidID"=>$auctionData['results'][0]['bidID'],
																		"auctionID"=>$auctionID,
																		"newLeaderID"=>$_SESSION['userID'],
																		"preparation"=>"automated")));
		
		if($returnGratiiToLeader['error']){ //Error returning bid
			return array("error"=>true,
						"msg"=>$returnGratiiToLeader['msg'],
						"requested"=>"Return gratii to leader");
		}
	}

	$insertBid = insertBid($auctionID, $bidAmount); //Insert new bid
	if($insertBid['error']){ //Error inserting bid
		return array("error"=>true,
					"msg"=>$insertBid['msg']);
	}

	$updateAuctionEndTime = updateAuctionEndTime($auctionID); //Update auction
	if($updateAuctionEndTime['error']){ //Error updating auction
		return array("error"=>true,
					"msg"=>$updateAuctionEndTime['msg']);
	}

	include_once("transactionFunctions.php"); //Include transactions functions
	$recordTransaction = createTransaction_Job(array("memo"=>"Placed a bid on ".$auctionData['results'][0]['promoName'],
												"gratiiAmount"=>-1*$bidAmount,
												"referenceTable"=>"bids",
												"referenceTableID"=>$insertBid['results'],
												"meta"=>array("outbidID"=>$auctionData['results'][0]['bidID'],
																"auctionID"=>$auctionID)));
	
	if($recordTransaction['error']){ //Error recording transactions
		return array("error"=>true,
					"msg"=>$recordTransaction['msg'],
					"requested"=>"Record transaction");
	}

	return array("error"=>false, //Success. Transaction recorded.
				"msg"=>"success",
				"results"=>$recordTransaction['results']);
	
	
}

function bidToNode_Job($auctionID){
	if(!isset($auctionID)){ //Missing auctions list
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}

	include_once("auctionFunctions.php");
	$auctionData = getAuction_Job($auctionID, "node");
	if($auctionData['error']){ //Error getting auction data
		return array("error"=>true,
					"msg"=>$auctionData['msg'],
					"requested"=>"Get auction data");
	}

	$ch = curl_init(); //Init curl
	$curlConfig = array( //Curl config
	    CURLOPT_URL            => $GLOBALS['nodeRoot']."/command/auction/".$auctionID, //API endpoint
	    CURLOPT_CUSTOMREQUEST  => 'PUT', //PUT
	    CURLOPT_RETURNTRANSFER => true, //Return results
	    CURLOPT_POSTFIELDS     => $auctionData['results'][0] //JSON data to post
	);
	curl_setopt_array($ch, $curlConfig); //Finish config
	
	$result = curl_exec($ch); //Results returned from API
	if($result!="success"){ //Not success
		curl_close($ch); //Close curl
		return array("error"=>true, //Return error
					"msg"=>"CURL Error: ".$result,
					"requested"=>"Send bid to node");
		die();
	}
	curl_close($ch); //Close curl. Success

	return array("error"=>false, //Return success
					"msg"=>"success");
	
}


//-----------TASKS----------------
function injectBidData($auctionsList, $receiver=NULL){

	if(!isset($auctionsList)){ //Missing auctions list
		return array("error"=>true,
					"msg"=>"No auctions list provided");
		die();
	}

	foreach ($auctionsList as &$auction) { //Process each live auction individually
		
		$maxBidData = getMaxBid($auction['id']); //Get max bid and related data
		if($maxBidData['error']){ //Error getting max bid data
			return array("error"=>true,
						"msg"=>$maxBidData['msg']);
		}else{ //Max bid data retrieved
			$auction['bidID'] = $maxBidData['results']['bidID']; //Injecting max bid amount
			$auction['maxBid'] = $maxBidData['results']['bidAmount']; //Injecting max bid amount
			$auction['leaderNickname'] = $maxBidData['results']['userNickname']; //Injecting leader nickname
			$auction['leaderAvatar'] = $maxBidData['results']['userAvatar']; //Injecting leader avatar
			$auction['leaderID'] = $maxBidData['results']['userID']; //Injecting leader ID
			if($receiver=="client" || $receiver=="admin"){ //If client or admin
				$auction['leaderAgeMin'] = $maxBidData['results']['userAgeMin']; //Injecting leader age min
				$auction['leaderAgeMax'] = $maxBidData['results']['userAgeMax']; //Injecting leader age max
				$auction['leaderGender'] = $maxBidData['results']['userGender']; //Injecting leader gender
				$auction['leaderCity'] = $maxBidData['results']['userCity']; //Injecting leader city
				$auction['leaderState'] = $maxBidData['results']['userState']; //Injecting leader state
				$auction['leaderCountry'] = $maxBidData['results']['userCountry']; //Injecting leader country
				$auction['leaderLat'] = $maxBidData['results']['userLat']; //Injecting leader lat
				$auction['leaderLong'] = $maxBidData['results']['userLong']; //Injecting leader long
			}
			if($receiver=="admin"){ //Admin
				$auction['leaderEmail'] = $maxBidData['results']['userEmail']; //Injecting leader email
			}
		}
		$totalBids = getTotalBidsForAuctionID($auction['id']); //Get total bid
		if($totalBids['error']){ //Error counting total bids
			return array("error"=>true,
						"msg"=>$totalBids['msg']);
		}else{ //Total bids retrieved
			$auction['totalBids'] = $totalBids['results']['totalBids']; //Injecting total bids
		}
	}

	if($auctionsList){//Success. Return all auctions.
		return array("error"=>false,
				"results"=>$auctionsList);
	}else{ //Some error
		return array("error"=>true,
				"msg"=>"Something went wrong.");
	}
}

function cleanBidAmount($bidAmount){
	if(!isset($bidAmount)){ //Missing bid amount
		return array("error"=>true,
				"msg"=>"Missing bid amount");
	} 
	if(!is_numeric($bidAmount) || $bidAmount<1 || $bidAmount=="0" || floor($bidAmount)!=ceil($bidAmount)){ //Valid whole number
		return array('error' => true,
					'msg' => "Invalid bid amount");	
		die();
	}else{ //Bid amount is clean.
		return array("error"=>false,
					"msg"=>"Bid clean");
	}
}



?>