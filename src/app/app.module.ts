import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { QueryService } from './query.service';
import { KeysPipe } from './pipe';
import { AppComponent } from './app.component';
import { DynamicFormComponent }         from './dynamicform/dynamic-form.component';
import { DynamicFormQuestionComponent } from './dynamicform/dynamic-form-question.component';
import { QuestionControlService }    from './dynamicform/question-control.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';  
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';

@NgModule({
  declarations: [
    AppComponent, KeysPipe,
    DynamicFormComponent, 
    DynamicFormQuestionComponent 
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,NgbModule.forRoot()
  ],
  providers: [QueryService,NgbDropdown],
  bootstrap: [AppComponent]
})
export class AppModule { }
