import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class SceneManager {
  private static instance: SceneManager;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  public initialize(): void {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app')?.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.z = 5;

    // Setup controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(ambientLight, directionalLight);

    // Add test object
    const geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00,
      metalness: 0.3,
      roughness: 0.4
    });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Rotate the cube slightly
    cube.rotation.x = 0.2;
    cube.rotation.y = 0.4;

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Console log to confirm initialization
    console.log('Scene initialized');
  }

  public update(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}