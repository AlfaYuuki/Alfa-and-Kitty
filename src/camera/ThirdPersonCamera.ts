import * as THREE from 'three';

export class ThirdPersonCamera {
  private yaw = 0;
  private pitch = 0.22;
  private distance = 7.2;
  private sensitivity = 0.006;
  private target = new THREE.Vector3();
  constructor(private camera: THREE.PerspectiveCamera, private element: HTMLElement) {}
  setSensitivity(value: number) { this.sensitivity = 0.006 * value; }
  getYaw() { return this.yaw; }

  update(player: THREE.Vector3, dt: number, lookX = 0, lookY = 0) {
    this.yaw -= lookX * this.sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch + lookY * this.sensitivity, -0.12, 0.72);
    this.target.copy(player).add(new THREE.Vector3(0,1.55,0));
    const horizontal = Math.cos(this.pitch) * this.distance;
    const desired = new THREE.Vector3(
      this.target.x + Math.sin(this.yaw) * horizontal,
      this.target.y + Math.sin(this.pitch) * this.distance + 1.1,
      this.target.z + Math.cos(this.yaw) * horizontal
    );
    this.camera.position.lerp(desired, 1 - Math.exp(-8 * dt));
    this.camera.lookAt(this.target);
  }
}