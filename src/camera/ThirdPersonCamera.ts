import * as THREE from 'three';

export class ThirdPersonCamera {
  private yaw = 0;
  private pitch = 0.22;
  private distance = 7.2;
  private sensitivity = 0.006;
  private target = new THREE.Vector3();
  private desired = new THREE.Vector3();
  private offset = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private obstructionDistance = 7.2;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private scene: THREE.Scene
  ) {}

  setSensitivity(value: number) { this.sensitivity = 0.006 * value; }
  getYaw() { return this.yaw; }

  update(player: THREE.Vector3, dt: number, lookX = 0, lookY = 0) {
    this.yaw -= lookX * this.sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch + lookY * this.sensitivity, -0.12, 0.72);
    this.target.copy(player).add(new THREE.Vector3(0, 1.55, 0));

    const horizontal = Math.cos(this.pitch) * this.distance;
    this.desired.set(
      this.target.x + Math.sin(this.yaw) * horizontal,
      this.target.y + Math.sin(this.pitch) * this.distance + 1.1,
      this.target.z + Math.cos(this.yaw) * horizontal
    );

    this.offset.copy(this.desired).sub(this.target);
    const desiredDistance = this.offset.length();
    this.offset.normalize();
    this.raycaster.set(this.target, this.offset);
    this.raycaster.far = desiredDistance;

    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    const obstruction = hits.find(hit =>
      hit.distance > 0.85 &&
      hit.object.visible &&
      (hit.object as THREE.Mesh).isMesh
    );

    const safeDistance = obstruction
      ? Math.max(1.25, obstruction.distance - 0.35)
      : desiredDistance;
    const response = safeDistance < this.obstructionDistance ? 18 : 5;
    this.obstructionDistance = THREE.MathUtils.damp(
      this.obstructionDistance, safeDistance, response, dt
    );

    const cameraDistance = Math.min(this.obstructionDistance, desiredDistance);
    this.desired.copy(this.target).addScaledVector(this.offset, cameraDistance);
    const followResponse = cameraDistance < this.distance * 0.9 ? 18 : 8;
    this.camera.position.lerp(this.desired, 1 - Math.exp(-followResponse * dt));
    this.camera.lookAt(this.target);
  }
}