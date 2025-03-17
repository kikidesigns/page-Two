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

    // Create simple materials for better visibility
    this.frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      color: 0xff0000, // Red
    });

    this.backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.BackSide,
      color: 0x0000ff, // Blue
    });

    // Create mesh with both materials as an array
    this.mesh = new THREE.Mesh(geometry, [this.frontMaterial, this.backMaterial]);
    
    // Set initial position and rotation
    this.mesh.position.copy(position);
    this.mesh.rotation.set(0, 0, 0); // Start flat
    
    // Rotate to face camera
    this.mesh.rotateX(-Math.PI / 2);

    // Scale up for visibility
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

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setPosition(position: THREE.Vector3): void {
    console.log('Card: Setting position to', position.toArray());
    this.mesh.position.copy(position);
  }

  public setRotation(rotation: THREE.Euler): void {
    console.log('Card: Setting rotation to', rotation.toArray());
    this.mesh.rotation.copy(rotation);
    // Ensure card faces up
    this.mesh.rotateX(-Math.PI / 2);
  }

  public dispose(): void {
    console.log('Card: Disposing resources');
    this.frontMaterial.dispose();
    this.backMaterial.dispose();
    this.mesh.geometry.dispose();
  }
}