# 🧸 BlockBuddy
A cute, easy Minecraft **Bedrock** resource pack maker (.mcpack) (Windows app first, web app next).

## Features
- Browse blocks, items, sky & overlay textures; add any custom ID
- Import your own PNGs, edit animation (frame time, interpolation) with live preview
- One-click **✨ Make it glow** for ore-style glowing animations
- Totem, swords, enchant glint, sun/moon/clouds, pumpkin/underwater overlays
- Cute cursor buddy + click sounds
- Export a ready-to-import `.mcpack` (manifest + flipbook animations generated for you)

## Run
```
npm install
npm start
```
## One release for everyone
Push a tag (`git tag v0.2.0 && git push --tags`). GitHub Actions builds everything and attaches it to ONE release:
- `BlockBuddy-Setup.exe` / `BlockBuddy-Portable.exe` (Windows)
- `BlockBuddy.apk` (Android, debug-signed: enable "install unknown apps")
- `BlockBuddy-Web.zip` + live site on GitHub Pages (Mac, Linux, iPhone, anything with a browser)

One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Build the .exe locally
Locally: `npm run build` (output in `dist/`), or push a tag like `v0.1.0` and download the exe from the GitHub Actions run.

## Roadmap
Full creative-menu block list, built-in pixel editor, block-place sounds/animations, sounds editor, web version (the `src/` folder is already plain HTML/JS).

## Editing real Minecraft textures
Download Mojang's free `bedrock-samples` repo (github.com/Mojang/bedrock-samples), then press **Load vanilla pack** and choose its `resource_pack` folder. Every real block, item, mob, particle, UI texture and sound is listed. Only what you edit gets exported.
