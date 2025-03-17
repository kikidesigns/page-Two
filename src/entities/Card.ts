import * as THREE from 'three';
import { gsap } from 'gsap';

interface CardProps {
  geometry: THREE.PlaneGeometry;
  position: THREE.Vector3;
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
}

export class Card {
  private mesh: THREE.Mesh;
  private isFlipping: boolean = false;
  private isFaceUp: boolean = false;

  constructor(props: CardProps) {
    const { geometry, position, frontTexture, backTexture } = props;

    // Create front and back materials
    const frontMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, // White
      side: THREE.FrontSide
    });

    const backMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000088, // Dark blue
      side: THREE.BackSide
    });

    // Create card mesh
    this.mesh = new THREE.Group() as any; // Use Group to hold card and decorations
    
    // Create main card plane
    const cardPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.75),
      [frontMaterial, backMaterial]
    );
    this.mesh.add(cardPlane);

    // Add border (slightly larger plane behind the card)
    const borderGeometry = new THREE.PlaneGeometry(1.05, 1.80);
    const borderMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, // Black border
      side: THREE.DoubleSide
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.z = -0.01; // Slightly behind the card
    this.mesh.add(border);

    // Add decorative elements
    const decorSize = 0.2;
    const decorGeometry = new THREE.PlaneGeometry(decorSize, decorSize);
    const decorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x880000, // Dark red
      side: THREE.FrontSide
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

    // Position and scale the entire card
    this.mesh.position.copy(position);
    this.mesh.scale.set(2, 2, 1);

    // Rotate to face up by default
    this.mesh.rotation.x = -Math.PI / 2;

    // Add debug helpers
    const axesHelper = new THREE.AxesHelper(1);
    this.mesh.add(axesHelper);

    console.log('Card created:', {
      position: this.mesh.position.toArray(),
      rotation: this.mesh.rotation.toArray(),
      scale: this.mesh.scale.toArray()
    });
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
    // Store the current up-facing rotation
    const upRotation = -Math.PI / 2;
    
    gsap.to(this.mesh.rotation, {
      x: rotation.x + upRotation, // Add the up-facing rotation
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

  public dispose(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
        child.geometry.dispose();
      }
    });
  }
}