import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class SceneManager {
  private static instance: SceneManager;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private constructor() {
    // Create scene with dark gray background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
    
    // Create camera with wider FOV
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Create renderer with physically correct lighting
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create controls
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
    this.camera.position.set(0, 5, 10); // Move camera back and up
    this.camera.lookAt(0, 0, 0);

    // Setup controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 20;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Add directional lights
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x666666, 0x444444);
    this.scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    if (process.env.NODE_ENV === 'development') {
      // Add light helpers in development
      const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
      this.scene.add(hemiLightHelper);

      const mainLightHelper = new THREE.DirectionalLightHelper(mainLight, 1);
      this.scene.add(mainLightHelper);

      const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 1);
      this.scene.add(fillLightHelper);

      const mainLightCameraHelper = new THREE.CameraHelper(mainLight.shadow.camera);
      this.scene.add(mainLightCameraHelper);
    }

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('Scene initialized with camera at:', this.camera.position);
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