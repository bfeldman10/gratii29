<?php 


class USER extends BaseController {

	public function index() //Get all users. ADMIN ONLY
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
		
		include("userFunctions.php");
    	$results = getAllUsers($entity);	
    
    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No users found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"users",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
	    }
	}


	public function show($id) //Get one user.
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
		

		include("userFunctions.php");
		$results = getUser($id, $entity);

    	
    	if($results['error']){
    		if($results['msg']=="404"){ //Empty table
    			echo json_encode(array('error' => true,
					        		'msg' => "No user found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die();
    		}	
	    }else{ //Success
	    	
		    	echo json_encode(array('error' => false,
							        	'msg' => "Success",
							        	'requested'=>"user",
							        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    		return;
	    }
	}

	public function getUserNickname() //Get one user.
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
		

		include("userFunctions.php");
		$results = getUser($entity);

    	
    	if($results['error']){
    		if($results['msg']=="404"){ //Empty table
    			echo json_encode(array('error' => true,
					        		'msg' => "No user found"), header("HTTP/1.0 404 Not Found"));
    			die(); 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die();
    		}	
	    }else{ //Success
	    	
		    	echo json_encode(array('error' => false,
							        	'msg' => "Success",
							        	'requested'=>"user",
							        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    		return;
	    }
	}

	
	public function store(){ //Create one user. ALL ACCESS.
	$GLOBALS['db']->beginTransaction();
	try{
		include("userFunctions.php");
		$results = createUser_Job();	

    	if($results['error']){ //Error within job
    		echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    		die();
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Create user",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return; //All users retrieved
	    }
	}catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}	
	}


	
	public function update($id){ //UPDATE ONE USER
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","user"); //Access list
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

		include("userFunctions.php");
		$results = updateUserProfile_Job($id, $entity);

		if($results['error']){
			if($results['msg']=="404"){ //User not found
				echo json_encode(array('error' => true,
						        	'msg' => "User not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error updating
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			$GLOBALS['db']->commit();
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update user",
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



	//DELETE ONE CLIENT
	// public function destroy($id)
	// {
		
	// 	include("deleteUser.php");
	// 	deleteUser($id);	
	// }

	public function login(){ //User login
	$GLOBALS['db']->beginTransaction();
	try{
		
		include("userFunctions.php");
		$results = loginUser_Job();
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
			$GLOBALS['db']->commit();
			echo json_encode(array("error"=>false,
					"msg"=>"Success",
					"requested"=>"User login",
					"results"=>$results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}	
	}

	public function checkSession() //Get entity type from session, or default to demo
	{
		include("userFunctions.php");
		$entity = checkSession();

		echo json_encode(array('error' => false,
								'msg' => "success",
								'requested'=>"Check session",
								'results' => $entity['results']), header("HTTP/1.0 200 OK"));
		return;

	}

	public function activateUserAccount(){
	$GLOBALS['db']->beginTransaction();
	try{
		include("userFunctions.php");
		$results = activateUserAccount();
		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();
		}else{ //Success
			$GLOBALS['db']->commit();
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Activate user account",
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

	public function requestPasswordReset(){
	$GLOBALS['db']->beginTransaction();
	try{
		include("userFunctions.php");
		$results = requestPasswordReset();
		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();
		}else{ //Success
			$GLOBALS['db']->commit();
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Request password reset",
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

	public function updateUserPassword(){
	$GLOBALS['db']->beginTransaction();
	try{
		include("userFunctions.php");
		$results = updateUserPassword();
		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();
		}else{ //Success
			$GLOBALS['db']->commit();
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update user password",
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

	public function logoutUser() //User logout (or destroy any session)
	{	

		include("userFunctions.php");
		$results = logoutUser();
		if(!$results['error']){ //Success. Session destroyed.
			echo json_encode(array('error' => false,
									'msg' => "Success",
									'requested'=>"User logout",
									'results' => null), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function userTransactions(){
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","user"); //Access list
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

		include("userFunctions.php");
		$results = getTransactionsByUserID_Job($entity);

		if($results['error']){
			if($results['msg']=="404"){ //No transactions found
				echo json_encode(array('error' => true,
						        	'msg' => "User not found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"User transactions",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function inbox(){
		$loginRequired = true; //Session required
		$allowedEntities = array("admin","user"); //Access list
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

		include("userFunctions.php");
		$results = getInbox_Job($entity);

		if($results['error']){
			if($results['msg']=="404"){ //No Msgs found
				echo json_encode(array('error' => true,
						        	'msg' => "No msgs found"), header("HTTP/1.0 404 Not Found"));
				die();
			}else{ //Error
				echo json_encode(array('error' => true,
						        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
				die();
			}
		}else{ //Success
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"User msgs",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
			return;
		}
	}

	public function externalGameEvent(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = externalGameEvent_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Earn gratii",
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

	public function openMsg(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("msgFunctions.php");
    	$results = openMsg_Job(NULL, $entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Opened msg",
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

	public function newUserNodeID(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = newUserNodeID($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Store user node ID",
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

	public function removeUserNodeID(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = removeUserNodeID($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Remove user node ID",
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

	public function import(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = false; //Session not required
		$allowedEntities = array("demo"); //Access list
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

		include("userFunctions.php");
    	$results = importUserAccount_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Remove user node ID",
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

	public function startPurchase(){
	$GLOBALS['db']->beginTransaction();
	try{

		include("userFunctions.php");
    	$results = startPurchase_Job();

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Purchase started",
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

	public function completePurchase(){
	$GLOBALS['db']->beginTransaction();
	try{

		include("userFunctions.php");
    	$results = completePurchase_Job();

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	header("HTTP/1.0 200 OK");
	    	echo json_encode(array("orderId"=>$results['results']));
	    	return;
    	}
    }catch(Exception $error){ //Mysql error
	
		$error = $error->getMessage();
		echo json_encode(array('error' => true,
				        		'msg' => "Mysql error: ".$error), header("HTTP/1.0 400 Bad Request"));
		die(); 
	}	
	}

	public function failPurchase(){
	$GLOBALS['db']->beginTransaction();
	try{

		include("userFunctions.php");
    	$results = failPurchase_Job();

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Purchase failed",
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

	public function bids(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = getBidsInPlay_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Bids in play",
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

	public function winsToday(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = getAuctionsWonIn24Hours_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Auctions won in 24 hours",
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

	public function gratiiGiftedToday(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = getGratiiGiftedIn24Hours_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Gratii gifted today",
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

	public function updateFacebookTokens(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = updateFacebookTokens_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update FB Token Short",
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

	public function updateTwitterTokens(){

	$GLOBALS['db']->beginTransaction();
	try{
		// $loginRequired = true; //Session not required
		// $allowedEntities = array("user"); //Access list
		// $checkPermissions = checkPermissions_Job($loginRequired, $allowedEntities);
		// if($checkPermissions['error']){
		// 	if($checkPermissions['msg']=="404"){ //No session found
		// 		echo json_encode(array("error"=>true,
		// 								"msg"=>"Please log in"), header("HTTP/1.0 401 Unathorized"));
		// 		die();
		// 	}else if($checkPermissions['msg']=="401"){ //Not granted access
		// 		echo json_encode(array("error"=>true,
		// 								"msg"=>"Permission denied"), header("HTTP/1.0 401 Unathorized"));
		// 		die();
		// 	}else{ //Other error
		// 		echo json_encode(array("error"=>true,
		// 								"msg"=>$checkPermissions['msg']), header("HTTP/1.0 401 Unathorized"));
		// 		die();
		// 	}
		// }else{ //Access granted
		// 	$entity = $checkPermissions['results']['entity'];
		// }

		include("userFunctions.php");
    	$results = updateTwitterTokens("user");

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Update Twitter Token",
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

	public function getFacebookLikes($id){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user", "admin"); //Access list
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

		include("userFunctions.php");
    	$results = getFacebookLikes_Job($id, $entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get Facebook Likes",
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

	public function getTwitterFollows($id){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user", "admin"); //Access list
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

		include("userFunctions.php");
    	$results = getTwitterFollows_Job($id, $entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get Twitter Follows",
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

	public function getCurrentNodeConnections(){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user", "admin"); //Access list
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

		include("userFunctions.php");
    	$results = getCurrentNodeConnections_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Get current node connections",
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

	public function setGoogleLocation($id){
	$GLOBALS['db']->beginTransaction();
	try{
		$loginRequired = true; //Session not required
		$allowedEntities = array("user"); //Access list
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

		include("userFunctions.php");
    	$results = updateUserLocationByGoogle($id, $entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Set user google location",
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