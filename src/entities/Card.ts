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

    // Create materials
    this.frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: THREE.FrontSide
    });

    this.backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.BackSide
    });

    // Create mesh with double-sided material
    this.mesh = new THREE.Mesh(geometry, [this.frontMaterial, this.backMaterial]);
    this.mesh.position.copy(position);

    // Add interaction capability
    this.mesh.userData.clickable = true;
    this.mesh.userData.card = this;
  }

  public flip(): void {
    if (this.isFlipping) return;

    this.isFlipping = true;
    const targetRotation = this.isFaceUp ? 0 : Math.PI;

    gsap.to(this.mesh.rotation, {
      y: targetRotation,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        this.isFlipping = false;
        this.isFaceUp = !this.isFaceUp;
      }
    });
  }

  public update(): void {
    // Update any card-specific animations or states
  }

  public getMesh(): THREE.Mesh {
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
    gsap.to(this.mesh.rotation, {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      duration: 0.5,
      ease: "power2.out"
    });
  }
}