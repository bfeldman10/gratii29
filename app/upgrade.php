<?php

	$user_id = $_GET['id'];
	include_once('../laravel/app/controllers/connect.php');
	/*

	try{

		$getAllPackages = $GLOBALS['db']->prepare('SELECT * FROM packages');
		$getAllPackages -> execute();
		if($results = $getAllPackages -> fetchAll(PDO::FETCH_ASSOC)){ //Success
			//print_r($results);
		}else{ //No packages found
			die();
	}

	}catch(Exception $error){ //Mysql error
		die();
	}
	*/
?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Gratii - Upgrade to a Pro Account</title>

	<!-- <meta name="viewport" content="width=device-width, initial-scale=0.50"> -->

	<script src="https://sandbox.google.com/checkout/inapp/lib/buy.js"></script>
	<script src="js/vendor/jquery-1.10.1.min.js"></script>

	<link href='http://fonts.googleapis.com/css?family=Ubuntu:400,500,700' rel='stylesheet' type='text/css'>

	<!-- HTML5BP -->
	<link rel="stylesheet" href="css/normalize.min.css">
	<link rel="stylesheet" href="css/main.css?c=3">


	<!-- COMPASS -->
	<!-- <link href="css/screen.css?c=19013a8ddsdd" media="screen, projection" rel="stylesheet" type="text/css" /> -->
	<link rel="stylesheet" href="css/pro.css?c=7">

	<script src="js/vendor/modernizr-2.6.2.min.js"></script>


	<script type="text/javascript">

	<?php
	if ( $user_id != "" && is_numeric($user_id) ) {
		echo "var userID = $user_id;";
	}
	else{
		echo "var userID = null;";
	}
	?>



	function initPurchase (packageID){
		//SEND user ID and ITEM ID to backend and get JWT

		var request = $.ajax({
			type: "POST",
			url: "http://gratii.com/laravel/public/api/v1/" + "user/purchase/start",
			// url: "http://gratii.com/laravel/public/api/v1/" + "user/purchase/start",
			dataType: 'json',
			data: {'userID': userID, 'packageID': packageID}
		});

		request.done(function(response, textStatus, jqXHR){
			console.log( 'Successfully Initiated Purchase' );
			var generatedJwt = response.results;

			google.payments.inapp.buy({
			  'jwt'     : generatedJwt,
			  'success' : purchaseOK,
			  'failure' : purchaseFail
			});


		});
		request.fail(function(response, textStatus, jqXHR){
			console.log( 'Failed to Initiate Purchase' );

		});

	}

	function resetPage(){
		$('section.features').show(0);
		$('section.packagess').show(0);
		$('section.error').hide(0);
		$('section.success').hide(0);
	}

	function purchaseOK(result){
		// alert("Purchase Successfull");
		// console.log( result );
		$('section.features').hide(0);
		$('section.packagess').hide(0);
		$('section.success').show(0);
	}

	function purchaseFail(result){
		//alert("Purchase Failed" + result.response.errorType);
		console.log( result );
		switch(result.response.errorType){
			case "PURCHASE_CANCELED":
				// DO NOTHING - purchase cancelled
			break;

			default:
				// SHOW error page
				$('section.features').hide(0);
				$('section.packagess').hide(0);
				$('section.error').show(0);
			break;
		}

		//SEND fail command in all cases.

		var request = $.ajax({
			type: "POST",
			url: "http://gratii.com/laravel/public/api/v1/" + "user/purchase/fail",
			// url: "http://gratii.com/laravel/public/api/v1/" + "user/purchase/start",
			dataType: 'json',
			data: {'purchaseID': result.request.request.purchaseID, 'errorType': result.response.errorType }
		});

		request.done(function(response, textStatus, jqXHR){
			console.log( 'Successfully Failed the Transaction that ws started.' );
		});
		request.fail(function(response, textStatus, jqXHR){
			console.log( 'Failed to Fail the Transaction' );
		});



	}

	$(document).ready(function(){

		$('.buttons').bind('click',function(e){
			var packageID = $(this).data('id');
			//alert('selected package: ' + packageID);
			initPurchase(packageID);
		});

		$('.reset').bind('click',function(e){
			e.preventDefault();
			resetPage();
		});

		// $('.buttons').bind('click',function(e){
		// 	purchaseOK("okok");
		// });

	});


	</script>

</head>
<body class="pro">

	<section class="header">
		<h1><img id="gratii-splash-logo" src="gfx/pro/logo.png" alt="Gratii Inc."></h1>
	</section>

	<section class="success">
		<h2>High-Five. Your transaction was<br>successfully completed.</h2>
		<p>You've been upgraded to a PRO account. Changes take affect next time you use Gratii.</p>
		<p class="details">
			We've emailed you a receipt <!--and Your order ID is: #5729290173-->
			<br>
			Questions or comments please email us at: <a href="mailto:info@gratii.com">info@gratii.com</a>
			<br>
			Cheers, The Gratii Team.
		</p>
	</section>

	<section class="error">
		<h2>Snap. There was an error processing your transaction.</h2>
		<p class="details">
			Please <a href="#" class="reset">click here to try again.</a>
			<br><br>
			Having trouble? Shoot us an email to: <a href="mailto:info@gratii.com">info@gratii.com</a>
			<br>
			Cheers, The Gratii Team.
		</p>
	</section>


	<section class="features">
		<h2>Go <strong>PRO</strong> and get even more out of your<br>gratii experience.</h2>
		<ol>
			<li><div class="star"></div>Win <strong>2 auctions</strong> per day <small>(instead of 1)</small></li>
			<li><div class="star"></div>Place <strong>multiple bids</strong> at the same time</li>
			<li><div class="star"></div><strong>Send 1000</strong> Gratii in gifts per day <small>(instead of 50)</small></li>
			<li><div class="star"></div><strong>Bet 500</strong> in slots &amp; blackjack <small>(instead of 25)</small></li>
			<li><div class="star"></div>Send <strong>challenges</strong></li>
			<li><div class="star"></div>Unlock all <strong>avatars</strong></li>
			<li><div class="star"></div><strong>Early access</strong> to new games</li>
		</ol>
	</section>


	<section class="packagess">
		<h2>Are you ready to get started?<br>Select your package:</h2>

		<div class="buttons package" data-id="1">
			<div class="icon icon-a"></div>
			<div class="package-type">24 Hours</div>
			<div class="price">$0.99<br><span>USD</span></div>
		</div>
		<div class="buttons package" data-id="2">
			<div class="icon icon-b"></div>
			<div class="package-type">1 Month</div>
			<div class="price">$10.99<br><span>USD</span></div>
		</div>
		<div class="buttons package" data-id="3">
			<div class="icon icon-c"></div>
			<div class="package-type">1 Month <span>recurring monthly</span></div>
			<div class="price">$7.99<br><span>USD</span></div>
		</div>

		<h2 class="lifetime-heading">Wanna impress the babes?</h2>

		<div class="buttons package" data-id="4">
			<div class="icon icon-d"></div>
			<div class="package-type">Lifteime</div>
			<div class="price">$199.99<br><span>USD</span></div>
		</div>


	</section>


	<section class="footer">
		<p>Gratii Inc. &copy; 2013</p>
		<p class="email"><a href="mailto:info@gratii.com">contact us</a></p>
	</section>
	<!-- <div id="overlay"></div> -->





</body>
</html>