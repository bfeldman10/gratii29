<?php

function createReport($inputs){ //Insert the new user
		$inputs = Input::all();
		if(!isset($inputs) || $inputs==""){
			return array("error"=>true,
						"msg"=>"No inputs provided");
		}
		if(!isset($inputs['reportedUserID']) || $inputs['reportedUserID']==""){
			return array("error"=>true,
						"msg"=>"No reported user ID provided");
		}
		if(!isset($inputs['msgID']) || $inputs['msgID']==""){
			return array("error"=>true,
						"msg"=>"No msg ID provided");
		}
		if(!isset($_SESSION['userID']) || $_SESSION['userID']==""){
			return array("error"=>true,
						"msg"=>"No session found");
		}
		
		$createReport = $GLOBALS['db'] -> prepare('INSERT INTO reports (reportedUserID, reporterUserID, 
									msgID, createdAt)
									VALUES (?, ?, ?, ?)');
		$createReport -> execute(array($inputs['reportedUserID'], $_SESSION['userID'], 
									$inputs['msgID'], $GLOBALS['NOW']));
		
		if($id = $GLOBALS['db']->lastInsertId()){ // User reported successfully. Returning the new report id.
			return array('error'=>false,
					    'results'=>$id);
		}else{
			return array("error"=>true,
						"msg"=>"No purchase created");
		}

	
}

?>