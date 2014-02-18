<?php

function getDownloadByClaimCode($claimCode){

	try{
		$getDownloadByClaimCode = $GLOBALS['db'] -> prepare('SELECT * FROM downloads WHERE claimCode = ?');
		$getDownloadByClaimCode -> execute(array($claimCode));
		if($results = $getDownloadByClaimCode -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{
			return array("error"=>true,
						"msg"=>"404");	
		}

	}catch(Exception $error){
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}

}

function getFileByID($fileID){

	try{
		$getFileByID = $GLOBALS['db'] -> prepare('SELECT * FROM downloadFiles WHERE id = ?');
		$getFileByID -> execute(array($fileID));
		if($results = $getFileByID -> fetchAll(PDO::FETCH_ASSOC)){
			return array("error"=>false,
						"msg"=>"200",
						"results"=>$results[0]);
		}else{
			return array("error"=>true,
						"msg"=>"404");	
		}

	}catch(Exception $error){
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql error: ".$error);
	}

}

function updateDownloadedAtTimestamp($claimCode){

	try{
		$updateDownloadedAtTimestamp = $GLOBALS['db'] -> prepare('UPDATE downloads SET claimedAt = ?, updatedAt = ? WHERE claimCode = ?');
		$updateDownloadedAtTimestamp -> execute(array($GLOBALS['NOW'], $GLOBALS['NOW'], $claimCode));
		$numRows = $updateDownloadedAtTimestamp -> rowCount();							

		if($numRows==0){
		
			return array('error' => true,
						'msg' => "No updates made.");	
			die();
		}else{
			
			return array('error' => false,
						'results' => $claimCode);
		}

	}catch(Exception $error){
		
		$error = $error->getMessage();
		return array("error"=>true, 
					"msg"=>"Mysql errors: ".$error);
	}

}

function claimDownload_Job(){
	$inputs = Input::all();

	if(!isset($inputs['claimCode']) || $inputs['claimCode']==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No claim code provided");
		die();
	}

	$downloadData = getDownloadByClaimCode($inputs['claimCode']);
	if($downloadData['error']){
		
		return array('error' => true,
					'msg' => $downloadData['msg'],
					'requested'=>"Get download by claim code");	
		die();
	}else if($downloadData['results']['claimedAt']!="0000-00-00 00:00:00"){
		// return array('error' => true,
		// 				'msg' => "used");	
		// die();
	}

	$fileData = getFileByID($downloadData['results']['downloadFileID']);
	if($fileData['error']){
		
		return array('error' => true,
					'msg' => $fileData['msg'],
					'requested'=>"Get download by claim code");	
		die();
	
	}

	$updateDownloadedAtTimestamp = updateDownloadedAtTimestamp($inputs['claimCode']);
	if($updateDownloadedAtTimestamp['error']){
		
		return array('error' => true,
					'msg' => $updateDownloadedAtTimestamp['msg'],
					'requested'=>"Updating timestamp for download");	
		die();
	
	}

	// header("Content-disposition: attachment; filename=".$fileData['results']['fileName']);
	// header("Content-type:".$fileData['results']['fileType']);
	// readfile("../../app/downloads/".$fileData['results']['path']."/".$fileData['results']['fileName']);

	$file_url = '../../app/downloads/music/Cycle.mp3';
	header('Content-Type: audio/mp3');
	header("Content-Transfer-Encoding: Binary"); 
	header("Content-disposition: attachment; filename=\"" . basename($file_url) . "\""); 
	readfile($file_url); // do the double-download-dance (dirty but worky)
	
	// return array('error' => false,
	// 				'results' => $fileData['results']);	

}

?>