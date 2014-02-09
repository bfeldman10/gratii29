<?php 


class ARCADE extends BaseController {


	
	public function index() //Get all games.
	{
		$loginRequired = false; //Session not required
		$allowedEntities = array("admin","user","demo"); //Access list
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

		include("arcadeFunctions.php");
    	$results = getArcade_Job($entity);

    	if($results['error']){ //Empty table
    		if($results['msg']=="404"){
    			echo json_encode(array('error' => true,
					        		'msg' => "No arcade games found"), header("HTTP/1.0 404 Not Found"));
    			die; 
    		}else{ //Mysql error
    			echo json_encode(array('error' => true,
					        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die; 
    		}	
	    }else{ //Success
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Arcade",
						        	'results' => $results['results']), header("HTTP/1.0 200 OK"));
	    	return;
    	}
	}

	
	// public function store() //CREATE ONE GAME
	// {
	// 	include("gameFunctions.php");
	// 	createGame();		
	// }

	

	// public function show($id) //GET ONE GAME
	// {
		
	// 	include("gameFunctions.php");
	// 	getGame($id);	
	// }



	
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