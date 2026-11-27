import * as THREE from 'three';
import { World } from '../world/World';
import { PlayerController } from '../characters/PlayerController';
import { InputManager } from '../input/InputManager';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { SaveManager } from '../save/SaveManager';

export class Game {
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private player!: PlayerController;
  private input = new InputManager();
  private followCamera!: ThirdPersonCamera;
  private clock = new THREE.Clock();
  private running = false;

  constructor(private root: HTMLElement) {}

  async initialize() {
    this.scene.background = new THREE.Color('#b9cedd');
    this.scene.fog = new THREE.Fog('#b9cedd', 42, 145);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 260);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.root.appendChild(this.renderer.domElement);
    const world = new World(this.scene);
    this.player = new PlayerController(this.scene, world.getCollisionBounds());
    this.followCamera = new ThirdPersonCamera(this.camera, this.scene);
    this.input.attach(this.renderer.domElement);
    this.bindTouchControls();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pagehide', this.handlePageHide);
    this.resize();
    this.renderer.setAnimationLoop(this.animate);
  }

  start() { this.running = true; this.clock.getDelta(); this.input.setEnabled(true); }
  stop() { this.save(); this.running = false; this.input.setEnabled(false); }
  pause() { this.save(); this.running = false; this.input.setEnabled(false); }
  resume() { this.running = true; this.clock.getDelta(); this.input.setEnabled(true); }
  isRunning() { return this.running; }
  hasSave() { return SaveManager.exists(); }
  save() { return SaveManager.save(this.player.getPosition()); }
  load() { const p = SaveManager.load(); if (p) this.player.setPosition(p); }

  setSensitivity(value: number) { this.followCamera.setSensitivity(value); }

  setQuality(value: 'high'|'medium'|'low') {
    const ratio = value === 'high' ? 1.75 : value === 'medium' ? 1.35 : 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratio));
    this.renderer.shadowMap.enabled = value !== 'low';
    this.resize();
  }

  private handlePageHide = () => {
    if (this.player) this.save();
  };

  private resize = () => {
    const w = Math.max(1, this.root.clientWidth), h = Math.max(1, this.root.clientHeight);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private bindTouchControls() {
    const keys = new Map<string, string>([['forward','w'],['back','s'],['left','a'],['right','d']]);
    document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => {
      const key = keys.get(button.dataset.key ?? '');
      if (!key) return;
      const down = (e: Event) => { e.preventDefault(); this.input.setVirtualKey(key, true); };
      const up = () => this.input.setVirtualKey(key, false);
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('pointerleave', up);
    });
    const run = document.querySelector<HTMLButtonElement>('#touch-run');
    run?.addEventListener('pointerdown', () => this.input.setVirtualKey('shift', true));
    ['pointerup','pointercancel','pointerleave'].forEach(type => run?.addEventListener(type, () => this.input.setVirtualKey('shift', false)));
  }

  private animate = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.running) {
      const look = this.input.consumeLook();
      this.followCamera.update(this.player.getPosition(), dt, look.x, look.y);
      this.player.update(dt, this.input, this.followCamera.getYaw());
    }
    this.renderer.render(this.scene, this.camera);
  };
}