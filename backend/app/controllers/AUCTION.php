<?php 


class AUCTION extends BaseController {

	public function index() //Get all games.
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

		include("auctionFunctions.php");
    	$results = getAllAuctions_Job($entity);

    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No auctions found"), header("HTTP/1.0 404 Not Found"));
    			die; 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die; 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
	}

	
	public function store() //CREATE AUCTIONS
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

		include("auctionFunctions.php");
		$results = createAuctions_Job($entity);	

    	if($results['error']){ //Error within job
    		echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    		die();
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Create auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return; 
	    }	
	}

	

	public function show($id) //Get one auction
	{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","user","demo", "client"); //Access list
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

		try{
		include("auctionFunctions.php");
    	$results = getAuction_Job($id, $entity);

    	if($results['error']){ //Auction not found
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "Invalid auction ID"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Other error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auction",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
	}catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}	
	}


	public function getLiveAuctions(){
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","user","demo","client"); //Access list
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

		try{
		include("auctionFunctions.php");
    	$results = getLiveAuctions_Job($entity);

    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No live auctions found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Other error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Live auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
	}catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function getUpcomingAuctions(){
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","user","demo","client"); //Access list
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

		include("auctionFunctions.php");
    	$results = getUpcomingAuctions_Job($entity);

    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No upcoming auctions found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Other error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Upcoming auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function getPastAuctions(){
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","user","demo","client"); //Access list
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

		include("auctionFunctions.php");
    	$results = getPastAuctions_Job($entity);

    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No past auctions found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Other error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Past auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function refresh(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","demo"); //Access list
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

		include("auctionFunctions.php");
    	$results = refresh_job($entity);

    	if($results['error']){ //Error
			echo json_encode(array('error' => true,
			        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();  			
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Refresh auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function winners(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","demo"); //Access list
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

		include("auctionFunctions.php");
    	$results = winners_Job($entity);

    	if($results['error']){ //Error
			echo json_encode(array('error' => true,
			        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();  			
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Check for auction new winners",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function scheduleAuctions(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = false; //Session not required
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

		include("auctionFunctions.php");
    	$results = scheduleAuctions_Job($entity);

    	if($results['error']){ //Error
			echo json_encode(array('error' => true,
			        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();  			
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Schedule auctions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}

	public function sendWinnerEmail($id){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin", "user"); //Access list
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

		include("auctionFunctions.php");
    	$results = sendWinnerEmail_Job($id, $entity);

    	if($results['error']){ //Error
			echo json_encode(array('error' => true,
			        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();  			
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Send winner email",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}
	}


}