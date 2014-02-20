<?php 

//-----------GET QUERIES----------------
function getAllAdmin($receiver=NULL){

	try{
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAllAdmin = $GLOBALS['db']->prepare('SELECT * FROM admin');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getAllAdmin -> execute();
		if($results = $getAllAdmin -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results);
		}else{ //No admin found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getAdmin($id,$receiver=NULL){

	try{

		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAdmin = $GLOBALS['db'] -> prepare('SELECT * FROM admin WHERE id = ?');
		}else{ //Invalid receiver
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}
		$getAdmin -> execute(array($id));
		if($results = $getAdmin -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //Admin not found
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

function getAdminByAdminNickname($adminNickname){
	
	try{

		$getAdmin = $GLOBALS['db'] -> prepare('SELECT * FROM admin WHERE adminNickname = ?');
		$getAdmin -> execute(array($adminNickname));
		if($results = $getAdmin -> fetchAll(PDO::FETCH_ASSOC)){
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

function getAdminByAdminEmail($adminEmail){

	try{

		$getAdmin = $GLOBALS['db'] -> prepare('SELECT * FROM admin WHERE adminEmail = ?');
		$getAdmin -> execute(array($adminEmail));
		if($results = $getAdmin -> fetchAll(PDO::FETCH_ASSOC)){
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

function getAuctionSettings($receiver=NULL){

	try{
		
		if($receiver===NULL||$receiver=="admin"){ //Internal or admin. Select all.
			$getAuctionSettings = $GLOBALS['db']->prepare('SELECT * FROM auctionSettings WHERE id=1');
		}else{ //Receiver denied
			return array("error"=>true,
						"msg"=>"Invalid entity");	
		}

		$getAuctionSettings -> execute();
		if($results = $getAuctionSettings -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			return array("error"=>false, 
						"msg"=>"200",
						"results"=>$results[0]);
		}else{ //No admin found
			return array("error"=>true, 
						"msg"=>"404");
		}		

	}catch(Exception $error){ //Mysql error
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}	

}

function getAllBidders_Job(){

	include_once("bidFunctions.php");
	$biddersData = getAllBidders();
	if($biddersData['error']){
		return array("error"=>true,
					"msg"=>$biddersData['msg'],
					"requested"=>"Get all bidders");
	}

	return array("error"=>false,
				"results"=>$biddersData['results']);

}

function getAllLikers_Job(){

	include_once("likeFunctions.php");
	$likersData = getAllLikers();
	if($likersData['error']){
		return array("error"=>true,
					"msg"=>$likersData['msg'],
					"requested"=>"Get all likers");
	}

	return array("error"=>false,
				"results"=>$likersData['results']);

}

function getAllFollowers_Job(){

	include_once("followFunctions.php");
	$followersData = getAllFollowers();
	if($followersData['error']){
		return array("error"=>true,
					"msg"=>$followersData['msg'],
					"requested"=>"Get all followers");
	}

	return array("error"=>false,
				"results"=>$followersData['results']);

}

function getAllClickers_Job(){

	include_once("clickthruFunctions.php");
	$clickersData = getAllClickers();
	if($clickersData['error']){
		return array("error"=>true,
					"msg"=>$clickersData['msg'],
					"requested"=>"Get all clickers");
	}

	return array("error"=>false,
				"results"=>$clickersData['results']);

}

function getAllEconomyStats($startTime){
	if(!isset($startTime) || $startTime==""){
		return array("error"=>true,
					"msg"=>"No start time provided");
	}
	
	$getEconomyStats = $GLOBALS['db']->prepare('SELECT * FROM economyStats WHERE createdAt>?');	
	$getEconomyStats -> execute(array($startTime));
	if($results = $getEconomyStats -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No admin found
		return array("error"=>true, 
					"msg"=>"404");
	}
}
//-----------INSERT QUERIES----------------
function createAdmin($adminEmail, $adminNickname, $adminPassword){ //Insert the new admin

		$createAdmin = $GLOBALS['db'] -> prepare('INSERT INTO admin (adminEmail, adminNickname, 
									adminPassword, createdAt)
									VALUES (?, ?, ?, ?)');
		$createAdmin -> execute(array($adminEmail, $adminNickname, 
									$adminPassword, $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ // Admin created successfully. Returning the new admin id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No admin created");
		}

}


//-----------UPDATE QUERIES----------------
function updateAdminProfile($adminProfile, $id){
	try {
		$updateAdminProfile = $GLOBALS['db'] -> prepare('UPDATE admin SET adminNickname=?,
									adminAddress1=?, adminAddress2=?, 
									adminCity=?, adminState=?, adminZip=?,
									adminFirstName=?, adminLastName=?, adminPhone=?, updatedAt=?
									WHERE id=?');
		$updateAdminProfile -> execute(array($adminProfile['adminNickname'], $adminProfile['adminAddress1'], 
									$adminProfile['adminAddress2'], $adminProfile['adminCity'], 
									$adminProfile['adminState'], $adminProfile['adminZip'],
									$adminProfile['adminFirstName'], $adminProfile['adminLastName'], 
									$adminProfile['adminPhone'], $GLOBALS['NOW'], $id));
		
		$numRows = $updateAdminProfile -> rowCount();							

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

function updateAuctionSettings(){
		
		$inputs = Input::all(); //Get inputs
		if(!isset($inputs) || $inputs==""){
			return array("error"=>true,
						"msg"=>"No inputs provided");
		}
		if(!isset($inputs['auctionsPerDay']) || $inputs['auctionsPerDay']==""){
			return array("error"=>true,
						"msg"=>"No auctions per day provided");
		}
		if(!isset($inputs['startTime']) || $inputs['startTime']==""){
			return array("error"=>true,
						"msg"=>"No start time provided");
		}
		if(!isset($inputs['endTime']) || $inputs['endTime']==""){
			return array("error"=>true,
						"msg"=>"No end time provided");
		}

		$updateAuctionSettings = $GLOBALS['db'] -> prepare('UPDATE auctionSettings SET auctionsPerDay=?,
									startTime=?, endTime=?, updatedAt=? WHERE id=?');
		$updateAuctionSettings -> execute(array($inputs['auctionsPerDay'], $inputs['startTime'], 
												$inputs['endTime'], $GLOBALS['NOW'], 1));
		
		$numRows = $updateAuctionSettings -> rowCount();							

		if($numRows==0){
		
			return array('error' => true,
						'msg' => "No updates made.");	
			die();
		}else{
			
			return array('error' => false,
						'results' => "Success");
		}

}

//-----------JOBS----------------
function createAdmin_Job($inputs=NULL){

	if($inputs===null){
		$inputs = Input::all(); //Get inputs
	}

	$cleanAdminProfileInputs = cleanAdminProfileInputs($inputs); //Validate inputs
	
	if($cleanAdminProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanAdminProfileInputs['msg']);	
		die();
	}else if(!isset($cleanAdminProfileInputs['results']['adminEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanAdminProfileInputs['results']['adminNickname'])){ // No name
		return array('error' => true,
					'msg' => "Enter nickname");	
		die();
	}

	if(isset($inputs['adminPassword'])){
		$adminPassword=$inputs['adminPassword'];
		if(strlen($adminPassword)>30){ //Max char
			return array('error'=>true,
						'msg'=>"Password: Max 30 characters");	
			die();
		}else if(strlen($adminPassword)<5){ //Min char
			return array('error'=>true,
						'msg'=>"Password: Min 5 characters");	
			die();
		}else{ //Clean. Add to array.
			$encryptedPassword = encryptAdminPassword($adminPassword); //Encrypt password
		}	
	}else{ // No password
		return array('error' => true,
					'msg' => "Enter secret password");	
		die();
	}

	$emailAvailable = getAdminByAdminEmail($cleanAdminProfileInputs['results']['adminEmail']); //Check for used email
	if($emailAvailable['error']==false){ // Email found
		return array("error"=>true,
					"msg"=>"Email taken");
		die();
	}

	$nicknameAvailable = getAdminByAdminNickname($cleanAdminProfileInputs['results']['adminNickname']); //Check for used nickname
	if($nicknameAvailable['error']==false){ // Nickname found
		return array("error"=>true,
					"msg"=>"Nickname taken");
		die();
	}
	
	$createAdmin = createAdmin($cleanAdminProfileInputs['results']['adminEmail'], $cleanAdminProfileInputs['results']['adminNickname'],
								$encryptedPassword); // Create the new admin	
	if($createAdmin['error']){ // Error creating the new admin
		return array("error"=>true,
					"msg"=>$createAdmin['msg']);
		die();
	}else{ // New admin created successfully. Returning the new admin id.
		return array("error"=>false,
					"results"=>$createAdmin['results']);
		die();
	}
	
}

function updateAdminProfile_Job($id, $receiver=NULL){

	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	$getAdmin= getAdmin($id);
	if($getAdmin['error']){ //Error finding admin
		return array("error"=>true,
					"msg"=>$getAdmin['msg']);
	}

	$inputs = Input::all();
	$overwriteAdminProfileInputs = overwriteAdminProfileInputs($getAdmin['results'], $inputs);
	$cleanAdminProfileInputs = cleanAdminProfileInputs($overwriteAdminProfileInputs['results']);

	if($cleanAdminProfileInputs['error']){ // Error cleaning inputs
		return array('error' => true,
					'msg' => $cleanAdminProfileInputs['msg']);	
		die();
	}else if(!isset($cleanAdminProfileInputs['results']['adminEmail'])){ // No email
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}else if(!isset($cleanAdminProfileInputs['results']['adminNickname'])){ // No name
		return array('error' => true,
					'msg' => "Enter nickname");	
		die();
	}

	$nicknameAvailable = getAdminByAdminNickname($cleanAdminProfileInputs['results']['adminNickname']); //Check for used nickname
	if($nicknameAvailable['error']==false && $nicknameAvailable['results']['id']!=$id){ // Nickname found
		return array("error"=>true,
					"msg"=>"Nickname taken");
		die();
	}

	$updateAdminProfile = updateAdminProfile($cleanAdminProfileInputs['results'], $id);

	if($updateAdminProfile['error']){ // Error updating the admin profile
		return array("error"=>true,
					"msg"=>$updateAdminProfile['msg']);
		die();
	}else{ // Admin profile updated successfully. Returning the admin id.
		return array("error"=>false,
					"results"=>$updateAdminProfile['results']);
		die();
	}

}

function loginAdmin_Job(){
	$adminEmail = Input::get('adminEmail');
	$adminPassword = Input::get('adminPassword');

	if($adminEmail==""){ //No email input
		return array('error' => true,
					'msg' => "Enter email");	
		die();
	}
	if($adminPassword==""){ //No password input
		return array('error' => true,
					'msg' => "Enter password");
		die();
	}

	$adminData = getAdminByAdminEmail($adminEmail); //Get admin data associated with email
	if($adminData['error']){ //Error getting admin data
		return array("error"=>true,
					"msg"=>$adminData['msg']);
		die();
	}

	if(md5($adminPassword) != $adminData['results']['adminPassword']) { //Password encryption check	    
 		return array('error' => true,
					'msg' => "401");
		die();
	}
	if($adminData['results']['adminActive']<$GLOBALS['NOW']){ //Account not active
		return array('error' => true,
					'msg' => "Only active admin can access login");
		die();
	}

	$_SESSION['adminID'] = $adminData['results']['id'];
	$_SESSION['entity'] = "admin";

	return array("error"=>false,
				"results"=>array("entity"=>$_SESSION['entity'],
								"id"=>$_SESSION['adminID'])); //Success

}

function getBidsDaily_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
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
	$allBids = getAllBids($startTime);
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
			if($dailyBid['unixTimestamp']==$unixCreatedAt){
				$dailyBid['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyBids);
}

function getLikesDaily_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
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
	$allLikes = getAllLikes($startTime);
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
			if($dailyLike['unixTimestamp']==$unixCreatedAt){
				$dailyLike['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyLikes);
}

function getFollowsDaily_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
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
	$allFollows = getAllFollows($startTime);
	if($allFollows['error']){ //Error getting all follows
		if($allFollows['msg']=="404"){
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
			if($dailyFollow['unixTimestamp']==$unixCreatedAt){
				$dailyFollow['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyFollows);
}

function getClickthrusDaily_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
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
	$allClickthrus = getAllClickthrus($startTime);
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
			if($dailyClickthru['unixTimestamp']==$unixCreatedAt){
				$dailyClickthru['count']++;
			}
		}		
	}

	return array("error"=>false,
				"results"=>$dailyClickthrus);
}

function getEconomyBoxAndWhiskers_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	include_once("userFunctions.php"); 
	$allUsers = getGratiiForAllUsers(); //Gratii for all users ordered ASC
	if($allUsers['msg']=="404"){
		return array("error"=>false,
					"results"=>$allUsers);
	}
	$totalUsers = count($allUsers['results']);

	$minOutlier = $allUsers['results'][0]['userGratii'];
	$maxOutlier = $allUsers['results'][$totalUsers-1]['userGratii'];
	if($totalUsers%2==0){ //If it's an even number of total users

		$lowerMedian = ($totalUsers/2-1); //The index just below 50%
		$higherMedian = ($totalUsers/2); //The index just above 50%
		$q2 = ($allUsers['results'][$lowerMedian]['userGratii']+$allUsers['results'][$higherMedian]['userGratii'])/2; 

		$q1 = $allUsers['results'][$lowerMedian/2]['userGratii'];
		$q3 = $allUsers['results'][$higherMedian+($lowerMedian/2)]['userGratii'];


	}else{
		$median = ceil($totalUsers/2);
		$q2 = $allUsers['results'][$median-1]['userGratii'];
		$lowerQ1 = floor($median/2)-1;
		$higherQ1 = ceil($median/2)-1;
		$q1 = ($allUsers['results'][$lowerQ1]['userGratii']+$allUsers['results'][$higherQ1]['userGratii'])/2;
		
		$lowerQ3 = $median+$lowerQ1;
		$higherQ3 = $median+$higherQ1;
		$q3 = ($allUsers['results'][$lowerQ3]['userGratii']+$allUsers['results'][$higherQ3]['userGratii'])/2;
	}

	$totalGratii = 0;
	foreach ($allUsers['results'] as $user) {
		$totalGratii+=$user['userGratii'];
	}
	$mean = $totalGratii/$totalUsers;

	return array("error"=>false,
				"results"=>array("totalUsers"=>$totalUsers,
								"totalGratii"=>$totalGratii,
								"mean"=>$mean,
								"minOutlier"=>$minOutlier,
								"q1"=>$q1,
								"q2"=>$q2,
								"q3"=>$q3,
								"maxOutlier"=>$maxOutlier));
}

function createEconomyBoxAndWhiskers_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity.");
	}

	$bw = getEconomyBoxAndWhiskers_Job($receiver);
	if($bw['error']){
		return array("error"=>true,
					"msg"=>$bw['msg'],
					"requested"=>"Get economy box and whiskers");
	}

	$createEntry = $GLOBALS['db'] -> prepare('INSERT INTO economyStats (totalUsers, totalGratii, 
								mean, minOutlier, maxOutlier, q1, q2, q3, createdAt)
								VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
	$createEntry -> execute(array($bw['results']['totalUsers'], $bw['results']['totalGratii'], 
								$bw['results']['mean'], $bw['results']['minOutlier'], 
								$bw['results']['maxOutlier'], $bw['results']['q1'], 
								$bw['results']['q2'], $bw['results']['q3'], $GLOBALS['NOW']));
	
	if($id = $GLOBALS['db']->lastInsertId()){ // User created successfully. Returning the new user id.
		return array('error'=>false,
				    'results'=>$id);
	}else{
		return array("error"=>true,
					"msg"=>"No purchase created");
	}
}

function getAllEconomyStats_Job($receiver=NULL){
	if($receiver!="admin"){ //Invalid receiver
		return array("error"=>true,
					"msg"=>"Invalid entity");
	}

	parse_str($_SERVER['QUERY_STRING']);
	if(!isset($days)){
		$startTime = "2013-09-01";
		$startUnix = strtotime($startTime);
	}else{
		$startTime = date('Y-m-d', time($GLOBALS['NOW']) - 60*60*24*$days);
		$startUnix = strtotime($startTime);
	}

	$allEconomyStats = getAllEconomyStats($startTime);
	if($allEconomyStats['error']){ //Error getting all economy stats
		return array("error"=>true,
					"msg"=>$allEconomyStats['msg']);
		die();
	}

	foreach ($allEconomyStats['results'] as &$stat) {
		$stat['unixTimestamp'] = strtotime($stat['createdAt']);		
	}

	return array("error"=>false,
				"results"=>$allEconomyStats['results']);
}

//-----------TASKS----------------
function cleanAdminProfileInputs($inputs){
	
	$cleanAdminProfileInputs = array(); // Initiate array to be returned.
	if(isset($inputs['adminNickname'])){
		$adminNickname=$inputs['adminNickname'];
		if(strlen($adminNickname)>25){ //Max char
			return array('error' => true,
						'msg' => "Name: Max 16 characters");	
			die();
		}else{ //Clean. Add to array.
			$cleanAdminProfileInputs['adminNickname'] = $adminNickname;
		}
	}
	if(isset($inputs['adminEmail'])){
		$adminEmail=$inputs['adminEmail'];
		if(strlen($adminEmail)>40){ //Max char
			return array('error' => true,
						'msg' => "Email: Max 40 characters");	
			die();
		}else if(!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)){ //Email validation
			return array('error' => true,
						'msg' => "Email invalid");	
			die();
		}else{ //Clean. Add to array.
			$cleanAdminProfileInputs['adminEmail'] = $adminEmail;
		}
	}
	if(isset($inputs['adminAddress1'])){
		$cleanAdminProfileInputs['adminAddress1']=$inputs['adminAddress1'];
	}
	if(isset($inputs['adminAddress2'])){
		$cleanAdminProfileInputs['adminAddress2']=$inputs['adminAddress2'];
	}
	if(isset($inputs['adminCity'])){
		$cleanAdminProfileInputs['adminCity']=$inputs['adminCity'];
	}
	if(isset($inputs['adminState'])){
		$cleanAdminProfileInputs['adminState']=$inputs['adminState'];
	}
	if(isset($inputs['adminZip'])){
		$cleanAdminProfileInputs['adminZip']=$inputs['adminZip'];
	}
	if(isset($inputs['adminFirstName'])){
		$cleanAdminProfileInputs['adminFirstName']=$inputs['adminFirstName'];
	}
	if(isset($inputs['adminLastName'])){
		$cleanAdminProfileInputs['adminLastName']=$inputs['adminLastName'];
	}
	if(isset($inputs['adminPhone'])){
		$cleanAdminProfileInputs['adminPhone']=$inputs['adminPhone'];
	}

	return array("error"=>false,
				"results"=>$cleanAdminProfileInputs);

}

function overwriteAdminProfileInputs($adminProfile, $inputs){

	$overwriteAdminProfileInputs = array(); // Initiate array to be returned.

	if(isset($inputs['adminNickname'])&&$inputs['adminNickname']!=""){
		$adminNickname = $inputs['adminNickname'];
		$overwriteAdminProfileInputs['adminNickname'] = $adminNickname;
	}else if(isset($adminProfile['adminNickname'])){
		$adminNickname = $adminProfile['adminNickname'];
		$overwriteAdminProfileInputs['adminNickname'] = $adminNickname;
	}
	if(isset($inputs['adminEmail'])&&$inputs['adminEmail']!=""){
		$adminEmail = $inputs['adminEmail'];
		$overwriteAdminProfileInputs['adminEmail'] = $adminEmail;
	}else if(isset($adminProfile['adminEmail'])){
		$adminEmail = $adminProfile['adminEmail'];
		$overwriteAdminProfileInputs['adminEmail'] = $adminEmail;
	}
	if(isset($inputs['adminAddress1'])){
		$adminAddress1 = $inputs['adminAddress1'];
		$overwriteAdminProfileInputs['adminAddress1'] = $adminAddress1;
	}else if(isset($adminProfile['adminAddress1'])){
		$adminAddress1 = $adminProfile['adminAddress1'];
		$overwriteAdminProfileInputs['adminAddress1'] = $adminAddress1;
	}
	if(isset($inputs['adminAddress2'])){
		$adminAddress2 = $inputs['adminAddress2'];
		$overwriteAdminProfileInputs['adminAddress2'] = $adminAddress2;
	}else if(isset($adminProfile['adminAddress2'])){
		$adminAddress2 = $adminProfile['adminAddress2'];
		$overwriteAdminProfileInputs['adminAddress2'] = $adminAddress2;
	}
	if(isset($inputs['adminCity'])){
		$adminCity = $inputs['adminCity'];
		$overwriteAdminProfileInputs['adminCity'] = $adminCity;
	}else if(isset($adminProfile['adminCity'])){
		$adminCity = $adminProfile['adminCity'];
		$overwriteAdminProfileInputs['adminCity'] = $adminCity;
	}
	if(isset($inputs['adminState'])){
		$adminState = $inputs['adminState'];
		$overwriteAdminProfileInputs['adminState'] = $adminState;
	}else if(isset($adminProfile['adminState'])){
		$adminState = $adminProfile['adminState'];
		$overwriteAdminProfileInputs['adminState'] = $adminState;
	}
	if(isset($inputs['adminZip'])){
		$adminZip = $inputs['adminZip'];
		$overwriteAdminProfileInputs['adminZip'] = $adminZip;
	}else if(isset($adminProfile['adminZip'])){
		$adminZip = $adminProfile['adminZip'];
		$overwriteAdminProfileInputs['adminZip'] = $adminZip;
	}
	if(isset($inputs['adminFirstName'])){
		$adminFirstName = $inputs['adminFirstName'];
		$overwriteAdminProfileInputs['adminFirstName'] = $adminFirstName;
	}else if(isset($adminProfile['adminFirstName'])){
		$adminFirstName = $adminProfile['adminFirstName'];
		$overwriteAdminProfileInputs['adminFirstName'] = $adminFirstName;
	}
	if(isset($inputs['adminLastName'])){
		$adminLastName = $inputs['adminLastName'];
		$overwriteAdminProfileInputs['adminLastName'] = $adminLastName;
	}else if(isset($adminProfile['adminLastName'])){
		$adminLastName = $adminProfile['adminLastName'];
		$overwriteAdminProfileInputs['adminLastName'] = $adminLastName;
	}
	if(isset($inputs['adminPhone'])){
		$adminPhone = $inputs['adminPhone'];
		$overwriteAdminProfileInputs['adminPhone'] = $adminPhone;
	}else if(isset($adminProfile['adminPhone'])){
		$adminPhone = $adminProfile['adminPhone'];
		$overwriteAdminProfileInputs['adminPhone'] = $adminPhone;
	}
	
	return array("error"=>false,
				"results"=>$overwriteAdminProfileInputs);

}

function encryptAdminPassword($input){
	//$encryptedPassword = password_hash($input, PASSWORD_BCRYPT, array("cost" => 12)); //BCrypy function
	
	$encryptedPassword = md5($input);
	return $encryptedPassword; //Return encrypter password alone
}

function logoutAdmin(){
	session_destroy();

	return array("error"=>false,
				"results"=>"success");
}

function checkAdminSession(){
	$session = getSession();
	if($session['error'] || $session['results']['entity']!="admin"){
		$_SESSION['entity'] = "demo";
		$session['results']['entity'] = "demo";
		$session['results']['id'] = NULL;
	}

	return array("error"=>false,
				"msg"=>"success",
				"results"=>$session['results']);
}


?>