import * as THREE from 'three';

export interface ProcessedImage {
  texture: THREE.Texture;
  width: number;
  height: number;
  aspectRatio: number;
  dataUrl: string;
}

export class ImageProcessor {
  private static instance: ImageProcessor;
  private textureLoader: THREE.TextureLoader;
  
  private constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  public async processImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to process the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Set dimensions to power of 2 for optimal texture performance
          const maxSize = 1024;
          let width = img.width;
          let height = img.height;
          
          // Scale down if necessary while maintaining aspect ratio
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round(height * (maxSize / width));
              width = maxSize;
            } else {
              width = Math.round(width * (maxSize / height));
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and process image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Create Three.js texture
          const texture = this.textureLoader.load(dataUrl);
          texture.needsUpdate = true;
          
          resolve({
            texture,
            width,
            height,
            aspectRatio: width / height,
            dataUrl
          });
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  public validateImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    return true;
  }

  public dispose(): void {
    // Clean up any resources if needed
  }
}