<?php 

class BaseController extends Controller {
	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		include(dirname(__FILE__)."/connect.php");	//DB Connect

		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}

		//Universal functions below

		//-----------JOBS-------------
		function checkPermissions_Job($loginRequired, $allowedEntities){

			$session = getSession();
			if($loginRequired){ //Login required
				if($session['error']){
					return array("error"=>true,
								"msg"=>$session['msg']);
					die();
				}
				if($session['results']['entity']=="demo"){ //No session found.
					return array("error"=>true,
								"msg"=>"404");
					die();
				}
			}

			$results = validateEntity($allowedEntities);
			if($results['error']){ //Invalid entity
				return array("error"=>true,
							"msg"=>$results['msg']);
			}else{ //Access granted.
				return array("error"=>false,
							"results"=>$results['results']);
			}
		}

		//-----------TASKS-------------
		function getSession(){

			if(!isset($_SESSION['entity'])){ //If no session, default to "none".
				$_SESSION['entity']="demo";
				$entity = "demo";
				$id = NULL;
			}else{
				if($_SESSION['entity']=="user"){
					$entity = "user";
					$id = $_SESSION['userID'];
				}else if($_SESSION['entity']=="admin"){
					$entity = "admin";
					$id = $_SESSION['adminID'];
				}else if($_SESSION['entity']=="client"){
					$entity = "client";
					$id = $_SESSION['clientID'];
				}else{
					$_SESSION['entity']="demo";
					$entity = "demo";
					$id = NULL;
				}
			}

			return array("error"=>false,
						"results"=>array("entity"=>$entity,
										"id"=>$id));
		}

		function validateEntity($allowedEntities){
			$session = getSession();
			if($session['error']){
				return array("error"=>true,
								"msg"=>$session['msg']);
				die();
			}

			if(in_array($session['results']['entity'], $allowedEntities)){ //Entity is allowed.
				return array("error"=>false,
							"results"=>$session['results']);
			}else{ //Invalid entity
				return array("error"=>true,
								"msg"=>"401");
				die();
			}
		}

	}


}