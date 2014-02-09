<?php

//SELECT QUERIES
function getAllClickers(){

	$getAllClickers = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
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
											FROM clickthrus
											LEFT JOIN users ON users.id = clickthrus.userID GROUP BY users.id');
	$getAllClickers -> execute();
	if($results = $getAllClickers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickers found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickthrus($startTime){

	$getAllClickthrus = $GLOBALS['db']->prepare('SELECT id, createdAt
											FROM clickthrus WHERE createdAt>?');
	$getAllClickthrus -> execute(array($startTime));
	if($results = $getAllClickthrus -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickthrus found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickthrusForClientID($clientID, $startTime){

	$getAllClickthrus = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
												clickthrus.createdAt AS createdAt		
											FROM clickthrus
											LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN clients ON promos.clientID = clients.id
											WHERE clients.id=? AND clickthrus.createdAt>?');
	$getAllClickthrus -> execute(array($clientID, $startTime));
	if($results = $getAllClickthrus -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickthrus found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickersForPromoID($promoID){

	$getAllClickers = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
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
											FROM clickthrus
											LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
											LEFT JOIN promos ON auctions.promoID = promos.id
											LEFT JOIN users ON users.id = clickthrus.userID 
											WHERE promos.id=? GROUP BY users.id');
	$getAllClickers -> execute(array($promoID));
	if($results = $getAllClickers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickers found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickersForClientID($clientID){

	$getAllClickers = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
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
												FROM clickthrus
												LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = clickthrus.userID 
												WHERE clients.id=? GROUP BY users.id');
	$getAllClickers -> execute(array($clientID));
	if($results = $getAllClickers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No follows found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickersForPromoWebsiteID($promoWebsiteID){

	$getAllClickers = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
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
												FROM clickthrus
												LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = clickthrus.userID 
												WHERE promos.promoWebsiteID=? GROUP BY users.id');
	$getAllClickers -> execute(array($promoWebsiteID));
	if($results = $getAllClickers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickthrus found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getAllClickthrusForPromoWebsiteID($promoWebsiteID){

	$getAllClickers = $GLOBALS['db']->prepare('SELECT clickthrus.id AS id,
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
												FROM clickthrus
												LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN clients ON promos.clientID = clients.id
												LEFT JOIN users ON users.id = clickthrus.userID 
												WHERE promos.promoWebsiteID=?');
	$getAllClickers -> execute(array($promoWebsiteID));
	if($results = $getAllClickers -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickthrus found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

function getClickthrusForUserID($userID){

	$getClickthrus = $GLOBALS['db']->prepare('SELECT promoWebsite, promoWebsiteID 
												FROM clickthrus
												LEFT JOIN auctions ON clickthrus.auctionID = auctions.id
												LEFT JOIN promos ON auctions.promoID = promos.id
												LEFT JOIN users ON users.id = clickthrus.userID 
												WHERE users.id=?');
	$getClickthrus -> execute(array($userID));
	if($results = $getClickthrus -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No clickthrus found
		return array("error"=>true, 
					"msg"=>"404");
	}	

}

//-----------INSERT QUERIES-----------
function insertClickthru($inputs, $receiver=NULL){ 
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
	

	$insertClickthru = $GLOBALS['db'] -> prepare('INSERT INTO clickthrus (userID, auctionID, createdAt)
								VALUES (?, ?, ?)');
	$insertClickthru -> execute(array($inputs['userID'], $inputs['auctionID'], $GLOBALS['NOW']));	
	if($id = $GLOBALS['db']->lastInsertId()){ // Success. Clickthru inserted.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error inserting clickthru
		return array('error'=>true,
				    'results'=>"Clickthru not inserted");
	}
	
}

//-----------JOBS-----------------
function createClickthru_Job($receiver=NULL){

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

	$arrayOfWebsiteIDs = array();

	$userClickthrus = getClickthrusForUserID($_SESSION['userID']);
	if($userClickthrus['error']){
		if($userClickthrus['msg']=="404"){
			
		}else{
			return array("error"=>true,
						"msg"=>$userClickthrus['msg'],
						"requested"=>"Get user clickthrus");
		}
	}else{
		foreach($userClickthrus['results'] as $website){
			$arrayOfWebsiteIDs[] = $website['promoWebsiteID'];
		}
	}

	$insertClickthru = insertClickthru(array("userID"=>$_SESSION['userID'],
											"auctionID"=>$inputs['auctionID']));
	if($insertClickthru['error']){
		return array("error"=>true,
					"msg"=>$insertClickthru['msg'],
					"requested"=>"Insert clickthru");
	}

	if(in_array($auctionData['results'][0]['promoWebsiteID'], $arrayOfWebsiteIDs)){
		return array("error"=>false,
					"results"=>array("clickthruID"=>NULL,
									"gratiiEarned"=>0));
	}
	

	$gratiiReward = rand(10, 50);

	include_once("transactionFunctions.php"); //Include transactions functions
	$recordTransaction = createTransaction_Job(array("memo"=>"Clicked through to ".$auctionData['results'][0]['promoWebsite'],
													"gratiiAmount"=>$gratiiReward,
													"referenceTable"=>"clickthrus",
													"referenceTableID"=>$insertClickthru['results'],
													"meta"=>array("promoWebsite"=>$auctionData['results'][0]['promoWebsite'],
																"promoWebsiteID"=>$auctionData['results'][0]['promoWebsiteID'],
																"promoID"=>$auctionData['results'][0]['promoID'],
																"auctionID"=>$inputs['auctionID'])));

	return array("error"=>false,
				"results"=>array("clickthruID"=>$insertClickthru['results'],
								"gratiiEarned"=>$gratiiReward));
	

}

//-----------TASKS----------------




?>