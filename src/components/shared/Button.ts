import { EventEmitter } from 'events';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export class Button extends EventEmitter {
  private element: HTMLButtonElement;

  constructor(props: ButtonProps) {
    super();
    this.element = document.createElement('button');
    this.update(props);
  }

  public update(props: ButtonProps): void {
    const { text, disabled = false, variant = 'primary', loading = false } = props;
    
    this.element.textContent = loading ? 'Loading...' : text;
    this.element.disabled = disabled || loading;
    this.element.className = `btn btn-${variant}`;
    
    if (loading) {
      this.element.classList.add('loading');
    } else {
      this.element.classList.remove('loading');
    }

    this.element.onclick = () => {
      if (!disabled && !loading) {
        props.onClick();
      }
    };
  }

  public getElement(): HTMLButtonElement {
    return this.element;
  }

  public dispose(): void {
    this.element.onclick = null;
    this.removeAllListeners();
  }
}