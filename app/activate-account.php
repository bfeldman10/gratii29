<?php

	$activate_id = $_GET['id'];
	if ($activate_id == "") {
		header('LOCATION:http://gratii.com/');
	}

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Gratii - Activate Your Account</title>

	<script src="js/jquery.js.min?v=1"></script>

	<link href='http://fonts.googleapis.com/css?family=Ubuntu:400,500,700' rel='stylesheet' type='text/css'>

	<!-- HTML5BP -->
	<link rel="stylesheet" href="css/normalize.min.css">
	<link rel="stylesheet" href="css/main.css?c=3">


	<link rel="stylesheet" href="css/pro.css?c=7">

	<script src="js/vendor/modernizr-2.6.2.min.js"></script>


	<script type="text/javascript">

	<?php
	if ( $activate_id != "") {
		echo "var activateID = '$activate_id';";
	}
	else{
		echo "var activateID = null;";
	}
	?>

	function activate(code){

		console.log( 'trying to activate code' );

		var request = $.ajax({
			type: "PUT",
			url: "../backend/public/api/v1/" + "user/activate",
			// url: "http://10.1.1.106/gratii-app/laravel/public/api/v1/" + "user/activate",
			dataType: 'json',
			data: { activationCode: code }
		});

		request.done(function(response, textStatus, jqXHR) {
			$('section.password-reset').hide(0);
			$('section.success').show(0);
		});

		request.fail(function(resp, textStatus, jqXHR) {
			$('section.password-reset').hide(0);
			$('section.error').show(0);
		});

	};


	function resetPage(){
		$('section.password-reset').show(0);
		$('section.error').hide(0);
		$('section.success').hide(0);
	}


	$(document).ready(function(){

		window.setTimeout(function(){
			activate(activateID);
		},1000);

		$('.reset').bind('click',function(e){
			e.preventDefault();
			resetPage();

			window.setTimeout(function(){
				activate(activateID);
			},3000);

		});

	});


	</script>

</head>
<body class="pro">

	<section class="header">
		<h1><img id="gratii-splash-logo" src="images/pro/logo.png" alt="Gratii Inc."></h1>
	</section>

	<section class="success">
		<h2>Nice. We've activated your<br>account successfully.</h2>
		<p>Now head over to Gratii App to earn some Gratii!</p>
	</section>

	<section class="error">
		<h2>Snap. There was a problem activating your account.</h2>
		<p class="details">
			Please <a href="#" class="reset">click here to try again.</a>
			<br><br>
			Having trouble? Shoot us an email to: <a href="mailto:info@gratii.com">info@gratii.com</a>
			<br>
			The Gratii Team.
		</p>
	</section>


	<section class="password-reset" style="font-size:3.0em;font-weight:700;min-height:40%;text-align:center;padding-top:100px;">
		<p>We're activating your account</p>
	</section>



	<section class="footer">
		<p>Gratii Inc. &copy; 2013</p>
		<p class="email"><a href="mailto:info@gratii.com">contact us</a></p>
	</section>
	<!-- <div id="overlay"></div> -->





</body>
</html>