<?php 


class CHALLENGE extends BaseController {

	public function store(){
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

		include("challengeFunctions.php");
    	$results = createChallenge_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Challenge created",
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

	public function issue(){
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

		include("challengeFunctions.php");
    	$results = issueChallenge_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Challenge sent",
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

	public function complete(){
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

		include("challengeFunctions.php");
    	$results = completeChallenge_Job($entity);

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Challenge completed",
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

	
	// public function update($id) //UPDATE ONE GAME
	// {
	// 	include("gameFunctions.php");
	// 	updateGame($id);	
	// }


	
	// public function destroy($id) //DELETE ONE GAME
	// {
		
	// 	include("GratiiGameFunctions/deleteGame.php");
	// 	deleteGame($id);	
	// }




}

?>