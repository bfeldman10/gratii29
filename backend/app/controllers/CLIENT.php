<?php 


class CLIENT extends BaseController {

	public function index() //Get all clients. ADMIN ONLY
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities);
		if($checkPermissions['error']){
			if($checkPermissions['msg']=="404"){ //No session found
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}
		
		include("clientFunctions.php");
    	$results = getAllClients($entity);	
    
    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No clients found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"clients",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
	    }
	}


	public function show($id) //Get one client.
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","user","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}
		

		include("clientFunctions.php");
		$results = getClient($id, $entity);

    	
    	if($results['error']){
    		if($results['msg']=="404"){ //Empty table
    			echo json_encode(array('error' => true,
					        		'msg' => "No client found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die();
    		}	
	    }else{ //Success
	    	
		    	echo json_encode(array('error' => false,
							        	'msg' => "Success",
							        	'requested'=>"client",
							        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    		return;
	    }
	}

	

	
	public function store() //Create one client. ALL ACCESS.
	{
		include("clientFunctions.php");
		$results = createClient_Job();	

    	if($results['error']){ //Error within job
    		echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    		die();
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Create client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return; //All clients retrieved
	    }
	}

	
	public function update($id) //UPDATE ONE CLIENT
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = updateClientProfile_Job($id, $entity);

		if($results['error']){
			if($results['msg']=="404"){ //Client not found
				echo json_encode(array('error' => true,
						        	'msg' => "Client not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error updating
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}



	public function login() //Client login
	{
		
		include("clientFunctions.php");
		$results = loginClient_Job();	
		if($results['error']){ //Wrong password
			if($results['msg']=="401"){
				echo json_encode(array("error"=>true,
					"msg"=>"Invalid credentials"), header("HTTP/1.0 401 Unauthorized"));
				die();
			}else if($results['msg']=="404"){ //Email not found
				echo json_encode(array("error"=>true,
					"msg"=>"Email not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
					"msg"=>$results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}		
		}else{ //Success
			
			echo json_encode(array("error"=>false,
					"msg"=>"Success",
					"requested"=>"Client login",
					"results"=>$results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function checkSession() //Get entity type from session, or default to demo
	{
		include("clientFunctions.php");
		$entity = checkClientSession();

		echo json_encode(array('error' => false,
								'msg' => "success",
								'requested'=>"Check session",
								'results' => $entity['results']), header("HTTP/1.0 200 OK"));
		return;
	
		
	}


	public function logoutClient() //Client logout (or destroy any session)
	{	

		include("clientFunctions.php");
		$results = logoutClient();
		if(!$results['error']){ //Success. Session destroyed.
			echo json_encode(array('error' => false,
									'msg' => "Success",
									'requested'=>"Client logout",
									'results' => null), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function promosForClient($id) //UPDATE ONE CLIENT
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getPromosForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Promos for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function auctionsBasicForClient($id) //UPDATE ONE CLIENT
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAuctionsBasicForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auctions basic for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function auctionsComplexForClient($id) //UPDATE ONE CLIENT
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAuctionsComplexForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auctions complex for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllBidders($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllBiddersForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get bidders for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllLikers($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllLikersForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get likers for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllFollowers($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllFollowersForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get followers for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllClickers($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllClickersForClient_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get clickers for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getFacebooks($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllFacebooksForClientID($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get facebooks for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getTwitters($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllTwittersForClientID($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get twitters for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getWebsites($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getAllWebsitesForClientID($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get websites for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getInventory($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getInventoryForClientID_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get inventory for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getSurveys($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getSurveysForClientID($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get surveys for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getSurveyResponses($id) 
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getSurveyResponsesForClientID_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get survey responses for client",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getBidsDaily($id) 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getBidsDailyForClient_Job($id, $entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get bids daily",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getLikesDaily($id) 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getLikesDailyForClient_Job($id, $entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get likes daily",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getFollowsDaily($id) 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getFollowsDailyForClient_Job($id, $entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get follows daily",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getClickthrusDaily($id) 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","client"); //Access list
		$checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities); 
		if($checkPermissions['error']){ //No session found
			if($checkPermissions['msg']=="404"){
				echo json_encode(array("error"=>true,
										"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else if($checkPermissions['msg']=="401"){ //Not granted access
				echo json_encode(array("error"=>true,
										"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
				die();
			}else{ //Other error
				echo json_encode(array("error"=>true,
										"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
				die();
			}
		}else{ //Access granted
			$entity = $checkPermissions['results']['entity'];
		}

		include("clientFunctions.php");
		$results = getClickthrusDailyForClient_Job($id, $entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get clickthrus daily",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}


}