//definimos las clases para las entradas de los formularios
export class InputBase<Type>{
  value: Type;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  constructor(options: {
      value?: Type,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string
    } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}

//clases segun el tipo de input que se necesite
export class InputText extends InputBase<string> {
  controlType = 'text';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}

export class InputHidden extends InputBase<string> {
  controlType = 'hidden';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = 'hidden';
  }
}
 

export class InputArea extends InputBase<string> {
  controlType = 'textArea'; 

  constructor(options: {} = {}) {
    super(options); 
  }
}

export class InputSelect extends InputBase<string> {
  controlType = 'select';
  options: {key: string, value: string}[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}

//sin soporte, para los datos no soportados
export class Nosupport extends InputBase<string> {
  controlType = 'Nosupported'; 

  constructor(options: {} = {}) {
    super(options); 
  }
}