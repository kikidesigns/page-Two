import * as THREE from 'three';
import { gsap } from 'gsap';

interface CardProps {
  geometry: THREE.PlaneGeometry;
  position: THREE.Vector3;
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  showDecorations?: boolean;
  borderColor?: number;
  decorColor?: number;
}

export class Card {
  private mesh: THREE.Group;
  private isFlipping: boolean = false;
  private isFaceUp: boolean = false;
  private frontTexture: THREE.Texture;
  private backTexture: THREE.Texture;
  private frontCard: THREE.Mesh;
  private backCard: THREE.Mesh;

  constructor(props: CardProps) {
    const { 
      geometry, 
      position, 
      frontTexture, 
      backTexture,
      showDecorations = true,
      borderColor = 0x000000,
      decorColor = 0x880000
    } = props;

    this.frontTexture = frontTexture;
    this.backTexture = backTexture;

    // Configure textures
    [frontTexture, backTexture].forEach(texture => {
      texture.flipY = false;
      texture.encoding = THREE.sRGBEncoding;
      texture.needsUpdate = true;
    });

    // Create materials with proper settings
    const frontMaterial = new THREE.MeshStandardMaterial({ 
      map: frontTexture,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.5
    });

    const backMaterial = new THREE.MeshStandardMaterial({ 
      map: backTexture,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.5
    });

    // Create card mesh as a Group
    this.mesh = new THREE.Group();
    
    // Create separate meshes for front and back faces
    const cardGeometry = new THREE.PlaneGeometry(1, 1.75);
    cardGeometry.attributes.uv.needsUpdate = true;

    this.frontCard = new THREE.Mesh(cardGeometry, frontMaterial);
    this.backCard = new THREE.Mesh(cardGeometry, backMaterial);

    // Position back face
    this.backCard.rotation.y = Math.PI;
    this.backCard.position.z = -0.01;

    this.mesh.add(this.frontCard);
    this.mesh.add(this.backCard);

    // Add border
    const borderGeometry = new THREE.PlaneGeometry(1.05, 1.80);
    const borderMaterial = new THREE.MeshStandardMaterial({ 
      color: borderColor,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.5
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.z = -0.02;
    this.mesh.add(border);

    if (showDecorations) {
      // Add decorative elements
      const decorSize = 0.2;
      const decorGeometry = new THREE.PlaneGeometry(decorSize, decorSize);
      const decorMaterial = new THREE.MeshStandardMaterial({ 
        color: decorColor,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5
      });

      // Add corner decorations
      const positions = [
        [-0.4, 0.8, 0.01],  // Top left
        [0.4, 0.8, 0.01],   // Top right
        [-0.4, -0.8, 0.01], // Bottom left
        [0.4, -0.8, 0.01]   // Bottom right
      ];

      positions.forEach(([x, y, z]) => {
        const decor = new THREE.Mesh(decorGeometry, decorMaterial);
        decor.position.set(x, y, z);
        this.mesh.add(decor);
      });
    }

    // Position and scale the entire card
    this.mesh.position.copy(position);
    this.mesh.scale.set(2, 2, 1);

    // Rotate to face up by default
    this.mesh.rotation.x = -Math.PI / 2;

    // Add debug helpers
    if (process.env.NODE_ENV === 'development') {
      const axesHelper = new THREE.AxesHelper(1);
      this.mesh.add(axesHelper);

      // Add wireframe helpers
      const wireframe = new THREE.WireframeGeometry(cardGeometry);
      const line = new THREE.LineSegments(wireframe);
      this.mesh.add(line);

      // Add normal helpers
      const frontNormals = new THREE.FaceNormalsHelper(this.frontCard, 0.2, 0x00ff00);
      const backNormals = new THREE.FaceNormalsHelper(this.backCard, 0.2, 0xff0000);
      this.mesh.add(frontNormals);
      this.mesh.add(backNormals);

      console.log('Card created:', {
        position: this.mesh.position.toArray(),
        rotation: this.mesh.rotation.toArray(),
        scale: this.mesh.scale.toArray(),
        frontTexture: {
          uuid: frontTexture.uuid,
          size: `${frontTexture.image?.width}x${frontTexture.image?.height}`,
          encoding: frontTexture.encoding
        },
        backTexture: {
          uuid: backTexture.uuid,
          size: `${backTexture.image?.width}x${backTexture.image?.height}`,
          encoding: backTexture.encoding
        }
      });
    }
  }

  public getMesh(): THREE.Object3D {
    return this.mesh;
  }

  public setPosition(position: THREE.Vector3): void {
    gsap.to(this.mesh.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 0.5,
      ease: "power2.out"
    });
  }

  public setRotation(rotation: THREE.Euler): void {
    const upRotation = -Math.PI / 2;
    
    gsap.to(this.mesh.rotation, {
      x: rotation.x + upRotation,
      y: rotation.y,
      z: rotation.z,
      duration: 0.5,
      ease: "power2.out"
    });
  }

  public flip(): void {
    if (this.isFlipping) return;
    this.isFlipping = true;

    gsap.to(this.mesh.rotation, {
      y: this.mesh.rotation.y + Math.PI,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => {
        this.isFlipping = false;
        this.isFaceUp = !this.isFaceUp;
      }
    });
  }

  public updateTextures(frontTexture: THREE.Texture, backTexture: THREE.Texture): void {
    this.frontTexture = frontTexture;
    this.backTexture = backTexture;

    // Configure new textures
    [frontTexture, backTexture].forEach(texture => {
      texture.flipY = false;
      texture.encoding = THREE.sRGBEncoding;
      texture.needsUpdate = true;
    });

    // Update materials
    (this.frontCard.material as THREE.MeshStandardMaterial).map = frontTexture;
    (this.backCard.material as THREE.MeshStandardMaterial).map = backTexture;
    this.frontCard.material.needsUpdate = true;
    this.backCard.material.needsUpdate = true;
  }

  public dispose(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.dispose();
        child.geometry.dispose();
      }
    });
    
    this.frontTexture?.dispose();
    this.backTexture?.dispose();
  }
}