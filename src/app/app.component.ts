import { QueryService } from './query.service';
import { Component,ViewChild} from '@angular/core';
import { environment } from '../environments/environment.prod'; 
import { KeysPipe } from './pipe'; 
import { Observable} from 'rxjs/Rx';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';
import { DynamicFormComponent }         from './dynamicform/dynamic-form.component';
import { InputBase,InputArea,InputSelect,InputText,InputHidden,Nosupport }              from './dynamicform/dynamicforminputs';

@Component({
  selector: 'dbrng',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent {
  @ViewChild(DynamicFormComponent) dyform:DynamicFormComponent;
  questions: InputBase<any>[] = [];
  work = 'no works!';
  loader:boolean = true;
  alertsuccess:boolean = false;
  alertdanger:boolean = false;
  alertinfo:boolean = false;
  infomsg:string = "Info message";
  tables;
  SQL:string = "";
  response;
  debug:boolean = !environment.production; 
  SHOWS = ['100', '50',
            '10', '5','1','all']; 
  show:any = this.SHOWS[5];
  fieldedit:any;
  valeditfield:any;
  edit:boolean = true;

  //clase que se ejecuta al inicio del componente
  constructor(private QS:QueryService) {   
     //obtenemos las tablas de la bd
        QS.tables.subscribe(
        tables => {this.tables = tables;this.work = 'works!';this.loader = false;},
        error => {this.alertdanger = true;this.loader = true; this.infomsg = "No se han devuelto las tablas de la BD"  }
      );
 
   }

  //funcion para pasarle la SQL query al backend
  generateQuery(){

    if(this.SQL != "")
    {
      //activamos el loader
      this.loader = true; 

      //obtenemos la respuesta a la SQL pasada
        this.QS.sqlquery(this.SQL).subscribe(
        response => {
          this.response = response;
          this.loader = false;
          //si no ha habido error success
          if(this.response.info.error != "")
            this.playmsg("alertdanger","ERROR: "+this.response.info.error,5000);
          else
            this.playmsg("alertsuccess","Tiempo "+response.info.time+" Rows:"+response.info.rows,5000); }
          ,
        error => {this.playmsg("alertdanger","No se ha obtenido respuesta del servidor",5000);this.loader = false;  }
      );
    }
    else
    {
       this.infomsg = "Escribe una consulta SQL"; this.alertdanger = true;
    }
  }

  //genera un array a partir de un objeto pasado
  generateArray(obj){
    return Object.keys(obj).map((key)=>{ return obj[key]});
  }

  //funcion para el select de consultas
  sqltext(str:string){
    switch(str){
      case "sel":
      this.SQL = "SELECT * FROM `tabla` WHERE `campo` = 'XXX';";
      break;
      case "del":
      this.SQL = "DELETE FROM `tabla` WHERE `campo` = 'XXX';";
      break;
      case "upd":
      this.SQL = "UPDATE `tabla` SET `campo` = '' WHERE campoid = 'XXX';";
      break;
      case "inner":
      this.SQL = "SELECT columna FROM `tabla1` INNER JOIN `tabla2` ON tabla1.columna=tabla2.columna;";
      break;

    }

  }

  //funcion para el select de consultas de tablas
  sqlselect(tbl){
    this.SQL="SELECT * FROM `"+tbl+"`;"; 
    this.generateQuery();
  }
  
  //para visualizar la respuesta del server
  get diagnostic() { 
    return JSON.stringify(this.response);  
    //return this.response.info.time; 
  }

  //para visualizar show
  get diagnosticshow() {  
    return JSON.stringify(this.show);
  }

  //para cambiar show
   changeshow(val) {  
     this.show = val; 
     console.log(" >"+this.show +" type:"+ typeof this.show );
  }

    //para mostrar las filas, pasamos el i index del array data
  showrows(i){  
     if(this.show == 'all')
      return true;
     else{
       var num:number = Number(this.show);
        if(i < num)
          return true;
        else
          return false;
     }
  }

  //click en una fila de la data mostrada
   onClickrow(row) {
    //si es editable llamamos al componente de formularios dinamicos para editar la fila
    if(this.editable(row))
    {  
      //obtenemos los datos de esa fila de la bd ya que pueden estar cortados al mostrar solo un preview en la tabla
      this.QS.datarow(this.response.tablename,this.fieldedit,this.valeditfield).subscribe(
        datarow => {
            if(this.getQuestions(datarow)) //obtenemos el array question que pasa via input al formulario dinamico con los datos a insertar
            {
              this.dyform.opendynamicform(this.fieldedit,this.valeditfield); //abrimos el formulario si hay array en questions
              this.edit = true; //es una ediccion no una inserccion
            }
      
        },
        error => {this.alertdanger = true;this.loader = true; this.infomsg = "No se han devuelto los datos de la fila a editar"  }
      );
 
    }
  } 

  //comprobamos si una fila es editable, devolvemos true o false
  editable(row){
    let editable = false;
    let keys = Object.keys(this.response.editables);

    //comprobamos que se pueda editar esa fila
    for(let i=0;i < Object.keys(this.response.editables).length; i++){
        if(this.response.editables[keys[i]] == true){
          editable=true; 

          //obtenemos el campo editable y su valor
          this.fieldedit = keys[i]; 
          
          let data = this.response.data[row][i];

          this.valeditfield = data[keys[i]]; 
          
           //console.log( this.valeditfield); 
        }
    }

    return editable;
  }

  //click en un insert row para una tabla
   onClickinsert(tablename) {

        //obtenemos las tablas de la bd
        this.QS.tableinfo(tablename).subscribe(
        info => {this.response = info;
            if(this.getQuestionsinsert(tablename)) //obtenemos el array question que pasa via input al formulario dinamico con los datos a insertar
            {
              this.dyform.opendynamicforminsert(tablename); //abrimos el formulario si hay array en questions
              this.edit = false;
            }
      
        },
        error => {this.alertdanger = true;this.loader = true; this.infomsg = "No se ha devuelto la info de la tabla a insertar"  }
      );

   }

   //obtenemos los datos de la fila a editar para pasarselo al formulario dinamico
   getQuestions(datarow) {

    console.log("Formamos el registro a editar:"+this.fieldedit+" valorcampo:"+this.valeditfield);
    this.questions = []; //vaciamos questions

            //le añadimos el input hidden con el nombre de la tabla
             this.questions.push( new InputHidden({
                                            key: 'tablename',
                                            value: this.response.tablename,
                                             }));

       let keys = Object.keys(datarow);

       for(let i=0;i < keys.length; i++){
         

          //obtenemos el campo editable y su valor
          let rowfield = keys[i];

          let valrowfield = datarow[keys[i]];
          
          //recorremos el array de tableinfo para encontrar el tipo del campo
          this.response.tableinfo.forEach(rowinfo => {
                if(rowfield == rowinfo.Field )
                {
                  //añadimos al array question el dato para editarlo segun sea su tipo
                  switch(true)
                  {
                    case /^int\(/.test(rowinfo.Type) || /^tinyint\(/.test(rowinfo.Type) || /^year/.test(rowinfo.Type):
                      //console.log( rowfield +" inputText NUMERICO");

                       this.questions.push( new InputText({
                                            key: rowfield,
                                            label: rowfield,
                                            value: valrowfield,
                                            type: 'number'
                                             }));
                    break;

                    case /^varchar\(/.test(rowinfo.Type) || /^date/.test(rowinfo.Type) || /^time/.test(rowinfo.Type) || /^decimal/.test(rowinfo.Type):
                      //console.log( rowfield +" InputText");

                       this.questions.push( new InputText({
                                            key: rowfield,
                                            label: rowfield,
                                            value: valrowfield,
                                            type: 'text'
                                             }));
                    break;
                    
                    case /^text/.test(rowinfo.Type) :
                      //console.log( rowfield +" InputArea");

                      this.questions.push( new InputArea({
                                            key: rowfield,
                                            label: rowfield,
                                            value: valrowfield
                                             }));
                    break;

                  }
                
                  //console.log( rowfield +" "+ valrowfield+" ftype: "+rowinfo.Type);  

                } 
            });

 
    } 

    //devolvemos true si hay questions o false si no
    if(this.questions.length > 0)
      return true;
    else
      return false;
  }

  //obtenemos los datos de la tabla para mostar el formulario dinamico a insertar
   getQuestionsinsert(table) {

    console.log("Formamos el registro a insertar para la tabla: "+table);
    this.questions = []; //vaciamos questions
    let req = false;
     
            //le añadimos el input hidden con el nombre de la tabla
             this.questions.push( new InputHidden({
                                            key: 'tablename',
                                            value: this.response.tablename,
                                             }));

          //recorremos el array de tableinfo para encontrar el tipo del campo
          this.response.tableinfo.forEach(rowinfo => {
                   
                   //si es extra autoincrement lo ponemos como campo oculto
                   if(rowinfo.Extra == "auto_increment")
                   { 
                                  this.questions.push( new InputHidden({
                                                                  key: rowinfo.Field,
                                                                  value: "auto_increment",
                                                                  }));
                   }
                   else
                   {
                     //miramos si puede ser null o no para poner el required
                     if(rowinfo.Null == "NO")
                     req = true;
                     else
                     req = false;

                      //añadimos al array question el dato para editarlo segun sea su tipo
                      switch(true)
                      {
                        case /^int\(/.test(rowinfo.Type) || /^tinyint\(/.test(rowinfo.Type) || /^year/.test(rowinfo.Type):
                          //console.log( rowfield +" inputText NUMERICO");

                          this.questions.push( new InputText({
                                                key: rowinfo.Field,
                                                label: rowinfo.Field,
                                                type: 'number',
                                                required: req
                                                }));
                        break;

                        case /^varchar\(/.test(rowinfo.Type) || /^date/.test(rowinfo.Type) || /^time/.test(rowinfo.Type) || /^decimal/.test(rowinfo.Type):
                          //console.log( rowfield +" InputText");

                          this.questions.push( new InputText({
                                                key: rowinfo.Field,
                                                label: rowinfo.Field,
                                                type: 'text',
                                                required: req
                                                }));
                        break;
                        
                        case /^text/.test(rowinfo.Type) :
                          //console.log( rowfield +" InputArea");

                          this.questions.push( new InputArea({
                                                key: rowinfo.Field,
                                                label: rowinfo.Field
                                                }));
                        break;

                      }

                   }
                

            });

  

    //devolvemos true si hay questions o false si no
    if(this.questions.length > 0)
      return true;
    else
      return false;
  }

  //recibimos el formulario con su data segun venga de un edit o insert
  receivedata(data){
    if(this.edit){
      //formamos la consulta y la ejecutamos
      this.editsql(data);
    }
    else{
      //formamos la consulta y la ejecutamos
      this.insertsql(data);
    }
  }

  //formamos la consulta para un edit
  editsql(data){
    
    let keys = Object.keys(data);
    let updatefields:string = "";

    //recorremos el array data para generar los set update de la consulta
    for(let i=0;i < keys.length; i++){
          
          if(keys[i] != "tablename") //quitamos el tablename que nos trae como campo el form
          {
            updatefields += "`"+keys[i]+ "` = '"+data[keys[i]]+"'";

            //añadimos la coma final o no si es el ultimo
            if(i != (keys.length - 1))
              updatefields += ",";
          }

    }
    
    //enviamos la consulta para ejecutarla
    this.SQL="UPDATE `"+data.tablename+"` SET "+updatefields+" WHERE "+this.fieldedit+" = '"+this.valeditfield+"'; ";
    this.generateQuery();
  }

  //formamos la consulta para un insert
  insertsql(data){ 
 
    let keys = Object.keys(data);
    let fields:string = "";
    let values:string = "";

    //recorremos el array data para generar los set update de la consulta
    for(let i=0;i < keys.length; i++){
          if(keys[i] != "tablename") //quitamos el tablename que nos trae como campo el form
          {
            
            fields += "`"+keys[i]+ "`";
            
            if(data[keys[i]] == "auto_increment")
            values += "NULL";
            else
            values += "'"+data[keys[i]]+"'";

            //añadimos la coma final o no si es el ultimo
            if(i < (keys.length-1)){
              values += ",";
              fields += ",";
            }
             
          }
    }
    
    //enviamos la consulta para ejecutarla
    this.SQL="INSERT INTO `"+data.tablename+"`  ("+fields+") VALUES ("+values+"); ";
    this.generateQuery();
  }

  //mostramos un msg de alerta con informacion
  playmsg(alert,infomsg,timems) {
    this.infomsg = infomsg;
    this[alert] = true;
    
    //cerramos los demas mensajes si estan true
    switch(alert)
    {
      case "alertsuccess":
       this.alertinfo = false; this.alertdanger = false;
      break;
      case "alertinfo":
       this.alertsuccess = false; this.alertdanger = false;
      break;
      case "alertdanger":
       this.alertinfo = false; this.alertsuccess = false;
      break;
    }


      let timer = Observable.timer(timems);
      timer.subscribe(t=>{this[alert] = false;});
      
    };
  

}
