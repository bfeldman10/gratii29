<?php session_start();  ob_start();
	$cookieLifetime = 365 * 24 * 60 * 60; // A year in seconds
	setcookie(session_name(),session_id(),time()+$cookieLifetime);
	
	$GLOBALS['NOW'] = date("Y-m-d H:i:s");
	$GLOBALS['nodeRoot'] = "http://127.0.0.1:8001";

	try {
	    
	    $GLOBALS['db'] = new PDO('mysql:host=localhost;dbname=gratii12_1;charset=utf8', 'root', 'root');
	    $GLOBALS['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	    $GLOBALS['db']->exec('USE gratii12_1;');
	} catch (PDOException $error) {
	   
	    $error = $error->getMessage();
	    echo json_encode(array('error' => true,
					        'msg' => "MySQL Connection Failed: ".$error), header("HTTP/1.0 400 Not Found"));
	    die();
	}

?> 