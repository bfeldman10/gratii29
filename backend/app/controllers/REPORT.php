<?php 


class REPORT extends BaseController {

	public function store() //Get all games.
	{
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

		include("reportFunctions.php");
    	$results = createReport($entity);

    	if($results['error']){ //Empty table
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die; 
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Report user",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
	}


}