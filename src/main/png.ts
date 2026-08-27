/**
 * A PNG encoder, so the tray icon can be drawn in code.
 *
 * The alternative is a binary blob checked into the repo that nobody can read,
 * diff, or adjust. The buddy is eleven rectangles; this is forty lines.
 */
import zlib from 'node:zlib';

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}

const TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

/** `rgba` is width * height * 4 bytes, row major, no filtering. */
export function encodePng(width: number, height: number, rgba: Buffer): Buffer {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour with alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/**
 * The buddy, 36×36, opaque black on transparent.
 *
 * Drawn as a template image: macOS recolours it for light and dark menu bars,
 * so the only thing that matters here is the silhouette. Twice the nominal 18pt
 * because every Mac this app can run on has a Retina menu bar, and an @1x buffer
 * gets upscaled into a blur.
 */
export function trayIcon(): Buffer {
  const w = 36;
  const h = 36;
  const px = Buffer.alloc(w * h * 4, 0);
  const fill = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        px[i] = 0;
        px[i + 1] = 0;
        px[i + 2] = 0;
        px[i + 3] = 255;
      }
    }
  };
  const clear = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) px[(y * w + x) * 4 + 3] = 0;
  };
  fill(6, 4, 30, 26); // head
  fill(2, 12, 6, 20); // left arm
  fill(30, 12, 34, 20); // right arm
  fill(6, 26, 10, 32); // legs
  fill(16, 26, 20, 32);
  fill(26, 26, 30, 32);
  clear(12, 12, 16, 16); // eyes
  clear(20, 12, 24, 16);
  return encodePng(w, h, px);
}
