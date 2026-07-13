/**
 * cubeFaces — textures for the six sides of the hero cube, built from the real
 * community photos in `src/assets/images` (passed in as URLs). Each photo is
 * composited onto an off-screen canvas with a premium finish — cover-fit crop,
 * rounded corners, a soft vignette for depth and a thin brand hairline — so the
 * faces read as framed cards rather than raw fills, and stay crisp at any DPR.
 *
 * Images load asynchronously: every face starts as a dark brand placeholder
 * (no white flash) and swaps to its photo the moment it decodes, so the engine
 * can build the cube synchronously and never blocks on the network.
 */
import { CanvasTexture, SRGBColorSpace } from "three";

/* Face order matches BoxGeometry material slots: +x, -x, +y, -y, +z, -z. */
export const FACE_ORDER = ["right", "left", "top", "bottom", "front", "back"];

/* Brand hairline colour for the face frame, theme-aware. */
function palette(isDark) {
  return { frame: isDark ? "rgba(125,255,158,0.55)" : "rgba(22,163,74,0.5)" };
}

/* Rounded-rectangle path (older canvas engines lack ctx.roundRect). */
function roundRect(g, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

/* Dark brand placeholder shown until the photo decodes. */
function drawPlaceholder(g, S, pal) {
  const grad = g.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#0a1a10");
  grad.addColorStop(1, "#04100a");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  g.lineWidth = Math.max(2, S * 0.006);
  g.strokeStyle = pal.frame;
  const pad = S * 0.05;
  roundRect(g, pad, pad, S - pad * 2, S - pad * 2, S * 0.08);
  g.stroke();
}

/* Composite one decoded photo into a premium framed face. */
function drawPhoto(g, S, img, pal) {
  g.clearRect(0, 0, S, S);
  g.save();
  // rounded-corner clip
  roundRect(g, 0, 0, S, S, S * 0.08);
  g.clip();

  // cover-fit (center-crop) so any aspect ratio fills the square face
  const ar = img.width / img.height;
  let w = S;
  let h = S;
  if (ar > 1) w = S * ar;
  else h = S / ar;
  g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);

  // gentle depth vignette — a soft edge falloff for framing, kept light so the
  // photo reads flat and true (no glare / bright streak on the image)
  const vig = g.createRadialGradient(S * 0.5, S * 0.5, S * 0.3, S * 0.5, S * 0.5, S * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.28)");
  g.fillStyle = vig;
  g.fillRect(0, 0, S, S);
  g.restore();

  // brand hairline frame on top
  g.lineWidth = Math.max(2, S * 0.008);
  g.strokeStyle = pal.frame;
  roundRect(g, S * 0.02, S * 0.02, S * 0.96, S * 0.96, S * 0.075);
  g.stroke();
}

/**
 * makeCubeFaces — returns { textures: CanvasTexture[6] in FACE_ORDER, dispose }.
 * `images` is an array of URLs mapped to FACE_ORDER; `size` is the texture edge
 * in px (caller drops it on mobile for memory).
 */
export function makeCubeFaces({ isDark = true, size = 512, images = [] } = {}) {
  const pal = palette(isDark);
  const loaders = [];

  const textures = FACE_ORDER.map((_, i) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    drawPlaceholder(g, size, pal);

    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;

    const url = images[i % (images.length || 1)];
    if (url) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        drawPhoto(g, size, img, pal);
        tex.needsUpdate = true;
      };
      img.src = url;
      loaders.push(img);
    }
    return tex;
  });

  return {
    textures,
    dispose: () => {
      loaders.forEach((img) => (img.onload = null));
      textures.forEach((t) => t.dispose());
    },
  };
}
