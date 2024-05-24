import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from "three/addons/renderers/CSS3DRenderer.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { PDBLoader } from "three/addons/loaders/PDBLoader.js";
import { PDB_VIZ_TYPE } from "./config";
import BallImg from "../../../assets/images/ball.png";

export class ThreeEngine {
  VIZ_TYPE = PDB_VIZ_TYPE;
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
  }
  init() {
    // 实例化相机
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.dom.offsetWidth / this.dom.offsetHeight,
      1,
      5000
    );
    this.camera.position.z = 2500;
    // 实例化场景
    this.scene = new THREE.Scene();
    this.scene.add(this.root);
    // 创建渲染器
    this.renderer = new CSS3DRenderer();

    // 设置大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    // 将渲染器挂载到dom
    this.dom.appendChild(this.renderer.domElement);

    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.rotateSpeed = 0.5;

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

    this.baseSprite.src = BallImg;

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

  changeVizType(value: number, _THIS?: any) {
    const _this = this?.dom ? this : _THIS;
    if (value === 0) _this.showAtoms();
    else if (value === 1) _this.showBonds();
    else _this.showAtomsBonds();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  restLoader(blobUrl: string) {
    const manager = new THREE.LoadingManager();

    manager.setURLModifier(() => {
      return blobUrl;
    });
    this.loader = new PDBLoader(manager);
    this.loadMolecule(blobUrl);
  }

  showAtoms() {
    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];

      if (object instanceof CSS3DSprite) {
        object.element.style.display = "";
        object.visible = true;
      } else {
        object.element.style.display = "none";
        object.visible = false;
      }
    }
  }
  showBonds() {
    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];

      if (object instanceof CSS3DSprite) {
        object.element.style.display = "none";
        object.visible = false;
      } else {
        object.element.style.display = "";
        object.element.style.height = object.userData.bondLengthFull;
        object.visible = true;
      }
    }
  }

  showAtomsBonds() {
    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];

      object.element.style.display = "";
      object.visible = true;

      if (!(object instanceof CSS3DSprite)) {
        object.element.style.height = object.userData.bondLengthShort;
      }
    }
  }

  colorify(ctx, width, height, color) {
    const r = color.r,
      g = color.g,
      b = color.b;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0, l = data.length; i < l; i += 4) {
      data[i + 0] *= r;
      data[i + 1] *= g;
      data[i + 2] *= b;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  imageToCanvas(image) {
    const width = image.width;
    const height = image.height;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context!.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  loadMolecule(modelUrl: string, _THIS?: any) {
    console.log("_THIS: ", this?.dom);
    const _this = this?.dom ? this : _THIS;
    const url = modelUrl;
    for (let i = 0; i < _this.objects.length; i++) {
      const object = _this.objects[i];
      object.parent.remove(object);
    }

    _this.objects.length = 0;

    _this.loader.load(url, (pdb) => {
      const geometryAtoms = pdb.geometryAtoms;
      console.log("geometryAtoms: ", geometryAtoms);
      const geometryBonds = pdb.geometryBonds;
      const json = pdb.json;

      geometryAtoms.computeBoundingBox();
      geometryAtoms.boundingBox.getCenter(_this.offset).negate();

      geometryAtoms.translate(_this.offset.x, _this.offset.y, _this.offset.z);
      geometryBonds.translate(_this.offset.x, _this.offset.y, _this.offset.z);

      const positionAtoms = geometryAtoms.getAttribute("position");
      const colorAtoms = geometryAtoms.getAttribute("color");

      const position = new THREE.Vector3();
      const color = new THREE.Color();

      for (let i = 0; i < positionAtoms.count; i++) {
        position.fromBufferAttribute(positionAtoms, i);
        color.fromBufferAttribute(colorAtoms, i);

        const atomJSON = json.atoms[i];
        const element = atomJSON[4];

        if (!_this.colorSpriteMap[element]) {
          const canvas = _this.imageToCanvas(_this.baseSprite);
          const context = canvas.getContext("2d");

          _this.colorify(context, canvas.width, canvas.height, color);

          const dataUrl = canvas.toDataURL();

          _this.colorSpriteMap[element] = dataUrl;
        }

        const colorSprite = _this.colorSpriteMap[element];

        const atom = document.createElement("img");
        atom.src = colorSprite;

        const object = new CSS3DSprite(atom);
        object.position.copy(position);
        object.position.multiplyScalar(75);

        object.matrixAutoUpdate = false;
        object.updateMatrix();

        _this.root.add(object);

        _this.objects.push(object);
      }

      const positionBonds = geometryBonds.getAttribute("position");

      const start = new THREE.Vector3();
      const end = new THREE.Vector3();

      for (let i = 0; i < positionBonds.count; i += 2) {
        start.fromBufferAttribute(positionBonds, i);
        end.fromBufferAttribute(positionBonds, i + 1);

        start.multiplyScalar(75);
        end.multiplyScalar(75);

        _this.tmpVec1.subVectors(end, start);
        const bondLength = _this.tmpVec1.length() - 50;

        //

        let bond = document.createElement("div");
        bond.className = "bond";
        bond.style.height = bondLength + "px";

        let object = new CSS3DObject(bond);
        object.position.copy(start);
        object.position.lerp(end, 0.5);

        object.userData.bondLengthShort = bondLength + "px";
        object.userData.bondLengthFull = bondLength + 55 + "px";

        //

        const axis = _this.tmpVec2.set(0, 1, 0).cross(_this.tmpVec1);
        const radians = Math.acos(
          _this.tmpVec3
            .set(0, 1, 0)
            .dot(_this.tmpVec4.copy(_this.tmpVec1).normalize())
        );

        const objMatrix = new THREE.Matrix4().makeRotationAxis(
          axis.normalize(),
          radians
        );
        object.matrix.copy(objMatrix);
        object.quaternion.setFromRotationMatrix(object.matrix);

        object.matrixAutoUpdate = false;
        object.updateMatrix();

        _this.root.add(object);

        _this.objects.push(object);

        //

        const joint = new THREE.Object3D();
        joint.position.copy(start);
        joint.position.lerp(end, 0.5);

        joint.matrix.copy(objMatrix);
        joint.quaternion.setFromRotationMatrix(joint.matrix);

        joint.matrixAutoUpdate = false;
        joint.updateMatrix();

        bond = document.createElement("div");
        bond.className = "bond";
        bond.style.height = bondLength + "px";

        object = new CSS3DObject(bond);
        object.rotation.y = Math.PI / 2;

        object.matrixAutoUpdate = false;
        object.updateMatrix();

        object.userData.bondLengthShort = bondLength + "px";
        object.userData.bondLengthFull = bondLength + 55 + "px";

        object.userData.joint = joint;

        joint.add(object);
        _this.root.add(joint);

        _this.objects.push(object);
      }

      //console.log( "CSS3DObjects:", objects.length );
      _this.changeVizType(2, _this);
      _this.render();
    });
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
