import { EventEmitter } from 'events';
import { TextureManager } from '../../core/TextureManager';
import { ProcessedImage } from '../../utils/ImageProcessor';
import { DropZone } from '../shared/DropZone';
import { ProgressBar } from '../shared/ProgressBar';
import { Button } from '../shared/Button';

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
  private statusContainer: HTMLDivElement;
  private saveButton: Button;
  private textureManager: TextureManager;
  private uploads: Map<string, UploadStatus>;

  constructor() {
    super();
    this.textureManager = TextureManager.getInstance();
    this.uploads = new Map();
    
    this.element = document.createElement('div');
    this.element.className = 'image-upload-zone';

    // Create status container
    this.statusContainer = document.createElement('div');
    this.statusContainer.className = 'upload-status';
    
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'preview-container';

    // Create save button
    this.saveButton = new Button({
      text: 'Save & Apply Changes',
      variant: 'primary',
      disabled: true,
      onClick: () => this.handleSave()
    });

    this.initializeDropZone();
    
    this.element.appendChild(this.dropZone.getElement());
    this.element.appendChild(this.statusContainer);
    this.element.appendChild(this.previewContainer);
    this.element.appendChild(this.saveButton.getElement());

    // Add initial helper text
    this.updateStatus('Ready to upload card images');
  }

  private initializeDropZone(): void {
    this.dropZone = new DropZone({
      onFilesAccepted: (files) => this.handleFiles(files),
      onError: (error) => {
        this.emit('error', error);
        this.updateStatus(`Error: ${error.message}`, 'error');
      },
      accept: ['image/jpeg', 'image/png', 'image/webp'],
      label: 'Drop card images here or click to select'
    });
  }

  private updateStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    this.statusContainer.className = `upload-status status-${type}`;
    this.statusContainer.textContent = message;
  }

  private async handleFiles(files: File[]): Promise<void> {
    this.updateStatus(`Processing ${files.length} file(s)...`, 'info');
    let successCount = 0;

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

        successCount++;
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

    // Update overall status
    if (successCount > 0) {
      this.updateStatus(
        `Successfully uploaded ${successCount} file(s). Click "Save & Apply Changes" to continue.`,
        'success'
      );
      this.saveButton.update({ disabled: false });
    } else {
      this.updateStatus('No files were uploaded successfully.', 'error');
    }
  }

  private createPreviewElement(id: string): void {
    const upload = this.uploads.get(id)!;
    
    const previewElement = document.createElement('div');
    previewElement.className = 'preview-item';
    previewElement.dataset.uploadId = id;

    // Create file name display
    const fileName = document.createElement('div');
    fileName.className = 'preview-filename';
    fileName.textContent = upload.file.name;

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
    
    previewElement.appendChild(fileName);
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

  private handleSave(): void {
    const successfulUploads = Array.from(this.uploads.values())
      .filter(upload => upload.status === 'success');

    if (successfulUploads.length > 0) {
      this.emit('save', successfulUploads.map(upload => ({
        file: upload.file,
        result: upload.result!
      })));
      this.updateStatus('Changes saved and applied successfully!', 'success');
      this.saveButton.update({ disabled: true });
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
    this.updateStatus('Ready to upload card images');
    this.saveButton.update({ disabled: true });
  }

  public dispose(): void {
    this.dropZone.dispose();
    this.saveButton.dispose();
    this.uploads.clear();
    this.removeAllListeners();
  }
}