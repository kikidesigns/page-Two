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

    // Configure default texture loader settings
    this.textureLoader.crossOrigin = 'anonymous';
  }

  public static getInstance(): TextureManager {
    if (!TextureManager.instance) {
      TextureManager.instance = new TextureManager();
    }
    return TextureManager.instance;
  }

  public async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.textureCache.has(url)) {
      const cachedTexture = this.textureCache.get(url)!;
      this.logTextureDetails('Loaded from cache', url, cachedTexture);
      return cachedTexture;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Configure texture properties
          texture.flipY = false;
          texture.encoding = THREE.sRGBEncoding;
          texture.needsUpdate = true;

          // Set proper filtering for cards
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;

          this.textureCache.set(url, texture);
          this.logTextureDetails('Loaded from URL', url, texture);
          resolve(texture);
        },
        (progress) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Loading texture: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        },
        (error) => {
          console.error(`Failed to load texture from ${url}:`, error);
          reject(new Error(`Failed to load texture: ${error.message}`));
        }
      );
    });
  }

  public async processAndLoadImage(file: File): Promise<ProcessedImage> {
    try {
      this.imageProcessor.validateImage(file);
      const processed = await this.imageProcessor.processImage(file);

      // Configure the processed texture
      processed.texture.flipY = false;
      processed.texture.encoding = THREE.sRGBEncoding;
      processed.texture.minFilter = THREE.LinearFilter;
      processed.texture.magFilter = THREE.LinearFilter;
      processed.texture.generateMipmaps = false;
      processed.texture.needsUpdate = true;

      this.textureCache.set(processed.dataUrl, processed.texture);
      this.logTextureDetails('Processed and loaded', file.name, processed.texture);
      return processed;
    } catch (error) {
      console.error('Failed to process image:', error);
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

    // Add a simple pattern
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture);
    this.logTextureDetails('Created default front', 'default-front', texture);
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

    // Add a pattern
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture);
    this.logTextureDetails('Created default back', 'default-back', texture);
    return texture;
  }

  private configureTexture(texture: THREE.Texture): void {
    texture.flipY = false;
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
  }

  private logTextureDetails(action: string, identifier: string, texture: THREE.Texture): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TextureManager] ${action}:`, {
        identifier,
        uuid: texture.uuid,
        size: texture.image ? `${texture.image.width}x${texture.image.height}` : 'unknown',
        encoding: texture.encoding,
        flipY: texture.flipY,
        minFilter: texture.minFilter,
        magFilter: texture.magFilter,
        generateMipmaps: texture.generateMipmaps,
        format: texture.format,
        type: texture.type
      });
    }
  }

  public clearCache(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[TextureManager] Clearing texture cache:', {
        size: this.textureCache.size,
        textures: Array.from(this.textureCache.keys())
      });
    }

    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
  }

  public removeTexture(url: string): void {
    const texture = this.textureCache.get(url);
    if (texture) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TextureManager] Removing texture:', {
          url,
          uuid: texture.uuid
        });
      }
      texture.dispose();
      this.textureCache.delete(url);
    }
  }
}