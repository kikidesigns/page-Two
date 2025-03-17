import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class SceneManager {
  private static instance: SceneManager;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private pointLight: THREE.PointLight;

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

    // Setup lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.pointLight = new THREE.PointLight(0xffffff, 0.5);
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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('app')?.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 0, 0);

    // Setup controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 15;

    // Setup lighting
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    
    this.pointLight.position.set(-5, 5, -5);
    this.pointLight.castShadow = true;

    this.scene.add(this.ambientLight, this.directionalLight, this.pointLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

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