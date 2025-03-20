import { EventEmitter } from 'events';
import { TextureManager } from '../../core/TextureManager';
import { ProcessedImage } from '../../utils/ImageProcessor';
import { DropZone } from '../shared/DropZone';
import { ProgressBar } from '../shared/ProgressBar';

export interface UploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  result?: ProcessedImage;
}

export class ImageUploadZone extends EventEmitter {
  private element: HTMLDivElement;
  private dropZone: DropZone;
  private previewContainer: HTMLDivElement;
  private textureManager: TextureManager;
  private uploads: Map<string, UploadStatus>;

  constructor() {
    super();
    this.textureManager = TextureManager.getInstance();
    this.uploads = new Map();
    
    this.element = document.createElement('div');
    this.element.className = 'image-upload-zone';

    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'preview-container';

    this.initializeDropZone();
    
    this.element.appendChild(this.dropZone.getElement());
    this.element.appendChild(this.previewContainer);
  }

  private initializeDropZone(): void {
    this.dropZone = new DropZone({
      onFilesAccepted: (files) => this.handleFiles(files),
      onError: (error) => this.emit('error', error),
      accept: ['image/jpeg', 'image/png', 'image/webp'],
      label: 'Drop card images here or click to select'
    });
  }

  private async handleFiles(files: File[]): Promise<void> {
    for (const file of files) {
      const id = crypto.randomUUID();
      
      // Create upload status
      this.uploads.set(id, {
        file,
        progress: 0,
        status: 'pending'
      });

      // Create preview element
      this.createPreviewElement(id);

      try {
        // Update status to processing
        this.updateUploadStatus(id, {
          status: 'processing',
          progress: 50
        });

        // Process the image
        const result = await this.textureManager.processAndLoadImage(file);

        // Update status to success
        this.updateUploadStatus(id, {
          status: 'success',
          progress: 100,
          result
        });

        this.emit('success', { id, result });
      } catch (error) {
        // Update status to error
        this.updateUploadStatus(id, {
          status: 'error',
          progress: 0,
          error: error.message
        });
      }
    }
  }

  private createPreviewElement(id: string): void {
    const upload = this.uploads.get(id)!;
    
    const previewElement = document.createElement('div');
    previewElement.className = 'preview-item';
    previewElement.dataset.uploadId = id;

    // Create thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'preview-thumbnail';
    
    // Create progress bar
    const progressBar = new ProgressBar({
      progress: upload.progress,
      variant: 'primary'
    });

    // Create status text
    const statusText = document.createElement('div');
    statusText.className = 'preview-status';
    
    previewElement.appendChild(thumbnail);
    previewElement.appendChild(progressBar.getElement());
    previewElement.appendChild(statusText);
    
    this.previewContainer.appendChild(previewElement);
  }

  private updatePreviewElement(id: string): void {
    const upload = this.uploads.get(id)!;
    const previewElement = this.previewContainer.querySelector(`[data-upload-id="${id}"]`);
    if (!previewElement) return;

    // Update thumbnail if available
    const thumbnail = previewElement.querySelector('.preview-thumbnail');
    if (thumbnail && upload.result?.dataUrl) {
      thumbnail.style.backgroundImage = `url(${upload.result.dataUrl})`;
    }

    // Update progress bar
    const progressBar = previewElement.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${upload.progress}%`;
    }

    // Update status text
    const statusText = previewElement.querySelector('.preview-status');
    if (statusText) {
      statusText.textContent = upload.error || upload.status;
      statusText.className = `preview-status status-${upload.status}`;
    }
  }

  private updateUploadStatus(id: string, update: Partial<UploadStatus>): void {
    const current = this.uploads.get(id);
    if (current) {
      this.uploads.set(id, { ...current, ...update });
      this.updatePreviewElement(id);
    }
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public getUploads(): Map<string, UploadStatus> {
    return this.uploads;
  }

  public clearUploads(): void {
    this.uploads.clear();
    this.previewContainer.innerHTML = '';
  }

  public dispose(): void {
    this.dropZone.dispose();
    this.uploads.clear();
    this.removeAllListeners();
  }
}