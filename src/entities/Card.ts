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

    console.log('Card: Creating new card at position:', position);

    // Create materials with proper settings
    this.frontMaterial = new THREE.MeshPhongMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: false,
      color: 0xffffff,
      emissive: 0x000000,
      shininess: 30
    });

    this.backMaterial = new THREE.MeshPhongMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: false,
      color: 0xffffff,
      emissive: 0x000000,
      shininess: 30
    });

    // Create mesh with both materials
    this.mesh = new THREE.Mesh(geometry, [this.frontMaterial, this.backMaterial]);
    this.mesh.position.copy(position);

    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Scale up the card slightly
    this.mesh.scale.set(2, 2, 2);

    // Add interaction capability
    this.mesh.userData.clickable = true;
    this.mesh.userData.card = this;

    // Set initial visibility
    this.mesh.visible = true;

    console.log('Card: Created with properties:', {
      position: this.mesh.position.toArray(),
      scale: this.mesh.scale.toArray(),
      rotation: this.mesh.rotation.toArray(),
      visible: this.mesh.visible,
      materials: {
        front: this.frontMaterial,
        back: this.backMaterial
      }
    });
  }

  public flip(): void {
    if (this.isFlipping) return;

    this.isFlipping = true;
    const targetRotation = this.isFaceUp ? 0 : Math.PI;

    console.log('Card: Flipping from', this.mesh.rotation.y, 'to', targetRotation);

    gsap.to(this.mesh.rotation, {
      y: targetRotation,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        this.isFlipping = false;
        this.isFaceUp = !this.isFaceUp;
        console.log('Card: Flip completed, now', this.isFaceUp ? 'face up' : 'face down');
      }
    });
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setPosition(position: THREE.Vector3): void {
    console.log('Card: Setting position to', position.toArray());
    gsap.to(this.mesh.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        console.log('Card: Position update completed');
      }
    });
  }

  public setRotation(rotation: THREE.Euler): void {
    console.log('Card: Setting rotation to', rotation.toArray());
    gsap.to(this.mesh.rotation, {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        console.log('Card: Rotation update completed');
      }
    });
  }

  public dispose(): void {
    console.log('Card: Disposing resources');
    this.frontMaterial.dispose();
    this.backMaterial.dispose();
    this.mesh.geometry.dispose();
  }
}