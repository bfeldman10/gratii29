<?php

class CRON extends BaseController {

	public function createEconomyStatsSnapshot(){ //Runs hourly
	$GLOBALS['db']->beginTransaction();
	try{

		include("adminFunctions.php");
		$results = createEconomyBoxAndWhiskers_Job("admin");

		if($results['error']){
			echo json_encode(array('error' => true,
					        	'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die();		
		}else{ //Success
			$GLOBALS['db']->commit();
			echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Save economy stats snapshot",
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

	public function takeTaxes(){ //Runs nightly @ 4:00am
	$GLOBALS['db']->beginTransaction();
	try{

		include("userFunctions.php");
    	$results = takeTaxes_Job();

    	if($results['error']){ //Some error
			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Take taxes",
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

	public function payoutLikeBuckets(){ //Runs nightly @ 4:15am
	$GLOBALS['db']->beginTransaction();
	try{
		include("likeFunctions.php");
    	$results = payoutLikeBuckets_Job();

    	if($results['error']){ //Error
    			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Payout like buckets",
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

	public function payoutFollowBuckets(){ //Runs nightly @ 4:30am
	$GLOBALS['db']->beginTransaction();
	try{
		include("followFunctions.php");
    	$results = payoutFollowBuckets_Job();

    	if($results['error']){ //Error
  
    			echo json_encode(array('error' => true,
				        		'msg' => $results['msg']), header("HTTP/1.0 400 Bad Request"));
    			die(); 
	    }else{ //Success
	    	$GLOBALS['db']->commit();
	    	echo json_encode(array('error' => false,
						        	'msg' => "Success",
						        	'requested'=>"Payout follow buckets",
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

?>