import { Component, Input, Output,EventEmitter,ElementRef,ViewChild,OnChanges,SimpleChange}  from '@angular/core';
import { FormGroup }                 from '@angular/forms';
import { InputBase }              from './dynamicforminputs';
import { QuestionControlService }    from './question-control.service';
import { NgbModal,NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [ QuestionControlService,NgbModal ]
})
export class DynamicFormComponent implements OnChanges{

  @ViewChild('rowed') el:ElementRef; //bindeamos el formulario para poder abrirlo desde open()
  @Input() questions: InputBase<any>[] = [];
  @Output() send:EventEmitter<any> = new EventEmitter();

  form: FormGroup;
  payLoad = ''; 
  editreg="editreg";
  fieldedit:string = "campo";
  valeditfield:string = "valor";
  edit:boolean = true;
  modalref:NgbModalRef;
   
  constructor(private modalService: NgbModal, private qcs: QuestionControlService) {
     
   }

  //observamos los cambios en questions y si trae datos formamos el formgroup con las questions
  ngOnChanges(){ 
        //console.log("Question length: "+this.questions.length); 
        if(this.questions.length > 0)    this.form =  this.qcs.toFormGroup(this.questions); 
    }

  //enviamos el formulario
  sendForm(){
      //let json = JSON.stringify(this.form.value);
      this.send.emit(this.form.value);
      this.close();
  }

  opendynamicform(fieldedit,valeditfield) {
    this.fieldedit = fieldedit;
    this.valeditfield = ""+valeditfield;
    this.edit = true;
    this.open(this.el); 
  }
 
  opendynamicforminsert(tablename) {
    this.edit = false;
    this.open(this.el); 
  }

  //abrimos el formulario
    open(content) {   
    this.modalref = this.modalService.open(content);

    this.modalref.result.then((result) => {
      //console.log(`Closed with: ${result}`);
    }, (reason) => {
      //console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }  
   
   close(){
        this.modalref.close("Form Send");
   }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  
} 