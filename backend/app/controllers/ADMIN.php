<?php 


class ADMIN extends BaseController {

	public function index() //Get all admin. ADMIN ONLY
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
		
		include("adminFunctions.php");
    	$results = getAllAdmin($entity);	
    
    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No admin found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"admin",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
	    }
	}


	public function show($id) //Get one admin.
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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
		

		include("adminFunctions.php");
		$results = getAdmin($id, $entity);

    	
    	if($results['error']){
    		if($results['msg']=="404"){ //Empty table
    			echo json_encode(array('error' => true,
					        		'msg' => "No admin found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die();
    		}	
	    }else{ //Success
	    	
		    	echo json_encode(array('error' => false,
							        	'msg' => "Success",
							        	'requested'=>"admin",
							        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    		return;
	    }
	}

	

	
	public function store() //Create one admin. ALL ACCESS.
	{
		include("adminFunctions.php");
		$results = createAdmin_Job();	

    	if($results['error']){ //Error within job
    		echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    		die();
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Create admin",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
	    }
	}

	
	public function update($id) //UPDATE ONE ADMIN
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = updateAdminProfile_Job($id, $entity);

		if($results['error']){
			if($results['msg']=="404"){ //Admin not found
				echo json_encode(array('error' => true,
						        	'msg' => "Admin not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error updating
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update admin",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function updateAuctionSettings() //UPDATE ONE ADMIN
	{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = updateAuctionSettings($entity);

		if($results['error']){
			if($results['msg']=="404"){ //Admin not found
				echo json_encode(array('error' => true,
						        	'msg' => "Admin not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error updating
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update admin",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}



	public function login() //Admin login
	{
		
		include("adminFunctions.php");
		$results = loginAdmin_Job();	
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
					"requested"=>"Admin login",
					"results"=>$results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function checkSession() //Get entity type from session, or default to demo
	{
		include("adminFunctions.php");
		$entity = checkAdminSession();

		echo json_encode(array('error' => false,
								'msg' => "success",
								'requested'=>"Check session",
								'results' => $entity['results']), header("HTTP/1.0 200 OK"));
		return;
	
		
	}


	public function logoutAdmin() //Admin logout (or destroy any session)
	{	

		include("adminFunctions.php");
		$results = logoutAdmin();
		if(!$results['error']){ //Success. Session destroyed.
			echo json_encode(array('error' => false,
									'msg' => "Success",
									'requested'=>"Admin logout",
									'results' => null), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllBidders() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getAllBidders_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get all bidders",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllLikers() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getAllLikers_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get all likers",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllFollowers() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getAllFollowers_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get all followers",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllClickers() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getAllClickers_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get all clickers",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getBidsDaily() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getBidsDaily_Job($entity);

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

	public function getLikesDaily() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getLikesDaily_Job($entity);

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

	public function getFollowsDaily() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getFollowsDaily_Job($entity);

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

	public function getClickthrusDaily() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getClickthrusDaily_Job($entity);

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

	public function getEconomyStatsSnapshot() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getEconomyBoxAndWhiskers_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get economy stats snapshot",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function createEconomyStatsSnapshot() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = createEconomyBoxAndWhiskers_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Save economy stats snapshot",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllEconomyStats() 
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin"); //Access list
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

		include("adminFunctions.php");
		$results = getAllEconomyStats_Job($entity);

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get economy stats",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

}