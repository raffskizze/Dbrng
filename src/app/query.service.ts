import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class QueryService { 
  urlajax:string = `http://127.0.0.1/edsa-dbrng/php/ajax.php`;

  constructor(private http: Http) { } 

  //obtenemos las tablas de la BD
  get tables() {
    //construimos las options para el post
    let heads = new Headers({ 'Content-Type': 'application/json; charset=UTF-8' });
    let options = new RequestOptions(heads);

    //el body en json
    let body = JSON.stringify({gettables : true});

    return this.http.post(this.urlajax, body , options)
      .map(response => response.json());

  }

  sqlquery(sql:string) {
      //construimos las options para el post
      let heads = new Headers({ 'Content-Type': 'application/json; charset=UTF-8' });
      let options = new RequestOptions(heads);

      //el body en json
      let body = JSON.stringify({sqlquery : sql});

      return this.http.post(this.urlajax, body , options)
        .map(response => response.json());

    }

  //obtenemos la info de una tabla pasada
  tableinfo(table) {
    //construimos las options para el post
    let heads = new Headers({ 'Content-Type': 'application/json; charset=UTF-8' });
    let options = new RequestOptions(heads);

    //el body en json
    let body = JSON.stringify({tableinfo: true,tablename: table});

    return this.http.post(this.urlajax, body , options)
      .map(response => response.json());

  }

  //obtenemos los datos de una fila a partir de su tabla campo y valor unico editable
  datarow(table,fieldrow,valfieldrow) {
    //construimos las options para el post
    let heads = new Headers({ 'Content-Type': 'application/json; charset=UTF-8' });
    let options = new RequestOptions(heads);

    //el body en json
    let body = JSON.stringify({datarow: true,tablename: table,field: fieldrow,valfield: valfieldrow});

    return this.http.post(this.urlajax, body , options)
      .map(response => response.json());

  }
}