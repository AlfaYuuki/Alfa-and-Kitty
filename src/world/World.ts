import * as THREE from 'three';

export class World {
  constructor(private scene: THREE.Scene) { this.build(); }
  private material(color: string, roughness = 0.9) { return new THREE.MeshStandardMaterial({ color, roughness }); }
  private box(name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), this.material(color));
    mesh.name = name; mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; this.scene.add(mesh); return mesh;
  }
  private build() {
    const hemi = new THREE.HemisphereLight('#dceeff','#68745e',2.1); this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff0d8',3.0);
    sun.position.set(-24,38,18); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left = -48; sun.shadow.camera.right = 48; sun.shadow.camera.top = 48; sun.shadow.camera.bottom = -48;
    this.scene.add(sun);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(180,180), this.material('#829477'));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; this.scene.add(ground);
    this.box('main-building',0,4,-23,34,8,12,'#e5e0d5');
    this.box('main-roof',0,8.25,-23,36,0.6,13,'#34465a');
    for (let i=0;i<7;i++) {
      const x=-13+i*4.3;
      this.box('window',x,4.4,-16.85,2.4,2.5,0.12,'#8baebc');
      this.box('window-frame',x,4.4,-16.72,2.55,0.12,0.16,'#f2eee4');
    }
    this.box('entrance',0,1.5,-16.65,5.2,3,0.35,'#b5c2c1');
    this.box('courtyard',0,0.04,0,18,0.08,23,'#a9a99c');
    this.box('walkway',0,0.08,11,7,0.12,32,'#c5c0b1');
    this.box('gym',-25,3,-4,13,6,17,'#c6c9c4');
    this.box('gym-roof',-25,6.2,-4,14,0.45,18,'#526678');
    this.box('library',24,3,-20,12,6,15,'#d7d2c5');
    this.box('library-roof',24,6.2,-20,13,0.45,16,'#596b78');
    this.box('notice-board',0,1.6,-11,3.2,2.2,0.18,'#785e47');
    for (let i=0;i<16;i++) {
      const x=(i%8)*9-31, z=Math.floor(i/8)*34-8;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,2.6,7),this.material('#70513c'));
      trunk.position.set(x,1.3,z); trunk.castShadow=true; this.scene.add(trunk);
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1),this.material(i%2?'#55795a':'#66845e'));
      crown.position.set(x,3.5,z); crown.castShadow=true; this.scene.add(crown);
    }
    const fenceMat=this.material('#52636b');
    for(let x=-39;x<=39;x+=3) {
      const post=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.4,0.12),fenceMat); post.position.set(x,0.7,43); this.scene.add(post);
    }
    const sky=new THREE.Mesh(new THREE.SphereGeometry(120,24,16),new THREE.MeshBasicMaterial({color:'#b9cedd',side:THREE.BackSide}));
    this.scene.add(sky);
  }
}