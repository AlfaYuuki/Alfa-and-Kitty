# Alfa & Kitty

A third-person, story-driven 3D browser adventure starring Alfa Yuuki, with Kitty Yukino planned as an autonomous companion NPC.

## Milestone 1 — Foundation (v0.1.0)

This prototype establishes the browser app, Three.js renderer, third-person camera, keyboard/touch movement, a blockout Kitsune High campus, pause/settings UI, and a local save foundation.

## Requirements

- Node.js 20+
- npm

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Controls

- WASD / arrow keys: move
- Shift: run
- Mouse drag: orbit camera
- E: interact (prototype prompt)
- Escape: pause

On touch devices, use the on-screen movement pad and drag the scene to rotate the camera.

## Architecture

Rendering, input, player movement, world construction, UI, and persistence are separate modules. The campus is currently a lightweight procedural blockout; production character models, authored campus assets, animation, and Kitty's companion AI are future milestones.

## Status

Milestone 1 implementation baseline. Performance depends on device and browser; the project does not promise a fixed frame rate.
