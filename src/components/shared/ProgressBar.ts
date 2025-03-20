import { EventEmitter } from 'events';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  variant?: 'primary' | 'success' | 'danger';
}

export class ProgressBar extends EventEmitter {
  private element: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private label: HTMLDivElement;

  constructor(props: ProgressBarProps) {
    super();
    this.element = document.createElement('div');
    this.element.className = 'progress-container';

    this.label = document.createElement('div');
    this.label.className = 'progress-label';

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';

    this.element.appendChild(this.label);
    this.element.appendChild(this.progressBar);

    this.update(props);
  }

  public update(props: ProgressBarProps): void {
    const { progress, label = '', variant = 'primary' } = props;

    // Ensure progress is between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    this.progressBar.style.width = `${clampedProgress}%`;
    this.progressBar.className = `progress-bar progress-${variant}`;
    
    this.label.textContent = label || `${Math.round(clampedProgress)}%`;
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public dispose(): void {
    this.removeAllListeners();
  }
}