import * as THREE from 'three';
import { InputManager } from '../input/InputManager';

export class PlayerController {
  private group = new THREE.Group();
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private speed = 5.2;
  private walk = 3.2;
  private run = 6.3;
  private bounds = new THREE.Box3(new THREE.Vector3(-38,0,-42), new THREE.Vector3(38,0,42));

  constructor(scene: THREE.Scene) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.95, 5, 10), new THREE.MeshStandardMaterial({ color: '#202b3b', roughness: 0.82 }));
    body.position.y = 1.12; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), new THREE.MeshStandardMaterial({ color: '#d8a982', roughness: 0.9 }));
    head.position.y = 1.95; head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), new THREE.MeshStandardMaterial({ color: '#17191e', roughness: 0.95 }));
    hair.position.y = 2.08; hair.castShadow = true;
    const hoodieMark = new THREE.Mesh(new THREE.BoxGeometry(0.44,0.08,0.025), new THREE.MeshStandardMaterial({color:'#3b5d85'}));
    hoodieMark.position.set(0,1.45,0.405);
    this.group.add(body, head, hair, hoodieMark);
    this.group.position.set(0,0,8);
    scene.add(this.group);
  }

  update(dt: number, input: InputManager) {
    const forward = input.down('w','arrowup') ? 1 : input.down('s','arrowdown') ? -1 : 0;
    const side = input.down('d','arrowright') ? 1 : input.down('a','arrowleft') ? -1 : 0;
    const cameraForward = new THREE.Vector3(0,0,-1);
    const yaw = this.group.rotation.y;
    cameraForward.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
    const right = new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
    this.direction.set(0,0,0).addScaledVector(cameraForward, forward).addScaledVector(right, side);
    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      const targetYaw = Math.atan2(this.direction.x, this.direction.z) + Math.PI;
      this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, targetYaw, 12, dt);
    }
    this.speed = input.down('shift') ? this.run : this.walk;
    this.velocity.copy(this.direction).multiplyScalar(this.speed * dt);
    const next = this.group.position.clone().add(this.velocity);
    next.x = THREE.MathUtils.clamp(next.x, -37, 37);
    next.z = THREE.MathUtils.clamp(next.z, -41, 41);
    this.group.position.copy(next);
  }
  getPosition() { return this.group.position.clone(); }
  setPosition(position: {x:number;y:number;z:number}) {
    this.group.position.set(THREE.MathUtils.clamp(position.x,-37,37),0,THREE.MathUtils.clamp(position.z,-41,41));
  }
}