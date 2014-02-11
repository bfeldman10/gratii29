<?php

//-----------GET QUERIES----------------
function getAllAuctions($receiver=NULL){
	
	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getAllAuctions = $GLOBALS['db']->prepare('SELECT *, auctions.id AS id
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID');
	}else{ //Receiver denied 
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	$getAllAuctions -> execute();
	if($results = $getAllAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}				

}

function getAuctionsForPromoID($promoID, $receiver=NULL){
	
	if($receiver===NULL||$receiver=="admin" || $receiver=="client"){ //Internal or admin. Select all.
		$getAllAuctions = $GLOBALS['db']->prepare('SELECT *, auctions.id AS id
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE promos.id=?');
	}else{ //Receiver denied 
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	$getAllAuctions -> execute(array($promoID));
	if($results = $getAllAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No users found
		return array("error"=>true, 
					"msg"=>"404");
	}				

}

function getLiveAuctions($receiver){

	if($receiver===NULL||$receiver=="admin"){ //Admin. Select all. No demographic filters.
		$getLiveAuctions = $GLOBALS['db']->prepare('SELECT *, auctions.id AS id,
													TIMESTAMPDIFF(SECOND, ?, auctions.endsAt) AS secondsRemaining 
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt>? AND startsAt!=? ORDER BY endsAt ASC');
		$getLiveAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], "0000-00-00 00:00:00"));
	}else if($receiver=="demo"){ //Demo. Default default demographics.
		$getLiveAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter, 
													promoBackgroundColor, promoFontColor,
													clientName, 
													TIMESTAMPDIFF(SECOND, ?, auctions.endsAt) AS secondsRemaining
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt>? AND startsAt!=? 
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND promoTargetAgeMin<18 ORDER BY endsAt ASC');
		$getLiveAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], "0000-00-00 00:00:00", $GLOBALS['NOW']));
	}else if($receiver=="user"){ //User. Filter by user demographics.
		include_once("userFunctions.php");

		$userData = getUser($_SESSION['userID']); //Get user data
		if($userData['error']){ //Error finding user
			return array("error"=>true,
						"msg"=>$userData['msg']);
			die();
		}else{
			$userBirthYear = $userData['results']['userBirthYear'];
			$userBirthMonth = $userData['results']['userBirthMonth'];
			$userBirthDate = $userData['results']['userBirthDate'];
			$userDOB = $userBirthYear."-".$userBirthMonth."-".$userBirthDate;
			$userDOBUnix= strtotime($userDOB);
			$currentUnix = time();
			$yearsDiffUnix = $currentUnix-$userDOBUnix;
			$years = floor($yearsDiffUnix / (365*60*60*24));
		
			$userAgeMin = $years;
			$userAgeMax = $years;

			//$userAgeMin = $userData['results']['userAgeMin']; //User age min
			//$userAgeMax = $userData['results']['userAgeMax']; //User age max
			$userGender = $userData['results']['userGender']; //User gender
		}

		$getLiveAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter, promoTargetAgeMin,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, ?, auctions.endsAt) AS secondsRemaining
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt>? AND startsAt!=?
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND (promoTargetAgeMin<? OR promoTargetAgeMin=0) 
													AND (promoTargetAgeMax>? OR promoTargetAgeMax=99)
													AND (promoTargetGender=? OR promoTargetGender="---") ORDER BY endsAt ASC');
		$getLiveAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], "0000-00-00 00:00:00",
									$GLOBALS['NOW'], $userAgeMin, $userAgeMax, $userGender));
	}else if($receiver=="client"){ //For client ID only
		$getLiveAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter, 
													promoBackgroundColor, promoFontColor,
													clientName, 
													TIMESTAMPDIFF(SECOND, ?, auctions.endsAt) AS secondsRemaining
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt>? AND startsAt!=? 
													AND promoDeactivatesAt>? AND adminOnly=0 AND clients.id=?
													ORDER BY endsAt ASC');
		$getLiveAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], "0000-00-00 00:00:00", $GLOBALS['NOW'], $_SESSION['clientID']));	
	}else{
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}
	
	if($results = $getLiveAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success. Live auctions found
		return array("error"=>false,
					"results"=>$results);
	}else{ //No live auctions found
		return array('error'=>true,
		        		'msg'=>"404");

		die();
	}
		
		

}

function getPastAuctions($receiver){

	if($receiver===NULL||$receiver=="admin"){ //Admin. Select all. No demographic filters.
		$getPastAuctions = $GLOBALS['db']->prepare('SELECT *,TIMESTAMPDIFF(SECOND, auctions.startsAt, auctions.endsAt) AS secondsLasted 
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt<? ORDER BY endsAt');
		$getPastAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW']));
	}else if($receiver=="demo"){ //Demo. Default default demographics.
		$getPastAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, auctions.startsAt, auctions.endsAt) AS secondsLasted
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt<? 
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND promoTargetAgeMin<18 ORDER BY endsAt DESC LIMIT 100');
		$getPastAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW']));
	}else if($receiver=="user"){ //User. Filter by user demographics.
		include_once("userFunctions.php");

		$userData = getUser($_SESSION['userID']); //Get user data
		if($userData['error']){ //Error finding user
			return array("error"=>true,
						"msg"=>$userData['msg']);
			die();
		}else{
			$userBirthYear = $userData['results']['userBirthYear'];
			$userBirthMonth = $userData['results']['userBirthMonth'];
			$userBirthDate = $userData['results']['userBirthDate'];
			$userDOB = $userBirthYear."-".$userBirthMonth."-".$userBirthDate;
			$userDOBUnix= strtotime($userDOB);
			$currentUnix = time();
			$yearsDiffUnix = $currentUnix-$userDOBUnix;
			$years = floor($yearsDiffUnix / (365*60*60*24));
		
			$userAgeMin = $years;
			$userAgeMax = $years;

			//$userAgeMin = $userData['results']['userAgeMin']; //User age min
			//$userAgeMax = $userData['results']['userAgeMax']; //User age max
			$userGender = $userData['results']['userGender']; //User gender
		}

		$getPastAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, auctions.startsAt, auctions.endsAt) AS secondsLasted
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt<? 
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND (promoTargetAgeMin<? OR promoTargetAgeMin=0) 
													AND (promoTargetAgeMax>? OR promoTargetAgeMax=99)
													AND (promoTargetGender=? OR promoTargetGender="---") ORDER BY endsAt DESC LIMIT 100');
		$getPastAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], 
											$userAgeMin, $userAgeMax, $userGender));
	}else if($receiver=="client"){ //For client ID only
		$getPastAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, auctions.startsAt, auctions.endsAt) AS secondsLasted
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt<? AND endsAt<? 
													AND promoDeactivatesAt>? AND adminOnly=0 AND clients.id=?
													ORDER BY endsAt DESC LIMIT 100');
		$getPastAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], $_SESSION['clientID']));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");		
	}
	
	if($results = $getPastAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success. Return past auctions.
		return array("error"=>false,
					"results"=>$results);
	}else{ //No past auctions found.
		return array('error'=>true,
		        		'msg'=>"404");

		die();
	}
		
		

}

function getUpcomingAuctions($receiver){

	if($receiver===NULL||$receiver=="admin"){ //Admin. Select all. No demographic filters.
		$getUpcomingAuctions = $GLOBALS['db']->prepare('SELECT *,TIMESTAMPDIFF(SECOND, ?, auctions.startsAt) AS secondsUntil
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt>? ORDER BY startsAt ASC');
		$getUpcomingAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW']));
	}else if($receiver=="demo"){ //Demo. Default default demographics.
		$getUpcomingAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, ?, auctions.startsAt) AS secondsUntil
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt>?
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND promoTargetAgeMin<18 ORDER BY startsAt ASC LIMIT 10');
		$getUpcomingAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW']));
	}else if($receiver=="user"){ //User. Filter by user demographics.
		include_once("userFunctions.php");

		$userData = getUser($_SESSION['userID']); //Get user info
		if($userData['error']){ //Error finding user
			return array("error"=>true,
						"msg"=>$userData['msg']);
			die();
		}else{
			$userBirthYear = $userData['results']['userBirthYear'];
			$userBirthMonth = $userData['results']['userBirthMonth'];
			$userBirthDate = $userData['results']['userBirthDate'];
			$userDOB = $userBirthYear."-".$userBirthMonth."-".$userBirthDate;
			$userDOBUnix= strtotime($userDOB);
			$currentUnix = time();
			$yearsDiffUnix = $currentUnix-$userDOBUnix;
			$years = floor($yearsDiffUnix / (365*60*60*24));
		
			$userAgeMin = $years;
			$userAgeMax = $years;

			//$userAgeMin = $userData['results']['userAgeMin']; //User age min
			//$userAgeMax = $userData['results']['userAgeMax']; //User age max
			$userGender = $userData['results']['userGender']; //User gender
		}

		$getUpcomingAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, ?, auctions.startsAt) AS secondsUntil
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt>?
													AND promoDeactivatesAt>? AND adminOnly=0 
													AND (promoTargetAgeMin<? OR promoTargetAgeMin=0) 
													AND (promoTargetAgeMax>? OR promoTargetAgeMax=99)
													AND (promoTargetGender=? OR promoTargetGender="---") ORDER BY startsAt ASC LIMIT 10');
		$getUpcomingAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'],
												 $userAgeMin, $userAgeMax, $userGender));
	}else if($receiver=="client"){ //For client ID only
		$getUpcomingAuctions = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter,
													promoBackgroundColor, promoFontColor,
													clientName,
													TIMESTAMPDIFF(SECOND, ?, auctions.startsAt) AS secondsUntil
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE startsAt>?
													AND promoDeactivatesAt>? AND adminOnly=0 AND clients.id=?
													ORDER BY startsAt ASC LIMIT 10');
		$getUpcomingAuctions -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $GLOBALS['NOW'], $_SESSION['clientID']));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");		
	}
	
	if($results = $getUpcomingAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success. Upcoming auctions found.
		return array("error"=>false,
					"results"=>$results);
	}else{ //No upcoming auctions found
		return array('error'=>true,
		        		'msg'=>"404");

		die();
	}
			

}

function getAuctionBasic($id, $receiver=NULL){
	
	if(!$id){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"Missing auction ID");
		die();
	}


	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getAuction = $GLOBALS['db'] -> prepare('SELECT * FROM auctions WHERE id = ?');
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}
	$getAuction -> execute(array($id));
	if($results = $getAuction -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results[0]);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}
	
}

function getAuctionComplex($id, $receiver=NULL){
	if(!$id){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"Missing auction ID");
		die();
	}

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getAuction = $GLOBALS['db'] -> prepare('SELECT *, auctions.id AS id, promos.id AS promoID FROM auctions
														LEFT JOIN promos ON promos.id = auctions.promoID
														LEFT JOIN clients ON clients.id = promos.clientID
														WHERE auctions.id = ?');
		$getAuction -> execute(array($id));
	}else if($receiver=="user" || $receiver=="demo"){ //User, demo, or client. Format result.
		$getAuction = $GLOBALS['db'] -> prepare('SELECT auctions.ID AS id, promos.id AS promoID, startsAt, endsAt, 
												promoName, promoDetails, promoPic, promoWebsite,
												promoFacebook, promoTwitter, promoBackgroundColor, promoFontColor, 
												clientName
												FROM auctions
												LEFT JOIN promos ON auctions.promoID=promos.ID
												LEFT JOIN clients ON promos.clientID = clients.ID
												WHERE adminOnly=0 AND auctions.id=?');
		$getAuction -> execute(array($id));
	}else if($receiver=="node"){ //Demo. Default default demographics.
		$getAuction = $GLOBALS['db']->prepare('SELECT auctions.ID AS id, startsAt, endsAt, 
													promoName, promoDetails, promoPic, promoWebsite,
													promoFacebook, promoTwitter, promoBackgroundColor, promoFontColor,
													clientName, 
													TIMESTAMPDIFF(SECOND, ?, auctions.endsAt) AS secondsRemaining
													FROM auctions
													LEFT JOIN promos ON auctions.promoID=promos.ID
													LEFT JOIN clients ON promos.clientID = clients.ID
													WHERE adminOnly=0 AND auctions.id=?');
		$getAuction -> execute(array($GLOBALS['NOW'], $id));
	}else if($receiver=="client"){ //For client
		$getAuction = $GLOBALS['db'] -> prepare('SELECT auctions.ID AS id, promos.id AS promoID, startsAt, endsAt, 
												promoName, promoDetails, promoPic, promoWebsite,
												promoFacebook, promoTwitter, promoBackgroundColor, promoFontColor,
												clientName, clients.id AS clientID
												FROM auctions
												LEFT JOIN promos ON auctions.promoID=promos.ID
												LEFT JOIN clients ON promos.clientID = clients.ID
												WHERE adminOnly=0 AND auctions.id=?');
		$getAuction -> execute(array($id));
	}else{
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	if($results = $getAuction -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

function getLiveAuctionsBasic($receiver=NULL){

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getLiveAuctions = $GLOBALS['db'] -> prepare('SELECT * FROM auctions
														WHERE startsAt<?');
		$getLiveAuctions -> execute(array($GLOBALS['NOW']));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	if($results = $getLiveAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

function getHistoricalLiveAuctionsBasic($receiver=NULL){

	$unixTimestamp = strtotime($GLOBALS['NOW']);
	$unixHistoricalTimestamp = $unixTimestamp-120;
	$historicalNOW = date("Y-m-d H:i:s", $unixHistoricalTimestamp);

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getLiveAuctions = $GLOBALS['db'] -> prepare('SELECT * FROM auctions
														WHERE startsAt<?');
		$getLiveAuctions -> execute(array($historicalNOW));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	if($results = $getLiveAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

function getRecentlyEndedAuctions($receiver=NULL){

	$unixTimestamp = strtotime($GLOBALS['NOW']);
	$unixHistoricalTimestamp = $unixTimestamp-1800;
	$historicalNOW = date("Y-m-d H:i:s", $unixHistoricalTimestamp);

	if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
		$getPastAuctions = $GLOBALS['db'] -> prepare('SELECT * FROM auctions
														WHERE endsAt<? AND endsAt>?');
		$getPastAuctions -> execute(array($GLOBALS['NOW'], $historicalNOW));
	}else{ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");	
	}

	if($results = $getPastAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false,
					"msg"=>"200",
					"results"=>$results);
	}else{ //Auction not found
		return array("error"=>true,
					"msg"=>"404");	
		die();
	}

}

function getAuctionsBasicForClientID($id,$receiver=NULL){

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAuctionsBasic = $GLOBALS['db'] -> prepare('SELECT *, auctions.id AS id
														FROM auctions 
														LEFT JOIN promos on promos.id = auctions.promoID
														LEFT JOIN clients on clients.id = promos.clientID
														WHERE clients.id = ?');
		}else if($receiver=="client" && $_SESSION['clientID']==$id){ //User or client
			$getAuctionsBasic = $GLOBALS['db'] -> prepare('SELECT auctions.id AS id, promoID, startsAt, endsAt 
														FROM auctions 
														LEFT JOIN promos on promos.id = auctions.promoID
														LEFT JOIN clients on clients.id = promos.clientID
														WHERE clients.id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getAuctionsBasic -> execute(array($id));
		if($results = $getAuctionsBasic -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results);
		}else{ //Auctions not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

function getAuctionsBasicForPromoID($id,$receiver=NULL){

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAuctionsBasic = $GLOBALS['db'] -> prepare('SELECT *, auctions.id AS id 
														FROM auctions 
														LEFT JOIN promos on promos.id = auctions.promoID
														LEFT JOIN clients on clients.id = promos.clientID
														WHERE promos.id = ?');
		}else if($receiver=="client" && $_SESSION['clientID']==$id){ //User or client
			$getAuctionsBasic = $GLOBALS['db'] -> prepare('SELECT auctions.id AS id, promoID, startsAt, endsAt 
														FROM auctions 
														LEFT JOIN promos on promos.id = auctions.promoID
														LEFT JOIN clients on clients.id = promos.clientID
														WHERE promos.id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getAuctionsBasic -> execute(array($id));
		if($results = $getAuctionsBasic -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results);
		}else{ //Auctions not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

function countAvailableAuctions($receiver=NULL){

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$countAvailableAuctions = $GLOBALS['db'] -> prepare('SELECT count(id) as count FROM auctions 
														WHERE startsAt = "0000-00-00 00:00:00" AND adminOnly=0');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$countAvailableAuctions -> execute();
		if($results = $countAvailableAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Auctions not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

function countAvailableAuctionsForClientID($id, $receiver=NULL){

		if($receiver===NULL||$receiver=="admin"||($receiver=="client" && $_SESSION['clientID']==$id)){ //Internal or admin or client self. 
			$countAvailableAuctions = $GLOBALS['db'] -> prepare('SELECT count(auctions.id) as count FROM auctions
																	LEFT JOIN promos ON promos.id = auctions.promoID
																	LEFT JOIN clients ON clients.id = promos.clientID 
																	WHERE startsAt = "0000-00-00 00:00:00" AND clientID = ?
																	AND adminOnly=0');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$countAvailableAuctions -> execute(array($id));
		if($results = $countAvailableAuctions -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Auctions not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

function getAvailableAuctionForClientID($id, $receiver=NULL){

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin
			$getAvailableAuctionForClientID = $GLOBALS['db'] -> prepare('SELECT auctions.id as id FROM auctions
																	LEFT JOIN promos ON promos.id = auctions.promoID
																	LEFT JOIN clients ON clients.id = promos.clientID 
																	WHERE startsAt = "0000-00-00 00:00:00" AND clientID = ?
																	AND adminOnly=0 ORDER BY rand() LIMIT 1');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getAvailableAuctionForClientID -> execute(array($id));
		if($results = $getAvailableAuctionForClientID -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Auctions not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

//-----------UPDATE QUERIES----------------
function updateAuctionEndTime($auctionID, $receiver=NULL){
	if(!isset($auctionID) || $auctionID==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}

	include_once("userFunctions.php"); //Include user functions
	$userData = getUser($_SESSION['userID']); //Get user data
	if($userData['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$userData['msg']);
		die();
	} 

	$updateAuctionEndTime = $GLOBALS['db'] -> prepare('UPDATE auctions 
														SET endsAt=DATE_ADD(?,INTERVAL ? SECOND), updatedAt=?  WHERE id=?');
	$updateAuctionEndTime -> execute(array($GLOBALS['NOW'], $userData['results']['secondsAddedToAuction'], 
											$GLOBALS['NOW'], $auctionID));	
	$numRows = $updateAuctionEndTime -> rowCount();							
	if($numRows==0){ //Error updated auction
		return array('error'=>true,
				    'msg'=>"Auction not updated");
	}else{ //Success. Auction updated.
		return array('error'=>false,
				    'msg'=>"Auction updated");
	}

}

function setStartsAt($inputs){
	if(!isset($inputs) || $inputs==""){ //Missing inputs
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['auctionID']) || $inputs['auctionID']==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID provided");
		die();
	}
	if(!isset($inputs['startsAt']) || $inputs['startsAt']==""){ //Missing starts at timestamp
		return array("error"=>true,
					"msg"=>"No starts at provided");
		die();
	}

	$updateStartsAt = $GLOBALS['db'] -> prepare('UPDATE auctions 
														SET startsAt=?, updatedAt=?  WHERE id=?');
	$updateStartsAt -> execute(array($inputs['startsAt'], $GLOBALS['NOW'], $inputs['auctionID']));	
	$numRows = $updateStartsAt -> rowCount();							
	if($numRows==0){ //Error updated auction
		return array('error'=>true,
				    'msg'=>"Auction not updated");
	}else{ //Success. Auction updated.
		return array('error'=>false,
				    'msg'=>"Auction updated");
	}
}

//-----------INSERT QUERIES----------------
function createAuction($promoID, $externalID){ 
	if(!isset($promoID) || $promoID==""){ //Missing promo ID
		return array("error"=>true,
					"msg"=>"No promoID provided");
		die();
	}
	if(!isset($externalID) || $externalID==""){ //Missing external ID
		return array("error"=>true,
					"msg"=>"No external ID provided");
		die();
	}

	$createAuction = $GLOBALS['db'] -> prepare('INSERT INTO auctions (promoID, externalID, createdAt)
								VALUES (?, ?, ?)');
	$createAuction -> execute(array($promoID, $externalID, $GLOBALS['NOW']));	
	if($id = $GLOBALS['db']->lastInsertId()){ // Success. Auction inserted.
		return array('error'=>false,
				    'results'=>$id);
	}else{ //Error inserting bid.
		return array('error'=>true,
				    'results'=>"Auction not inserted");
	}

	
}



//-----------JOBS----------------
function getLiveAuctions_Job($receiver=NULL){

	$liveAuctions = getLiveAuctions($receiver); //Get live auctions
	if($liveAuctions['error']){ //Error retrieving auctions
		return array("error"=>true,
					"msg"=>$liveAuctions['msg']);
		die();
	}

	include_once("bidFunctions.php");
	$liveAuctions = injectBidData($liveAuctions['results'], $receiver); //Inject bid data

	if($liveAuctions['results']){//Success. Return all auctions.
		return array("error"=>false,
				"results"=>$liveAuctions['results']);

	}else{ //Some error
		return array("error"=>true,
				"msg"=>"Something went wrong.");
	}
	
	

}

function getUpcomingAuctions_Job($receiver=NULL){

	$upcomingAuctions = getUpcomingAuctions($receiver); //Get upcoming auctions
	if($upcomingAuctions['error']){ //Error retrieving auctions
		return array("error"=>true,
					"msg"=>$upcomingAuctions['msg']);
		die();
	}

	if($upcomingAuctions['results']){//Success. Return all auctions.
		return array("error"=>false,
				"results"=>$upcomingAuctions['results']);
	}else{ //Some error
		return array("error"=>true,
				"msg"=>"Something went wrong.");
	}
		

}

function getPastAuctions_Job($receiver=NULL){

	$pastAuctions = getPastAuctions($receiver); //Get past auctions
	if($pastAuctions['error']){ //Error retrieving auctions
		return array("error"=>true,
					"msg"=>$pastAuctions['msg']);
		die();
	}

	include_once("bidFunctions.php");
	$pastAuctions = injectBidData($pastAuctions['results'], $receiver); //Inject bid data

	if($pastAuctions['results']){//Success. Return all auctions.
		return array("error"=>false,
				"results"=>$pastAuctions['results']);
	}else{ //Some error
		return array("error"=>true,
				"msg"=>"Something went wrong.");
	}
		

}

function getAuction_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No auction ID supplied");
		die();
	}

	$auction = getAuctionComplex($id, $receiver); //Get auction and related data
	if($auction['error']){ //Error retrieving auctions
		return array("error"=>true,
					"msg"=>$auction['msg']);
		die();
	}
	if($receiver=="client"){
		if($auction['results'][0]['clientID']!=$_SESSION['clientID']){
			return array("error"=>true,
						"msg"=>"Invalid request");
		}
	}

	include_once("bidFunctions.php");
	$auction = injectBidData($auction['results']); //Inject bid data

	if($auction['results']){//Success. Return all auctions.
		return array("error"=>false,
				"results"=>$auction['results']);
	}else{ //Some error
		return array("error"=>true,
				"msg"=>"Something went wrong.");
	}
}

function refresh_job(){
	$getLiveAuctionsBasic = getLiveAuctionsBasic();
	if($getLiveAuctionsBasic['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$getLiveAuctionsBasic['msg'],
					"requested"=>"Get live auctions basic");
		die();
	} 

	$getHistoricalLiveAuctionsBasic = getHistoricalLiveAuctionsBasic();
	if($getHistoricalLiveAuctionsBasic['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$getHistoricalLiveAuctionsBasic['msg'],
					"requested"=>"Get historical live auctions basic");
		die();
	} 

	if($getLiveAuctionsBasic == $getHistoricalLiveAuctionsBasic){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>false);
	}else{
		return array("error"=>false,
					"msg"=>"success",
					"results"=>true);
	}
}

function winners_Job(){
	
	$recentlyEndedAuctions = getRecentlyEndedAuctions();
	if($recentlyEndedAuctions['error']){ //Error getting user data
		return array("error"=>true,
					"msg"=>$recentlyEndedAuctions['msg'],
					"requested"=>"Get recently ended auctions");
		die();
	} 

	$auctionsPendingNotification = array();
	foreach ($recentlyEndedAuctions['results'] as $recentlyEndedAuction) {
		include_once("msgFunctions.php");
		$getWinnerMsg = getWinnerMsg($recentlyEndedAuction['id']);
		if($getWinnerMsg['error']){ //Error getting user data
			if($getWinnerMsg['msg']=="404"){
				$auctionsPendingNotification[] = $recentlyEndedAuction['id'];
			}else{
				return array("error"=>true,
							"msg"=>$getWinnerMsg['msg'],
							"requested"=>"Get winner msg");
				die();
			}
		}
	}

	if(count($auctionsPendingNotification)==0){
		return array("error"=>false,
					"msg"=>"Success",
					"results"=>"No messages sent");
	}else{
		foreach ($auctionsPendingNotification as $auctionID) {
			

			$auctionData = getAuction_Job($auctionID);
			if($auctionData['error']){ //Error getting auctions data
				return array("error"=>true,
							"msg"=>$auctionData['msg'],
							"requested"=>"Get auction data");
				die();
			}

			$body = "Congratulations, you won the ".$auctionData['results'][0]['promoName']
					." from ".$auctionData['results'][0]['clientName'].".";
			$winnerMsg = createMsg_Job(array("recipientIDs"=>array($auctionData['results'][0]['leaderID']),
											"template"=>"winAuction",
											"gratiiReward"=>"0",
											"title"=>"You won!",
											"body"=>$body,
											"senderEntity"=>"auction",
											"senderID"=>$auctionID,
											"msgBackgroundPic"=>$auctionData['results'][0]['promoPic'],
											"msgBackgroundColor"=>$auctionData['results'][0]['promoBackgroundColor'],
											"msgFontColor"=>$auctionData['results'][0]['promoFontColor'],
											"meta"=>array("bidID"=>$auctionData['results'][0]['bidID'],
															"preparation"=>"automated")));
			if($winnerMsg['error']){ //Error creating msg
				return array("error"=>true,
							"msg"=>$winnerMsg['msg'],
							"requested"=>"Create msg job");
				die();
			}
			$winnerMsgs[] = $winnerMsg['results'];
		}
	}
	return array("error"=>false,
				"msg"=>"Success",
				"results"=>$winnerMsgs);
	
}

function createAuctions_Job(){
	$inputs = Input::all(); //Grab json data
	if(!isset($inputs) || $inputs==""){ 
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['promoID']) || $inputs['promoID']==""){ //Missing promo ID
		return array("error"=>true,
					"msg"=>"No promo ID provided");
		die();
	}
	if(!isset($inputs['amount']) || $inputs['amount']==""){ //Missing amount
		return array("error"=>true,
					"msg"=>"No amount provided");
		die();
	}
	if(!isset($inputs['externalIDs']) || $inputs['externalIDs']==""){ //Missing externalIDs
		$i = 1;
		$externalIDs = array();
		while($i <= $inputs['amount']){
			$externalIDs[] = "---";
			$i++;
		}
		$inputs['externalIDs'] = $externalIDs;
	}

	if(count($inputs['externalIDs']) != $inputs['amount']){
		return array("error"=>true,
					"msg"=>"Count does not match external IDs provided");
		die();
	}

	$newAuctionIDs = array();
	foreach ($inputs['externalIDs'] as $externalID) {
		$createAuction = createAuction($inputs['promoID'], $externalID);
		if($createAuction['error']){
			return array("error"=>true,
						"msg"=>$createAuction['msg']);
		}else{
			$newAuctionIDs[] = $createAuction['results'];
		}
	}
	
	return array("error"=>false,
				"msg"=>"Success",
				"results"=>$newAuctionIDs);
	
}

function scheduleAuctions_Job(){
	$inputs = Input::all(); //Grab json data
	if(!isset($inputs) || $inputs==""){ 
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['startDate']) || $inputs['startDate']==""){ //Missing unix start date
		return array("error"=>true,
					"msg"=>"No start date provided");
		die();
	}
	
	include_once("adminFunctions.php"); //Include admin functions
	$auctionSettings = getAuctionSettings(); //Get auction settings
	if($auctionSettings['error']){ //Error getting auction settings
		return array("error"=>true,
					"msg"=>$auctionSettings['msg'],
					"requested"=>"Get auction settings");
	}

	include_once("clientFunctions.php"); //Include client functions
	$clients = getAllClients(); //Get all clients
	if($clients['error']){ //Error getting all clients
		return array("error"=>true,
					"msg"=>$clients['msg'],
					"requested"=>"Get clients");
	}

	$requiredForToday = array(); //Init array of required client ID tallys due to min daily
	$reservesForToday = array(); //Init array of reserve client ID tallys, total remaining and under max daily

	foreach ($clients['results'] as $client){ //For each client
		$availableAuctions = countAvailableAuctionsForClientID($client['id']); //Count available auctions for this client
		if($availableAuctions['error']){ //Error getting availble count for this client
			return array("error"=>true,
						"msg"=>$availableAuctions['msg'],
						"requested"=>"Count available auctions");
		}


		$auctionsToday=0; //Init auctions today ticker
		while($auctionsToday<$client['minDaily']){ //While auctions today for this client is under the min daily
			if($availableAuctions['results']['count']>0){ //If auctions are available for this client
				$requiredForToday[] = $client['id']; //Add on tally to the required array
					$auctionsToday++; //Inc auctions today for this client by 1
					$availableAuctions['results']['count']--; //Dec available auctions for this client by 1
			}else{ //No more availble auctions for this client, but min daily is not fulfilled yet
				return array("error"=>true,
							"msg"=>"Can not fulfill min daily requirements for client ".$client['id']);
			}
		}

		$auctionsToday = $client['minDaily']; //Start auctions today counter at min daily, bc it was already fulfilled
		while($availableAuctions['results']['count']>0 && $auctionsToday<$client['maxDaily']){	//While auctions remain and still below max daily for this client
			$reservesForToday[] = $client['id']; //Add a tally for this client to the reserves array
			$auctionsToday++; //Inc auctions today for this client by 1
			$availableAuctions['results']['count']--; //Dec available auctions for this client by 1
		}
	}

	if(count($requiredForToday)>$auctionSettings['results']['auctionsPerDay']){ //There are more required today than you are attempting to set. Must increase auction settings
		return array("error"=>true,
					"msg"=>count($requiredForToday)." auctions are required for today. You are attempting to schedule only ".$auctionSettings['results']['auctionsPerDay']);
	}

	if(count($requiredForToday)+count($reservesForToday)<$auctionSettings['results']['auctionsPerDay']){ //Betweeen required and reserves combined, there are not enough. Must decrease auction settings or increase inventory or inc max dailys
		return array("error"=>true,
					"msg"=>"Only ".(count($requiredForToday)+count($reservesForToday))." auctions remaining. Cannot schedule ".$auctionSettings['results']['auctionsPerDay']." for day ".$day);
	}

	//Start scheduling auctions
	$day1_String = gmdate("Y-m-d", $inputs['startDate']); //Convert start date to string

	$startOfDay1_String = $day1_String." ".$auctionSettings['results']['startTime']; //Append start time to string for full timestamp string
	$startOfDay1_Unix = strtotime($startOfDay1_String)-(4*60*60); //Convert timestamp string to unix

	if($startOfDay1_String<$GLOBALS['NOW']){ //The start date is is the past
		return array("error"=>true,
					"msg"=>"You are trying to set auctions for a past date");
	}

	$endOfDay1_String = $day1_String." ".$auctionSettings['results']['endTime']; //Append end time to string for full timestamp string
	$endOfDay1_Unix = strtotime($endOfDay1_String)-(4*60*60); //Convert timestamp string to unix

	$totalSecondsAvailable = $endOfDay1_Unix-$startOfDay1_Unix; //Total seconds within the day
	$secondsBetweenAuctions = $totalSecondsAvailable/($auctionSettings['results']['auctionsPerDay']-1); //Gap in seconds between each time slot

	$timeSlots = array(); //Init array of time slots array

	$i=0; //Total auctions ticker
	$timeSlot = $startOfDay1_Unix; //Time slot variable
	while($i < $auctionSettings['results']['auctionsPerDay']){ //Until ticker reaches auctions needed for the day	
		$timeSlots[] = gmdate("Y-m-d H:i:s", $timeSlot); //Add a time stamp to the time slots array
		$timeSlot += $secondsBetweenAuctions; //Inc the time slot variable by the gab size so the next time around we'll get the next available time slot
		$i++; //Inc the total auctions ticker by one
	}

	shuffle($requiredForToday); //Shuffle the array of required client tallys
	shuffle($reservesForToday); //Shuffle the array of reserve client tallys
	$scheduledAuctionIDs = array(); //Init array that will hold the scheduled auction IDs
	foreach ($timeSlots as $timeSlot) { //For each time slot
		if(count($requiredForToday)>0){ //If there are still client ID tallys in the required array
			$randomClientID = array_pop($requiredForToday); //Grab a random client ID tally, and remove it from the array
			$availableAuction = getAvailableAuctionForClientID($randomClientID); //Get one random available auction for that client ID
			if($availableAuction['error']){ //Error getting the available auction
				return array("error"=>true,
							"msg"=>$availableAuction['msg'],
							"requested"=>"Get available auction for client ID");
			}
			$setStartsAt = setStartsAt(array("auctionID"=>$availableAuction['results']['id'], //Update the starts at time given the auction ID and time slot
											"startsAt"=>$timeSlot));
			if($setStartsAt['error']){ //Error updating the starts at time
				return array("error"=>true,
							"msg"=>$setStartsAt['msg'],
							"requested"=>"Set starts at time for auction ID");
			}
			$scheduledAuctionIDs[] = $availableAuction['results']['id']; //Add the auction ID to the array of scheduled auctions
		}else if(count($reservesForToday)>0){ //Required array is empty. If there are still client ID tallys in the reserves array
			$randomClientID = array_pop($reservesForToday); //Grab a random client ID tally, and remove it from the array
			$availableAuction = getAvailableAuctionForClientID($randomClientID); //Get one random available auction for that client ID
			if($availableAuction['error']){ //Error getting the available auction
				return array("error"=>true,
							"msg"=>$availableAuction['msg'],
							"requested"=>"Get available auction for client ID");
			}
			$setStartsAt = setStartsAt(array("auctionID"=>$availableAuction['results']['id'], //Update the starts at time given the auction ID and time slot
											"startsAt"=>$timeSlot));
			if($setStartsAt['error']){ //Error updating the starts at time
				return array("error"=>true,
							"msg"=>$setStartsAt['msg'],
							"requested"=>"Set starts at time for auction ID");
			}
			$scheduledAuctionIDs[] = $availableAuction['results']['id']; //Add the auction ID to the array of scheduled auctions
		}else{ //The required and reserves arrays are both empty, but we haven't scheduled enough auction for the day yet.
			return array("error"=>true,
						"msg"=>"Out of available auctions. Time slots not filled");
		}
	}

	return array("error"=>false, //Success. Return array of the auction IDs that were scheduled.
				"results"=>$scheduledAuctionIDs);

}

function getAllAuctions_Job($receiver=NULL){
	
	$auctionsList = getAllAuctions();
	if($auctionsList['error']){
		return array("error"=>true,
					"msg"=>$auctionsList['msg'],
					"requested"=>"Get all auctions");
	}

	include_once("bidFunctions.php");
	$auctionsListComplex = injectBidData($auctionsList['results']);
	if($auctionsListComplex['error']){
		return array("error"=>true,
					"msg"=>$auctionsListComplex['msg'],
					"requested"=>"Inject bid data");
	}

	return array("error"=>false,
				"results"=>$auctionsListComplex['results']);				

}

function sendWinnerEmail_Job($auctionID, $receiver=NULL){
	if(!isset($auctionID) || $auctionID==""){
		return array("error"=>true,
					"msg"=>"No auction ID provided");
	}
	if(!isset($receiver) || $receiver==""){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	if($receiver!="user" && $receiver!="admin"){
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}
	
	$auctionData = getAuction_Job($auctionID);
	if($auctionData['error']){
		return array("error"=>true,
					"msg"=>$auctionData['msg'],
					"requested"=>"Get auction job");
	}

	$inputs = Input::all();
	if(!isset($inputs) or $inputs==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['msgID']) or $inputs['msgID']==""){ //No json data found
		return array("error"=>true,
					"msg"=>"No receiver provided");
		die();
	}

	include_once("msgFunctions.php");
	$msgResponseData = array("response"=>"true",
							"msgID"=>$inputs['msgID']);
	$msgResponse = respondToMsg($msgResponseData);
	if($msgResponse['error']){
		return array("error"=>true,
					"msg"=>$msgResponse['msg'],
					"requested"=>"Respond to msg");
	}

	include_once("userFunctions.php");
	$userData = getUser($auctionData['results'][0]['leaderID']);
	if($userData['error']){
		return array("error"=>true,
					"msg"=>$userData['msg'],
					"requested"=>"Get user");
	}

	$to = $userData['results']['userEmail'];
	$subject = "Congratulations!";

	$headers = "From: info@gratii.com\r\n";
    $headers .= "Reply-To: info@gratii.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    ////////
    $message = '<html>
	<body style="background-color:#f6f6f6;">

		<table width="100%"><tr><td align="center">

			<table bgcolor="#FFFFFF" width="613" style="font-family:arial;color:black;">
				<tr bgcolor="blue">
					<td align="center">
						<br>
						<img src="http://graticity.com/gratii29/app/images/pro/logo.png" alt="Gratii" width="200">
						<br><br>
					</td>
				</tr>
				<tr>
					<td align="center">
						<img src="http://graticity.com/gratii29/app/images/auctions/'.$auctionData['results'][0]['promoPic'].'" alt="'.$auctionData['results'][0]['promoName'].'" style="border-top:2px solid #FFF;border-bottom:2px solid #FFF;">
					</td>
				</tr>
				<tr>
					<td style="padding-left:10px;color:#000000;">
						<h3 style="font-size:22px;">YOU WON!</h3>
						<p style="font-size:15px;">Congratulations on winning the '.$auctionData['results'][0]['promoName'].' from '.$auctionData['results'][0]['clientName'].'.</p>
						<p style="font-size:15px;">Instructions:</br>'.$auctionData['results'][0]['promoUseInstructions'].'</p>
						<p class="code" style="font-size:25px;">'.$auctionData['results'][0]['externalID'].'</p>
						<br>
						<br>
					</td>
				</tr>
			</table>

		</td></tr></table>

	</body>
	</html>';
    ////////


	if(mail($to, $subject, $message, $headers)){
		return array("error"=>false,
					"results"=>"Email sent");
	}else{
		return array("error"=>true,
					"msg"=>"Error sending email");
	}
}

//-----------TASKS----------------


?>