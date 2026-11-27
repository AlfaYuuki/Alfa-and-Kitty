import * as THREE from 'three';
import { InputManager } from '../input/InputManager';

type Blocker = { minX:number; maxX:number; minZ:number; maxZ:number };

export class PlayerController {
  private group = new THREE.Group();
  private direction = new THREE.Vector3();
  private walk = 3.2;
  private run = 6.3;
  private blockers: Blocker[] = [
    {minX:-17.5,maxX:17.5,minZ:-29.5,maxZ:-16.5},
    {minX:-32,maxX:-18,minZ:-13,maxZ:5},
    {minX:17,maxX:31,minZ:-28,maxZ:-12}
  ];

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

  update(dt: number, input: InputManager, cameraYaw: number) {
    const forward = input.down('w','arrowup') ? 1 : input.down('s','arrowdown') ? -1 : 0;
    const side = input.down('d','arrowright') ? 1 : input.down('a','arrowleft') ? -1 : 0;
    const forwardVector = new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw));
    const rightVector = new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));
    this.direction.set(0,0,0).addScaledVector(forwardVector,forward).addScaledVector(rightVector,side);
    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      const targetYaw = Math.atan2(this.direction.x,this.direction.z) + Math.PI;
      this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y,targetYaw,12,dt);
    }
    const speed = input.down('shift') ? this.run : this.walk;
    const movement = this.direction.clone().multiplyScalar(speed * dt);
    const current = this.group.position;
    const nextX = THREE.MathUtils.clamp(current.x + movement.x,-37,37);
    const nextZ = THREE.MathUtils.clamp(current.z + movement.z,-41,41);
    if (!this.collides(nextX,current.z)) current.x = nextX;
    if (!this.collides(current.x,nextZ)) current.z = nextZ;
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