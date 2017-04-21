<?php 
namespace dbrng; 

/* Globales */
require_once("confdbr.php");

/* Clase dbr mysqli */
class Dbrclass 
{ 
			/* identificador de conexión y consulta */
			public $IDcon = 0;
			
			public $IDquery = 0;
			
			public $Querytime = 0;
			
			public $Querytimemysql = 0;
			
			public $Treg = 0;
			
			/* número de error - texto error - consulta SQL */
			
			public $Errnum = 0;
			
			public $Error = "";
			
			public $SQL = ""; 
			
	/* Método Constructor: Cada vez que creemos una variable			
	de esta clase, se ejecutará esta función */			
	function __construct()
	{			 
				$this->BaseDatos = NOMBREBD;
				
				$this->Servidor = HOST;
				
				$this->Usuario = USERBD;
				
				$this->Clave = USERPWD; 
			
			$this->con();
	}
	
	/* Método destructor: */
	function __destruct()
	{
			$this->Con->close();
	}
	/*Conexión a la base de datos*/			
	function con()
	{			 
			/* conexion objeto de mysqli */
			$this->Con = new \mysqli($this->Servidor, $this->Usuario, $this->Clave, $this->BaseDatos); 
			$this->Con->set_charset("utf8");
			
			if (mysqli_connect_error()) {
			
				$this->Error = mysqli_connect_error();	
				$this->Errnum = mysqli_connect_errno();			
				return 0; 
			}
			  
			/* Si hemos tenido éxito conectando devuelve 
			el identificador de la conexión, sino devuelve 0 */
			return $this->IDcon = $this->Con->thread_id;
	}
	
	/* Ejecuta un consulta y devuelve TRUE si ha tenido exito o el numero de files devueltas y 0 FALSE si ocurrio un error */			
	function sqlquery($sql)
	{
		$time_start = microtime(true);
		 
		$this->initprofiles();
		
		if ($sql == "") 
			{			
				$this->Error = "No ha especificado una consulta SQL";
			
				return 0;
			}
			else
			$this->SQL = $sql;
			
			//ejecutamos la consulta
			if (!$this->Result = $this->Con->query($this->SQL)) { 
				$this->Error = $this->Con->error;	
				$this->Errnum = $this->Con->errno;
				return FALSE;
			}
		 
		$this->getprofiles(); 
		
			$time_end = microtime(true);
			$this->Querytime = $time_end - $time_start; 
			
			$this->IDquery = $this->Con->insert_id;
			
			if(  isset($this->Result->num_rows) && $this->Result->num_rows > 0) 
			{
				$this->Treg = $this->Result->num_rows;
				return  $this->Result->num_rows;
			}
			else
			{
				$this->Treg = 0; //la consulta se ejecuto pero no tiene registros
				return TRUE;
			}
	}
	
	/* Devuelve el número de campos de una consulta */
	function numcamp() 
	{
			return $this->Result->field_count;
	} 
	
	/* Devuelve la info de un campo */
	function infofield($num) 
	{
			return $this->Result->fetch_field_direct($num);
	}
	
	/* Devuelve la info de los campos */
	function infofields() 
	{
			return $this->Result->fetch_fields();
	}
	
	/* Devuelve el número de registros de una consulta */
	function numreg()
	{
			return $this->Treg;
	}
	
	/* Devuelve la consulta en un array */
	function getarray() 
	{			
			if($r=@$this->Result->fetch_assoc())
			{
				return $r; 
			}
			else
			return 0;				
	}	
	
	/* Devuelve el array completo que genera una consulta*/
	function getallarray() 
	{			
		$i = 0;
		
			while(@$valor = $this->Result->fetch_array(MYSQLI_ASSOC) )
			{
				$array[$i] = $valor;	
				$i++;
			}
			
			if(isset($array))
				return $array;
			else
				return 0;		
	} 
	
	/* Devuelve el array completo que genera una consulta cortando los campos a maximo 255 caracteres*/
	function getallarrayprev() 
	{			
		$i = 0;
		
			while(@$valor = $this->Result->fetch_array(MYSQLI_ASSOC) )
			{ 
				$valorprev=array();
				foreach ($valor as $clave => $dato) {
					//si se le puede hacer el substr es un dato que se puede mostrar si no no
					if(mb_check_encoding($dato,"UTF-8"))
					{
						if($dato = substr($dato, 0, 255))
						$valorprev[]=[ $clave => $dato];  
						elseif(is_numeric($dato)) 
						$valorprev[]=[ $clave => $dato];
						else
						$valorprev[]=[ $clave => "[Dato no soportado o vacio]"];
					}
					else
					$valorprev[]=[ $clave => "[Dato no soportado]"];
				}
				
				$array[$i] = $valorprev;	
				$i++;
			}
			
			if(isset($array))
				return $array;
			else
				return 0;		
	} 
	
	/* Devuelve la ultima id autoincrement insertada */
	function getid() 
	{			
			return 	$this->IDquery;			
	}
	
	/* Cierra el resultado existente*/
	function closeresult() 
	{		
			$this->Result->free(); 
	}
	
	/* funciones que establecen y cierran los profiles mysql para recoger el tiempo de la consulta */
	function initprofiles()
	{
		//creamos los perfiles
		$this->Con->query('SET profiling_history_size=1;');
		$this->Con->query('SET profiling=1'); 
	}
	
	function getprofiles()
	{
		//sacamos el tiempo del perfil mysql
		if ($res = $this->Con->query("SHOW profiles", MYSQLI_USE_RESULT)) {
			if($row = $res->fetch_row()) { 
				//print_r($row);
				$this->Querytimemysql =$row[1]; //viene en el segundo campo
			}
			$res->close();
		}
		 
		//remueve los perfiles
		$this->Con->query('SET profiling=0'); 
		$this->Con->query('SET profiling_history_size=0;');
	}
	
}
 
/* PRUEBAS */  
?>