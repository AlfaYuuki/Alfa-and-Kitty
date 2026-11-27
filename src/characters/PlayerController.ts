import * as THREE from 'three';
import { InputManager } from '../input/InputManager';
import { CollisionBox } from '../world/World';

export class PlayerController {
  private group = new THREE.Group();
  private rig = new THREE.Group();
  private direction = new THREE.Vector3();
  private walk = 3.2;
  private run = 6.3;
  private gaitPhase = 0;
  private gaitAmount = 0;
  private leftArm = new THREE.Group();
  private rightArm = new THREE.Group();
  private leftLeg = new THREE.Group();
  private rightLeg = new THREE.Group();
  constructor(scene: THREE.Scene, private blockers: CollisionBox[]) {
    const hoodie = new THREE.MeshStandardMaterial({ color: '#202b3b', roughness: 0.82 });
    const skin = new THREE.MeshStandardMaterial({ color: '#d8a982', roughness: 0.9 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#17191e', roughness: 0.95 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: '#171d27', roughness: 0.92 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.72, 5, 10), hoodie);
    body.position.y = 1.15;
    body.castShadow = true;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), skin);
    head.position.y = 1.95;
    head.castShadow = true;

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hair.position.y = 2.08;
    hair.castShadow = true;

    const eyeWhite = new THREE.MeshStandardMaterial({ color: '#fff8ee', roughness: 0.38 });
    const irisMat = new THREE.MeshStandardMaterial({ color: '#285b9a', roughness: 0.28, metalness: 0.08 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: '#101827', roughness: 0.25 });
    const eyeShine = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.064, 16, 12), eyeWhite);
      eye.scale.set(0.82, 1.12, 0.48);
      eye.position.set(side * 0.125, 1.985, 0.303);
      this.rig.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.039, 14, 12), irisMat);
      iris.position.set(side * 0.125, 1.982, 0.332);
      this.rig.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.021, 12, 10), pupilMat);
      pupil.position.set(side * 0.125, 1.982, 0.354);
      this.rig.add(pupil);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), eyeShine);
      shine.position.set(side * 0.125 - 0.012, 1.999, 0.365);
      this.rig.add(shine);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.018, 0.025), hairMat);
      brow.position.set(side * 0.125, 2.075, 0.296);
      brow.rotation.z = side * -0.08;
      this.rig.add(brow);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), skin);
      ear.scale.set(0.55, 0.8, 0.42);
      ear.position.set(side * 0.33, 1.91, 0.015);
      this.rig.add(ear);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), skin);
    nose.scale.set(0.75, 0.7, 0.6);
    nose.position.set(0, 1.91, 0.34);
    this.rig.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.012), new THREE.MeshStandardMaterial({ color: '#8e5558' }));
    mouth.position.set(0, 1.855, 0.326);
    this.rig.add(mouth);

    const hairTuftMat = hairMat;
    for (const [x, y, z, rz] of [[-0.2,2.08,0.17,-0.45],[-0.08,2.17,0.2,-0.15],[0.1,2.15,0.18,0.18],[0.22,2.07,0.13,0.45]] as number[][]) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.28, 7), hairTuftMat);
      tuft.position.set(x, y, z);
      tuft.rotation.z = rz;
      tuft.rotation.x = -0.28;
      this.rig.add(tuft);
    }

    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), hairMat);
    fringe.scale.set(1.25, 0.55, 0.8);
    fringe.position.set(0, 2.12, 0.25);
    fringe.castShadow = true;

    const hoodieMark = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.08, 0.025),
      new THREE.MeshStandardMaterial({ color: '#5279a8', roughness: 0.7 })
    );
    hoodieMark.position.set(0, 1.43, 0.405);

    const hoodiePocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.19, 0.045), new THREE.MeshStandardMaterial({ color: '#29394d', roughness: 0.9 }));
    hoodiePocket.position.set(0, 0.98, 0.39);
    this.rig.add(hoodiePocket);
    const hoodieDrawstring = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.22, 0.018), new THREE.MeshStandardMaterial({ color: '#b7c3d0' }));
    const stringRight = hoodieDrawstring.clone();
    hoodieDrawstring.position.set(-0.09, 1.48, 0.414);
    stringRight.position.set(0.09, 1.48, 0.414);
    this.rig.add(hoodieDrawstring, stringRight);

    const limbGeometry = new THREE.CapsuleGeometry(0.14, 0.48, 4, 8);
    const legGeometry = new THREE.CapsuleGeometry(0.17, 0.48, 4, 8);

    this.leftArm.position.set(-0.48, 1.48, 0);
    this.rightArm.position.set(0.48, 1.48, 0);
    for (const arm of [this.leftArm, this.rightArm]) {
      const sleeve = new THREE.Mesh(limbGeometry, hoodie);
      sleeve.position.y = -0.29;
      sleeve.castShadow = true;
      arm.add(sleeve);
    }
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin);
    const rightHand = leftHand.clone();
    leftHand.position.y = -0.62;
    rightHand.position.y = -0.62;
    this.leftArm.add(leftHand);
    this.rightArm.add(rightHand);

    this.leftLeg.position.set(-0.22, 0.78, 0);
    this.rightLeg.position.set(0.22, 0.78, 0);
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const trouser = new THREE.Mesh(legGeometry, hoodie);
      trouser.position.y = -0.31;
      trouser.castShadow = true;
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.43), shoeMat);
      shoe.position.set(0, -0.63, 0.08);
      shoe.castShadow = true;
      leg.add(trouser, shoe);
    }

    this.rig.add(body, head, hair, fringe, hoodieMark, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
    this.group.add(this.rig);
    this.group.position.set(0, 0, 8);
    scene.add(this.group);
  }

  update(dt: number, input: InputManager, cameraYaw: number) {
    const forward = input.down('w','arrowup') ? 1 : input.down('s','arrowdown') ? -1 : 0;
    const side = input.down('d','arrowright') ? 1 : input.down('a','arrowleft') ? -1 : 0;
    const forwardVector = new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw));
    const rightVector = new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));
    this.direction.set(0,0,0).addScaledVector(forwardVector,forward).addScaledVector(rightVector,side);

    const moving = this.direction.lengthSq() > 0;
    const sprinting = input.down('shift');
    if (moving) {
      this.direction.normalize();
      const targetYaw = Math.atan2(this.direction.x,this.direction.z) + Math.PI;
      this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y,targetYaw,12,dt);
    }

    const speed = sprinting ? this.run : this.walk;
    const movement = this.direction.clone().multiplyScalar(speed * dt);
    const current = this.group.position;
    const nextX = THREE.MathUtils.clamp(current.x + movement.x,-37,37);
    const nextZ = THREE.MathUtils.clamp(current.z + movement.z,-41,41);
    if (!this.collides(nextX,current.z)) current.x = nextX;
    if (!this.collides(current.x,nextZ)) current.z = nextZ;

    const targetGait = moving ? 1 : 0;
    this.gaitAmount = THREE.MathUtils.damp(this.gaitAmount,targetGait, moving ? 12 : 10,dt);
    if (this.gaitAmount > 0.001) {
      this.gaitPhase += dt * (sprinting ? 13 : 9);
    }
    const swing = Math.sin(this.gaitPhase) * this.gaitAmount;
    const runBounce = Math.abs(Math.cos(this.gaitPhase * 2)) * 0.055 * this.gaitAmount;
    this.leftLeg.rotation.x = swing * 0.72;
    this.rightLeg.rotation.x = -swing * 0.72;
    this.leftArm.rotation.x = -swing * 0.58;
    this.rightArm.rotation.x = swing * 0.58;
    this.leftArm.rotation.z = -0.08;
    this.rightArm.rotation.z = 0.08;
    this.rig.position.y = runBounce;
    this.rig.rotation.z = moving ? Math.sin(this.gaitPhase) * 0.025 * this.gaitAmount : 0;
  }

  private collides(x:number,z:number) {
    const radius = 0.55;
    return this.blockers.some(b => x + radius > b.minX && x - radius < b.maxX && z + radius > b.minZ && z - radius < b.maxZ);
  }

  getPosition() { return this.group.position.clone(); }
  setPosition(position: {x:number;y:number;z:number}) {
    const x = THREE.MathUtils.clamp(position.x,-37,37);
    const z = THREE.MathUtils.clamp(position.z,-41,41);
    if (!this.collides(x,z)) this.group.position.set(x,0,z);
  }
}