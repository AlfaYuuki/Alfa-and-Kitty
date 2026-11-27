import * as THREE from 'three';
const KEY = 'alfa-and-kitty-save-v1';
type SaveData = { version: 1; position: {x:number;y:number;z:number}; savedAt: string };
export class SaveManager {
  static exists() { try { return localStorage.getItem(KEY) !== null; } catch { return false; } }
  static save(position: THREE.Vector3) {
    const data: SaveData = { version:1, position:{x:position.x,y:position.y,z:position.z}, savedAt:new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
  }
  static load() {
    try {
      const raw = localStorage.getItem(KEY); if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== 1 || !data.position || ![data.position.x,data.position.y,data.position.z].every(Number.isFinite)) return null;
      return data.position;
    } catch { return null; }
  }
}