import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from "three/addons/renderers/CSS3DRenderer.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { PDBLoader } from "three/addons/loaders/PDBLoader.js";
import BallImg from "../../../assets/images/ball.png";
import { WebGLRenderer } from "three";

export class ThreeEngine {
  dom = null; // 挂载的 DOM
  scene: THREE.Scene | null = null; // 场景
  camera = null; // 照相机
  renderer: any = null; // 渲染器
  controls: any = null; // 控制器

  root: THREE.Object3D<THREE.Event> = new THREE.Object3D();
  objects: any[] = [];
  tmpVec1 = new THREE.Vector3();
  tmpVec2 = new THREE.Vector3();
  tmpVec3 = new THREE.Vector3();
  tmpVec4 = new THREE.Vector3();
  offset = new THREE.Vector3();
  loader = new PDBLoader();
  colorSpriteMap = {};

  baseSprite = document.createElement("img");
  constructor(dom) {
    this.dom = dom;
    this.init();
    // this.mockInit()
  }

  init() {
    // 实例化相机
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.dom.offsetWidth / this.dom.offsetHeight,
      0.1,
      1000
    );

    this.camera.position.z = 100;
    // 实例化场景
    this.scene = new THREE.Scene();

    this.scene.add(this.root);
    // const light = new THREE.AmbientLight(0x404040); // 柔和的白光
    // this.scene.add(light);
    // 创建渲染器
    this.renderer = new WebGLRenderer();
    this.renderer.setClearColor(0xffffff, 1);

    // 设置大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    console.log("this.dom: ", this.dom);
    // 将渲染器挂载到dom
    this.dom.appendChild(this.renderer.domElement);

    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.rotateSpeed = 2;

    // 逐帧渲染threejs
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();

      // const time = Date.now() * 0.0004

      // this.root!.rotation.x = time
      // this.root!.rotation.y = time * 0.7

      this.render();
    };

    animate();
    const _this = this;

    window.addEventListener("resize", () => _this.onWindowResize(_this));

    // const gui = new GUI()
    // gui.add(params, "vizType", VIZ_TYPE).onChange((val) => _this.changeVizType(val, _this))
    // gui.add(params, "molecule", MOLECULES).onChange((val) => _this.loadMolecule(val, _this))
    // gui.open()

    this.render();

    console.log("渲染完成");
  }

  destroy() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  restPath() {
    console.log(this.root, "===");
    // Define a custom shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(10, 0);
    shape.lineTo(10, 10);
    shape.lineTo(5, 15);
    shape.lineTo(0, 10);
    shape.lineTo(0, 0);

    // Extrude settings
    const extrudeSettings = {
      steps: 2,
      depth: 100,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    // Create a geometry from the shape
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create a material
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    // Create a mesh and add it to the scene
    const mesh = new THREE.Mesh(geometry, material);

    this.root.add(mesh);

    this.render();
  }

  onWindowResize(_THIS) {
    const _this = _THIS;
    if (_this.dom && _this.camera) {
      _this.camera.aspect = _this.dom.offsetWidth / _this.dom!.offsetHeight;
      _this.camera.updateProjectionMatrix();

      _this.renderer.setSize(_this.dom.offsetWidth, _this.dom.offsetHeight);
    }
  }
}
