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
  private frontMaterial: THREE.Material;
  private backMaterial: THREE.Material;

  constructor(props: CardProps) {
    const { geometry, position, frontTexture, backTexture } = props;

    // Create materials with proper settings
    this.frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
      metalness: 0.1,
      roughness: 0.8
    });

    this.backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
      metalness: 0.1,
      roughness: 0.8
    });

    // Create mesh with both materials
    this.mesh = new THREE.Mesh(geometry, [this.frontMaterial, this.backMaterial]);
    this.mesh.position.copy(position);

    // Add interaction capability
    this.mesh.userData.clickable = true;
    this.mesh.userData.card = this;

    // Set initial visibility
    this.mesh.visible = true;

    console.log('Card created:', {
      position: this.mesh.position,
      rotation: this.mesh.rotation,
      materials: this.mesh.material,
      visible: this.mesh.visible
    });
  }

  public flip(): void {
    if (this.isFlipping) return;

    this.isFlipping = true;
    const targetRotation = this.isFaceUp ? 0 : Math.PI;

    console.log('Flipping card:', {
      from: this.mesh.rotation.y,
      to: targetRotation,
      isFaceUp: this.isFaceUp
    });

    gsap.to(this.mesh.rotation, {
      y: targetRotation,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        this.isFlipping = false;
        this.isFaceUp = !this.isFaceUp;
        console.log('Flip completed, card is now:', this.isFaceUp ? 'face up' : 'face down');
      }
    });
  }

  public update(): void {
    // Update any card-specific animations or states
    if (this.mesh.visible) {
      // Add any per-frame updates here
    }
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setPosition(position: THREE.Vector3): void {
    console.log('Setting card position:', position);
    gsap.to(this.mesh.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        console.log('Position update completed:', this.mesh.position);
      }
    });
  }

  public setRotation(rotation: THREE.Euler): void {
    console.log('Setting card rotation:', rotation);
    gsap.to(this.mesh.rotation, {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        console.log('Rotation update completed:', this.mesh.rotation);
      }
    });
  }

  public dispose(): void {
    // Clean up resources
    this.frontMaterial.dispose();
    this.backMaterial.dispose();
    this.mesh.geometry.dispose();
  }
}