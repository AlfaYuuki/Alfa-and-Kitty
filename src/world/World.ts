import * as THREE from 'three';

export type CollisionBox = { minX: number; maxX: number; minZ: number; maxZ: number };

export class World {
  private seed = 481516;
  constructor(private scene: THREE.Scene) { this.build(); }

  getCollisionBounds(): CollisionBox[] {
    const bounds: CollisionBox[] = [
      { minX: -17.5, maxX: 17.5, minZ: -29.5, maxZ: -16.5 },
      { minX: -32, maxX: -18, minZ: -13, maxZ: 5 },
      { minX: 17, maxX: 31, minZ: -28, maxZ: -12 },
      { minX: -1.8, maxX: 1.8, minZ: -11.5, maxZ: -10.5 }
    ];
    for (let i = 0; i < 16; i++) {
      const x = (i % 8) * 9 - 31;
      const z = Math.floor(i / 8) * 34 - 8;
      bounds.push({ minX: x - 0.62, maxX: x + 0.62, minZ: z - 0.62, maxZ: z + 0.62 });
    }
    return bounds;
  }

  private random() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  private material(color: string, roughness = 0.86, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  private addMesh<T extends THREE.Mesh>(mesh: T, x: number, y: number, z: number, cast = true) {
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    return mesh;
  }

  private box(name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string, roughness = 0.86) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), this.material(color, roughness));
    mesh.name = name;
    return this.addMesh(mesh, x, y, z);
  }

  private build() {
    this.scene.background = new THREE.Color('#a9c9df');
    this.scene.fog = new THREE.FogExp2('#c5d8df', 0.0038);

    const hemi = new THREE.HemisphereLight('#e7f4ff', '#667653', 1.65);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff0d5', 3.4);
    sun.position.set(-34, 52, 24);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -62;
    sun.shadow.camera.right = 62;
    sun.shadow.camera.top = 62;
    sun.shadow.camera.bottom = -62;
    sun.shadow.bias = -0.00018;
    sun.shadow.normalBias = 0.025;
    this.scene.add(sun);

    this.buildTerrain();
    this.buildCampus();
    this.buildTrees();
    this.buildDistantLandscape();
    this.buildStreetFurniture();
    this.buildClouds();
  }

  private buildTerrain() {
    const geometry = new THREE.PlaneGeometry(220, 220, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const colors: number[] = [];
    const low = new THREE.Color('#526b50');
    const mid = new THREE.Color('#71865e');
    const high = new THREE.Color('#9b9b70');
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave = Math.sin(x * 0.045) * Math.cos(z * 0.052) * 0.42;
      const detail = Math.sin(x * 0.19 + z * 0.08) * Math.cos(z * 0.16) * 0.1;
      positions.setY(i, wave + detail - 0.18);
      const blend = THREE.MathUtils.clamp((wave + 0.5) / 1.15, 0, 1);
      color.copy(low).lerp(mid, blend).lerp(high, Math.max(0, blend - 0.72) * 0.5);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    const pathMat = this.material('#c7c1ad', 1);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 42), pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.035, 8);
    path.receiveShadow = true;
    this.scene.add(path);
    const crossPath = new THREE.Mesh(new THREE.PlaneGeometry(48, 5.5), pathMat);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.set(0, 0.04, -8);
    crossPath.receiveShadow = true;
    this.scene.add(crossPath);

    const grassGeo = new THREE.ConeGeometry(0.055, 0.34, 3);
    grassGeo.translate(0, 0.17, 0);
    const grass = new THREE.InstancedMesh(grassGeo, this.material('#78915e', 1), 1800);
    const dummy = new THREE.Object3D();
    let count = 0;
    for (let i = 0; i < 1800; i++) {
      const x = (this.random() - 0.5) * 88;
      const z = (this.random() - 0.5) * 88;
      if (Math.abs(x) < 5 && z > -13 && z < 28) continue;
      if (z < -15 && Math.abs(x) < 19) continue;
      dummy.position.set(x, 0.02, z);
      dummy.rotation.y = this.random() * Math.PI;
      const scale = 0.55 + this.random() * 0.9;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      grass.setMatrixAt(count++, dummy.matrix);
    }
    grass.count = count;
    grass.instanceMatrix.needsUpdate = true;
    grass.receiveShadow = true;
    this.scene.add(grass);
  }

  private buildCampus() {
    const wall = this.material('#e6e1d5');
    const trim = this.material('#f5f0e5');
    const glass = new THREE.MeshPhysicalMaterial({ color: '#8db5c7', roughness: 0.22, metalness: 0.08, transparent: true, opacity: 0.78 });
    const roof = this.material('#354b60', 0.72);
    this.box('main-building', 0, 4, -23, 34, 8, 12, '#e6e1d5');
    this.box('main-roof', 0, 8.25, -23, 36, 0.6, 13, '#354b60', 0.72);
    this.box('main-entry-canopy', 0, 3.25, -15.9, 9, 0.28, 2.4, '#c4ad83', 0.55);
    this.box('main-steps', 0, 0.28, -15.8, 8, 0.45, 2.2, '#b8b7ad');
    for (let floor = 0; floor < 2; floor++) {
      for (let i = 0; i < 9; i++) {
        const x = -14 + i * 3.5;
        const y = 2.45 + floor * 3.25;
        const window = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.85, 0.1), glass);
        this.addMesh(window, x, y, -16.91, false);
        this.box('window-sill', x, y - 0.98, -16.82, 2.25, 0.12, 0.22, '#f5f0e5');
        this.box('window-lintel', x, y + 0.98, -16.82, 2.25, 0.12, 0.22, '#f5f0e5');
        this.box('window-mullion', x, y, -16.79, 0.09, 1.85, 0.12, '#f5f0e5');
      }
    }
    this.box('entrance', 0, 1.5, -16.65, 5.2, 3, 0.35, '#9eb6b9');
    this.box('gym', -25, 3, -4, 13, 6, 17, '#cbd0cb');
    this.box('gym-roof', -25, 6.2, -4, 14, 0.45, 18, '#526678');
    this.box('gym-front', -25, 2.7, 4.57, 8, 3.4, 0.18, '#a8b9bd');
    this.box('library', 24, 3, -20, 12, 6, 15, '#ded8c9');
    this.box('library-roof', 24, 6.2, -20, 13, 0.45, 16, '#596b78');
    for (let i = 0; i < 5; i++) {
      this.box('library-window', 20 + i * 2, 3.2, -12.42, 1.3, 3.1, 0.08, '#87aebe', 0.25);
    }
    this.box('notice-board', 0, 1.6, -11, 3.2, 2.2, 0.18, '#785e47');
    this.box('notice-board-paper', 0, 1.65, -10.88, 2.45, 1.55, 0.035, '#e7dfc8');
    this.box('courtyard', 0, 0.025, 0, 18, 0.05, 23, '#a9a99c');
    this.box('courtyard-inlay', 0, 0.06, 0, 0.16, 0.02, 21, '#d7c9a9');
    void wall; void trim; void roof;
  }

  private buildTrees() {
    const trunkMat = this.material('#72513b');
    const leaves = ['#557b5b', '#66865f', '#789267'];
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.34, 2.8, 8);
    const crownGeo = new THREE.IcosahedronGeometry(1.75, 2);
    for (let i = 0; i < 34; i++) {
      const x = (this.random() - 0.5) * 96;
      const z = (this.random() - 0.5) * 96;
      if (Math.abs(x) < 20 && z < -12 && z > -34) continue;
      if (Math.abs(x) < 8 && z > -13 && z < 28) continue;
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      this.addMesh(trunk, x, 1.35, z);
      for (let cluster = 0; cluster < 3; cluster++) {
        const crown = new THREE.Mesh(crownGeo, this.material(leaves[(i + cluster) % leaves.length], 1));
        const scale = 0.72 + this.random() * 0.42;
        crown.scale.set(scale, scale * (0.85 + this.random() * 0.3), scale);
        this.addMesh(crown, x + (this.random() - 0.5) * 1.1, 3.25 + cluster * 0.52, z + (this.random() - 0.5) * 1.1);
      }
    }
  }

  private buildDistantLandscape() {
    const mountainMat = this.material('#879da1', 1);
    for (let i = 0; i < 14; i++) {
      const radius = 11 + this.random() * 12;
      const height = 15 + this.random() * 19;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mountainMat);
      mountain.position.set(-95 + i * 15, height * 0.38 - 4, -85 - this.random() * 28);
      mountain.rotation.y = this.random() * Math.PI;
      mountain.receiveShadow = true;
      this.scene.add(mountain);
    }
    const farTreeLine = new THREE.Mesh(new THREE.CylinderGeometry(28, 36, 9, 24, 1, true), this.material('#526b58', 1));
    farTreeLine.position.set(0, 2, -88);
    this.scene.add(farTreeLine);
  }

  private buildStreetFurniture() {
    for (const x of [-12, 12]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 3.2, 8), this.material('#3d4850', 0.45, 0.35));
      this.addMesh(pole, x, 1.6, 8);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshStandardMaterial({ color: '#ffe8b0', emissive: '#d69b4e', emissiveIntensity: 0.65 }));
      this.addMesh(lamp, x, 3.28, 8, false);
      this.box('lamp-cap', x, 3.52, 8, 0.5, 0.08, 0.5, '#384752', 0.5);
    }
    for (const z of [-2, 12]) {
      this.box('bench-seat', -10, 0.62, z, 2.5, 0.16, 0.65, '#8a6747');
      this.box('bench-back', -10, 1.05, z - 0.25, 2.5, 0.75, 0.14, '#8a6747');
      for (const x of [-10.9, -9.1]) this.box('bench-leg', x, 0.3, z, 0.12, 0.6, 0.12, '#46515a', 0.5);
    }
  }

  private buildClouds() {
    const cloudMat = new THREE.MeshBasicMaterial({ color: '#f3f6f4', transparent: true, opacity: 0.82 });
    for (let i = 0; i < 12; i++) {
      const cloud = new THREE.Group();
      const count = 4 + Math.floor(this.random() * 4);
      for (let j = 0; j < count; j++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), cloudMat);
        puff.scale.set(1.8 + this.random(), 0.65 + this.random() * 0.4, 1);
        puff.position.set(j * 1.35, this.random() * 0.35, (this.random() - 0.5) * 0.7);
        cloud.add(puff);
      }
      cloud.position.set((this.random() - 0.5) * 150, 34 + this.random() * 22, -60 - this.random() * 80);
      this.scene.add(cloud);
    }
  }
}
