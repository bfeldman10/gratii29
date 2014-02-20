<?php

include_once("connect.php");

claimDownload_Job();

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
		
		if($numRows=="0"){
		
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

function claimDownload_Job($inputs){

	$claimCode = $_POST['claimCode'];
	if(!isset($claimCode) || $claimCode==""){ //Missing auction ID
		return array("error"=>true,
					"msg"=>"No claim code provided");
		die();
	}

	$downloadData = getDownloadByClaimCode($claimCode);
	if($downloadData['error']){

		// echo "This code does not exist.<br><a href='http://localhost:8888/gratii29/app/claim.html'>Try Again </a>";
		echo json_encode(array('error' => true,
					'msg' => $downloadData['msg'],
					'requested'=>"Get download by claim code"));	
		die();
	}else if($downloadData['results']['claimedAt']!="0000-00-00 00:00:00"){
		echo json_encode(array('error' => true,
						'msg' => "used"));	
		die();
	}

	$fileData = getFileByID($downloadData['results']['downloadFileID']);
	if($fileData['error']){
		
		return array('error' => true,
					'msg' => $fileData['msg'],
					'requested'=>"Get download sby claim code");	
		die();
	
	}


	// header("Content-disposition: attachment; filename=".$fileData['results']['fileName']);
	// header("Content-type:".$fileData['results']['fileType']);
	// readfile("../../app/downloads/".$fileData['results']['path']."/".$fileData['results']['fileName']);


	// return array('error' => false,
	// 				'results' => $fileData['results']);	
	//exit;
	
	// echo $_SERVER['DOCUMENT_ROOT'].'/gratii29/app/downloads/music/text.txt';

	// $file_url = $_SERVER['DOCUMENT_ROOT'].'/gratii29/app/downloads/music/text.txt';
	// header('Content-Type: text/plain');
	// header("Content-Transfer-Encoding: Binary"); 
	// header("Content-disposition: attachment; filename=\"" . basename($file_url) . "\""); 
	// readfile($file_url); // do the double-download-dance (dirty but worky)

	$path = $fileData['results']['path'];
	$fileName = $fileData['results']['fileName'];

	$file = $_SERVER['DOCUMENT_ROOT'].'/gratii29/app/downloads/'.$path.'/'.$fileName;

    if(!file_exists($file)){
    	echo json_encode(array('error' => true,
								'msg' => "!exist"));	
		die();
    }else{
    	$downloadRequest = $_POST['downloadRequest'];
    	if(!isset($downloadRequest) || $downloadRequest==""){ //Missing auction ID
    		
    		$updateDownloadedAtTimestamp = updateDownloadedAtTimestamp($claimCode);
			if($updateDownloadedAtTimestamp['error']){
				
				echo json_encode(array('error' => true,
							'msg' => $updateDownloadedAtTimestamp['msg'],
							'requested'=>"Updating timestamp for download"));	
				die();
			
			}

    		$type = filetype($file);

			header('Content-Description: File Transfer');
		    header("Content-type: $type");
		    header('Content-Disposition: attachment; filename='.basename($file));
		    header("Content-Length: ". filesize($file));
		    header("Content-Transfer-Encoding: binary"); 
		    header('Pragma: no-cache'); 
		    header('Cache-Control: must-revalidate');
		    header('Expires: 0');
		    // Send the file contents.
		    ob_clean();
		    flush();
		    readfile($file);
		    exit;

		}else{
			echo json_encode(array("error"=>false,
						"msg"=>"success"));
			die();
		}


    	
    }

    

	// echo json_encode(array('error' => false,
	// 					'msg' => "success",
	// 					'results' => $fileData['results']));
}

?>