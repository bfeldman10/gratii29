<?php 
/**
 * @file
 * User has successfully authenticated with Twitter. Access tokens saved to session and DB.
 */
// include_once('../../laravel/app/config/session.php');
// echo "included l session file";
/* Load required lib files. */

// echo $_SESSION['userID'];
// echo "\n---";

session_start();
require_once('twitteroauth/twitteroauth.php');
require_once('config.php');
$gratiiUserID = $_SESSION['userID'];
// $rootURL = "http://graticity.com/gratii29";

/* If access tokens are not available redirect to connect page. */
if (empty($_SESSION['access_token']) || empty($_SESSION['access_token']['oauth_token']) || empty($_SESSION['access_token']['oauth_token_secret'])) {
    header('Location: ./clearsessions.php');
}
/* Get user access tokens out of the session. */
$access_token = $_SESSION['access_token'];

/* Create a TwitterOauth object with consumer/user tokens. */
$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token['oauth_token'], $access_token['oauth_token_secret']);

/* If method is set change API call made. Test is called by default. */
$content = $connection->get('account/verify_credentials');
/* Some example calls */
//$connection->get('users/show', array('screen_name' => 'abraham'));
//$connection->post('statuses/update', array('status' => date(DATE_RFC822)));
//$connection->post('statuses/destroy', array('id' => 5437877770));
//$connection->post('friendships/create', array('id' => 9436992));
//$connection->post('friendships/destroy', array('id' => 9436992));


// print_r($_COOKIE);
//SAVE THIS
// print_r( $access_token );

// $t = file_get_contents("http://gratii.com/laravel/public/api/v1/user/session");
// echo $t;

//$ch = curl_init(); //Init curl

// $curlConfig = array( //Curl config
//     CURLOPT_URL            => $rootURL."/backend/public/api/v1/user/twitterTokens", //API endpoint
//     // CURLOPT_CUSTOMREQUEST  => "PUT",
//     CURLOPT_POST           => true,
//     CURLOPT_RETURNTRANSFER => true, //Return results
//     CURLOPT_POSTFIELDS     => array("twitterOAuthToken"=> $access_token['oauth_token'], //JSON data to put
//     								"twitterOAuthTokenSecret"=> $access_token['oauth_token_secret'],
//     								"twitterUserID"=> $content->id,
//     								"gratiiUserID"=> $_SESSION['userID'])
// );
$userID = $_SESSION['userID'];
$ch = curl_init(); //Init curl
$curlConfig = array( //Curl config
    CURLOPT_URL            => $rootURL."/backend/public/api/v1/user/twitterTokens", //API endpoint
    CURLOPT_POST           => true, //POST
    CURLOPT_RETURNTRANSFER => true, //Return results
    CURLOPT_POSTFIELDS     => array("twitterOAuthToken"=> $access_token['oauth_token'], //JSON data to put
    								"twitterOAuthTokenSecret"=> $access_token['oauth_token_secret'],
    								"twitterUserID"=> $content->id,
    								"gratiiUserID"=> $_SESSION['userID'])
);
curl_setopt_array($ch, $curlConfig); //Finish config
$result = curl_exec($ch); //Results returned from API
// if($result!="success"){ //Not success
// 	curl_close($ch); //Close curl
// 	echo "</br>";
// 	echo "ERROR";
// 	echo $result;
// 	return array("error"=>true, //Return error
// 				"msg"=>"CURL Error: ".$result,
// 				"requested"=>"Twitter login error");
// 	die();
// }
curl_close($ch); //Close curl. Success
// $_SESSION['twitterOAuthToken'] = $access_token['oauth_token']; 
// $_SESSION['twitterOAuthTokenSecret'] = $access_token['oauth_token_secret'];


//echo $connection;
// curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
//curl_setopt($ch, CURLOPT_COOKIE, 'laravel_session='.$_COOKIE['laravel_session'].';');


//curl_setopt_array($ch, $curlConfig); //Finish config
//$result = curl_exec($ch); //Results returned from endpoint

$res = json_decode($result, true);

if($res['error']){ //Error
	curl_close($ch); //Close curl
	$errorMsg = $res['msg']; //Error msg
	//Handle error here...
	echo $errorMsg;

}else{
	curl_close($ch); //Close curl
	// $results = $res['results']; //Success data
	// echo $results;
	Header('Location:'.$rootURL.'/app/twitterComplete.html');
	echo $content->id;
}


//REDIRECT TO APP
//Header('Location:http://gratii.com/app-template/');


/* Include HTML to display on the page */
// include('html.inc');