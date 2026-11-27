import './style.css';
import { Game } from './game/Game';

type Quality = 'high' | 'medium' | 'low';
type Preferences = { quality: Quality; sensitivity: number };
const PREFERENCES_KEY = 'alfa-and-kitty-preferences-v1';
const DEFAULT_PREFERENCES: Preferences = { quality: 'medium', sensitivity: 1 };

function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const value = JSON.parse(raw) as Partial<Preferences>;
    const quality: Quality = value.quality === 'high' || value.quality === 'low' ? value.quality : 'medium';
    const sensitivity = typeof value.sensitivity === 'number' && Number.isFinite(value.sensitivity)
      ? Math.min(2, Math.max(0.3, value.sensitivity))
      : 1;
    return { quality, sensitivity };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(preferences: Preferences) {
  try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch {
    setStatus('Settings could not be saved by this browser.');
  }
}

const preferences = readPreferences();
const loading = document.querySelector<HTMLElement>('#loading')!;
const menu = document.querySelector<HTMLElement>('#menu')!;
const hud = document.querySelector<HTMLElement>('#hud')!;
const pauseMenu = document.querySelector<HTMLElement>('#pause-menu')!;
const settingsMenu = document.querySelector<HTMLElement>('#settings-menu')!;
const qualitySelect = document.querySelector<HTMLSelectElement>('#quality')!;
const sensitivityInput = document.querySelector<HTMLInputElement>('#sensitivity')!;
const game = new Game(document.querySelector<HTMLElement>('#game-root')!);

qualitySelect.value = preferences.quality;
sensitivityInput.value = String(preferences.sensitivity);

const show = (el: HTMLElement, visible: boolean) => el.classList.toggle('hidden', !visible);
function setStatus(message: string) {
  const status = document.querySelector<HTMLElement>('#status');
  if (status) status.textContent = message;
}

function start(continueSave = false) {
  if (continueSave) game.load();
  game.start();
  show(menu, false); show(pauseMenu, false); show(settingsMenu, false); show(hud, true);
}

document.querySelector('#start-button')!.addEventListener('click', () => start(false));
const continueButton = document.querySelector<HTMLButtonElement>('#continue-button')!;
continueButton.disabled = !game.hasSave();
document.querySelector('#continue-button')!.addEventListener('click', () => start(true));
document.querySelector('#pause-button')!.addEventListener('click', () => pause());
document.querySelector('#resume-button')!.addEventListener('click', () => resume());
document.querySelector('#save-button')!.addEventListener('click', () => {
  game.save();
  setStatus('Progress saved on this device.');
  continueButton.disabled = !game.hasSave();
});
document.querySelector('#settings-button')!.addEventListener('click', () => show(settingsMenu, true));
document.querySelector('#settings-back')!.addEventListener('click', () => show(settingsMenu, false));
document.querySelector('#main-menu-button')!.addEventListener('click', () => {
  game.stop(); show(pauseMenu, false); show(hud, false); show(menu, true);
});
qualitySelect.addEventListener('change', () => {
  const quality = qualitySelect.value as Quality;
  game.setQuality(quality);
  preferences.quality = quality;
  writePreferences(preferences);
});
sensitivityInput.addEventListener('input', () => {
  const sensitivity = Number(sensitivityInput.value);
  game.setSensitivity(sensitivity);
  preferences.sensitivity = sensitivity;
  writePreferences(preferences);
});

function pause() { game.pause(); show(pauseMenu, true); }
function resume() { game.resume(); show(pauseMenu, false); show(settingsMenu, false); }
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && game.isRunning()) {
    if (!settingsMenu.classList.contains('hidden')) show(settingsMenu, false);
    else if (pauseMenu.classList.contains('hidden')) pause();
    else resume();
  }
});

game.initialize().then(() => {
  game.setQuality(preferences.quality);
  game.setSensitivity(preferences.sensitivity);
  loading.classList.add('fade-out');
  window.setTimeout(() => loading.remove(), 450);
  continueButton.disabled = !game.hasSave();
}).catch(error => {
  console.error('Game initialization failed:', error);
  loading.innerHTML = '<div class="load-error">Unable to initialize 3D graphics. Please try a recent browser with WebGL enabled.</div>';
});