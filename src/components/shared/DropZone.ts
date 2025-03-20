import { EventEmitter } from 'events';
import { ImageProcessor } from '../../utils/ImageProcessor';

export interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  onError?: (error: Error) => void;
  maxFiles?: number;
  accept?: string[];
  label?: string;
}

export class DropZone extends EventEmitter {
  private element: HTMLDivElement;
  private imageProcessor: ImageProcessor;

  constructor(props: DropZoneProps) {
    super();
    this.imageProcessor = ImageProcessor.getInstance();
    this.element = document.createElement('div');
    this.update(props);
  }

  public update(props: DropZoneProps): void {
    const { 
      onFilesAccepted, 
      onError,
      maxFiles = 1,
      accept = ['image/jpeg', 'image/png', 'image/webp'],
      label = 'Drop files here or click to select'
    } = props;

    this.element.className = 'dropzone';
    this.element.innerHTML = `
      <div class="dropzone-content">
        <div class="dropzone-icon">📁</div>
        <div class="dropzone-text">${label}</div>
      </div>
      <input type="file" accept="${accept.join(',')}" ${maxFiles > 1 ? 'multiple' : ''} />
    `;

    const input = this.element.querySelector('input')!;

    const handleFiles = async (files: FileList) => {
      try {
        const fileArray = Array.from(files).slice(0, maxFiles);
        
        // Validate each file
        fileArray.forEach(file => {
          this.imageProcessor.validateImage(file);
        });

        onFilesAccepted(fileArray);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    // Handle drag and drop
    this.element.ondragover = (e) => {
      e.preventDefault();
      this.element.classList.add('dropzone-active');
    };

    this.element.ondragleave = () => {
      this.element.classList.remove('dropzone-active');
    };

    this.element.ondrop = async (e) => {
      e.preventDefault();
      this.element.classList.remove('dropzone-active');
      
      if (e.dataTransfer?.files) {
        await handleFiles(e.dataTransfer.files);
      }
    };

    // Handle click to select
    input.onchange = async () => {
      if (input.files) {
        await handleFiles(input.files);
      }
    };
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public dispose(): void {
    this.element.ondragover = null;
    this.element.ondragleave = null;
    this.element.ondrop = null;
    const input = this.element.querySelector('input');
    if (input) {
      input.onchange = null;
    }
    this.removeAllListeners();
  }
}