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

    // Create a simple colored material for testing
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      side: THREE.DoubleSide 
    });

    // Create the mesh
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.75), // Create new geometry instead of using passed one
      material
    );

    // Position and scale
    this.mesh.position.copy(position);
    this.mesh.scale.set(2, 2, 1);

    // Add a helper box to make it easier to see
    const boxGeometry = new THREE.BoxGeometry(1, 1.75, 0.1);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.mesh.add(box);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(2);
    this.mesh.add(axesHelper);

    console.log('Card created:', {
      geometry: this.mesh.geometry,
      material: this.mesh.material,
      position: this.mesh.position.toArray(),
      scale: this.mesh.scale.toArray(),
      rotation: this.mesh.rotation.toArray()
    });
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setPosition(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
  }

  public setRotation(rotation: THREE.Euler): void {
    this.mesh.rotation.copy(rotation);
  }

  public dispose(): void {
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(m => m.dispose());
    } else {
      this.mesh.material.dispose();
    }
    this.mesh.geometry.dispose();
  }
}