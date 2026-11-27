export class InputManager {
  private keys = new Set<string>();
  private virtualKeys = new Set<string>();
  private enabled = false;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  lookDeltaX = 0;
  lookDeltaY = 0;

  attach(element: HTMLElement) {
    window.addEventListener('keydown', e => {
      if (!this.enabled) return;
      const key = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) e.preventDefault();
      this.keys.add(key);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this.virtualKeys.clear(); this.dragging = false; });
    element.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.dragging = true; this.lastX = e.clientX; this.lastY = e.clientY;
      element.setPointerCapture(e.pointerId);
    });
    element.addEventListener('pointerup', () => this.dragging = false);
    element.addEventListener('pointercancel', () => this.dragging = false);
    element.addEventListener('pointermove', e => {
      if (!this.enabled || !this.dragging) return;
      this.lookDeltaX += e.clientX - this.lastX; this.lookDeltaY += e.clientY - this.lastY;
      this.lastX = e.clientX; this.lastY = e.clientY;
    });
  }
  setEnabled(value: boolean) { this.enabled = value; if (!value) { this.keys.clear(); this.virtualKeys.clear(); } }
  setVirtualKey(key: string, down: boolean) { if (down) this.virtualKeys.add(key); else this.virtualKeys.delete(key); }
  down(...keys: string[]) { return keys.some(k => this.keys.has(k) || this.virtualKeys.has(k)); }
  consumeLook() { const d = { x: this.lookDeltaX, y: this.lookDeltaY }; this.lookDeltaX = 0; this.lookDeltaY = 0; return d; }
}