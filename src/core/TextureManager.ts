import * as THREE from 'three';
import { ImageProcessor, ProcessedImage } from '../utils/ImageProcessor';

export class TextureManager {
  private static instance: TextureManager;
  private textureLoader: THREE.TextureLoader;
  private textureCache: Map<string, THREE.Texture>;
  private imageProcessor: ImageProcessor;

  private constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = new Map();
    this.imageProcessor = ImageProcessor.getInstance();
  }

  public static getInstance(): TextureManager {
    if (!TextureManager.instance) {
      TextureManager.instance = new TextureManager();
    }
    return TextureManager.instance;
  }

  private configureTexture(texture: THREE.Texture): void {
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
  }

  public async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.configureTexture(texture);
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => reject(new Error(`Failed to load texture: ${error.message}`))
      );
    });
  }

  public async processAndLoadImage(file: File): Promise<ProcessedImage> {
    try {
      this.imageProcessor.validateImage(file);
      const processed = await this.imageProcessor.processImage(file);
      this.configureTexture(processed.texture);
      this.textureCache.set(processed.dataUrl, processed.texture);
      return processed;
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  public getDefaultFrontTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 896; // Maintains 1:1.75 ratio
    const ctx = canvas.getContext('2d')!;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add a grid pattern
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 2;

    // Vertical lines
    for (let x = 40; x < canvas.width - 40; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, canvas.height - 40);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 40; y < canvas.height - 40; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }

    // Add border
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Add text for debugging
    ctx.fillStyle = '#000000';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FRONT', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture);
    return texture;
  }

  public getDefaultBackTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 896;
    const ctx = canvas.getContext('2d')!;

    // Fill background
    ctx.fillStyle = '#000088';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add a diagonal pattern
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Draw diagonal lines
    for (let i = -canvas.height; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    // Add border
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Add text for debugging
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BACK', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture);
    return texture;
  }

  public clearCache(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
  }

  public removeTexture(url: string): void {
    const texture = this.textureCache.get(url);
    if (texture) {
      texture.dispose();
      this.textureCache.delete(url);
    }
  }
}