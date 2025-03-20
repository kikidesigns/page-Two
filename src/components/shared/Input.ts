import { EventEmitter } from 'events';

export interface InputProps {
  label: string;
  type?: 'text' | 'textarea';
  value?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  error?: string;
}

export class Input extends EventEmitter {
  private container: HTMLDivElement;
  private input: HTMLInputElement | HTMLTextAreaElement;
  private label: HTMLLabelElement;
  private errorElement: HTMLDivElement;

  constructor(props: InputProps) {
    super();
    this.container = document.createElement('div');
    this.container.className = 'input-container';

    this.label = document.createElement('label');
    this.label.className = 'input-label';

    this.input = props.type === 'textarea' 
      ? document.createElement('textarea')
      : document.createElement('input');
    this.input.className = 'input-field';

    this.errorElement = document.createElement('div');
    this.errorElement.className = 'input-error';

    this.container.appendChild(this.label);
    this.container.appendChild(this.input);
    this.container.appendChild(this.errorElement);

    this.update(props);
  }

  public update(props: InputProps): void {
    const { 
      label, 
      value = '', 
      placeholder = '', 
      required = false,
      error = '',
      type = 'text'
    } = props;

    this.label.textContent = `${label}${required ? ' *' : ''}`;
    this.input.value = value;
    this.input.placeholder = placeholder;
    this.errorElement.textContent = error;
    this.errorElement.style.display = error ? 'block' : 'none';

    if (this.input instanceof HTMLInputElement) {
      this.input.type = type;
    }

    this.input.oninput = (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      props.onChange?.(target.value);
    };

    this.input.onblur = (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      props.onBlur?.(target.value);
    };
  }

  public getValue(): string {
    return this.input.value;
  }

  public getElement(): HTMLDivElement {
    return this.container;
  }

  public focus(): void {
    this.input.focus();
  }

  public dispose(): void {
    this.input.oninput = null;
    this.input.onblur = null;
    this.removeAllListeners();
  }
}