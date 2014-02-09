<?php
/**
*  This code is generating JWT of a product.
*
* @copyright 2013  Google Inc. All rights reserved.
* @author Rohit Panwar <panwar@google.com>
*/

function createJWT($inputs){


	if(count($inputs) == 0){ //No json data found
		return array("error"=>true,
					"msg"=>"No inputs provided");
		die();
	}
	if(!isset($inputs['userID']) || $inputs['userID']==""){
		return array("error"=>true,
					"msg"=>"No user id provided");
		die();
	}
	if(!isset($inputs['packageID']) || $inputs['packageID']==""){
		return array("error"=>true,
					"msg"=>"No package ID provided");
		die();
	}
	if(!isset($inputs['packageName']) || $inputs['packageName']==""){
		return array("error"=>true,
					"msg"=>"No package name provided");
		die();
	}
	if(!isset($inputs['packageDescription']) || $inputs['packageDescription']==""){
		return array("error"=>true,
					"msg"=>"No package description provided");
		die();
	}
	if(!isset($inputs['packageCost']) || $inputs['packageCost']==""){
		return array("error"=>true,
					"msg"=>"No package cost provided");
		die();
	}
	if(!isset($inputs['secondsAddedToPRO']) || $inputs['secondsAddedToPRO']==""){
		return array("error"=>true,
					"msg"=>"No seconds added to PRO provided");
		die();
	}
	if(!isset($inputs['paymentModel']) || $inputs['paymentModel']==""){
		return array("error"=>true,
					"msg"=>"No payment model provided");
		die();
	}

	/**
	 * JWT class to encode/decode payload into JWT format.
	 */
	include_once "JWT.php";

	/**
	 * Get merchant account information.
	 */
	include_once "seller_info.php";

	$sellerIdentifier = SellerInfo::$issuerId;
	$sellerSecretKey = SellerInfo::$secretKey;

	if($inputs['paymentModel']=="subscription"){
		/**
		* Get payload of the product.
		*/
		include_once "subscriptionPayload.php";

		$payload = new Payload();
		$payload->SetIssuedAt(time());
		$payload->SetExpiration(time()+3600);
		$payload->AddProperty("name", $inputs['packageName']);
		$payload->AddProperty("description", $inputs['packageDescription']);
		$payload->AddProperty("initialPayment", array("price"=>$inputs['packageCost'],
																"currencyCode"=>"USD",
																"paymentType"=>"prorated"));
	
	
		$payload->AddProperty("recurrence", array("price"=>$inputs['packageCost'],
												"currencyCode"=>"USD",
												"startTime"=>time(),
												"frequency"=>"monthly",
												"numRecurrences"=>"12"));
		$payload->AddProperty("userID", $inputs['userID']);
		$payload->AddProperty("packageID", $inputs['packageID']);
		$payload->AddProperty("purchaseID", $inputs['purchaseID']);
		$payload->AddProperty("secondsAddedToPRO", $inputs['secondsAddedToPRO']);

	}else{
		/**
		* Get payload of the product.
		*/
		include_once "itemPayload.php";
		$payload = new Payload();
		$payload->SetIssuedAt(time());
		$payload->SetExpiration(time()+3600);
		$payload->AddProperty("name", $inputs['packageName']);
		$payload->AddProperty("description", $inputs['packageDescription']);
		$payload->AddProperty("price", $inputs['packageCost']);
		$payload->AddProperty("currencyCode", "USD");
		$payload->AddProperty("userID", $inputs['userID']);
		$payload->AddProperty("packageID", $inputs['packageID']);
		$payload->AddProperty("purchaseID", $inputs['purchaseID']);
		$payload->AddProperty("secondsAddedToPRO", $inputs['secondsAddedToPRO']);
	}

	// Creating payload of the product.
	$Token = $payload->CreatePayload($sellerIdentifier);

	// Encoding payload into JWT format.
	$jwtToken = JWT::encode($Token, $sellerSecretKey);
		
	return array("error"=>false,
				"results"=>$jwtToken);
}

?>
