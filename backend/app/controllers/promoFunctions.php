<?php 

//-----------GET QUERIES----------------
function getAllPromos($receiver=NULL){

	try{
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
														FROM promos
														LEFT JOIN clients ON clients.id = promos.clientID');
			$getAllPromos -> execute();
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		
		if($results = $getAllPromos -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No promos found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getAllPromosForClientID($id, $receiver=NULL){
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
														FROM promos
														LEFT JOIN clients ON clients.id = promos.clientID
														WHERE clients.id=?');
			$getAllPromos -> execute(array($id));
		}else if($receiver=="client"){
			$getAllPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
														FROM promos
														LEFT JOIN clients ON clients.id = promos.clientID
														WHERE clients.id=?');
			$getAllPromos -> execute(array($_SESSION['clientID']));
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		
		if($results = $getAllPromos -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No promos found
			return array("error"=>true, 
						"msg"=>"404");
		}		
	
}

function getPromo($id,$receiver=NULL){

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getPromo = $GLOBALS['db'] -> prepare('SELECT *, promos.id AS id
													FROM promos
													LEFT JOIN clients ON clients.id = promos.clientID WHERE promos.id = ?');
		}else if($receiver=="user" || $receiver=="client" || $receiver=="demo"){ //User or client
			$getPromo = $GLOBALS['db'] -> prepare('SELECT id, clientID, promoDetails, promoPic, 
													promoWebsite, promoFacebook, promoTwitter, featuredPromo, 
													promoTargetGender, promoTargetAgeMin, promoTargetAgeMax 
													FROM promos WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getPromo -> execute(array($id));
		if($results = $getPromo -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Promo not found
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

function getPromosForClientID($id,$receiver=NULL){

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getPromosForClientID = $GLOBALS['db'] -> prepare('SELECT * FROM promos WHERE clientID = ?');
		}else if($receiver=="client" && $_SESSION['clientID']==$id){ //User or client
			$getPromosForClientID = $GLOBALS['db'] -> prepare('SELECT id, clientID, promoName, promoDetails, promoPic, 
													promoWebsite, promoFacebook, promoTwitter, featuredPromo, 
													promoTargetGender, promoTargetAgeMin, promoTargetAgeMax 
													FROM promos WHERE clientID = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getPromosForClientID -> execute(array($id));
		if($results = $getPromosForClientID -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results);
		}else{ //Promos not found
			return array("error"=>true,
						"msg"=>"404");	
			die();
		}

}

function getAuctionsBasicForPromo_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){
		if($getPromosForClient['error']){
			return array("error"=>true,
					"msg"=>"No client ID provided");
		}
	}

	include_once("auctionFunctions.php");
	$getAuctionsBasic = getAuctionsBasicForPromoID($id, $receiver);
	if($getAuctionsBasic['error']){
		return array("error"=>true,
				"msg"=>$getAuctionsBasic['msg']);
	}

	return array("error"=>false,
				"results"=>$getAuctionsBasic['results']);

}

function getAuctionsComplexForPromo_Job($id, $receiver=NULL){

	if(!isset($id) || $id==""){
		if($getPromosForClient['error']){
			return array("error"=>true,
					"msg"=>"No client ID provided");
		}
	}

	include_once("auctionFunctions.php");
	$getAuctionsBasic = getAuctionsBasicForPromoID($id, $receiver);
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

function getPromosForFacebookID($promoFacebookID){

	if(!isset($promoFacebookID) || $promoFacebookID==""){
		return array("error"=>true,
					"msg"=>"No promo Facebook ID provided");
	}
	
	$getPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
												FROM promos
												LEFT JOIN clients ON clients.id = promos.clientID
												WHERE promos.promoFacebookID=?');
	$getPromos -> execute(array($promoFacebookID));
	if($results = $getPromos -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No promos found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}

function getPromosForTwitterID($promoTwitterID){

	if(!isset($promoTwitterID) || $promoTwitterID==""){
		return array("error"=>true,
					"msg"=>"No promo Twitter ID provided");
	}
	
	$getPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
												FROM promos
												LEFT JOIN clients ON clients.id = promos.clientID
												WHERE promos.promoTwitterID=?');
	$getPromos -> execute(array($promoTwitterID));
	if($results = $getPromos -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No promos found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}

function getPromosForWebsiteID($promoWebsiteID){

	if(!isset($promoWebsiteID) || $promoWebsiteID==""){
		return array("error"=>true,
					"msg"=>"No promo website ID provided");
	}
	
	$getPromos = $GLOBALS['db']->prepare('SELECT *, promos.id AS id 
												FROM promos
												LEFT JOIN clients ON clients.id = promos.clientID
												WHERE promos.promoWebsiteID=?');
	$getPromos -> execute(array($promoWebsiteID));
	if($results = $getPromos -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No promos found
		return array("error"=>true, 
					"msg"=>"404");
	}	
}


//-----------INSERT QUERIES----------------
function createPromo($inputs){ //Insert the new promo

		if(!isset($inputs) || $inputs==""){
			return array("error"=>true,
						"msg"=>"No inputs provided");
		}

		if(!isset($inputs['clientID']) || $inputs['clientID']==""){
			return array("error"=>true,
						"msg"=>"No client id provided");
		}
		if(!isset($inputs['promoDetails']) || $inputs['promoDetails']==""){
			return array("error"=>true,
						"msg"=>"No promo details provided");
		}
		if(!isset($inputs['promoPic']) || $inputs['promoPic']==""){
			return array("error"=>true,
						"msg"=>"No promo pic provided");
		}
		if(!isset($inputs['promoBackgroundColor']) || $inputs['promoBackgroundColor']==""){
			return array("error"=>true,
						"msg"=>"No promo background color provided");
		}
		if(!isset($inputs['promoFontColor']) || $inputs['promoFontColor']==""){
			return array("error"=>true,
						"msg"=>"No  promo font color provided");
		}
		if(!isset($inputs['promoWebsite']) || $inputs['promoWebsite']==""){
			return array("error"=>true,
						"msg"=>"No promo website provided");
		}
		if(!isset($inputs['promoWebsiteID']) || $inputs['promoWebsiteID']==""){
			return array("error"=>true,
						"msg"=>"No promo website ID provided");
		}
		if(!isset($inputs['promoFacebook']) || $inputs['promoFacebook']==""){
			return array("error"=>true,
						"msg"=>"No promo facebook provided");
		}
		if(!isset($inputs['promoTwitter']) || $inputs['promoTwitter']==""){
			return array("error"=>true,
						"msg"=>"No promo twitter provided");
		}
		if(!isset($inputs['promoTargetAgeMin']) || $inputs['promoTargetAgeMin']==""){
			return array("error"=>true,
						"msg"=>"No promo target age min provided");
		}
		if(!isset($inputs['promoTargetAgeMax']) || $inputs['promoTargetAgeMax']==""){
			return array("error"=>true,
						"msg"=>"No promo target age max provided");
		}
		if(!isset($inputs['promoTargetGender']) || $inputs['promoTargetGender']==""){
			return array("error"=>true,
						"msg"=>"No promo target gender provided");
		}

		$createPromo = $GLOBALS['db'] -> prepare('INSERT INTO promos (clientID, promoName, promoDetails, promoPic, 
													promoBackgroundColor, promoFontColor,
													promoWebsite, promoWebsiteID, promoFacebook, promoFacebookID,
													promoTwitter, promoTwitterID, featuredPromo, 
													promoTargetGender, promoTargetAgeMin, promoTargetAgeMax, createdAt)
													VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
		$createPromo -> execute(array($inputs['clientID'], $inputs['promoName'], $inputs['promoDetails'], $inputs['promoPic'], 
									$inputs['promoBackgroundColor'], $inputs['promoFontColor'],
									$inputs['promoWebsite'], $inputs['promoWebsiteID'], 
									$inputs['promoFacebook'], $inputs['promoFacebookID'], 
									$inputs['promoTwitter'], $inputs['promoTwitterID'], 
									$inputs['featuredPromo'], $inputs['promoTargetGender'], 
									$inputs['promoTargetAgeMin'], $inputs['promoTargetAgeMax'], $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ //Promo created successfully. Returning the new promo id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No promo created");
		}

}


//-----------UPDATE QUERIES----------------
function updatePromo($inputs, $id){
	try {
		$updatePromo = $GLOBALS['db'] -> prepare('UPDATE promos SET clientID=?, promoName=?, promoDetails=?, promoPic=?, 
												promoBackgroundColor=?, promoFontColor=?,
												promoWebsite=?, promoWebsiteID=?, promoFacebook=?, promoFacebookID=?, 
												promoTwitter=?, promoTwitterID=?, featuredPromo=?, 
												promoTargetGender=?, promoTargetAgeMin=?, promoTargetAgeMax=?, updatedAt=?
												WHERE id=?');
		$updatePromo -> execute(array($inputs['clientID'], $inputs['promoName'], $inputs['promoDetails'], $inputs['promoPic'], 
									$inputs['promoBackgroundColor'], $inputs['promoFontColor'],
									$inputs['promoWebsite'], $inputs['promoWebsiteID'], 
									$inputs['promoFacebook'], $inputs['promoFacebookID'], 
									$inputs['promoTwitter'], $inputs['promoTwitterID'], 
									$inputs['featuredPromo'], $inputs['promoTargetGender'], 
									$inputs['promoTargetAgeMin'], $inputs['promoTargetAgeMax'],  $GLOBALS['NOW'], $id));
		
		$numRows = $updatePromo -> rowCount();							

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
function createPromo_Job(){


	$inputs = Input::all(); //Get inputs	

	if(!isset($inputs['clientID']) || $inputs['clientID']==""){
		if(!isset($_SESSION['clientID']) || $_SESSION['clientID']==""){
			return array('error' => true,
						'msg' => "No client ID provided");	
			die();
		}else{
			$inputs['clientID'] = $_SESSION['clientID'];
		}
	}else{
		include_once("clientFunctions.php");
		$clientData = getClient($inputs['clientID']);
		if($clientData['error']){
			return array("error"=>true,
						"msg"=>"Invalid client ID");
		}
	}

	$cleanPromoInputs = cleanPromoInputs($inputs); //Validate inputs
	if($cleanPromoInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanPromoInputs['msg']);	
		die();
	}else if(!isset($cleanPromoInputs['results']['clientID'])){ // No email
		return array('error' => true,
					'msg' => "Enter client ID");	
		die();
	}else if(!isset($cleanPromoInputs['results']['promoName'])){ // No name
		return array('error' => true,
					'msg' => "Enter promo name");	
		die();
	}

	$createPromo = createPromo($cleanPromoInputs['results']); // Create the new promo	
	if($createPromo['error']){ // Error creating the new promo
		return array("error"=>true,
					"msg"=>$createPromo['msg']);
		die();
	}else{ // New promo created successfully. Returning the new promo id.
		return array("error"=>false,
					"results"=>$createPromo['results']);
	}
	
}

function updatePromoProfile_Job($id, $receiver=NULL){

	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	$getPromo = getPromo($id);

	if($getPromo['error']){ //Error finding promo
		return array("error"=>true,
					"msg"=>$getPromo['msg']);
	}

	$inputs = Input::all();
	$overwritePromoInputs = overwritePromoInputs($getPromo['results'], $inputs);
	$cleanPromoInputs = cleanPromoInputs($overwritePromoInputs['results']);

	if($overwritePromoInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $overwritePromoInputs['msg']);	
		die();
	}else if(!isset($overwritePromoInputs['results']['clientID'])){ // No client ID
		return array('error' => true,
					'msg' => "Enter client ID");	
		die();
	}else if(!isset($overwritePromoInputs['results']['promoName'])){ // No promo name
		return array('error' => true,
					'msg' => "Enter promo name");	
		die();
	}

	$updatePromo = updatePromo($cleanPromoInputs['results'], $id);

	if($updatePromo['error']){ // Error updating the promo
		return array("error"=>true,
					"msg"=>$updatePromo['msg']);
		die();
	}else{ // Promo updated successfully. Returning the promo id.
		return array("error"=>false,
					"results"=>$updatePromo['results']);
		die();
	}

}

function getAllBiddersForPromo_Job($id, $receiver=NULL){
	if(!isset($id) || $id==""){
		return array("error"=>true,
					"msg"=>"No promo ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promoData = getPromo($id); //Get promo data
		if($promoData['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promoData['msg']);
		}

		if($promoData['results']['clientID'] != $_SESSION['clientID']){ //Promo client ID doesn't match current client logged in
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("bidFunctions.php"); //Include bid functions
	$biddersData = getAllBiddersForPromoID($id); //Get bidders for this promo id
	if($biddersData['error']){ //Error finding biders data
		return array("error"=>true,
						"msg"=>$biddersData['msg']);
	}
	return array("error"=>false,
				"results"=>$biddersData['results']);

}

function getAllLikersForPromo_Job($id, $receiver=NULL){
	if(!isset($id) || $id==""){
		return array("error"=>true,
					"msg"=>"No promo ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promoData = getPromo($id); //Get promo data
		if($promoData['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promoData['msg']);
		}

		if($promoData['results']['clientID'] != $_SESSION['clientID']){ //Promo client ID doesn't match current client logged in
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("likeFunctions.php"); //Include like functions
	$likersData = getAllLikersForPromoID($id); //Get likers for this promo id
	if($likersData['error']){ //Error finding likers data
		return array("error"=>true,
						"msg"=>$likersData['msg']);
	}
	return array("error"=>false,
				"results"=>$likersData['results']);

}

function getAllBidsForPromoID_Job($promoID, $receiver=NULL){
	if(!isset($promoID) || $promoID==""){
		return array("error"=>true,
					"msg"=>"No promo ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promosList = getPromosForClientID($_SESSION['clientID']); //Get promo data
		if($promosList['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promosList['msg']);
		}

		$arrayOfClientIDs = array();
		foreach ($promosList['results'] as $promo) {
			$arrayOfClientIDs[] = $promo['clientID'];
		}

		if(!in_array($_SESSION['clientID'], $arrayOfClientIDs)){ //Promo client ID doesn't match any of the found client IDs
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("bidFunctions.php"); //Include bid functions
	$bidsData = getAllBidsForPromoID($promoID); //Get bids for this promo id
	if($bidsData['error']){ //Error finding bids data
		return array("error"=>true,
						"msg"=>$bidsData['msg']);
	}

	return array("error"=>false,
				"results"=>$bidsData['results']);

}

function getAllLikersForPromoFacebookID_Job($promoFacebookID, $receiver=NULL){
	if(!isset($promoFacebookID) || $promoFacebookID==""){
		return array("error"=>true,
					"msg"=>"No promo Facebook ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promosList = getPromosForFacebookID($promoFacebookID); //Get promo data
		if($promosList['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promosList['msg']);
		}

		$arrayOfClientIDs = array();
		foreach ($promosList['results'] as $promo) {
			$arrayOfClientIDs[] = $promo['clientID'];
		}

		if(!in_array($_SESSION['clientID'], $arrayOfClientIDs)){ //Promo client ID doesn't match any of the found client IDs
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("likeFunctions.php"); //Include like functions
	$likersData = getAllLikersForPromoFacebookID($promoFacebookID); //Get likers for this facebook id
	if($likersData['error']){ //Error finding likers data
		return array("error"=>true,
						"msg"=>$likersData['msg']);
	}
	return array("error"=>false,
				"results"=>$likersData['results']);

}

function getAllFollowersForPromo_Job($id, $receiver=NULL){
	if(!isset($id) || $id==""){
		return array("error"=>true,
					"msg"=>"No promo ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promoData = getPromo($id); //Get promo data
		if($promoData['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promoData['msg']);
		}

		if($promoData['results']['clientID'] != $_SESSION['clientID']){ //Promo client ID doesn't match current client logged in
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("followFunctions.php"); //Include follow functions
	$followersData = getAllFollowersForPromoID($id); //Get followers for this promo id
	if($followersData['error']){ //Error finding followers data
		return array("error"=>true,
						"msg"=>$followersData['msg']);
	}
	return array("error"=>false,
				"results"=>$followersData['results']);

}

function getAllFollowersForPromoTwitterID_Job($promoTwitterID, $receiver=NULL){
	if(!isset($promoTwitterID) || $promoTwitterID==""){
		return array("error"=>true,
					"msg"=>"No promo Twitter ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promosList = getPromosForTwitterID($promoTwitterID); //Get promo data
		if($promosList['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promosList['msg']);
		}

		$arrayOfClientIDs = array();
		foreach ($promosList['results'] as $promo) {
			$arrayOfClientIDs[] = $promo['clientID'];
		}

		if(!in_array($_SESSION['clientID'], $arrayOfClientIDs)){ //Promo client ID doesn't match any of the found client IDs
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("followFunctions.php"); //Include follow functions
	$followersData = getAllFollowersForPromoTwitterID($promoTwitterID); //Get followers for this twitter id
	if($followersData['error']){ //Error finding followers data
		return array("error"=>true,
						"msg"=>$followersData['msg']);
	}
	return array("error"=>false,
				"results"=>$followersData['results']);

}

function getAllClickersForPromo_Job($id, $receiver=NULL){
	if(!isset($id) || $id==""){
		return array("error"=>true,
					"msg"=>"No promo ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promoData = getPromo($id); //Get promo data
		if($promoData['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promoData['msg']);
		}

		if($promoData['results']['clientID'] != $_SESSION['clientID']){ //Promo client ID doesn't match current client logged in
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("clickthruFunctions.php"); //Include clickthru functions
	$clickersData = getAllClickersForPromoID($id); //Get clickers for this promo id
	if($clickersData['error']){ //Error finding clickers data
		return array("error"=>true,
						"msg"=>$clickersData['msg']);
	}
	return array("error"=>false,
				"results"=>$clickersData['results']);

}

function getAllClickersForPromoWebsiteID_Job($promoWebsiteID, $receiver=NULL){
	if(!isset($promoWebsiteID) || $promoWebsiteID==""){
		return array("error"=>true,
					"msg"=>"No promo website ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promosList = getPromosForWebsiteID($promoWebsiteID); //Get promo data
		if($promosList['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promosList['msg']);
		}

		$arrayOfClientIDs = array();
		foreach ($promosList['results'] as $promo) {
			$arrayOfClientIDs[] = $promo['clientID'];
		}

		if(!in_array($_SESSION['clientID'], $arrayOfClientIDs)){ //Promo client ID doesn't match any of the found client IDs
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("clickthruFunctions.php"); //Include clickthru functions
	$clickersData = getAllClickersForPromoWebsiteID($promoWebsiteID); //Get clickers for this website id
	if($clickersData['error']){ //Error finding clickers data
		return array("error"=>true,
						"msg"=>$clickersData['msg']);
	}
	return array("error"=>false,
				"results"=>$clickersData['results']);

}

function getAllClickthrusForPromoWebsiteID_Job($promoWebsiteID, $receiver=NULL){
	if(!isset($promoWebsiteID) || $promoWebsiteID==""){
		return array("error"=>true,
					"msg"=>"No promo website ID provided");
	}
	if($receiver!="client" && $receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}else if($receiver=="client"){ //Client request
		$promosList = getPromosForWebsiteID($promoWebsiteID); //Get promo data
		if($promosList['error']){ //Error finding promo data
			return array("error"=>true,
							"msg"=>$promosList['msg']);
		}

		$arrayOfClientIDs = array();
		foreach ($promosList['results'] as $promo) {
			$arrayOfClientIDs[] = $promo['clientID'];
		}

		if(!in_array($_SESSION['clientID'], $arrayOfClientIDs)){ //Promo client ID doesn't match any of the found client IDs
			return array("error"=>true,
						"msg"=>"Invalid request.");
		}
	}

	include("clickthruFunctions.php"); //Include clickthru functions
	$clickersData = getAllClickthrusForPromoWebsiteID($promoWebsiteID); //Get clickers for this website id
	if($clickersData['error']){ //Error finding clickers data
		return array("error"=>true,
						"msg"=>$clickersData['msg']);
	}
	return array("error"=>false,
				"results"=>$clickersData['results']);

}


//-----------TASKS----------------
function cleanPromoInputs($inputs){
	
	$cleanPromoInputs = array(); // Initiate array to be returned.
	
	$cleanPromoInputs['clientID']=$inputs['clientID'];
	if(isset($inputs['promoName'])){
		$promoName=$inputs['promoName'];
		if(strlen($promoName)>25){ //Max char
			return array('error' => true,
						'msg' => "Name: Max 25 characters");	
			die();
		}else{ //Clean. Add to array.
			$cleanPromoInputs['promoName'] = $promoName;
		}
	}
	if(isset($inputs['promoDetails'])){
		$promoDetails=$inputs['promoDetails'];
		if(strlen($promoDetails)>255){ //Max char
			return array('error' => true,
						'msg' => "Details: Max 255 characters");	
			die();
		}else{ //Clean. Add to array.
			$cleanPromoInputs['promoDetails'] = $promoDetails;
		}
	}else{
		$cleanPromoInputs['promoDetails']="---";
	}

	if(!isset($inputs['promoPic']) || $inputs['promoPic']==""){
		$cleanPromoInputs['promoPic']="---";
	}else{
		$cleanPromoInputs['promoPic']=$inputs['promoPic'];
	}
	if(!isset($inputs['promoBackgroundColor']) || $inputs['promoBackgroundColor']==""){
		$cleanPromoInputs['promoBackgroundColor']="---";
	}else{
		$cleanPromoInputs['promoBackgroundColor']=$inputs['promoBackgroundColor'];
	}
	if(!isset($inputs['promoFontColor']) || $inputs['promoFontColor']==""){
		$cleanPromoInputs['promoFontColor']="---";
	}else{
		$cleanPromoInputs['promoFontColor']=$inputs['promoFontColor'];
	}
	if(!isset($inputs['promoWebsite']) || $inputs['promoWebsite']==""){
		$cleanPromoInputs['promoWebsite']="---";
		$cleanPromoInputs['promoWebsiteID']="---";
	}else{
		$cleanPromoInputs['promoWebsite']=$inputs['promoWebsite'];
		$cleanPromoInputs['promoWebsiteID']=crc32($inputs['promoWebsite']);
	}
	if(!isset($inputs['promoFacebook']) || $inputs['promoFacebook']==""){
		$cleanPromoInputs['promoFacebook']="---";
		$cleanPromoInputs['promoFacebookID']="---";
	}else{
		$cleanPromoInputs['promoFacebook']=$inputs['promoFacebook'];
		$cleanPromoInputs['promoFacebookID']=getFacebookId($inputs['promoFacebook']);
	}
	if(!isset($inputs['promoTwitter']) || $inputs['promoTwitter']==""){
		$cleanPromoInputs['promoTwitter']="---";
		$cleanPromoInputs['promoTwitterID']="---";
	}else{
		$cleanPromoInputs['promoTwitter']=$inputs['promoTwitter'];
		$cleanPromoInputs['promoTwitterID']=getTwitterId($inputs['promoTwitter']);
	}
	if(!isset($inputs['promoTargetGender']) || $inputs['promoTargetGender']==""){
		$cleanPromoInputs['promoTargetGender']="---";
	}else{
		$cleanPromoInputs['promoTargetGender']=$inputs['promoTargetGender'];
	}
	if(!isset($inputs['promoTargetAgeMin']) || $inputs['promoTargetAgeMin']==""){
		$cleanPromoInputs['promoTargetAgeMin']="---";
	}else{
		$cleanPromoInputs['promoTargetAgeMin']=$inputs['promoTargetAgeMin'];
	}
	if(!isset($inputs['promoTargetAgeMax']) || $inputs['promoTargetAgeMax']==""){
		$cleanPromoInputs['promoTargetAgeMax']="---";
	}else{
		$cleanPromoInputs['promoTargetAgeMax']=$inputs['promoTargetAgeMax'];
	}
	if(!isset($inputs['featuredPromo']) || $inputs['featuredPromo']==""){
		$cleanPromoInputs['featuredPromo']="0";
	}else{
		$cleanPromoInputs['featuredPromo']=$inputs['featuredPromo'];
	}

	

	return array("error"=>false,
				"results"=>$cleanPromoInputs);

}

function overwritePromoInputs($promoInputs, $inputs){

	$overwritePromoInputs = array(); // Initiate array to be returned.

	if(isset($inputs['clientID'])&&$inputs['clientID']!=""){
		$overwritePromoInputs['clientID'] = $inputs['clientID'];
	}else if(isset($promoInputs['clientID'])){
		$overwritePromoInputs['clientID'] = $promoInputs['clientID'];
	}
	if(isset($inputs['promoName'])&&$inputs['promoName']!=""){
		$overwritePromoInputs['promoName'] = $inputs['promoName'];
	}else if(isset($promoInputs['promoName'])){
		$overwritePromoInputs['promoName'] = $promoInputs['promoName'];
	}
	if(isset($inputs['promoDetails'])&&$inputs['promoDetails']!=""){
		$overwritePromoInputs['promoDetails'] = $inputs['promoDetails'];
	}else if(isset($promoInputs['promoDetails'])){
		$overwritePromoInputs['promoDetails'] = $promoInputs['promoDetails'];
	}
	if(isset($inputs['promoPic'])&&$inputs['promoPic']!=""){
		$overwritePromoInputs['promoPic'] = $inputs['promoPic'];
	}else if(isset($promoInputs['promoPic'])){
		$overwritePromoInputs['promoPic'] = $promoInputs['promoPic'];
	}
	if(isset($inputs['promoBackgroundColor'])&&$inputs['promoBackgroundColor']!=""){
		$overwritePromoInputs['promoBackgroundColor'] = $inputs['promoBackgroundColor'];
	}else if(isset($promoInputs['promoBackgroundColor'])){
		$overwritePromoInputs['promoBackgroundColor'] = $promoInputs['promoBackgroundColor'];
	}
	if(isset($inputs['promoFontColor'])&&$inputs['promoFontColor']!=""){
		$overwritePromoInputs['promoFontColor'] = $inputs['promoFontColor'];
	}else if(isset($promoInputs['promoFontColor'])){
		$overwritePromoInputs['promoFontColor'] = $promoInputs['promoFontColor'];
	}
	if(isset($inputs['promoWebsite'])&&$inputs['promoWebsite']!=""){
		$overwritePromoInputs['promoWebsite'] = $inputs['promoWebsite'];
		$overwritePromoInputs['promoWebsiteID'] = crc32($inputs['promoWebsite']);
	}else if(isset($promoInputs['promoWebsite'])){
		$overwritePromoInputs['promoWebsite'] = $promoInputs['promoWebsite'];
		$overwritePromoInputs['promoWebsiteID'] = $promoInputs['promoWebsiteID'];
	}
	if(isset($inputs['promoFacebook'])&&$inputs['promoFacebook']!=""){
		$overwritePromoInputs['promoFacebook'] = $inputs['promoFacebook'];
		$overwritePromoInputs['promoFacebookID'] = getFacebookId($inputs['promoFacebook']);
	}else if(isset($promoInputs['promoFacebook'])){
		$overwritePromoInputs['promoFacebook'] = $promoInputs['promoFacebook'];
		$overwritePromoInputs['promoFacebookID'] = $promoInputs['promoFacebookID'];
	}
	if(isset($inputs['promoTwitter'])&&$inputs['promoTwitter']!=""){
		$overwritePromoInputs['promoTwitter'] = $inputs['promoTwitter'];
		$overwritePromoInputs['promoTwitterID'] = getTwitterId($inputs['promoTwitter']);
	}else if(isset($promoInputs['promoTwitter'])){
		$overwritePromoInputs['promoTwitter'] = $promoInputs['promoTwitter'];
		$overwritePromoInputs['promoTwitterID'] = $promoInputs['promoTwitterID'];
	}
	if(isset($inputs['promoTargetGender'])&&$inputs['promoTargetGender']!=""){
		$overwritePromoInputs['promoTargetGender'] = $inputs['promoTargetGender'];
	}else if(isset($promoInputs['promoTargetGender'])){
		$overwritePromoInputs['promoTargetGender'] = $promoInputs['promoTargetGender'];
	}
	if(isset($inputs['promoTargetAgeMin'])&&$inputs['promoTargetAgeMin']!=""){
		$overwritePromoInputs['promoTargetAgeMin'] = $inputs['promoTargetAgeMin'];
	}else if(isset($promoInputs['promoTargetAgeMin'])){
		$overwritePromoInputs['promoTargetAgeMin'] = $promoInputs['promoTargetAgeMin'];
	}
	if(isset($inputs['promoTargetAgeMax'])&&$inputs['promoTargetAgeMax']!=""){
		$overwritePromoInputs['promoTargetAgeMax'] = $inputs['promoTargetAgeMax'];
	}else if(isset($promoInputs['promoTargetAgeMax'])){
		$overwritePromoInputs['promoTargetAgeMax'] = $promoInputs['promoTargetAgeMax'];
	}
	if(isset($inputs['featuredPromo'])&&$inputs['featuredPromo']!=""){
		$overwritePromoInputs['featuredPromo'] = $inputs['featuredPromo'];
	}else if(isset($promoInputs['featuredPromo'])){
		$overwritePromoInputs['featuredPromo'] = $promoInputs['featuredPromo'];
	}

	
	return array("error"=>false,
				"results"=>$overwritePromoInputs);

}

function getFacebookId($url) {

    $id =  substr(strrchr($url,'/'),1); 

    $json = file_get_contents('http://graph.facebook.com/'.$id);

    $json = json_decode($json);

    return $json->id;

}

function getTwitterId($handle) {

 	require_once('twitterSDK/twitteroauth/twitteroauth.php');
 	require_once('twitterSDK/config.php');

	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, 
 										"768658309-tkFjeUSD3Qdx56zFdMploSraNeGsIBadrhlT4dBH", 
 										"dj9pgNvBV6ZWLy3W7jfdkvQU0KyTw3IJplBYBolvWc");

 	$twitterUser = $connection->get('https://api.twitter.com/1.1/users/show.json', array('screen_name'=>$handle));
 	
    return $twitterUser->id;

}


?>