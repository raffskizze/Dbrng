<?php
namespace dbrng; 
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header("Content-Type: application/json; charset=UTF-8");
 
/* Comprobamos si el usuario esta autentificado para mostrar el sistema DBR //use \younamespace\authmethod() */
if(TRUE)
{ 

//si nos han enviado algo por post
if($arr = json_decode(file_get_contents('php://input')))
{   
 require_once("controlclass.php");

	if(isset($arr->gettables))
	{ 
		echo Control::gettables();
		exit();
	}
	elseif(isset($arr->sqlquery) )
	{ 
		echo Control::query($arr->sqlquery);
		exit();
	}
	elseif(isset($arr->tableinfo) && isset($arr->tablename))
	{ 
		echo Control::getonlytableinfo($arr->tablename);
		exit();
	}
	elseif(isset($arr->datarow) && isset($arr->tablename) && isset($arr->field) && isset($arr->valfield))
	{ 
		echo Control::getdatarow($arr->tablename, $arr->field,$arr->valfield);
		exit();
	}
	else
	{
		header("HTTP/1.0 404 Not Found");
		exit();
	}
}
else //fallo no hemos recibido ningun post
{
	header("HTTP/1.0 404 Not Found");
	echo json_encode(["responseError"=>"Ha ocurrido un fallo muy grave, no has enviado ninguna peticion"]);
	exit();
}
}
else //fallo en la autentificación; mostramos un error 404
{
	header("HTTP/1.0 404 Not Found");
	echo json_encode(["responseError"=>"Ha ocurrido un fallo muy grave, no tienes permisos para usar la app"]);
	exit();
}


?>