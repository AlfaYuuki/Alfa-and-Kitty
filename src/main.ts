import './style.css';
import { Game } from './game/Game';

const loading = document.querySelector<HTMLElement>('#loading')!;
const menu = document.querySelector<HTMLElement>('#menu')!;
const hud = document.querySelector<HTMLElement>('#hud')!;
const pauseMenu = document.querySelector<HTMLElement>('#pause-menu')!;
const settingsMenu = document.querySelector<HTMLElement>('#settings-menu')!;
const game = new Game(document.querySelector<HTMLElement>('#game-root')!);

const show = (el: HTMLElement, visible: boolean) => el.classList.toggle('hidden', !visible);
const setStatus = (message: string) => {
  const status = document.querySelector<HTMLElement>('#status');
  if (status) status.textContent = message;
};

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
  game.save(); setStatus('Progress saved on this device.'); continueButton.disabled = false;
});
document.querySelector('#settings-button')!.addEventListener('click', () => show(settingsMenu, true));
document.querySelector('#settings-back')!.addEventListener('click', () => show(settingsMenu, false));
document.querySelector('#main-menu-button')!.addEventListener('click', () => {
  game.stop(); show(pauseMenu, false); show(hud, false); show(menu, true);
});
document.querySelector<HTMLSelectElement>('#quality')!.addEventListener('change', e => {
  game.setQuality((e.target as HTMLSelectElement).value as 'high'|'medium'|'low');
});
document.querySelector<HTMLInputElement>('#sensitivity')!.addEventListener('input', e => {
  game.setSensitivity(Number((e.target as HTMLInputElement).value));
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
  loading.classList.add('fade-out');
  window.setTimeout(() => loading.remove(), 450);
  continueButton.disabled = !game.hasSave();
}).catch(error => {
  console.error('Game initialization failed:', error);
  loading.innerHTML = '<div class="load-error">Unable to initialize 3D graphics. Please try a recent browser with WebGL enabled.</div>';
});