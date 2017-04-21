/*$(document).ready(function(){
	//cerramos loading y abrimos el dbr
	$("#loading").fadeOut();
	$("#dbrhtml").fadeIn();
	
	
	//a�adimos las tablas al ul
	addtables();

	//clicks en consultas
    $("#select").click(function(){
		$("#sqlarea").val("SELECT * FROM tabla WHERE campo = 'XXX';");
    });
    $("#delete").click(function(){
		$("#sqlarea").val("DELETE FROM tabla WHERE campo = 'XXX';");
    });
    $("#update").click(function(){
		$("#sqlarea").val("UPDATE tabla SET campo = '' WHERE campoid = 'XXX';");
    });
    $("#innerjoin").click(function(){
		$("#sqlarea").val("SELECT columna FROM tabla1 INNER JOIN tabla2 ON tabla1.columna=tabla2.columna;");
    });
	$('.closealert').click(function() {
	   $(this).parent().hide();
	})
	

	
	//al hacer click en el boton de enviar consulta
    $("#sendsql").click(function(){
		query($("#sqlarea").val());
    });
	
	//al hacer click en el boton de enviar una edicion de un registro
	$("#editsend").click(clicksendedit);
	//al hacer click en el boton de enviar una inserccion de un registro
	$("#insertsend").click(clicksendinsert);
	 
});

*/

/* funcion para añadir las tablas al listado del menu*/
function addtables()
{
	$( "ul#tables" ).html('');

	$.post( "php/ajax.php", { gettables: true }, 
	function(json)
	{ 
		console.log( 'tablas = ' + json.length); 
	  
		$( "ul#tables" ).append(wrapjson('<li><a href="#" class="tabledb">',json,'</a></li>'));
		$( "ul#inserts" ).append(wrapjson('<li><a href="#" class="tabledbinsert">',json,'</a></li>'));
		
		//al hacer click en una tabla la mostraremos con un select *
		$("#tables a").click(function(){
			console.log('click en tabla '+$(this).text());
			_sql = 'SELECT * FROM `'+$(this).text()+'`;';
			$("#sqlarea").val(_sql);
			query(_sql);
		});
		
		//al hacer click en un insert mostramos su form
		$("#inserts a").click(clickinsert);
	
	}, 'json' );
	
}

/* funcion para mostrar los mensajes de alerta alert+success +danger +info*/
function alertdiv(_texto,_tipo)
{
	$("#alert"+_tipo+" p").html(_texto); 
	//muestra durante 5 segundos
	$("#alert"+_tipo).fadeTo(15000, 100).slideUp(500, function(){ $("#alert"+_tipo).slideUp(500); });   
}

/* funcion para ejecutar la consulta*/
function query(_sql)
{
	$("#loading").fadeIn(); 
	$("#sqlarea").val(_sql);
	
	//hacemos la llamada para la query
	$.post( "php/ajax.php", { query: true, sql: _sql }, 
	function(json)
	{  
		if(json.info.error == "")
		alertdiv('Query ok!! Time: '+json.info.time+' seconds Total regs: '+json.info.rows,"success");
		else
		alertdiv('Query error!! '+json.info.error,"danger");
		
		if(json.info.rows > 0)
			showdata(json);
		else
		{
				//sacamos el nombre de la tabla 
				$("#tabledata").data("tablename", "");
				$("#headnames").html("");
				$("#datarows").html("");
				
				console.log( "tabledata sin registros = " + $("#tabledata").data("tablename")); 
		}
		
		$("#loading").fadeOut();
	}, 'json' );
	
}
/* funcion para crear la tabla con los datos de la consulta*/
function showdata(json)
{ 
		console.log( "data = " + json.data.length); 
		
		//quitamos lo que haya en la tabla
		$( "#datarows" ).html('');
		$( "#headnames" ).html('');
		
		//ponemos los headnames
		$( "#headnames" ).append(wrapjsonkeys('<th>',json.data[0],'</th>'));
		 
		
		//a�adimos el contenido data
		$.each(json.data, function(i) {
			
			if(i < $("#showrows").val() || $("#showrows").val() == "all")
			{
				_row = wrapdata(json.data[i],json.editables);
			
				$( "#datarows" ).append(_row);
			}
			else
				return false;
		});
		
		//sacamos el nombre de la tabla 
		$("#tabledata").data("tablename", json.editables.tablename);
		 
		//bindeamos el click en un registro, abrimos una ventana modal para editarlo en caso de que se pueda
		$(".rowsql").click(clickreg);
}

/* funcion que envia una edicion update del formulario editreg y cierra la ventana modal*/
function clicksendedit()
{ 
	_sets = "";
	
	//sacamos los set del formulario, solo input y textarea
	$("#editreg form input,#editreg form textarea").each(function(){
		//console.log($(this).attr("name")+" > "+$(this).val());//buscamos los input del form
		if(_sets != "")
		_sets+=",";
		
		_sets += "`"+$(this).attr("name")+"` = '"+$(this).val()+"'";
	});
	
	_sql = "UPDATE "+ $("#tabledata").data("tablename") +" SET "+_sets+" WHERE "+$("#editwhere").data("field")+"='"+$("#editwhere").data("val")+"';";
	
	//alert(_sql); 
	$("#editreg").modal("hide");
	query(_sql);
}

/* funcion que detecta si un registro es editable y muestra su edicion*/
function clickreg()
{ 
			_editar = false;
			
			$(this).find('td').each(function () 
            { 
				if($(this).data("field") != undefined)
				{
					//alert($(this).data("field")+" "+$(this).data("val")+" "+$("#tabledata").data("tablename"));
					_editar = true;
					_field = $(this).data("field");
					_val = $(this).data("val"); 
					
					return false;//break each
				}
            });
			
			//si se ha clickeado en un registro editable sacamos sus datos para editarlo en una ventana modal
			if(_editar)
			{
				//alert(_field+" "+_val+" "+$("#tabledata").data("tablename"));
				
				//hacemos la llamada para mostrar el formulario de edicion
				$.post( "php/ajax.php", { editreg: true, field: _field, val: _val, table: $("#tabledata").data("tablename") }, 
				function(_htmlform)
				{   
					$("#editwhere").data("field",_field);
					$("#editwhere").data("val",_val);
					$("#editwhere").html(_field +" = "+ _val);
					
					$("#modalbody").html(_htmlform);
						
					$("#editreg").modal();
					
					
				}, 'html' );
				
			}
}

/* funcion que detecta si un registro es editable y muestra su edicion*/
function clickinsert()
{ 
	 
			console.log('click en insert '+$(this).text());
					$("#insertable").html( $(this).text());
					$("#insertable").data("tablename",$(this).text())
			
				// hacemos la llamada para mostrar el formulario de edicion
				$.post( "php/ajax.php", { insertreg: true,table: $(this).text() }, 
				function(_htmlform)
				{   
					$("#modalinsertbody").html(_htmlform);
					$("#insertreg").modal(); 
					
					
				}, 'html' );
				 
}

/* funcion que envia una inserccion del form insertreg y cierra la ventana modal*/
function clicksendinsert()
{ 
	_values = "";
	_cols = "";
	
	//sacamos los set del formulario, solo input y textarea
	$("#insertreg form input,#insertreg form textarea").each(function(){
		//console.log($(this).attr("name")+" > "+$(this).val());//buscamos los input del form
		if(_values != "")
		_values += ",";
		
		_values += "'"+$(this).val()+"'";
		
		if(_cols != "")
		_cols += ",";
		
		_cols += "`"+$(this).attr("name")+"`";
	});
	 
	_sql = "INSERT INTO `"+ $("#insertable").data("tablename") +"` ("+ _cols +") VALUES("+ _values+")";
	//alert(_sql); 
	$("#insertreg").modal("hide");
	query(_sql);
}

/* funcion para encapsular los datos de elementos de un array json entre etiquetas*/
function wrapdata(jsonarray,jsonedit)
{ 
		_wrapjson="";
		$.each(jsonarray, function(i) {
			$.each(jsonarray[i], function(k,v) {
				//console.log('key='+k+' editable='+jsonedit[k]); 
				if(jsonedit[k])
				_editable=' data-field="'+k+'" data-val="'+v+'"';
				else
				_editable='';
				
				_wrapjson += '<td'+_editable+'>'+v+'</td>'; 
			});
		});
		
			_row = '<tr class="rowsql">';
			_row += _wrapjson;
			_row += '</tr>';
			
		return _row;
}

/* funcion para encapsular los datos de elementos de un array json entre etiquetas*/
function wrapjson(_tag,jsonarray,_closetag)
{ 
		_wrapjson="";

		$.each(jsonarray, function(i) {
			$.each(jsonarray[i], function(k,v) {
				//console.log(_tag+v+_closetag);  
				_wrapjson += _tag+v+_closetag; 
			});
		});
		
		return _wrapjson;
}

/* funcion para encapsular las keys de elementos de un array json entre etiquetas*/
function wrapjsonkeys(_tag,jsonarray,_closetag)
{ 
		_wrapjson="";

		$.each(jsonarray, function(i) {
			$.each(jsonarray[i], function(k,v) {
				//console.log(_tag+k+_closetag);  
				_wrapjson += _tag+k+_closetag; 
			});
		});
		
		return _wrapjson;
}