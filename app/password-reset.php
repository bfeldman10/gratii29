<?php

	$reset_id = $_GET['id'];
	if ($reset_id == "") {
		// header('LOCATION:http://gratii.com/');
	}

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Gratii - Reset your Password</title>

	<script src="js/jquery.js.min?v=1"></script>

	<link href='http://fonts.googleapis.com/css?family=Ubuntu:400,500,700' rel='stylesheet' type='text/css'>

	<!-- HTML5BP -->
	<link rel="stylesheet" href="css/normalize.min.css">
	<!-- <link rel="stylesheet" href="css/main.css?v=1"> -->


	<link rel="stylesheet" href="css/pro.css?v=1">

	<script src="js/modernizr-2.6.2.min.js"></script>


	<script type="text/javascript">

	<?php
	if ( $reset_id != "") {
		echo "var resetID = '$reset_id';";
	}
	else{
		echo "var resetID = null;";
	}
	?>


	function resetPage(){
		$('section.password-reset').show(0);
		$('section.error').hide(0);
		$('section.success').hide(0);
	}


	$(document).ready(function(){

		$('.password-reset #reset-btn').bind('click',function(e){

			var pw = $('#new-password').val();

			var request = $.ajax({
				type: "PUT",
				url: "../backend/public/api/v1/" + "user/password",
				dataType: 'json',
				data: {'passwordCode': resetID, 'userPassword': pw}
			});

			request.done(function(response, textStatus, jqXHR){
				$('section.password-reset').hide(0);
				$('section.success').show(0);
			});
			request.fail(function(response, textStatus, jqXHR){
				console.log( 'Failed to Reset Password' );
				$('section.password-reset').hide(0);
				$('section.error').show(0);
			});

		});

		$('.reset').bind('click',function(e){
			e.preventDefault();
			resetPage();
		});

	});


	</script>

</head>
<body class="pro">

	<section class="header">
		<h1><img id="gratii-splash-logo" src="images/pro/logo.png" alt="Gratii Inc."></h1>
	</section>

	<section class="success">
		<h2>Nice. We've reset your password<br>successfully.</h2>
		<p>Changes take affect immedietly the next time you use Gratii.</p>
	</section>

	<section class="error">
		<h2>Snap. There was a problem resetting your password.</h2>
		<p class="details">
			Please <a href="#" class="reset">click here to try again.</a>
			<br><br>
			Having trouble? Shoot us an email to: <a href="mailto:info@gratii.com">info@gratii.com</a>
			<br>
			Cheers, The Gratii Team.
		</p>
	</section>


	<section class="password-reset" style="font-size:2.0em;min-height:40%;">
		<p>Enter your new password:</p>
		<form action="#">
			<input type="password" name="newPassword" id="new-password">
			<input id="reset-btn" type="button" value="Reset My Password">
		</form>
	</section>



	<section class="footer">
		<p>Gratii Inc. &copy; 2013</p>
		<p class="email"><a href="mailto:info@gratii.com">contact us</a></p>
	</section>
	<!-- <div id="overlay"></div> -->





</body>
</html>