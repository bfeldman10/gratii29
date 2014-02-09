<?php 


class PROMO extends BaseController {

	public function index() //Get all promos. ADMIN ONLY
	{	
		$loginRequired = true; //Session required
		$allowedEntities = array("admin", "client"); //Access list
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
		
		include("promoFunctions.php");
    	$results = getAllPromos($entity);	
    
    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No promos found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"promos",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
	    }
	}


	public function show($id) //Get one promo.
	{	
		$loginRequired = false; //Session required
		$allowedEntities = array("admin","user","client", "demo"); //Access list
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
		

		include("promoFunctions.php");
		$results = getPromo($id, $entity);

    	
    	if($results['error']){
    		if($results['msg']=="404"){ //Empty table
    			echo json_encode(array('error' => true,
					        		'msg' => "No promo found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die();
    		}	
	    }else{ //Success
	    	
		    	echo json_encode(array('error' => false,
							        	'msg' => "Success",
							        	'requested'=>"promo",
							        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    		return;
	    }
	}

	

	
	public function store() //Create one promo. Admin or Client.
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

		include("promoFunctions.php");
		$results = createPromo_Job($entity);	

    	if($results['error']){ //Error within job
    		echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    		die();
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Create promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return; //All promos retrieved
	    }
	}

	
	public function update($id) //UPDATE ONE PROMO
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

		include("promoFunctions.php");
		$results = updatePromoProfile_Job($id, $entity);

		if($results['error']){
			if($results['msg']=="404"){ //Promo not found
				echo json_encode(array('error' => true,
						        	'msg' => "Promo not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error updating
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function auctionsBasicForPromo($id) 
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

		include("promoFunctions.php");
		$results = getAuctionsBasicForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auctions basic for promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function auctionsComplexForPromo($id) 
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

		include("promoFunctions.php");
		$results = getAuctionsComplexForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auctions complex for promo",
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

		include("promoFunctions.php");
		$results = getAllBiddersForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get bidders for promo",
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

		include("promoFunctions.php");
		$results = getAllLikersForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get likers for promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllBids($promoID) 
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

		include("promoFunctions.php");
		$results = getAllBidsForPromoID_Job($promoID, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get bids for promo ID",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllLikersForFacebookID($promoFacebookID) 
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

		include("promoFunctions.php");
		$results = getAllLikersForPromoFacebookID_Job($promoFacebookID, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get likers for promo facebook ID",
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

		include("promoFunctions.php");
		$results = getAllFollowersForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get followers for promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllFollowersForTwitterID($promoTwitterID) 
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

		include("promoFunctions.php");
		$results = getAllFollowersForPromoTwitterID_Job($promoTwitterID, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get followers for promo twitter ID",
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

		include("promoFunctions.php");
		$results = getAllClickersForPromo_Job($id, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get clickers for promo",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllClickersForWebsiteID($promoWebsiteID) 
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

		include("promoFunctions.php");
		$results = getAllClickersForPromoWebsiteID_Job($promoWebsiteID, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get clickers for promo website ID",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function getAllClickthrusForWebsiteID($promoWebsiteID) 
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

		include("promoFunctions.php");
		$results = getAllClickthrusForPromoWebsiteID_Job($promoWebsiteID, $entity);

		if($results['error']){
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get clickthrus for promo website ID",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}


}