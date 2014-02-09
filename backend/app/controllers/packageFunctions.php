<?php

function getAllPackages(){

	$getAllPackages = $GLOBALS['db']->prepare('SELECT * FROM packages');
	$getAllPackages -> execute();
	if($results = $getAllPackages -> fetchAll(PDO::FETCH_ASSOC)){ //Success
		return array("error"=>false, 
					"msg"=>"200",
					"results"=>$results);
	}else{ //No packages found
		return array("error"=>true, 
					"msg"=>"404");
	}		

}

function getPackage($packageID){

	if(!isset($packageID) || $packageID==""){
		return array("error"=>true,
					"msg"=>"No package ID provided");	
	}
	
	$getPackage = $GLOBALS['db'] -> prepare('SELECT * FROM packages WHERE id=?');
	$getPackage -> execute(array($packageID));
	if($results = $getPackage -> fetchAll(PDO::FETCH_ASSOC)){
		return array("error"=>false,
					"msg"=>"success",
					"results"=>$results[0]);	
	}else{
		return array("error"=>true,
					"msg"=>"404");	
	}

}

?>


	